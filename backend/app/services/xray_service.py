"""
X-Ray Deep Learning Inference Service for HeartHealth AI
Loads DenseNet-121 model weights, preprocesses chest radiograph images,
and performs real-time Cardiomegaly inference with medical findings descriptions.
"""

import os
import io
import json
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from typing import Dict, Any, Optional

WEIGHTS_PATH = os.path.join("models", "cardiomegaly_model.pth")
CONFIG_PATH = os.path.join("models", "cardiomegaly_config.json")
METRICS_PATH = os.path.join("reports", "cardiomegaly_metrics.json")

class XRayService:
    def __init__(self, weights_path: str = WEIGHTS_PATH, config_path: str = CONFIG_PATH):
        self.weights_path = weights_path
        self.config_path = config_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.config = {}
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        self.load_model()

    def load_model(self):
        if os.path.exists(self.weights_path):
            try:
                # Load config
                if os.path.exists(self.config_path):
                    with open(self.config_path, "r", encoding="utf-8") as f:
                        self.config = json.load(f)

                # Reconstruct DenseNet-121 architecture
                base_model = models.densenet121(weights=None)
                num_ftrs = base_model.classifier.in_features
                base_model.classifier = nn.Sequential(
                    nn.Dropout(0.3),
                    nn.Linear(num_ftrs, 2)
                )

                # Load trained weights
                state_dict = torch.load(self.weights_path, map_location=self.device)
                base_model.load_state_dict(state_dict)
                base_model.to(self.device)
                base_model.eval()

                self.model = base_model
                print(f"[XRayService] Successfully loaded DenseNet-121 from {self.weights_path} onto {self.device}")
            except Exception as e:
                print(f"[XRayService] Error loading model from {self.weights_path}: {e}")
                self.model = None
        else:
            print(f"[XRayService] Model weights file not found at {self.weights_path}")

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def get_metrics(self) -> Dict[str, Any]:
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                return {"error": f"Failed reading metrics: {e}"}
        return {"status": "metrics_not_found"}

    def predict_image(self, image_bytes: bytes) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_model()
            if not self.is_loaded:
                raise RuntimeError("Chest X-ray deep learning model weights are not loaded. Ensure training is complete.")

        # Validate and open image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()  # Check for corruption
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Uploaded file is corrupted or not a readable image: {e}")

        # Check reasonable dimensions
        if image.width < 32 or image.height < 32:
            raise ValueError(f"Image dimensions ({image.width}x{image.height}) are too small for chest radiograph analysis.")

        # Transform and predict
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            pred_class = int(torch.argmax(probs).item())
            prob_positive = float(probs[1].item())

        if pred_class == 1:
            label_name = "Cardiomegaly Positive"
            finding_description = (
                "The neural network detected radiographic features consistent with an enlarged cardiac silhouette (Cardiomegaly), "
                "where the cardiothoracic ratio (CTR) typically exceeds 0.50 on a standard PA projection."
            )
        else:
            label_name = "No Finding (No Cardiomegaly)"
            finding_description = (
                "No radiographic signs of cardiac enlargement were detected. The cardiac silhouette dimensions "
                "fall within expected normal parameters relative to thoracic diameter."
            )

        return {
            "prediction": pred_class,
            "prediction_label": label_name,
            "probability": round(prob_positive, 4),
            "finding_description": finding_description,
            "model_architecture": self.config.get("architecture", "DenseNet121"),
            "disclaimer": (
                "Educational research demonstration model. Evaluates only radiographic silhouette enlargement (Cardiomegaly). "
                "Does NOT evaluate ischemic heart disease, coronary artery occlusions, valvular dysfunction, or acute coronary syndromes. "
                "Must never be utilized as a substitute for professional clinical or radiological diagnosis."
            )
        }

xray_service = XRayService()
