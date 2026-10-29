"""
Pydantic Schemas for HeartHealth AI Backend API
Defines robust request and response data models for tabular and X-ray inference.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class HeartDiseaseInput(BaseModel):
    age: float = Field(..., ge=18.0, le=110.0, description="Patient age in years (18 - 110)")
    gender: int = Field(..., ge=1, le=2, description="Biological sex (1: Female, 2: Male)")
    height: float = Field(..., ge=100.0, le=240.0, description="Height in centimeters (100 - 240)")
    weight: float = Field(..., ge=30.0, le=250.0, description="Weight in kilograms (30 - 250)")
    ap_hi: int = Field(..., ge=60, le=260, description="Systolic blood pressure in mmHg (60 - 260)")
    ap_lo: int = Field(..., ge=30, le=180, description="Diastolic blood pressure in mmHg (30 - 180)")
    cholesterol: int = Field(..., ge=1, le=3, description="Serum cholesterol (1: Normal, 2: Above Normal, 3: Well Above Normal)")
    gluc: int = Field(..., ge=1, le=3, description="Fasting glucose level (1: Normal, 2: Above Normal, 3: Well Above Normal)")
    smoke: int = Field(..., ge=0, le=1, description="Smoking status (0: Non-smoker, 1: Smoker)")
    alco: int = Field(..., ge=0, le=1, description="Alcohol intake (0: Non-drinker, 1: Regular drinker)")
    active: int = Field(..., ge=0, le=1, description="Physical activity (0: Inactive, 1: Active)")

    @field_validator("ap_lo")
    @classmethod
    def validate_blood_pressure(cls, ap_lo, info):
        ap_hi = info.data.get("ap_hi")
        if ap_hi is not None and ap_lo >= ap_hi:
            raise ValueError(f"Diastolic pressure ({ap_lo}) must be lower than systolic pressure ({ap_hi})")
        return ap_lo

class RiskFactor(BaseModel):
    feature: str
    status: str
    detail: str
    severity: str  # "warning", "danger", "normal"

class HeartDiseaseResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability: float
    risk_level: str
    model_name: str
    risk_factors: List[RiskFactor]
    disclaimer: str

class CardiomegalyResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability: float
    finding_description: str
    model_architecture: str
    disclaimer: str

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    gpu_available: bool
    device_name: Optional[str] = None

class ModelMetricsResponse(BaseModel):
    model_name: str
    metrics: Dict[str, Any]
    details: Optional[Dict[str, Any]] = None
