# Tabular Data Cleaning and Preprocessing Report

## Executive Summary
- **Source File**: `heart_disease_5000_clean.csv\cardio_train.csv`
- **Initial Record Count**: 70,000
- **Retained Clean Record Count**: 68,574 (97.96% retention)
- **Target Variable**: `cardio` (Cardiovascular disease presence: 0 = Negative, 1 = Positive)
- **Target Distribution**:
  - Class 0 (Negative): 34,644 (50.52%)
  - Class 1 (Positive): 33,930 (49.48%)

## Data Quality Checks & Removals

### 1. Missing Values
- Total missing cells detected across all columns: **0**. The raw dataset had complete values for all features.

### 2. Identifier Removal & Duplicate Records
- `id` column removed to prevent arbitrary identifier leakage during model training.
- Exact duplicates including ID: **0**
- Exact feature-level duplicates (identical patient profiles): **24** records removed.

### 3. Feature Unit Standardization
- **Age**: Originally recorded in days (range 10798 to 23713 days). Converted to clinical standard **years** (`age = age_days / 365.25`), yielding age range 29.6 - 64.9 years.

### 4. Physiological Outlier Filtering Criteria
Clinically impossible measurements and typographical errors were filtered based on standard medical guidelines:
- **Systolic Blood Pressure (`ap_hi`)**: Valid range [70, 240] mmHg. Filtered 229 invalid records (raw extremes: min -150, max 16020).
- **Diastolic Blood Pressure (`ap_lo`)**: Valid range [40, 150] mmHg. Filtered 1034 invalid records (raw extremes: min -70, max 11000).
- **Blood Pressure Consistency**: Removed 1236 records where systolic pressure was lower than or equal to diastolic pressure (`ap_hi <= ap_lo`), which is physiologically contradictory.
- **Height**: Valid physiological adult range [120, 220] cm. Filtered 53 records (raw min 55 cm, max 250 cm).
- **Weight**: Valid adult range [35, 200] kg. Filtered 20 records (raw min 10.0 kg, max 200.0 kg).

## Cleaned Feature Summary
The cleaned dataset contains the following 11 input features and 1 binary target:

| Feature | Type | Range / Categories | Description |
|---|---|---|---|
| `age` | Float | 29.6 - 64.9 yrs | Patient age in years |
| `gender` | Categorical | 1: Female, 2: Male | Biological sex |
| `height` | Float | 120.0 - 207.0 cm | Patient height in centimeters |
| `weight` | Float | 35.0 - 200.0 kg | Patient weight in kilograms |
| `ap_hi` | Integer | 70 - 240 mmHg | Systolic blood pressure |
| `ap_lo` | Integer | 40 - 150 mmHg | Diastolic blood pressure |
| `cholesterol` | Categorical | 1: Normal, 2: Above Normal, 3: Well Above | Total cholesterol category |
| `gluc` | Categorical | 1: Normal, 2: Above Normal, 3: Well Above | Fasting glucose category |
| `smoke` | Binary | 0: Non-smoker, 1: Smoker | Tobacco smoking status |
| `alco` | Binary | 0: Non-drinker, 1: Alcohol user | Regular alcohol consumption |
| `active` | Binary | 0: Inactive, 1: Active | Regular physical activity |
| `cardio` | Binary (Target) | 0: Negative, 1: Positive | Presence of cardiovascular disease |

## Conclusion
The resulting dataset of **68,574 records** maintains high data integrity with 0 missing values, no leakage features, realistic physiological values, and a balanced class ratio (49.5% positive).
