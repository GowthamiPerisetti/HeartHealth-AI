"""
HeartHealth AI - Tabular Model Training and Evaluation Pipeline
Trains and compares Logistic Regression, Random Forest, and Gradient Boosting
using a Scikit-learn Pipeline and ColumnTransformer with held-out stratified test evaluation.
Saves the best model artifact to models/heart_disease_model.joblib,
evaluation metrics to reports/heart_disease_metrics.json,
and human-readable report to reports/heart_disease_evaluation.md.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

FEATURE_COLUMNS = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active"
]

NUMERIC_FEATURES = ["age", "height", "weight", "ap_hi", "ap_lo"]
CATEGORICAL_FEATURES = ["gender", "cholesterol", "gluc"]
BINARY_FEATURES = ["smoke", "alco", "active"]
TARGET_COLUMN = "cardio"
RANDOM_STATE = 42

def load_data(clean_csv_path="data/processed/heart_disease_clean.csv"):
    if not os.path.exists(clean_csv_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {clean_csv_path}. Run clean_tabular_data.py first.")
    df = pd.read_csv(clean_csv_path)
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()
    return X, y

def build_preprocessor():
    numeric_transformer = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("bin", "passthrough", BINARY_FEATURES),
        ]
    )
    return preprocessor

def train_and_evaluate():
    print("Loading cleaned dataset...")
    X, y = load_data()
    print(f"Total samples: {len(X):,}, Features: {list(X.columns)}")

    # Stratified Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Training set: {len(X_train):,} samples")
    print(f"Held-out test set: {len(X_test):,} samples")

    candidate_models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000, random_state=RANDOM_STATE, solver="lbfgs"
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=12, min_samples_split=10,
            random_state=RANDOM_STATE, n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1, max_depth=5,
            random_state=RANDOM_STATE
        )
    }

    results = {}
    fitted_pipelines = {}

    for name, clf in candidate_models.items():
        print(f"\n--- Training {name} ---")
        pipeline = Pipeline(steps=[
            ("preprocessor", build_preprocessor()),
            ("classifier", clf)
        ])
        
        # Fit ONLY on training data
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Predict on held-out test data
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        roc_auc = float(roc_auc_score(y_test, y_prob)) if y_prob is not None else None
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Training accuracy to verify against overfitting
        y_train_pred = pipeline.predict(X_train)
        train_acc = float(accuracy_score(y_train, y_train_pred))

        results[name] = {
            "train_accuracy": round(train_acc, 4),
            "test_accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
            "confusion_matrix": cm,
            "test_samples": int(len(y_test))
        }

        print(f"Results for {name}:")
        print(f"  Test Accuracy: {acc*100:.2f}% | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
        print(f"  Train Accuracy: {train_acc*100:.2f}% (Overfit check)")

    # Select best model based on ROC-AUC and F1-Score
    best_name = max(results.keys(), key=lambda k: (results[k]["roc_auc"], results[k]["f1_score"]))
    print(f"\n===> Selected Best Model: {best_name} (ROC-AUC: {results[best_name]['roc_auc']})")

    best_pipeline = fitted_pipelines[best_name]

    # Save model and artifacts
    os.makedirs("models", exist_ok=True)
    model_save_path = os.path.join("models", "heart_disease_model.joblib")
    
    # Bundle feature schema and metadata
    artifact_bundle = {
        "model_name": best_name,
        "pipeline": best_pipeline,
        "feature_names": FEATURE_COLUMNS,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "binary_features": BINARY_FEATURES,
        "feature_schema": {
            "age": {"type": "float", "unit": "years", "min": 20.0, "max": 100.0, "default": 50.0, "description": "Patient age in years"},
            "gender": {"type": "int", "categories": {1: "Female", 2: "Male"}, "default": 1, "description": "Biological sex"},
            "height": {"type": "float", "unit": "cm", "min": 120.0, "max": 220.0, "default": 165.0, "description": "Patient height in centimeters"},
            "weight": {"type": "float", "unit": "kg", "min": 35.0, "max": 200.0, "default": 70.0, "description": "Patient weight in kilograms"},
            "ap_hi": {"type": "int", "unit": "mmHg", "min": 70, "max": 240, "default": 120, "description": "Systolic blood pressure"},
            "ap_lo": {"type": "int", "unit": "mmHg", "min": 40, "max": 150, "default": 80, "description": "Diastolic blood pressure"},
            "cholesterol": {"type": "int", "categories": {1: "Normal", 2: "Above Normal", 3: "Well Above Normal"}, "default": 1, "description": "Serum cholesterol category"},
            "gluc": {"type": "int", "categories": {1: "Normal", 2: "Above Normal", 3: "Well Above Normal"}, "default": 1, "description": "Fasting glucose category"},
            "smoke": {"type": "int", "categories": {0: "Non-smoker", 1: "Smoker"}, "default": 0, "description": "Tobacco smoking status"},
            "alco": {"type": "int", "categories": {0: "Non-drinker", 1: "Alcohol Consumer"}, "default": 0, "description": "Regular alcohol consumption"},
            "active": {"type": "int", "categories": {0: "Inactive", 1: "Physically Active"}, "default": 1, "description": "Regular physical activity"}
        },
        "target_column": TARGET_COLUMN,
        "target_labels": {0: "No Cardiovascular Disease", 1: "Cardiovascular Disease Present"},
        "metrics": results[best_name],
        "all_model_results": results
    }

    joblib.dump(artifact_bundle, model_save_path)
    print(f"Saved best model bundle to {model_save_path}")

    # Save feature schema JSON
    schema_path = os.path.join("models", "heart_disease_schema.json")
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(artifact_bundle["feature_schema"], f, indent=2)
    print(f"Saved feature schema to {schema_path}")

    # Save metrics JSON
    os.makedirs("reports", exist_ok=True)
    metrics_path = os.path.join("reports", "heart_disease_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "selected_model": best_name,
            "evaluation_metrics": results[best_name],
            "all_models_comparison": results,
            "train_set_size": len(X_train),
            "test_set_size": len(X_test),
            "features_used": FEATURE_COLUMNS
        }, f, indent=2)
    print(f"Saved evaluation metrics to {metrics_path}")

    # Save markdown evaluation report
    report_path = os.path.join("reports", "heart_disease_evaluation.md")
    md_content = f"""# Heart Disease Tabular Model Evaluation Report

