"""
API Endpoints for HeartHealth AI
Exposes modular, documented endpoints for tabular risk prediction and chest X-ray inference.
"""

import os
import torch
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from backend.app.schemas import (
    HeartDiseaseInput, HeartDiseaseResponse, CardiomegalyResponse,
    HealthResponse
)
from backend.app.services.tabular_service import tabular_service
from backend.app.services.xray_service import xray_service

router = APIRouter()

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/bmp", "image/webp"]

@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    gpu_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if gpu_available else "CPU"
    return HealthResponse(
        status="healthy",
        app_name="HeartHealth AI API",
        version="1.0.0",
        gpu_available=gpu_available,
        device_name=device_name
    )

@router.get("/models/status", tags=["Model Information"])
def get_model_status():
    tab_path = os.path.join("models", "heart_disease_model.joblib")
    xray_path = os.path.join("models", "cardiomegaly_model.pth")

    tab_trained = os.path.exists(tab_path)
    xray_trained = os.path.exists(xray_path)

    tab_size = os.path.getsize(tab_path) if tab_trained else 0
    xray_size = os.path.getsize(xray_path) if xray_trained else 0

    return {
        "tabular_module": {
            "name": "Heart Disease Risk Prediction",
            "status": "trained" if tab_trained else "not_trained",
            "model_architecture": "Gradient Boosting Classifier",
            "artifact_path": tab_path,
            "artifact_size_bytes": tab_size,
            "is_loaded": tabular_service.is_loaded
        },
        "xray_module": {
            "name": "Chest X-Ray Cardiomegaly Analysis",
            "status": "trained" if xray_trained else "not_trained",
            "model_architecture": "DenseNet-121 (Transfer Learning)",
            "artifact_path": xray_path,
            "artifact_size_bytes": xray_size,
            "is_loaded": xray_service.is_loaded
        }
    }

@router.get("/models/heart-disease/metrics", tags=["Model Information"])
def get_heart_disease_metrics():
    metrics = tabular_service.get_metrics()
    if metrics.get("status") == "not_loaded":
        raise HTTPException(status_code=404, detail="Tabular model metrics not available. Train the model first.")
    return metrics

@router.get("/models/cardiomegaly/metrics", tags=["Model Information"])
def get_cardiomegaly_metrics():
    metrics = xray_service.get_metrics()
    if metrics.get("status") == "metrics_not_found":
        raise HTTPException(status_code=404, detail="Cardiomegaly metrics not available. Train the model first.")
    return metrics

@router.post("/predict/heart-disease", response_model=HeartDiseaseResponse, tags=["Inference"])
def predict_heart_disease(input_data: HeartDiseaseInput):
    try:
        data_dict = input_data.model_dump()
        result = tabular_service.predict(data_dict)
        return HeartDiseaseResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {str(e)}")

@router.post("/predict/cardiomegaly", response_model=CardiomegalyResponse, tags=["Inference"])
async def predict_cardiomegaly(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. Supported formats: JPEG, PNG, JPG, WebP."
        )

    # Read image contents safely with size check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
        )
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        result = xray_service.predict_image(contents)
        return CardiomegalyResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Image inference error: {str(e)}")
