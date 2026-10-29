import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Activity, Scan, ArrowRight, ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <HeartPulse className="w-4 h-4 text-blue-600" />
          Academic Machine Learning Prototype
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight">
          HeartHealth <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          An integrated clinical intelligence platform featuring two independent machine learning modules: tabular cardiovascular risk assessment and radiographic chest X-ray silhouette analysis.
        </p>
      </div>

      {/* Two Prominent Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Module A */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module A</span>
              <h2 className="text-2xl font-bold text-navy mt-1">Heart Disease Risk Prediction</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluate cardiovascular disease likelihood using 11 validated clinical, biometric, and lifestyle parameters including blood pressure, lipid categories, and physiological indicators.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Supervised Tabular Pipeline (Gradient Boosting Classifier)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Interactive Clinical Form with Real-time Validation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Stratified Evaluation on 13,715 Held-Out Clinical Cases</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4">
            <Link
              to="/heart-disease"
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm gap-2"
            >
              <span>Launch Heart Disease Predictor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Module B */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Module B</span>
              <h2 className="text-2xl font-bold text-navy mt-1">Heart X-Ray Analysis</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Deep convolutional neural network for automated detection of Cardiomegaly (enlarged cardiac silhouette) on frontal chest radiographs using transfer learning.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Deep Neural Architecture (DenseNet-121 Transfer Learning)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Drag-and-Drop Image Uploader with Instant Preview</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Patient-Level Split Evaluation on 1,114 Test Radiographs</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4">
            <Link
              to="/xray-analysis"
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-navy text-white font-medium hover:bg-navy-800 transition-colors shadow-sm gap-2"
            >
              <span>Launch X-Ray Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dataset & Architecture Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-navy">Verified Datasets</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trained on 68,574 cleaned cardiovascular patient records and 5,552 verified chest radiographs with zero cross-contamination.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-navy">Independent Pipelines</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Both modules operate independently. Tabular clinical features and radiograph images are never conflated into an artificial single diagnosis.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-navy">Academic Integrity</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All evaluation metrics (ROC-AUC, Precision, Recall, Specificity) derive strictly from authentic held-out test partitions.
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
