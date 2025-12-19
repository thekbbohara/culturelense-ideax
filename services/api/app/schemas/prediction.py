from pydantic import BaseModel
from typing import List, Optional

class PredictionResult(BaseModel):
    entity_slug: str
    confidence: float
    bbox: Optional[List[int]] = None # [x, y, w, h]

class PredictionResponse(BaseModel):
    success: bool
    data: PredictionResult
    error: Optional[str] = None
