import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Scan, CheckCircle2,
  Clock, ArrowUpRight, BarChart3, Database, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import { ModelStatus, TabularMetrics, XRayMetrics } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ConfusionMatrixCard } from '../components/ConfusionMatrixCard';

export const DashboardPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [tabularMetrics, setTabularMetrics] = useState<TabularMetrics | null>(null);
  const [xrayMetrics, setXRayMetrics] = useState<XRayMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const status = await apiService.getModelStatus();
        setModelStatus(status);

        if (status.tabular_module.status === 'trained') {
          const tab = await apiService.getTabularMetrics().catch(() => null);
          setTabularMetrics(tab);
        }

        if (status.xray_module.status === 'trained') {
          const xray = await apiService.getXRayMetrics().catch(() => null);
          setXRayMetrics(xray);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to HeartHealth AI Backend API. Please ensure the backend is running on port 8000.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            System Status & Model Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">AI Diagnostic Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time model operational status and verified held-out evaluation performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/heart-disease"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>Tabular Predictor</span>
          </Link>
          <Link
            to="/xray-analysis"
            className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Scan className="w-4 h-4" />
            <span>X-Ray Analysis</span>
          </Link>
        </div>
      </div>

      {/* Backend Disconnection Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-rose-950">Backend Connection Notice: </span>
            <span>{error}</span>
            <p className="text-xs text-rose-700 mt-1">
              Start the FastAPI server via: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">uvicorn backend.app.main:app --port 8000 --reload</code>
            </p>
          </div>
        </div>
      )}

      {/* Module Operational Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module A Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Module A — Heart Disease</h3>
                <p className="text-xs text-slate-500">Supervised Tabular Classification</p>
              </div>
            </div>
            {modelStatus?.tabular_module.status === 'trained' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Trained & Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Training Pending
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Test Acc</span>
              <span className="text-lg font-bold text-navy">
                {tabularMetrics ? `${(tabularMetrics.metrics.test_accuracy * 100).toFixed(1)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">ROC-AUC</span>
              <span className="text-lg font-bold text-blue-600">
                {tabularMetrics ? tabularMetrics.metrics.roc_auc.toFixed(4) : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Recall</span>
              <span className="text-lg font-bold text-teal-600">
                {tabularMetrics ? tabularMetrics.metrics.recall.toFixed(4) : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Test Cases</span>
              <span className="text-lg font-bold text-slate-700">
                {tabularMetrics ? tabularMetrics.metrics.test_samples.toLocaleString() : '---'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Algorithm: <strong className="text-slate-700">Gradient Boosting</strong></span>
            <Link to="/heart-disease" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              Go to Predictor <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module B Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Module B — Chest X-Ray</h3>
                <p className="text-xs text-slate-500">Deep Radiographic Transfer Learning</p>
              </div>
            </div>
            {modelStatus?.xray_module.status === 'trained' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Trained & Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Training in Progress
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Test Acc</span>
              <span className="text-lg font-bold text-navy">
                {xrayMetrics?.test_metrics ? `${(xrayMetrics.test_metrics.test_accuracy * 100).toFixed(1)}%` : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">AUROC</span>
              <span className="text-lg font-bold text-blue-600">
                {xrayMetrics?.test_metrics ? xrayMetrics.test_metrics.test_auc.toFixed(4) : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Sensitivity</span>
              <span className="text-lg font-bold text-teal-600">
                {xrayMetrics?.test_metrics ? xrayMetrics.test_metrics.recall_sensitivity.toFixed(4) : '---'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Test Images</span>
              <span className="text-lg font-bold text-slate-700">
                {xrayMetrics?.test_metrics ? xrayMetrics.test_metrics.test_samples.toLocaleString() : '---'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Architecture: <strong className="text-slate-700">DenseNet-121</strong></span>
            <Link to="/xray-analysis" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              Go to X-Ray Upload <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dataset Summary & Provenance Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-navy">Verified Datasets & Preprocessing Integrity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Cardiovascular Tabular Cohort</span>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">cardio_train.csv</span>
            </div>
            <p className="text-xs text-slate-600">
              Cleaned from 70,000 raw patient records. Removed 24 duplicate records and 1,402 physiologically contradictory blood pressure and extreme biometric records.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1 font-medium text-slate-700">
              <span>Cleaned Records: <strong>68,574</strong></span>
              <span>Training: <strong>54,859 (80%)</strong></span>
              <span>Test: <strong>13,715 (20%)</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Cardiomegaly Radiograph Archive</span>
              <span className="text-xs font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded">cardiomegaly_manifest.csv</span>
            </div>
            <p className="text-xs text-slate-600">
              Scanned and hash-verified 5,552 grayscale PNG chest radiographs. Stratified into training, validation, and held-out test sets with 50/50 class balance.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1 font-medium text-slate-700">
              <span>Verified Images: <strong>5,552</strong></span>
              <span>Train: <strong>3,550</strong></span>
              <span>Val: <strong>888</strong></span>
              <span>Test: <strong>1,114</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Held-Out Confusion Matrices Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabularMetrics && (
          <ConfusionMatrixCard
            title="Tabular Model: Held-Out Confusion Matrix"
            matrix={tabularMetrics.metrics.confusion_matrix}
            labels={["No Disease", "Cardiovascular Disease"]}
          />
        )}
        {xrayMetrics?.test_metrics && (
          <ConfusionMatrixCard
            title="Chest X-Ray: Held-Out Confusion Matrix"
            matrix={xrayMetrics.test_metrics.confusion_matrix}
            labels={["No Finding", "Cardiomegaly Positive"]}
          />
        )}
      </div>

      {/* Academic Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
