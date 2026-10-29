import React, { useState } from 'react';
import {
  Activity, RotateCcw, AlertTriangle, CheckCircle2,
  TrendingUp, ShieldAlert, Heart, Info, ArrowRight, Stethoscope
} from 'lucide-react';
import { apiService } from '../services/api';
import { HeartDiseaseInput, HeartDiseasePrediction } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

const INITIAL_FORM: HeartDiseaseInput = {
  age: 50,
  gender: 1, // 1: Female, 2: Male
  height: 165,
  weight: 68,
  ap_hi: 120,
  ap_lo: 80,
  cholesterol: 1,
  gluc: 1,
  smoke: 0,
  alco: 0,
  active: 1
};

export const HeartDiseasePage: React.FC = () => {
  const [formData, setFormData] = useState<HeartDiseaseInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<HeartDiseasePrediction | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (formData.age < 18 || formData.age > 110) {
      errs.age = 'Age must be between 18 and 110 years.';
    }
    if (formData.height < 100 || formData.height > 240) {
      errs.height = 'Height must be between 100 and 240 cm.';
    }
    if (formData.weight < 30 || formData.weight > 250) {
      errs.weight = 'Weight must be between 30 and 250 kg.';
    }
    if (formData.ap_hi < 60 || formData.ap_hi > 260) {
      errs.ap_hi = 'Systolic BP must be between 60 and 260 mmHg.';
    }
    if (formData.ap_lo < 30 || formData.ap_lo > 180) {
      errs.ap_lo = 'Diastolic BP must be between 30 and 180 mmHg.';
    }
    if (formData.ap_lo >= formData.ap_hi) {
      errs.ap_lo = 'Diastolic BP must be lower than systolic BP.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof HeartDiseaseInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setPrediction(null);
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    try {
      const res = await apiService.predictHeartDisease(formData);
      setPrediction(res);
    } catch (err: any) {
      setServerError(err.message || 'Error occurred while contacting prediction service.');
    } finally {
      setLoading(false);
    }
  };

  // BMI calculation for user reference
  const heightInMeters = formData.height / 100;
  const bmi = heightInMeters > 0 ? (formData.weight / (heightInMeters * heightInMeters)).toFixed(1) : '---';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          Module A — Tabular Clinical Model
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Heart Disease Risk Prediction</h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter clinical and biometric indicators to calculate cardiovascular disease probability using our trained Gradient Boosting pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span>Patient Clinical Profile</span>
              </h2>
              <span className="text-xs text-slate-500">Calculated BMI: <strong className="text-navy">{bmi} kg/m²</strong></span>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Age <span className="text-slate-400 font-normal">(years)</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="110"
                  step="0.5"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.age ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Biological Sex</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={1}>Female (1)</option>
                  <option value={2}>Male (2)</option>
                </select>
              </div>
            </div>

            {/* Biometrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Height <span className="text-slate-400 font-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="240"
                  value={formData.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.height ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.height && <p className="text-xs text-rose-600 mt-1">{errors.height}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Weight <span className="text-slate-400 font-normal">(kg)</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.weight ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.weight && <p className="text-xs text-rose-600 mt-1">{errors.weight}</p>}
              </div>
            </div>

            {/* Blood Pressure Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Systolic BP <span className="text-slate-400 font-normal">(ap_hi, mmHg)</span>
                </label>
                <input
                  type="number"
                  min="60"
                  max="260"
                  value={formData.ap_hi}
                  onChange={(e) => handleChange('ap_hi', parseInt(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ap_hi ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.ap_hi && <p className="text-xs text-rose-600 mt-1">{errors.ap_hi}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Diastolic BP <span className="text-slate-400 font-normal">(ap_lo, mmHg)</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={formData.ap_lo}
                  onChange={(e) => handleChange('ap_lo', parseInt(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ap_lo ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.ap_lo && <p className="text-xs text-rose-600 mt-1">{errors.ap_lo}</p>}
              </div>
            </div>

            {/* Blood Chemistry Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cholesterol Level</label>
                <select
                  value={formData.cholesterol}
                  onChange={(e) => handleChange('cholesterol', parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={1}>1: Normal</option>
                  <option value={2}>2: Above Normal</option>
                  <option value={3}>3: Well Above Normal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fasting Glucose Level</label>
                <select
                  value={formData.gluc}
                  onChange={(e) => handleChange('gluc', parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={1}>1: Normal</option>
                  <option value={2}>2: Above Normal</option>
                  <option value={3}>3: Well Above Normal</option>
                </select>
              </div>
            </div>

            {/* Lifestyle Factors (Toggles) */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase">Lifestyle & Habits</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Smoking */}
                <button
                  type="button"
                  onClick={() => handleChange('smoke', formData.smoke === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    formData.smoke === 1
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-medium">Tobacco Smoker</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    formData.smoke === 1 ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {formData.smoke === 1 ? 'Yes' : 'No'}
                  </span>
                </button>

                {/* Alcohol */}
                <button
                  type="button"
                  onClick={() => handleChange('alco', formData.alco === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    formData.alco === 1
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-medium">Alcohol Intake</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    formData.alco === 1 ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {formData.alco === 1 ? 'Yes' : 'No'}
                  </span>
                </button>

                {/* Activity */}
                <button
                  type="button"
                  onClick={() => handleChange('active', formData.active === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    formData.active === 1
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-medium">Physical Activity</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    formData.active === 1 ? 'bg-teal-200 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {formData.active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Clinical Features...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Predict Cardiovascular Risk</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {serverError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block text-rose-950">Inference Error:</span>
                {serverError}
              </div>
            </div>
          )}

          {prediction ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Output Score</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  prediction.risk_level === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : prediction.risk_level === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {prediction.risk_level} Risk
                </span>
              </div>

              {/* Main Score & Prediction */}
              <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">Predicted Class</span>
                <h3 className={`text-2xl font-black ${
                  prediction.prediction === 1 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {prediction.prediction_label}
                </h3>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs text-slate-600">Model Probability:</span>
                  <span className="text-xl font-bold font-mono text-navy">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Contributing Clinical Factors */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Clinical Indicator Analysis
                </h4>
                <div className="space-y-2">
                  {prediction.risk_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        factor.severity === 'danger'
                          ? 'bg-rose-50/60 border-rose-200'
                          : factor.severity === 'warning'
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-emerald-50/60 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="text-navy">{factor.feature}</span>
                        <span className={
                          factor.severity === 'danger'
                            ? 'text-rose-700 font-bold'
                            : factor.severity === 'warning'
                            ? 'text-amber-700 font-bold'
                            : 'text-emerald-700 font-bold'
                        }>
                          {factor.status}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{factor.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Attribution & Limitation */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1 border border-slate-100">
                <p>Architecture: <strong className="text-slate-700">{prediction.model_name}</strong></p>
                <p>Trained with: <strong>54,859 Stratified Clinical Records</strong></p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy">Prediction Output Panel</h3>
              <p className="text-xs leading-relaxed max-w-sm mx-auto">
                Fill in the clinical indicators on the left and select <strong className="text-slate-700">Predict Cardiovascular Risk</strong> to view the algorithm's risk assessment and contributing factors.
              </p>
            </div>
          )}

          {/* Module-Specific Educational Disclaimer */}
          <DisclaimerBanner moduleSpecificNote="Cardiovascular prediction scores are generated via algorithmic statistical correlations from research data and do not represent a clinical diagnosis or treatment recommendation." />
        </div>
      </div>
    </div>
  );
};
