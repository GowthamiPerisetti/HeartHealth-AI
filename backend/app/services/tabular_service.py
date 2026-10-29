"""
Tabular Inference Service for HeartHealth AI
Loads trained Scikit-learn Pipeline and executes cardiovascular disease predictions
with clinical risk factor analysis and transparent explanations.
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

MODEL_PATH = os.path.join("models", "heart_disease_model.joblib")

class TabularService:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.bundle = None
        self.pipeline = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.bundle = joblib.load(self.model_path)
                self.pipeline = self.bundle.get("pipeline")
                print(f"[TabularService] Successfully loaded model from {self.model_path}")
            except Exception as e:
                print(f"[TabularService] Error loading model from {self.model_path}: {e}")
                self.bundle = None
                self.pipeline = None
        else:
            print(f"[TabularService] Model file not found at {self.model_path}")

    @property
    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def get_metrics(self) -> Dict[str, Any]:
        if not self.is_loaded:
            return {"status": "not_loaded", "error": "Tabular model artifact not available"}
        return {
            "model_name": self.bundle.get("model_name", "Gradient Boosting"),
            "metrics": self.bundle.get("metrics", {}),
            "all_model_results": self.bundle.get("all_model_results", {}),
            "feature_schema": self.bundle.get("feature_schema", {})
        }

    def analyze_risk_factors(self, data: Dict[str, Any]) -> List[Dict[str, str]]:
        factors = []
        
        # Blood pressure analysis
        sbp = data.get("ap_hi", 120)
        dbp = data.get("ap_lo", 80)
        if sbp >= 140 or dbp >= 90:
            factors.append({
                "feature": "Blood Pressure",
                "status": f"Stage 2 Hypertension ({sbp}/{dbp} mmHg)",
                "detail": "Systolic >= 140 or Diastolic >= 90 mmHg strongly correlates with vascular strain.",
                "severity": "danger"
            })
        elif sbp >= 130 or dbp >= 80:
            factors.append({
                "feature": "Blood Pressure",
                "status": f"Stage 1 Hypertension ({sbp}/{dbp} mmHg)",
                "detail": "Mildly elevated blood pressure requiring lifestyle management.",
                "severity": "warning"
            })
        else:
            factors.append({
                "feature": "Blood Pressure",
                "status": f"Optimal / Normal ({sbp}/{dbp} mmHg)",
                "detail": "Blood pressure readings are within standard healthy ranges.",
                "severity": "normal"
            })

        # Cholesterol
        chol = data.get("cholesterol", 1)
        if chol == 3:
            factors.append({
                "feature": "Cholesterol",
                "status": "Well Above Normal (Category 3)",
                "detail": "Significantly elevated serum cholesterol promotes arterial plaque formation.",
                "severity": "danger"
            })
        elif chol == 2:
            factors.append({
                "feature": "Cholesterol",
                "status": "Above Normal (Category 2)",
                "detail": "Borderline high cholesterol level warrants dietary review.",
                "severity": "warning"
            })
        else:
            factors.append({
                "feature": "Cholesterol",
                "status": "Normal (Category 1)",
                "detail": "Total cholesterol levels within normal physiological limits.",
                "severity": "normal"
            })

        # Fasting Glucose
        gluc = data.get("gluc", 1)
        if gluc == 3:
            factors.append({
                "feature": "Glucose",
                "status": "Well Above Normal (Category 3)",
                "detail": "Hyperglycemia is a major independent cardiovascular risk accelerator.",
                "severity": "danger"
            })
        elif gluc == 2:
            factors.append({
                "feature": "Glucose",
                "status": "Above Normal (Category 2)",
                "detail": "Impaired fasting glucose indicates pre-diabetic metabolic risk.",
                "severity": "warning"
            })

        # Body Mass Index (BMI)
        ht = data.get("height", 170) / 100.0
        wt = data.get("weight", 70)
        bmi = wt / (ht ** 2) if ht > 0 else 22.0
        if bmi >= 30.0:
            factors.append({
                "feature": "Body Mass Index",
                "status": f"Obese (BMI {bmi:.1f} kg/m²)",
                "detail": "BMI >= 30 increases cardiac workload and metabolic syndrome risk.",
                "severity": "danger"
            })
        elif bmi >= 25.0:
            factors.append({
                "feature": "Body Mass Index",
                "status": f"Overweight (BMI {bmi:.1f} kg/m²)",
                "detail": "BMI 25-29.9 moderately elevates long-term cardiovascular risk.",
                "severity": "warning"
            })

        # Smoking
        if data.get("smoke", 0) == 1:
            factors.append({
                "feature": "Tobacco Use",
                "status": "Active Smoker",
                "detail": "Smoking induces endothelial dysfunction, vasoconstriction, and thrombosis.",
                "severity": "danger"
            })

        # Physical Inactivity
        if data.get("active", 1) == 0:
            factors.append({
                "feature": "Physical Activity",
                "status": "Sedentary Lifestyle",
                "detail": "Lack of regular exercise increases cardiometabolic vulnerability.",
                "severity": "warning"
            })

        return factors

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_model()
            if not self.is_loaded:
                raise RuntimeError("Heart disease tabular model is not loaded. Ensure model has been trained.")

        feature_cols = self.bundle.get("feature_names", [
            "age", "gender", "height", "weight", "ap_hi", "ap_lo",
            "cholesterol", "gluc", "smoke", "alco", "active"
        ])

        # Prepare single row DataFrame
        row_dict = {col: input_data[col] for col in feature_cols}
        df_input = pd.DataFrame([row_dict])

        # Model inference
        prob_array = self.pipeline.predict_proba(df_input)[0]
        pred_class = int(self.pipeline.predict(df_input)[0])
        prob_positive = float(prob_array[1])

        # Determine risk tier
        if prob_positive >= 0.65:
            risk_level = "High"
        elif prob_positive >= 0.40:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        label_map = self.bundle.get("target_labels", {
            0: "No Cardiovascular Disease",
            1: "Cardiovascular Disease Present"
        })

        risk_factors = self.analyze_risk_factors(input_data)

        return {
            "prediction": pred_class,
            "prediction_label": label_map.get(pred_class, "Unknown"),
            "probability": round(prob_positive, 4),
            "risk_level": risk_level,
            "model_name": self.bundle.get("model_name", "Gradient Boosting Classifier"),
            "risk_factors": risk_factors,
            "disclaimer": (
                "Educational research demonstration model trained on cardiovascular population data. "
                "This output represents algorithmic correlation scoring and does NOT constitute a clinical diagnosis. "
                "Always consult a licensed medical professional for personal cardiovascular evaluation."
            )
        }

tabular_service = TabularService()
