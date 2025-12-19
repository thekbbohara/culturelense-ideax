from fastapi import APIRouter
from app.api.endpoints import inference

api_router = APIRouter()
api_router.include_router(inference.router, tags=["ai"])
