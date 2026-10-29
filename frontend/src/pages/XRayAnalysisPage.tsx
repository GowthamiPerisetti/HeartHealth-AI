import React, { useState, useRef } from 'react';
import {
  Scan, UploadCloud, X, CheckCircle2, AlertTriangle,
  RotateCcw, ShieldAlert, FileImage, Sparkles, HelpCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { CardiomegalyPrediction } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const XRayAnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<CardiomegalyPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setPrediction(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file format '${file.type}'. Please upload a chest radiograph in PNG or JPEG format.`);
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit. Please select a smaller radiograph file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiService.predictCardiomegaly(selectedFile);
      setPrediction(res);
    } catch (err: any) {
      setError(err.message || 'Error occurred during image inference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
          <Scan className="w-4 h-4" />
          Module B — Radiographic Deep Learning
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Heart X-Ray Analysis</h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload a frontal chest radiograph (PA view) to evaluate radiographic features associated with Cardiomegaly (enlarged cardiac silhouette).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <FileImage className="w-5 h-5 text-teal-600" />
            <span>Chest Radiograph Upload</span>
          </h2>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="xray-file-input"
            />

            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Radiograph Preview"
                    className="max-h-72 object-contain mx-auto"
                  />
                  <div className="absolute top-2 right-2 bg-navy/80 text-white text-[11px] px-2 py-0.5 rounded backdrop-blur">
                    {selectedFile?.name}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Image</span>
                  </button>
                  <label
                    htmlFor="xray-file-input"
                    className="px-3.5 py-1.5 rounded-lg border border-teal-300 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <label
                    htmlFor="xray-file-input"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer underline underline-offset-2"
                  >
                    Browse radiograph image
                  </label>
                  <span className="text-sm text-slate-500"> or drag and drop here</span>
                </div>
                <p className="text-xs text-slate-400">
                  Supported formats: PNG, JPEG, JPG (up to 10 MB). Grayscale or RGB PA chest radiographs.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-navy text-white font-medium text-sm hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Radiograph with DenseNet-121...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Analyze Radiograph</span>
                </>
              )}
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Radiological Scope Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-semibold text-navy flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              What is Cardiomegaly Silhouette Analysis?
            </span>
            <p className="leading-relaxed">
              Cardiomegaly is clinically assessed on PA chest X-rays by comparing transverse cardiac diameter against maximal internal thoracic diameter. A cardiothoracic ratio (CTR) &gt; 0.50 suggests cardiomegaly. This neural network evaluates pattern variations across the silhouette.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block text-rose-950">Analysis Notice:</span>
                {error}
              </div>
            </div>
          )}

          {prediction ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Radiological Output</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  prediction.prediction === 1
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {prediction.prediction === 1 ? 'Positive Finding' : 'Negative Finding'}
                </span>
              </div>

              {/* Finding Title & Confidence */}
              <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">Detected Silhouette Pattern</span>
                <h3 className={`text-2xl font-black ${
                  prediction.prediction === 1 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {prediction.prediction_label}
                </h3>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs text-slate-600">Model Probability Score:</span>
                  <span className="text-xl font-bold font-mono text-navy">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Radiological Finding Summary
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-lg border border-slate-100">
                  {prediction.finding_description}
                </p>
              </div>

              {/* Model Specifications */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1 border border-slate-100">
                <p>Architecture: <strong className="text-slate-700">{prediction.model_architecture}</strong></p>
                <p>Pretrained Backbone: <strong>ImageNet-1k Feature Extractor</strong></p>
                <p>Tested on: <strong>1,114 Unseen Frontal Radiographs</strong></p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy">Radiograph Evaluation Panel</h3>
              <p className="text-xs leading-relaxed max-w-sm mx-auto">
                Select or drag a chest X-ray image into the upload area and click <strong className="text-slate-700">Analyze Radiograph</strong> to generate the deep learning silhouette evaluation.
              </p>
            </div>
          )}

          {/* Mandatory Critical Limitation Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs leading-relaxed space-y-1.5 shadow-sm">
            <span className="font-bold flex items-center gap-1.5 text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Crucial Radiographic Scope Limitation:
            </span>
            <p>
              A chest radiograph classifier for Cardiomegaly evaluates solely whether the cardiac outline appears enlarged. It cannot determine overall heart health, identify coronary artery blockages, detect myocardial infarction, or replace an echocardiogram.
            </p>
          </div>

          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
};
