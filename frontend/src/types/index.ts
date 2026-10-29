export interface HeartDiseaseInput {
  age: number;
  gender: number;
  height: number;
  weight: number;
  ap_hi: number;
  ap_lo: number;
  cholesterol: number;
  gluc: number;
  smoke: number;
  alco: number;
  active: number;
}

export interface RiskFactor {
  feature: string;
  status: string;
  detail: string;
  severity: 'warning' | 'danger' | 'normal';
}

export interface HeartDiseasePrediction {
  prediction: number;
  prediction_label: string;
  probability: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  model_name: string;
  risk_factors: RiskFactor[];
  disclaimer: string;
}

export interface CardiomegalyPrediction {
  prediction: number;
  prediction_label: string;
  probability: number;
  finding_description: string;
  model_architecture: string;
  disclaimer: string;
}

export interface TabularMetrics {
  model_name: string;
  metrics: {
    test_accuracy: number;
    train_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
    test_samples: number;
  };
  all_model_results: Record<string, {
    test_accuracy: number;
    train_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  }>;
  feature_schema: Record<string, any>;
}

export interface XRayMetrics {
  test_metrics: {
    test_accuracy: number;
    test_auc: number;
    precision: number;
    recall_sensitivity: number;
    specificity: number;
    f1_score: number;
    confusion_matrix: number[][];
    test_samples: number;
    best_val_auc: number;
    total_training_time_minutes: number;
  };
  training_history: Array<{
    epoch: number;
    train_loss: number;
    train_acc: number;
    val_loss: number;
    val_acc: number;
    val_auc: number;
    duration_sec: number;
  }>;
  config: Record<string, any>;
}

export interface ModelStatus {
  tabular_module: {
    name: string;
    status: 'trained' | 'not_trained';
    model_architecture: string;
    artifact_path: string;
    artifact_size_bytes: number;
    is_loaded: boolean;
  };
  xray_module: {
    name: string;
    status: 'trained' | 'not_trained';
    model_architecture: string;
    artifact_path: string;
    artifact_size_bytes: number;
    is_loaded: boolean;
  };
}
