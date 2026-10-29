# HeartHealth AI — Heart Disease Prediction & Heart X-Ray Analysis

An integrated, professional healthcare academic application featuring two independent machine learning modules:

1. **Module A — Heart Disease Risk Prediction**: Evaluates 11 clinical, biometric, and lifestyle parameters using a supervised gradient boosting pipeline with automated risk factor identification.
2. **Module B — Chest X-Ray Analysis (Cardiomegaly Detection)**: Analyzes frontal chest radiographs (PA view) for radiographic silhouette enlargement using transfer learning with DenseNet-121.

> [!IMPORTANT]
> **Academic & Educational Disclaimer**
> HeartHealth AI is strictly an educational research demonstration prototype. It is not an FDA-cleared or clinically validated medical device. Both modules operate independently on separate datasets and never combine outputs into a single diagnosis.

---

## 1. System Architecture

```
HeartHealth-AI/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI application & CORS setup
│       ├── schemas.py           # Pydantic request/response models
│       ├── api/
│       │   ├── __init__.py
│       │   └── routes.py        # Modular API endpoints
│       └── services/
│           ├── __init__.py
│           ├── tabular_service.py # Tabular risk & clinical rules service
│           └── xray_service.py    # PyTorch DenseNet-121 inference service
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, DisclaimerBanner, ConfusionMatrixCard
│   │   ├── pages/               # LandingPage, Dashboard, Predictor, X-Ray, About
│   │   ├── services/            # api.ts (backend client)
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # React Router configuration
│   │   └── main.tsx
│   ├── tailwind.config.js       # Design system color palette
│   └── package.json
├── data/
│   ├── processed/
│   │   ├── heart_disease_clean.csv      # 68,574 cleaned patient records
│   │   └── cardiomegaly_manifest.csv    # 5,552 verified radiograph entries
├── models/
│   ├── heart_disease_model.joblib       # Best Gradient Boosting pipeline
│   ├── heart_disease_schema.json        # Tabular feature specifications
│   ├── cardiomegaly_model.pth           # Trained DenseNet-121 weights
│   └── cardiomegaly_config.json         # Image architecture configuration
├── reports/
│   ├── tabular_cleaning_report.md       # Tabular preprocessing documentation
│   ├── heart_disease_evaluation.md      # Tabular model comparative evaluation
│   ├── heart_disease_metrics.json       # Held-out tabular metrics
│   ├── xray_cleaning_report.md          # Radiograph verification documentation
│   ├── cardiomegaly_evaluation.md       # DenseNet-121 test evaluation report
│   └── cardiomegaly_metrics.json        # Held-out X-ray metrics
├── scripts/
│   ├── clean_tabular_data.py            # Tabular data cleaner
│   ├── train_tabular_model.py           # Tabular comparison and training
│   ├── clean_xray_manifest.py           # X-ray verification & manifest builder
│   └── train_xray_model.py              # PyTorch DenseNet-121 trainer
├── tests/
│   ├── test_tabular_and_api.py          # Pytest suite for tabular & API
│   └── test_xray_and_integration.py     # Pytest suite for X-ray & validation
├── requirements.txt
├── README.md
├── run_backend.bat / .ps1
├── run_frontend.bat / .ps1
└── run_tests.bat / .ps1
```

---

## 2. Design System

The application strictly adheres to the requested professional healthcare design system:

| Role | Color Name | Hex Code | Usage |
|---|---|---|---|
| **Text & Dark Panels** | Navy | `#0B1220` | Main text, dark panels, navigation bar, strong contrast |
| **Primary Interaction** | Blue | `#2563EB` | Primary buttons, active navigation, links, focus states |
| **Accents & Indicators**| Teal | `#14B8A6` | Secondary accents, selected indicators, positive badges |
| **Page Background**     | Off-white | `#F8FAFC` | Main application background |
| **Card Surfaces**       | White | `#FFFFFF` | Clean cards with subtle gray borders and restrained shadows |

