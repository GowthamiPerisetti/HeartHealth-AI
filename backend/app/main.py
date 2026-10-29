"""
HeartHealth AI - Main FastAPI Application
Provides the unified backend serving both Tabular Disease Prediction and Chest X-ray Deep Learning.
Configured for production deployment on Render with dynamic CORS and port handling.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import router as api_router

app = FastAPI(
    title="HeartHealth AI — Clinical Decision Support & X-Ray Analysis",
    description=(
        "Dual-module healthcare research API for cardiovascular risk scoring "
        "and chest radiograph cardiomegaly silhouette analysis."
    ),
    version="1.0.0"
)

# Configure CORS with environment variable support
allowed_origins_raw = os.environ.get("ALLOWED_ORIGINS", "*").strip()
if allowed_origins_raw == "*" or not allowed_origins_raw:
    origins = ["*"]
else:
    origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api
app.include_router(api_router, prefix="/api")

# Top-level health endpoint (compatible with Render/cloud health checks)
@app.get("/health", tags=["System"])
def root_health():
    return {
        "status": "healthy",
        "app_name": "HeartHealth AI API",
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "HeartHealth AI API is online",
        "documentation": "/docs",
        "endpoints": {
            "health": "/api/health",
            "model_status": "/api/models/status",
            "tabular_metrics": "/api/models/heart-disease/metrics",
            "xray_metrics": "/api/models/cardiomegaly/metrics",
            "predict_tabular": "/api/predict/heart-disease",
            "predict_xray": "/api/predict/cardiomegaly"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
