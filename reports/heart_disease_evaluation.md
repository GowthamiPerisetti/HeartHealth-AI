# Heart Disease Tabular Model Evaluation Report

## Overview
This report evaluates three machine learning models for cardiovascular disease classification using the cleaned cardiovascular dataset (68,574 total samples).

- **Training samples**: 54,859 (80%)
- **Held-out testing samples**: 13,715 (20%, stratified by target)
- **Features**: 11 clinical and lifestyle variables
- **Target**: `cardio` (0 = Negative, 1 = Positive)

## Model Comparison

| Model | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC | Train Accuracy |
|---|---|---|---|---|---|---|
| Logistic Regression | 72.69% | 0.7543 | 0.6645 | 0.7065 | 0.7923 | 72.79% |
| Random Forest | 73.40% | 0.7566 | 0.6817 | 0.7172 | 0.8014 | 76.40% |
| Gradient Boosting | 73.31% | 0.7510 | 0.6892 | 0.7188 | 0.8034 | 74.57% |

## Selected Model: **Gradient Boosting**
**Rationale**: Gradient Boosting achieved the highest discriminatory power with an ROC-AUC of **0.8034** and an F1-score of **0.7188** on the held-out test set, while maintaining balanced generalization between training (74.57%) and testing (73.31%).

### Confusion Matrix on Held-Out Test Set (13,715 cases):
| | Predicted Negative (0) | Predicted Positive (1) | Total Actual |
|---|---|---|---|
| **Actual Negative (0)** | **5,378** (True Neg) | 1,551 (False Pos) | 6,929 |
| **Actual Positive (1)** | 2,109 (False Neg) | **4,677** (True Pos) | 6,786 |
| **Total Predicted** | 7,487 | 6,228 | 13,715 |

### Detailed Performance Breakdown:
- **Test Accuracy**: 73.31%
- **Precision**: 0.7510 (When predicting heart disease, correct 75.1% of the time)
- **Recall (Sensitivity)**: 0.6892 (Identified 68.9% of actual heart disease cases)
- **F1 Score**: 0.7188
- **ROC-AUC**: 0.8034

## Clinical and Research Disclaimer
This model is a research demonstration prototype trained on anonymized population data. It is intended for educational purposes and is **not a clinically validated diagnostic tool**. Output probabilities represent model prediction confidence based on learned historical correlations and must not be used as clinical medical advice or a substitute for professional cardiovascular evaluation.
