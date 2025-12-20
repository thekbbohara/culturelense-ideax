from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import json
import io
from PIL import Image
from contextlib import asynccontextmanager

# --- Configuration ---
MODEL_PATH = 'god_recognizer_ultra.keras'
MODEL_PATH_V2 = 'god_recognizer_ultraV2.keras'
LABELS_PATH = 'class_names.json'
IMG_SIZE = (300, 300)  # Must match your training size!
CONFIDENCE_THRESHOLD = 60.0  # <--- New setting for V2

# Global variables to hold model and labels
resources = {}

# --- Lifespan: Loads model ONLY ONCE when server starts ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Loading AI Model & Labels... ---")
    try:
        resources['model'] = tf.keras.models.load_model(MODEL_PATH)
        resources['modelv2'] = tf.keras.models.load_model(MODEL_PATH_V2)
        with open(LABELS_PATH, 'r') as f:
            resources['class_names'] = json.load(f)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        resources['model'] = None

    yield  # Server runs here

    print("--- Shutting down ---")
    resources.clear()

# Initialize App
app = FastAPI(title="God Recognizer API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"status": "online", "message": "God Recognizer API is running"}

# --- ORIGINAL V1 ENDPOINT (Unchanged) ---


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if resources['model'] is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize(IMG_SIZE)
        img_array = tf.keras.utils.img_to_array(image)
        img_array = tf.expand_dims(img_array, 0)

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
        raise HTTPException(
            status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/v2/predict")
async def predict(file: UploadFile = File(...)):
    if resources['modelv2'] is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize(IMG_SIZE)
        img_array = tf.keras.utils.img_to_array(image)
        img_array = tf.expand_dims(img_array, 0)

        predictions = resources['modelv2'].predict(img_array, verbose=0)
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
        raise HTTPException(
            status_code=500, detail=f"Prediction failed: {str(e)}")


# --- NEW V2 ENDPOINT (With Validation Logic) ---


@app.post("/predictv2")
async def predict_v2(file: UploadFile = File(...)):
    # 1. Validation
    if resources['model'] is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # 2. Read & Preprocess
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize(IMG_SIZE)
        img_array = tf.keras.utils.img_to_array(image)
        img_array = tf.expand_dims(img_array, 0)

        # 3. Predict
        predictions = resources['model'].predict(img_array, verbose=0)
        scores = tf.nn.softmax(predictions[0])  # Convert to probabilities

        # 4. Analyze Results
        top_index = np.argmax(scores)
        confidence = float(scores[top_index]) * 100
        predicted_god = resources['class_names'][top_index]

        # 5. The "Human/Junk" Filter
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "prediction": "Unknown",
                "confidence": confidence,
                "message": "Confidence too low. Image might be a human or unrelated object.",
                "top_3": []  # Return empty or existing top 3 if you want debugging info
            }

        # 6. Standard Success Response
        # (Only reached if confidence > 60%)
        top_k = 3
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for i in top_indices:
            results.append({
                "god": resources['class_names'][i],
                "confidence": float(scores[i]) * 100
            })

        return {
            "prediction": predicted_god,
            "confidence": confidence,
            "top_3": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Prediction v2 failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Using port 8005 as in your example
    uvicorn.run(app, host="0.0.0.0", port=8005)
