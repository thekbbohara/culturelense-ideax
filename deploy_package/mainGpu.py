from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import numpy as np
import tensorflow as tf
import os
import io
import json
import logging

# --- 1. CONFIGURATION ---
# ENABLE GPU: We commented out the line that forced CPU mode.
# os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Silence TensorFlow INFO logs (keep warnings/errors)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Set Python logging
logging.basicConfig(level=logging.INFO)

# --- 2. IMPORTS ---
# tf-nightly includes Keras 3 natively as 'tf.keras'

# --- 3. PATHS & SETTINGS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'god_recognizer_nightly.keras')
LABELS_PATH = os.path.join(BASE_DIR, 'class_names_nightly.json')

IMG_SIZE = (300, 300)

resources = {}

# --- 4. LIFESPAN (Model Loading) ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- [STARTUP] Initializing on RTX 5090... ---")

    # Check if GPU is detected
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"🚀 GPU DETECTED: {len(gpus)} device(s) found!")
        for gpu in gpus:
            print(f"   - {gpu}")
            # Experimental: Enable memory growth to prevent allocating all VRAM at once
            try:
                tf.config.experimental.set_memory_growth(gpu, True)
            except:
                pass
    else:
        print("⚠️ WARNING: No GPU detected. Running on CPU.")

    try:
        # Load model using native Keras 3 loader
        resources['model'] = tf.keras.models.load_model(MODEL_PATH)

        with open(LABELS_PATH, 'r') as f:
            resources['class_names'] = json.load(f)

        print("✅ [SUCCESS] Model loaded successfully on GPU!")
    except Exception as e:
        print(f"❌ [CRITICAL ERROR] Failed to load model: {e}")
        import traceback
        traceback.print_exc()
        resources['model'] = None

    yield
    resources.clear()

# --- 5. APP & ENDPOINTS ---
app = FastAPI(title="God Recognizer API (GPU)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    status = "online" if resources.get('model') else "model_error"
    return {"status": status, "gpu_enabled": len(tf.config.list_physical_devices('GPU')) > 0}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if resources.get('model') is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize(IMG_SIZE)

        img_array = np.array(image)
        img_array = tf.expand_dims(img_array, 0)

        # Predict
        predictions = resources['model'].predict(img_array, verbose=0)
        scores = tf.nn.softmax(predictions[0])

        top_k = 3
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for i in top_indices:
            results.append({
                "god": resources['class_names'][i],
                "confidence": float(scores[i]) * 100
            })

        return {
            "prediction": results[0]["god"],
            "confidence": results[0]["confidence"],
            "top_3": results
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
