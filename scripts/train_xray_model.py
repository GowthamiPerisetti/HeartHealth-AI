"""
HeartHealth AI - Chest X-Ray Deep Learning Pipeline (Cardiomegaly Detection)
Uses PyTorch, Transfer Learning with DenseNet-121, stratified patient splits,
and real GPU/CPU training. Evaluates on held-out test set, saves weights to
models/cardiomegaly_model.pth, config to models/cardiomegaly_config.json,
and metrics & report to reports/.
"""

import os
import time
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import pandas as pd
import numpy as np
from sklearn.metrics import (
    roc_auc_score, accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix
)

RANDOM_SEED = 42
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

class ChestXRayDataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = row["image_path"]
        
        # Load grayscale image and convert to 3-channel RGB for pretrained CNN
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            raise RuntimeError(f"Error loading image {img_path}: {e}")

        label = int(row["label"])

        if self.transform:
            image = self.transform(image)

        return image, label

def get_transforms():
    # Standard ImageNet normalization
    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=7),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        normalize
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        normalize
    ])

    return train_transform, eval_transform

def train_and_evaluate_xray(
    manifest_path="data/processed/cardiomegaly_manifest.csv",
    epochs=6,
    batch_size=32,
    learning_rate=1e-4
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using compute device: {device}")
    if device.type == "cuda":
        print(f"Device Name: {torch.cuda.get_device_name(0)}")

    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Manifest not found at {manifest_path}. Run clean_xray_manifest.py first.")

    manifest_df = pd.read_csv(manifest_path)
    print(f"Loaded manifest: {len(manifest_df)} total records.")

    train_df = manifest_df[manifest_df["split"] == "train"].copy()
    val_df = manifest_df[manifest_df["split"] == "val"].copy()
    test_df = manifest_df[manifest_df["split"] == "test"].copy()

    print(f"Splits: Train={len(train_df)}, Val={len(val_df)}, Held-Out Test={len(test_df)}")

    train_transform, eval_transform = get_transforms()

    train_dataset = ChestXRayDataset(train_df, transform=train_transform)
    val_dataset = ChestXRayDataset(val_df, transform=eval_transform)
    test_dataset = ChestXRayDataset(test_df, transform=eval_transform)

    num_workers = 0  # Safe on Windows
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    # Initialize DenseNet-121 with pretrained weights
    print("\nInitializing DenseNet-121 transfer learning architecture...")
    model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)

    # Replace classifier head for 2 classes (No Finding=0, Cardiomegaly=1)
    num_ftrs = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_ftrs, 2)
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    # Fine-tune classifier with higher LR, backbone with lower LR or Adam
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=1)

    best_val_auc = 0.0
    best_model_state = None
    history = []

    print(f"\nBeginning training for {epochs} epochs...")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)

        train_loss = running_loss / total_train
        train_acc = correct_train / total_train

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_labels_all = []
        val_probs_all = []
        val_preds_all = []

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)

                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)

                probs = torch.softmax(outputs, dim=1)[:, 1]
                _, preds = torch.max(outputs, 1)

                val_labels_all.extend(labels.cpu().numpy().tolist())
                val_probs_all.extend(probs.cpu().numpy().tolist())
                val_preds_all.extend(preds.cpu().numpy().tolist())

        val_loss = val_loss / len(val_labels_all)
        val_acc = accuracy_score(val_labels_all, val_preds_all)
        val_auc = roc_auc_score(val_labels_all, val_probs_all)

        scheduler.step(val_auc)
        epoch_duration = time.time() - epoch_start

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4),
            "val_auc": round(val_auc, 4),
            "duration_sec": round(epoch_duration, 1)
        })

        print(
            f"Epoch {epoch}/{epochs} [{epoch_duration:.1f}s] - "
            f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.2f}% | "
            f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}%, Val AUC: {val_auc:.4f}"
        )

        if val_auc > best_val_auc:
            best_val_auc = val_auc
            best_model_state = model.state_dict().copy()
            print(f"  --> Saved new best checkpoint (Val AUC: {best_val_auc:.4f})")

    total_training_time = time.time() - start_time
    print(f"\nTraining completed in {total_training_time/60:.2f} minutes.")

    # Load best weights
    if best_model_state is not None:
        model.load_state_dict(best_model_state)

    # Final Evaluation on HELD-OUT TEST SET
    print("\n--- Evaluating on Held-Out Test Set (1,114 images) ---")
    model.eval()
    test_labels_all = []
    test_probs_all = []
    test_preds_all = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)[:, 1]
            _, preds = torch.max(outputs, 1)

            test_labels_all.extend(labels.numpy().tolist())
            test_probs_all.extend(probs.cpu().numpy().tolist())
            test_preds_all.extend(preds.cpu().numpy().tolist())

    test_acc = float(accuracy_score(test_labels_all, test_preds_all))
    test_auc = float(roc_auc_score(test_labels_all, test_probs_all))
    test_prec = float(precision_score(test_labels_all, test_preds_all))
    test_rec = float(recall_score(test_labels_all, test_preds_all))  # sensitivity
    test_f1 = float(f1_score(test_labels_all, test_preds_all))
    cm = confusion_matrix(test_labels_all, test_preds_all)
    tn, fp, fn, tp = cm[0][0], cm[0][1], cm[1][0], cm[1][1]
    specificity = float(tn / (tn + fp))

    test_metrics = {
        "test_accuracy": round(test_acc, 4),
        "test_auc": round(test_auc, 4),
        "precision": round(test_prec, 4),
        "recall_sensitivity": round(test_rec, 4),
        "specificity": round(specificity, 4),
        "f1_score": round(test_f1, 4),
        "confusion_matrix": cm.tolist(),
        "test_samples": len(test_labels_all),
        "best_val_auc": round(best_val_auc, 4),
        "total_training_time_minutes": round(total_training_time / 60, 2)
    }

    print("\nFinal Held-Out Test Results:")
    print(f"  Accuracy: {test_acc*100:.2f}%")
    print(f"  AUROC: {test_auc:.4f}")
    print(f"  Sensitivity (Recall): {test_rec:.4f}")
    print(f"  Specificity: {specificity:.4f}")
    print(f"  Precision: {test_prec:.4f}")
    print(f"  F1-Score: {test_f1:.4f}")
    print(f"  Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # Save model weights
    os.makedirs("models", exist_ok=True)
    weights_path = os.path.join("models", "cardiomegaly_model.pth")
    torch.save(model.state_dict(), weights_path)
    print(f"\nTrained model weights saved to {weights_path}")

    # Save config
    config = {
        "architecture": "DenseNet121",
        "num_classes": 2,
        "input_size": [3, 224, 224],
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        },
        "target_labels": {
            0: "No Finding (No Cardiomegaly)",
            1: "Cardiomegaly Positive"
        },
        "training_device": str(device),
        "batch_size": batch_size,
        "epochs": epochs,
        "initial_lr": learning_rate,
        "optimizer": "AdamW"
    }
    config_path = os.path.join("models", "cardiomegaly_config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Configuration saved to {config_path}")

    # Save metrics JSON
    os.makedirs("reports", exist_ok=True)
    metrics_path = os.path.join("reports", "cardiomegaly_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "test_metrics": test_metrics,
            "training_history": history,
            "config": config
        }, f, indent=2)
    print(f"Metrics saved to {metrics_path}")

    # Generate Markdown Report
    report_path = os.path.join("reports", "cardiomegaly_evaluation.md")
    md_content = f"""# Chest X-Ray Cardiomegaly Deep Learning Evaluation Report

## Model Overview
- **Architecture**: DenseNet-121 (Pretrained on ImageNet, custom 2-class classification head)
- **Input Resolution**: 224 x 224 x 3 channels
- **Target Finding**: Cardiomegaly (Class 1 = Positive, Class 0 = No Finding)
- **Training Acceleration**: {device} ({torch.cuda.get_device_name(0) if device.type == 'cuda' else 'CPU'})
- **Total Dataset Size**: {len(manifest_df):,} images
- **Train / Val / Test Distribution**:
  - Training Set: {len(train_df):,} images
  - Validation Set: {len(val_df):,} images
  - Held-Out Test Set: {len(test_df):,} images

## Held-Out Test Evaluation Results ({len(test_df):,} images)

| Metric | Score | Clinical Meaning |
|---|---|---|
| **AUROC** | **{test_auc:.4f}** | Area under the ROC curve indicating overall discriminative capability |
| **Accuracy** | **{test_acc*100:.2f}%** | Proportion of overall correct classifications on unseen test images |
| **Sensitivity (Recall)** | **{test_rec:.4f}** | Proportion of true cardiomegaly cases correctly flagged ({test_rec*100:.1f}%) |
| **Specificity** | **{specificity:.4f}** | Proportion of true negative cases correctly identified ({specificity*100:.1f}%) |
| **Precision (PPV)** | **{test_prec:.4f}** | Reliability of positive cardiomegaly predictions ({test_prec*100:.1f}%) |
| **F1-Score** | **{test_f1:.4f}** | Harmonic mean of precision and sensitivity |

### Confusion Matrix on Held-Out Test Partition:
| | Predicted Negative (No Finding) | Predicted Positive (Cardiomegaly) | Total Actual |
|---|---|---|---|
| **Actual Negative (0)** | **{tn:,}** (True Negative) | {fp:,} (False Positive) | {tn + fp:,} |
| **Actual Positive (1)** | {fn:,} (False Negative) | **{tp:,}** (True Positive) | {fn + tp:,} |
| **Total Predicted** | {tn + fn:,} | {fp + tp:,} | {len(test_df):,} |

## Training History Across Epochs
| Epoch | Training Loss | Training Acc | Validation Loss | Validation Acc | Validation AUROC | Duration |
|---|---|---|---|---|---|---|
"""
    for h in history:
        md_content += f"| {h['epoch']} | {h['train_loss']:.4f} | {h['train_acc']*100:.2f}% | {h['val_loss']:.4f} | {h['val_acc']*100:.2f}% | {h['val_auc']:.4f} | {h['duration_sec']}s |\n"

    md_content += f"""
## Diagnostic and Research Limitations
> [!IMPORTANT]
> **Radiological Disclaimer**:
> This deep learning classifier identifies a radiographic silhouette pattern associated with **Cardiomegaly**.
> 1. It does **not** evaluate ischemic heart disease, coronary artery occlusions, valvular dysfunction, or acute coronary syndromes.
> 2. It cannot replace a comprehensive radiological examination or an echocardiogram.
> 3. This system is developed strictly as an educational and research prototype and must never be utilized for real-world clinical decision making.
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Evaluation report saved to {report_path}")

    # Reusable inference verification
    print("\nVerifying inference pipeline with a sample image...")
    sample_img_path = test_df.iloc[0]["image_path"]
    with Image.open(sample_img_path).convert("RGB") as img:
        tensor = eval_transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            out = model(tensor)
            prob = torch.softmax(out, dim=1)[0, 1].item()
            pred = torch.argmax(out, dim=1).item()
    print(f"Sample test image: {sample_img_path}")
    print(f"True label: {test_df.iloc[0]['label']} ({test_df.iloc[0]['label_name']})")
    print(f"Model prediction: Class {pred} ({config['target_labels'][pred]}), Score: {prob:.4f}")

    return test_metrics

if __name__ == "__main__":
    train_and_evaluate_xray()
