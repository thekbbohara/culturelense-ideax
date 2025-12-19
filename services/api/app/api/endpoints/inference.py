from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.prediction import PredictionResponse, PredictionResult
import random
import asyncio

router = APIRouter()

# Mock labels matching our Seed Data
KNOWN_ENTITIES = ['shiva', 'vishnu', 'ganesha', 'durga', 'hanuman']

@router.post("/predict", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    """
    Mock inference endpoint.
    In real implementation, this would load the model and process the image.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Simulate processing time
    await asyncio.sleep(1)

    # Mock Random Prediction
    # For MVP demo purposes, we can deterministically pick one or random
    predicted_slug = random.choice(KNOWN_ENTITIES)
    confidence = round(random.uniform(0.75, 0.99), 2)

    return {
        "success": True,
        "data": {
            "entity_slug": predicted_slug,
            "confidence": confidence,
            "bbox": [100, 100, 200, 200]
        },
        "error": None
    }
