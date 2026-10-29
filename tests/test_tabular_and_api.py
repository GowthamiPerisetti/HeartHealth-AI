"""
Comprehensive Test Suite for HeartHealth AI Tabular Pipeline and FastAPI API
Tests data loading, schema integrity, prediction pipeline, and API endpoints.
"""

import os
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.tabular_service import tabular_service

client = TestClient(app)

def test_api_health():
    """Verify health endpoint responds with healthy status and metadata."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "gpu_available" in data

def test_model_status():
    """Verify model status endpoint returns status for both modules."""
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "tabular_module" in data
    assert "xray_module" in data
    assert data["tabular_module"]["status"] in ["trained", "not_trained"]

def test_tabular_dataset_cleanliness():
    """Verify cleaned tabular dataset exists, has no nulls, and no impossible BP."""
    clean_csv = os.path.join("data", "processed", "heart_disease_clean.csv")
    assert os.path.exists(clean_csv), f"Cleaned dataset missing at {clean_csv}"
    df = pd.read_csv(clean_csv)
    
    assert len(df) > 5000, f"Expected substantial dataset, got {len(df)}"
    assert df.isnull().sum().sum() == 0, "Cleaned dataset contains null values"
    
    # Blood pressure physiological validation
    assert (df["ap_hi"] >= 70).all() and (df["ap_hi"] <= 240).all(), "ap_hi contains out-of-range values"
    assert (df["ap_lo"] >= 40).all() and (df["ap_lo"] <= 150).all(), "ap_lo contains out-of-range values"
    assert (df["ap_hi"] > df["ap_lo"]).all(), "ap_hi <= ap_lo found in clean data"
    
    # Target validation
    assert set(df["cardio"].unique()) == {0, 1}, "Target column does not contain binary {0, 1}"

def test_tabular_metrics_endpoint():
    """Verify held-out evaluation metrics endpoint."""
    response = client.get("/api/models/heart-disease/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "metrics" in data
    metrics = data["metrics"]
    assert "test_accuracy" in metrics
    assert "roc_auc" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["test_accuracy"] > 0.65, f"Accuracy too low: {metrics['test_accuracy']}"
    assert metrics["roc_auc"] > 0.70, f"ROC-AUC too low: {metrics['roc_auc']}"

def test_tabular_valid_prediction():
    """Test valid clinical input prediction via API."""
    payload = {
        "age": 55.0,
        "gender": 2,
        "height": 172.0,
        "weight": 85.0,
        "ap_hi": 145,
        "ap_lo": 92,
        "cholesterol": 2,
        "gluc": 1,
        "smoke": 1,
        "alco": 0,
        "active": 0
    }
    response = client.post("/api/predict/heart-disease", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["prediction"] in [0, 1]
    assert "probability" in res
    assert 0.0 <= res["probability"] <= 1.0
    assert res["risk_level"] in ["Low", "Moderate", "High"]
    assert len(res["risk_factors"]) > 0
    assert "disclaimer" in res

def test_tabular_invalid_prediction_ranges():
    """Test API rejects physiological contradiction (diastolic >= systolic)."""
    payload = {
        "age": 50.0,
        "gender": 1,
        "height": 165.0,
        "weight": 65.0,
        "ap_hi": 100,
        "ap_lo": 110,  # Contradiction: diastolic > systolic
        "cholesterol": 1,
        "gluc": 1,
        "smoke": 0,
        "alco": 0,
        "active": 1
    }
    response = client.post("/api/predict/heart-disease", json=payload)
    assert response.status_code == 422, "API should reject diastolic >= systolic"

def test_tabular_invalid_missing_fields():
    """Test API rejects incomplete payloads."""
    payload = {
        "age": 50.0,
        "gender": 1
        # missing height, weight, BP, etc.
    }
    response = client.post("/api/predict/heart-disease", json=payload)
    assert response.status_code == 422
