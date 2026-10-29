import React, { useEffect, useState } from 'react';
import {
  Info, Database, Layers, CheckCircle2, ShieldAlert,
  GitBranch, Cpu, Award, BookOpen
} from 'lucide-react';
import { apiService } from '../services/api';
import { TabularMetrics, XRayMetrics } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ConfusionMatrixCard } from '../components/ConfusionMatrixCard';

export const AboutModelsPage: React.FC = () => {
  const [tabularMetrics, setTabularMetrics] = useState<TabularMetrics | null>(null);
  const [xrayMetrics, setXRayMetrics] = useState<XRayMetrics | null>(null);

  useEffect(() => {
    apiService.getTabularMetrics().then(setTabularMetrics).catch(() => null);
    apiService.getXRayMetrics().then(setXRayMetrics).catch(() => null);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          Technical Documentation & Audit
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">About the Models & Methodology</h1>
        <p className="text-sm text-slate-600 mt-1">
          Full technical disclosure of data provenance, preprocessing pipelines, model architectures, and held-out evaluation methodology.
        </p>
      </div>

      {/* Dataset Sources & Preprocessing Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Dataset Provenance & Preprocessing Integrity</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabular Dataset Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tabular Cohort</span>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">cardio_train.csv</span>
            </div>
            <h3 className="text-base font-bold text-navy">Cardiovascular Patient Records</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Originated from 70,000 patient examinations containing demographic, physiological, blood chemistry, and behavioral indicators.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-navy mb-1">Cleaning Strategy:</div>
              <div>• Removed arbitrary <code className="text-blue-700">id</code> column to prevent leakage.</div>
              <div>• Dropped 24 exact feature duplicates.</div>
              <div>• Standardized age from raw days to clinical decimal years (<code className="text-blue-700">age / 365.25</code>).</div>
              <div>• Filtered physiological contradictions: systolic BP [70, 240], diastolic BP [40, 150], and enforced <code className="text-blue-700">systolic &gt; diastolic</code>.</div>
              <div>• Clean cohort retained: <strong>68,574 patients (97.96% retention)</strong> with 0 missing values.</div>
            </div>
          </div>

          {/* X-Ray Dataset Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Imaging Archive</span>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">cardiomegaly_manifest.csv</span>
            </div>
            <h3 className="text-base font-bold text-navy">Chest Radiograph Archive</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consists of 5,552 verified chest X-ray images in grayscale PNG format specifically cataloged for the radiographic finding of Cardiomegaly.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-navy mb-1">Verification Strategy:</div>
              <div>• Automated MD5 hash audit verified 0 corrupted and 0 duplicate images.</div>
              <div>• Positive class: Confirmed radiographic Cardiomegaly (CTR &gt; 0.50).</div>
              <div>• Negative class: Documented No Finding in the archive.</div>
              <div>• Partitioned into patient-level splits to guarantee zero split leakage:</div>
              <div className="pl-2">• Training: <strong>3,550 images (50/50 balance)</strong></div>
              <div className="pl-2">• Validation: <strong>888 images (50/50 balance)</strong></div>
              <div className="pl-2">• Held-Out Test: <strong>1,114 images (50/50 balance)</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Architectures & Training Pipelines */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          <span>Architectures & Training Methodology</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabular Model Architecture */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module A Architecture</span>
            <h3 className="text-base font-bold text-navy">Gradient Boosting Classifier Pipeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Implemented inside a Scikit-learn Pipeline with a strict ColumnTransformer to prevent data leakage. Preprocessing was fit solely on training data.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Numeric Transformers:</span>
                <span className="font-medium text-navy">StandardScaler (age, height, weight, ap_hi, ap_lo)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Categorical Transformers:</span>
                <span className="font-medium text-navy">OneHotEncoder (gender, cholesterol, gluc)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Binary Features:</span>
                <span className="font-medium text-navy">Passthrough (smoke, alco, active)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Models Compared:</span>
                <span className="font-medium text-navy">Logistic Regression, Random Forest, Gradient Boosting</span>
              </div>
            </div>
          </div>

          {/* Deep Learning Architecture */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Module B Architecture</span>
            <h3 className="text-base font-bold text-navy">DenseNet-121 Densely Connected Network</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              DenseNet-121 is recognized in medical imaging literature for high feature reuse and gradient flow across deep layers without vanishing gradients.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Input Resolution:</span>
                <span className="font-medium text-navy">224 x 224 x 3 channels</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Normalization:</span>
                <span className="font-medium text-navy">ImageNet Mean [0.485, 0.456, 0.406] / Std [0.229, 0.224, 0.225]</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Data Augmentation:</span>
                <span className="font-medium text-navy">RandomHorizontalFlip(p=0.5), RandomRotation(7°)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Optimization:</span>
                <span className="font-medium text-navy">AdamW, CrossEntropyLoss, ReduceLROnPlateau</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabular Model Comparison Table */}
      {tabularMetrics?.all_model_results && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-navy">Tabular Model Comparative Evaluation (13,715 Held-Out Cases)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <th className="p-3">Candidate Model</th>
                  <th className="p-3">Test Accuracy</th>
                  <th className="p-3">Precision</th>
                  <th className="p-3">Recall</th>
                  <th className="p-3">F1-Score</th>
                  <th className="p-3">ROC-AUC</th>
                  <th className="p-3">Overfit Check (Train Acc)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(tabularMetrics.all_model_results).map(([name, m]) => {
                  const isSelected = name === tabularMetrics.model_name;
                  return (
                    <tr key={name} className={isSelected ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-semibold text-navy">{name}</td>
                      <td className="p-3">{(m.test_accuracy * 100).toFixed(2)}%</td>
                      <td className="p-3">{m.precision.toFixed(4)}</td>
                      <td className="p-3">{m.recall.toFixed(4)}</td>
                      <td className="p-3">{m.f1_score.toFixed(4)}</td>
                      <td className="p-3 font-bold text-blue-700">{m.roc_auc.toFixed(4)}</td>
                      <td className="p-3 text-slate-500">{(m.train_accuracy * 100).toFixed(2)}%</td>
                      <td className="p-3">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase">
                            Selected
                          </span>
                        ) : (
                          <span className="text-slate-400">Baseline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Held-Out Evaluation Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabularMetrics && (
          <ConfusionMatrixCard
            title="Tabular Model: Held-Out Test Confusion Matrix"
            matrix={tabularMetrics.metrics.confusion_matrix}
            labels={["Negative", "Cardiovascular Disease"]}
          />
        )}
        {xrayMetrics?.test_metrics && (
          <ConfusionMatrixCard
            title="Chest X-Ray: Held-Out Test Confusion Matrix"
            matrix={xrayMetrics.test_metrics.confusion_matrix}
            labels={["No Finding", "Cardiomegaly Positive"]}
          />
        )}
      </div>

      {/* Responsible AI & Clinical Limitations */}
      <div className="p-6 bg-slate-900 rounded-2xl text-slate-200 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-teal-400" />
          <span>Responsible AI Disclosures & Academic Scope</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. <strong>Independent Modalities:</strong> HeartHealth AI maintains complete functional separation between clinical tabular risk scoring and chest radiograph analysis. Tabular risk factors are never converted into image features, and image predictions are never conflated with blood pressure or biometric indices.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          2. <strong>Radiological Specificity:</strong> The chest X-ray module evaluates only the radiographic silhouette pattern for Cardiomegaly. It does not assess coronary artery disease, valvular stenosis, or acute coronary syndrome.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          3. <strong>Academic Classification:</strong> This software is strictly an educational research prototype. It has not received FDA 510(k), CE-MDR, or regulatory clearance as a medical device and must never be utilized for patient diagnosis or clinical management.
        </p>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
