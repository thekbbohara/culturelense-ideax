import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import numpy as np
import os
import io
import json
import logging

# --- 1. CRITICAL: FORCE CPU & SILENCE LOGS ---
# This fixes the RTX 5090 "CUDA_ERROR_INVALID_PTX" crash
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Set Python logging to show only errors
logging.basicConfig(level=logging.ERROR)

# --- 2. IMPORTS ---
# Standard TensorFlow (Native Keras 3) - The debug script confirmed this works

# --- 3. CONFIGURATION ---
# Use absolute paths to prevent "file not found" errors in PM2
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'god_recognizer_nightly.keras')
LABELS_PATH = os.path.join(BASE_DIR, 'class_names_nightly.json')

IMG_SIZE = (300, 300)

# Global resources
resources = {}

# --- 4. LIFESPAN (Model Loading) ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- [STARTUP] Loading AI Model (Native Keras) on CPU... ---")
    try:
        # CORRECT LOADER: Use standard tf.keras (Keras 3)
        resources['model'] = tf.keras.models.load_model(MODEL_PATH)

        with open(LABELS_PATH, 'r') as f:
            resources['class_names'] = json.load(f)

        print("✅ [SUCCESS] Model loaded successfully!")
    except Exception as e:
        print(f"❌ [CRITICAL ERROR] Failed to load model: {e}")
        # Print full error for debugging if it fails again
        import traceback
        traceback.print_exc()
        resources['model'] = None

    yield  # Application runs here

    print("--- [SHUTDOWN] Cleaning up resources... ---")
    resources.clear()

# --- 5. FASTAPI APP INIT ---
app = FastAPI(title="God Recognizer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 6. ENDPOINTS ---


@app.get("/")
def home():
    status = "online" if resources.get('model') else "model_error"
    return {"status": status, "message": "God Recognizer API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 1. Fail fast if model isn't ready
    if resources.get('model') is None:
        raise HTTPException(
            status_code=500, detail="Model failed to load. Check server logs.")

    # 2. Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # 3. Process Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize(IMG_SIZE)

        # Convert to numpy array
        img_array = np.array(image)
        img_array = tf.expand_dims(img_array, 0)

        # 4. Predict
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
        print(f"⚠️ Prediction Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal prediction error")

if __name__ == "__main__":
    import uvicorn
    # log_level="error" suppresses Uvicorn's massive INFO logs
    uvicorn.run(app, host="0.0.0.0", port=8005, log_level="error")
