# Chest X-Ray Cardiomegaly Deep Learning Evaluation Report

## Model Overview
- **Architecture**: DenseNet-121 (Pretrained on ImageNet, custom 2-class classification head)
- **Input Resolution**: 224 x 224 x 3 channels
- **Target Finding**: Cardiomegaly (Class 1 = Positive, Class 0 = No Finding)
- **Training Acceleration**: cuda (NVIDIA GeForce RTX 4050 Laptop GPU)
- **Total Dataset Size**: 5,552 images
- **Train / Val / Test Distribution**:
  - Training Set: 3,550 images
  - Validation Set: 888 images
  - Held-Out Test Set: 1,114 images

## Held-Out Test Evaluation Results (1,114 images)

| Metric | Score | Clinical Meaning |
|---|---|---|
| **AUROC** | **0.8780** | Area under the ROC curve indicating overall discriminative capability |
| **Accuracy** | **78.55%** | Proportion of overall correct classifications on unseen test images |
| **Sensitivity (Recall)** | **0.8797** | Proportion of true cardiomegaly cases correctly flagged (88.0%) |
| **Specificity** | **0.6912** | Proportion of true negative cases correctly identified (69.1%) |
| **Precision (PPV)** | **0.7402** | Reliability of positive cardiomegaly predictions (74.0%) |
| **F1-Score** | **0.8039** | Harmonic mean of precision and sensitivity |

### Confusion Matrix on Held-Out Test Partition:
| | Predicted Negative (No Finding) | Predicted Positive (Cardiomegaly) | Total Actual |
|---|---|---|---|
| **Actual Negative (0)** | **385** (True Negative) | 172 (False Positive) | 557 |
| **Actual Positive (1)** | 67 (False Negative) | **490** (True Positive) | 557 |
| **Total Predicted** | 452 | 662 | 1,114 |

## Training History Across Epochs
| Epoch | Training Loss | Training Acc | Validation Loss | Validation Acc | Validation AUROC | Duration |
|---|---|---|---|---|---|---|
| 1 | 0.6021 | 66.76% | 0.5420 | 72.97% | 0.8258 | 825.6s |
| 2 | 0.4685 | 77.35% | 0.4618 | 77.82% | 0.8659 | 822.6s |
| 3 | 0.4115 | 81.01% | 0.4626 | 79.17% | 0.8780 | 168.9s |
| 4 | 0.3647 | 83.55% | 0.4592 | 80.07% | 0.8853 | 82.4s |
| 5 | 0.3210 | 85.97% | 0.5351 | 74.21% | 0.8757 | 88.2s |
| 6 | 0.2730 | 88.31% | 0.5312 | 79.73% | 0.8885 | 85.4s |

## Diagnostic and Research Limitations
> [!IMPORTANT]
> **Radiological Disclaimer**:
> This deep learning classifier identifies a radiographic silhouette pattern associated with **Cardiomegaly**.
> 1. It does **not** evaluate ischemic heart disease, coronary artery occlusions, valvular dysfunction, or acute coronary syndromes.
> 2. It cannot replace a comprehensive radiological examination or an echocardiogram.
> 3. This system is developed strictly as an educational and research prototype and must never be utilized for real-world clinical decision making.
