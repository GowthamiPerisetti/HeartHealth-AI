"""
Test Suite for Chest X-Ray Pipeline & Radiograph Inference API
Tests manifest integrity, split balance, image rejection, and model inference.
"""

import os
import io
import pytest
import pandas as pd
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.xray_service import xray_service

client = TestClient(app)

def test_xray_manifest_integrity():
    """Verify clean manifest exists and has 5,552 verified records."""
    manifest_csv = os.path.join("data", "processed", "cardiomegaly_manifest.csv")
    assert os.path.exists(manifest_csv), f"Manifest missing at {manifest_csv}"
    df = pd.read_csv(manifest_csv)
    assert len(df) == 5552, f"Expected 5552 images, got {len(df)}"
    
    required_cols = {"image_filename", "image_path", "label", "label_name", "split"}
    assert required_cols.issubset(set(df.columns)), f"Missing required columns in manifest"
    assert set(df["label"].unique()) == {0, 1}

def test_xray_split_balance():
    """Verify train/val/test splits are balanced."""
    manifest_csv = os.path.join("data", "processed", "cardiomegaly_manifest.csv")
    df = pd.read_csv(manifest_csv)
    
    train_df = df[df["split"] == "train"]
    val_df = df[df["split"] == "val"]
    test_df = df[df["split"] == "test"]
    
    assert len(train_df) == 3550
    assert len(val_df) == 888
    assert len(test_df) == 1114
    
    # 50/50 balance
    assert (train_df["label"] == 1).sum() == 1775
    assert (val_df["label"] == 1).sum() == 444
    assert (test_df["label"] == 1).sum() == 557

def test_xray_rejects_non_image():
    """Verify endpoint rejects text or binary non-image files with 415."""
    files = {"file": ("document.txt", b"plain text content", "text/plain")}
    response = client.post("/api/predict/cardiomegaly", files=files)
    assert response.status_code == 415

def test_xray_rejects_empty_file():
    """Verify endpoint rejects 0-byte images with 400."""
    files = {"file": ("empty.png", b"", "image/png")}
    response = client.post("/api/predict/cardiomegaly", files=files)
    assert response.status_code == 400

def test_xray_rejects_corrupted_image():
    """Verify endpoint rejects corrupted image bytes with 400."""
    files = {"file": ("fake.png", b"\x89PNG\r\n\x1a\ncorrupted_data_not_valid_image", "image/png")}
    response = client.post("/api/predict/cardiomegaly", files=files)
    assert response.status_code == 400

def test_xray_sample_inference():
    """Verify end-to-end inference on a genuine radiograph from the test set."""
    sample_path = os.path.join(
        "cardiomegaly_5000_manifest.csv", "cardiomegaly_5000_manifest.csv",
        "test", "true", "1.png"
    )
    if not os.path.exists(sample_path):
        pytest.skip("Sample test image not found on disk")
        
    weights_path = os.path.join("models", "cardiomegaly_model.pth")
    if not os.path.exists(weights_path):
        pytest.skip("Model weights still training")
        
    with open(sample_path, "rb") as f:
        img_bytes = f.read()
        
    files = {"file": ("sample_test_1.png", img_bytes, "image/png")}
    response = client.post("/api/predict/cardiomegaly", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["prediction"] in [0, 1]
    assert 0.0 <= res["probability"] <= 1.0
    assert "finding_description" in res
    assert "disclaimer" in res