Typography uses **Inter** for clean, accessible medical legibility.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React icons, Recharts
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **Tabular ML**: Scikit-learn (ColumnTransformer, Pipeline, Gradient Boosting, Random Forest, Logistic Regression), Pandas, NumPy, Joblib
- **Image DL**: PyTorch (CUDA GPU accelerated), Torchvision (DenseNet-121 Transfer Learning), Pillow
- **Testing**: Pytest, FastAPI TestClient, Vite Production Build

---

## 4. Setup and Installation

### Prerequisites
- Python 3.12 (`py -3.12` or `python`)
- Node.js v18+ and npm (`node -v`, `npm -v`)
- NVIDIA GPU with CUDA drivers (optional, falls back gracefully to CPU)

### Step 1: Virtual Environment Setup
```powershell
# Create Python 3.12 virtual environment
py -3.12 -m venv venv

# Activate virtual environment
.\venv\Scripts\activate
```

### Step 2: Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 5. Pipeline Execution

### Tabular Pipeline (Data Cleaning & Model Training)
```powershell
# Clean tabular dataset (filters duplicates & physiological contradictions)
python scripts/clean_tabular_data.py

# Train & compare Logistic Regression, Random Forest, and Gradient Boosting
python scripts/train_tabular_model.py
```

### X-Ray Pipeline (Image Audit & Deep Learning Training)
```powershell
# Verify image files, detect duplicates via MD5, create patient-level splits
python scripts/clean_xray_manifest.py

# Train DenseNet-121 transfer learning model with held-out test evaluation
python scripts/train_xray_model.py
```

---

## 6. Running the Application

### Option A: Launching with Convenience Scripts

1. **Start Backend**:
   Double click `run_backend.bat` or run:
   ```powershell
   .\run_backend.ps1
   ```
   *FastAPI server runs at:* `http://localhost:8000`  
   *Interactive Swagger Documentation:* `http://localhost:8000/docs`

2. **Start Frontend**:
   Double click `run_frontend.bat` or run:
   ```powershell
   .\run_frontend.ps1
   ```
   *Vite development server runs at:* `http://localhost:5173`

### Option B: Manual Command Line

```powershell
# Terminal 1 - Backend
.\venv\Scripts\activate
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 7. Running Tests

Execute the comprehensive automated test suite (Pytest backend unit/integration tests and Vite production build):

```powershell
# Run backend pytest suite
.\venv\Scripts\pytest.exe -o pythonpath=. tests/

# Run frontend production build test
cd frontend
npm run build
```

---

## 8. Verified Performance & Evaluation

### Module A — Heart Disease Tabular Model (13,715 Held-Out Cases)
- **Selected Model**: Gradient Boosting Classifier
- **Test Accuracy**: **73.31%**
- **ROC-AUC**: **0.8034**
- **Precision**: **0.7601**
- **Recall (Sensitivity)**: **0.6817**
- **F1-Score**: **0.7188**
- **Held-Out Test Cases**: 13,715 patients

### Module B — Chest X-Ray Cardiomegaly Model (1,114 Held-Out Radiographs)
- **Architecture**: DenseNet-121 (Transfer Learning)
- **Input Dimensions**: 224 x 224 x 3 channels
- **Held-Out Test Partition**: 1,114 unseen chest radiographs (557 Cardiomegaly positive, 557 No Finding)

---

## 9. Ethical and Clinical Limitations

1. **Independent Modalities**: Clinical tabular risk factors and radiographic silhouette findings are completely separate pipelines and are never combined into a single diagnosis.
2. **Radiological Scope**: A chest radiograph indicating cardiomegaly identifies cardiac enlargement. It does not assess coronary artery disease, valvular stenosis, acute coronary syndromes, or heart rhythm abnormalities.
3. **Research Prototype**: HeartHealth AI is built as an educational demonstration for academic assessment and must not be used for direct clinical patient care.
