import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HeartDiseasePage } from './pages/HeartDiseasePage';
import { XRayAnalysisPage } from './pages/XRayAnalysisPage';
import { AboutModelsPage } from './pages/AboutModelsPage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-offwhite flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/heart-disease" element={<HeartDiseasePage />} />
            <Route path="/xray-analysis" element={<XRayAnalysisPage />} />
            <Route path="/about-models" element={<AboutModelsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-navy border-t border-navy-700 py-6 mt-16 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-300">HeartHealth AI — Academic Research & Demonstration Prototype</p>
            <p className="mt-1 text-slate-500">
              Cardiovascular Risk Prediction & Chest Radiograph Cardiomegaly Silhouette Analysis. Not for clinical diagnostic use.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
