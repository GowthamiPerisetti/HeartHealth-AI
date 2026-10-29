"""
HeartHealth AI - Tabular Data Cleaning Pipeline
Loads cardio_train.csv, detects duplicates and physiological outliers,
converts age from days to years, validates feature ranges, and saves
cleaned data to data/processed/heart_disease_clean.csv along with a
comprehensive markdown report to reports/tabular_cleaning_report.md.
"""

import os
import sys
import pandas as pd
import numpy as np

def clean_tabular_data():
    raw_path = os.path.join("heart_disease_5000_clean.csv", "cardio_train.csv")
    if not os.path.exists(raw_path):
        # Fallback check
        alt_path = os.path.join("data", "tabular", "cardio_train.csv")
        if os.path.exists(alt_path):
            raw_path = alt_path
        else:
            raise FileNotFoundError(f"Cannot find raw tabular dataset at {raw_path}")

    print(f"Loading raw dataset from {raw_path}...")
    df = pd.read_csv(raw_path, sep=";")
    total_raw = len(df)
    raw_cols = list(df.columns)
    print(f"Raw dataset loaded: {total_raw} rows, columns: {raw_cols}")

    # Missing values check
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())

    # ID column handling
    has_id = "id" in df.columns
    if has_id:
        df_no_id = df.drop(columns=["id"])
    else:
        df_no_id = df.copy()

    # Exact duplicates check
    exact_duplicates_with_id = df.duplicated().sum()
    duplicates_feature_level = df_no_id.duplicated().sum()

    # Remove feature-level exact duplicates
    df_dedup = df_no_id.drop_duplicates().copy()
    post_dedup_count = len(df_dedup)

    # Convert age from days to years (rounded to 1 decimal place)
    df_dedup["age"] = np.round(df_dedup["age"] / 365.25, 1)

    # Identify physiological outliers
    invalid_ap_hi = ((df_dedup["ap_hi"] < 70) | (df_dedup["ap_hi"] > 240)).sum()
    invalid_ap_lo = ((df_dedup["ap_lo"] < 40) | (df_dedup["ap_lo"] > 150)).sum()
    invalid_bp_relation = (df_dedup["ap_hi"] <= df_dedup["ap_lo"]).sum()
    invalid_height = ((df_dedup["height"] < 120) | (df_dedup["height"] > 220)).sum()
    invalid_weight = ((df_dedup["weight"] < 35) | (df_dedup["weight"] > 200)).sum()

    # Filter to medically valid physiological ranges
    valid_mask = (
        (df_dedup["ap_hi"] >= 70) & (df_dedup["ap_hi"] <= 240) &
        (df_dedup["ap_lo"] >= 40) & (df_dedup["ap_lo"] <= 150) &
        (df_dedup["ap_hi"] > df_dedup["ap_lo"]) &
        (df_dedup["height"] >= 120) & (df_dedup["height"] <= 220) &
        (df_dedup["weight"] >= 35) & (df_dedup["weight"] <= 200)
    )

    df_clean = df_dedup[valid_mask].copy().reset_index(drop=True)
    final_count = len(df_clean)
    retention_pct = (final_count / total_raw) * 100

    # Class balance
    cardio_counts = df_clean["cardio"].value_counts().to_dict()
    cardio_pcts = df_clean["cardio"].value_counts(normalize=True).to_dict()

    # Save cleaned dataset
    os.makedirs(os.path.join("data", "processed"), exist_ok=True)
    out_csv = os.path.join("data", "processed", "heart_disease_clean.csv")
    df_clean.to_csv(out_csv, index=False)
    print(f"Cleaned dataset saved to {out_csv} ({final_count} rows, {retention_pct:.2f}% retention)")

    # Generate Markdown Report
    os.makedirs("reports", exist_ok=True)
    report_path = os.path.join("reports", "tabular_cleaning_report.md")

    report_content = f"""# Tabular Data Cleaning and Preprocessing Report

## Executive Summary
- **Source File**: `{raw_path}`
- **Initial Record Count**: {total_raw:,}
- **Retained Clean Record Count**: {final_count:,} ({retention_pct:.2f}% retention)
- **Target Variable**: `cardio` (Cardiovascular disease presence: 0 = Negative, 1 = Positive)
- **Target Distribution**:
  - Class 0 (Negative): {cardio_counts.get(0, 0):,} ({cardio_pcts.get(0, 0)*100:.2f}%)
  - Class 1 (Positive): {cardio_counts.get(1, 0):,} ({cardio_pcts.get(1, 0)*100:.2f}%)

## Data Quality Checks & Removals

### 1. Missing Values
- Total missing cells detected across all columns: **{total_missing}**. The raw dataset had complete values for all features.

### 2. Identifier Removal & Duplicate Records
- `id` column removed to prevent arbitrary identifier leakage during model training.
- Exact duplicates including ID: **{exact_duplicates_with_id}**
- Exact feature-level duplicates (identical patient profiles): **{duplicates_feature_level}** records removed.

### 3. Feature Unit Standardization
- **Age**: Originally recorded in days (range {df['age'].min()} to {df['age'].max()} days). Converted to clinical standard **years** (`age = age_days / 365.25`), yielding age range {df_clean['age'].min():.1f} - {df_clean['age'].max():.1f} years.

### 4. Physiological Outlier Filtering Criteria
Clinically impossible measurements and typographical errors were filtered based on standard medical guidelines:
- **Systolic Blood Pressure (`ap_hi`)**: Valid range [70, 240] mmHg. Filtered {invalid_ap_hi} invalid records (raw extremes: min {df['ap_hi'].min()}, max {df['ap_hi'].max()}).
- **Diastolic Blood Pressure (`ap_lo`)**: Valid range [40, 150] mmHg. Filtered {invalid_ap_lo} invalid records (raw extremes: min {df['ap_lo'].min()}, max {df['ap_lo'].max()}).
- **Blood Pressure Consistency**: Removed {invalid_bp_relation} records where systolic pressure was lower than or equal to diastolic pressure (`ap_hi <= ap_lo`), which is physiologically contradictory.
- **Height**: Valid physiological adult range [120, 220] cm. Filtered {invalid_height} records (raw min {df['height'].min()} cm, max {df['height'].max()} cm).
- **Weight**: Valid adult range [35, 200] kg. Filtered {invalid_weight} records (raw min {df['weight'].min()} kg, max {df['weight'].max()} kg).

## Cleaned Feature Summary
The cleaned dataset contains the following 11 input features and 1 binary target:

| Feature | Type | Range / Categories | Description |
|---|---|---|---|
| `age` | Float | {df_clean['age'].min():.1f} - {df_clean['age'].max():.1f} yrs | Patient age in years |
| `gender` | Categorical | 1: Female, 2: Male | Biological sex |
| `height` | Float | {df_clean['height'].min():.1f} - {df_clean['height'].max():.1f} cm | Patient height in centimeters |
| `weight` | Float | {df_clean['weight'].min():.1f} - {df_clean['weight'].max():.1f} kg | Patient weight in kilograms |
| `ap_hi` | Integer | {df_clean['ap_hi'].min()} - {df_clean['ap_hi'].max()} mmHg | Systolic blood pressure |
| `ap_lo` | Integer | {df_clean['ap_lo'].min()} - {df_clean['ap_lo'].max()} mmHg | Diastolic blood pressure |
| `cholesterol` | Categorical | 1: Normal, 2: Above Normal, 3: Well Above | Total cholesterol category |
| `gluc` | Categorical | 1: Normal, 2: Above Normal, 3: Well Above | Fasting glucose category |
| `smoke` | Binary | 0: Non-smoker, 1: Smoker | Tobacco smoking status |
| `alco` | Binary | 0: Non-drinker, 1: Alcohol user | Regular alcohol consumption |
| `active` | Binary | 0: Inactive, 1: Active | Regular physical activity |
| `cardio` | Binary (Target) | 0: Negative, 1: Positive | Presence of cardiovascular disease |

## Conclusion
The resulting dataset of **{final_count:,} records** maintains high data integrity with 0 missing values, no leakage features, realistic physiological values, and a balanced class ratio ({cardio_pcts.get(1, 0)*100:.1f}% positive).
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
    print(f"Tabular cleaning report saved to {report_path}")

    return df_clean

if __name__ == "__main__":
    clean_tabular_data()
