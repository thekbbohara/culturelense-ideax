from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CultureLense API", version="0.1.0")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api_router import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to CultureLense API", "success": True, "data": {}, "error": None}

@app.get("/health")
def health_check():
    return {"status": "ok", "success": True, "data": {"status": "ok"}, "error": None}