## Overview
This report evaluates three machine learning models for cardiovascular disease classification using the cleaned cardiovascular dataset ({len(X):,} total samples).

- **Training samples**: {len(X_train):,} (80%)
- **Held-out testing samples**: {len(X_test):,} (20%, stratified by target)
- **Features**: {len(FEATURE_COLUMNS)} clinical and lifestyle variables
- **Target**: `cardio` (0 = Negative, 1 = Positive)

## Model Comparison

| Model | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC | Train Accuracy |
|---|---|---|---|---|---|---|
"""
    for name, m in results.items():
        md_content += f"| {name} | {m['test_accuracy']*100:.2f}% | {m['precision']:.4f} | {m['recall']:.4f} | {m['f1_score']:.4f} | {m['roc_auc']:.4f} | {m['train_accuracy']*100:.2f}% |\n"

    best_cm = results[best_name]["confusion_matrix"]
    tn, fp, fn, tp = best_cm[0][0], best_cm[0][1], best_cm[1][0], best_cm[1][1]

    md_content += f"""
## Selected Model: **{best_name}**
**Rationale**: {best_name} achieved the highest discriminatory power with an ROC-AUC of **{results[best_name]['roc_auc']:.4f}** and an F1-score of **{results[best_name]['f1_score']:.4f}** on the held-out test set, while maintaining balanced generalization between training ({results[best_name]['train_accuracy']*100:.2f}%) and testing ({results[best_name]['test_accuracy']*100:.2f}%).

### Confusion Matrix on Held-Out Test Set ({len(X_test):,} cases):
| | Predicted Negative (0) | Predicted Positive (1) | Total Actual |
|---|---|---|---|
| **Actual Negative (0)** | **{tn:,}** (True Neg) | {fp:,} (False Pos) | {tn + fp:,} |
| **Actual Positive (1)** | {fn:,} (False Neg) | **{tp:,}** (True Pos) | {fn + tp:,} |
| **Total Predicted** | {tn + fn:,} | {fp + tp:,} | {len(X_test):,} |

### Detailed Performance Breakdown:
- **Test Accuracy**: {results[best_name]['test_accuracy']*100:.2f}%
- **Precision**: {results[best_name]['precision']:.4f} (When predicting heart disease, correct {results[best_name]['precision']*100:.1f}% of the time)
- **Recall (Sensitivity)**: {results[best_name]['recall']:.4f} (Identified {results[best_name]['recall']*100:.1f}% of actual heart disease cases)
- **F1 Score**: {results[best_name]['f1_score']:.4f}
- **ROC-AUC**: {results[best_name]['roc_auc']:.4f}

## Clinical and Research Disclaimer
This model is a research demonstration prototype trained on anonymized population data. It is intended for educational purposes and is **not a clinically validated diagnostic tool**. Output probabilities represent model prediction confidence based on learned historical correlations and must not be used as clinical medical advice or a substitute for professional cardiovascular evaluation.
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved evaluation markdown to {report_path}")

    # Self-test reusable prediction function
    print("\nTesting prediction pipeline with sample input...")
    sample_input = pd.DataFrame([{
        "age": 55.0, "gender": 2, "height": 175.0, "weight": 82.0,
        "ap_hi": 140, "ap_lo": 90, "cholesterol": 2, "gluc": 1,
        "smoke": 0, "alco": 0, "active": 1
    }])
    pred_prob = best_pipeline.predict_proba(sample_input)[0]
    pred_class = int(best_pipeline.predict(sample_input)[0])
    print(f"Sample prediction: Class {pred_class} ({artifact_bundle['target_labels'][pred_class]}), Probability: {pred_prob[1]:.4f}")

    return artifact_bundle

if __name__ == "__main__":
    train_and_evaluate()
