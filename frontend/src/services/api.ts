import type {
  HeartDiseaseInput,
  HeartDiseasePrediction,
  CardiomegalyPrediction,
  TabularMetrics,
  XRayMetrics,
  ModelStatus
} from '../types';

// Read API Base URL from environment variable or fallback to local
const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const API_BASE = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`)
  : 'http://localhost:8000/api';

async function fetchWithColdStartNotice(url: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to the backend API. If the service was idle (Render free tier), it may take 30-50 seconds to wake up from cold start. Please retry in a few moments.'
      );
    }
    throw err;
  }
}

export const apiService = {
  getApiBase(): string {
    return API_BASE;
  },

  async checkHealth() {
    const res = await fetchWithColdStartNotice(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetchWithColdStartNotice(`${API_BASE}/models/status`);
    if (!res.ok) throw new Error(`Failed to load model status: ${res.statusText}`);
    return res.json();
  },

  async getTabularMetrics(): Promise<TabularMetrics> {
    const res = await fetchWithColdStartNotice(`${API_BASE}/models/heart-disease/metrics`);
    if (!res.ok) throw new Error(`Failed to load heart disease metrics: ${res.statusText}`);
    return res.json();
  },

  async getXRayMetrics(): Promise<XRayMetrics> {
    const res = await fetchWithColdStartNotice(`${API_BASE}/models/cardiomegaly/metrics`);
    if (!res.ok) throw new Error(`Failed to load X-ray metrics: ${res.statusText}`);
    return res.json();
  },

  async predictHeartDisease(input: HeartDiseaseInput): Promise<HeartDiseasePrediction> {
    const res = await fetchWithColdStartNotice(`${API_BASE}/predict/heart-disease`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async predictCardiomegaly(file: File): Promise<CardiomegalyPrediction> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetchWithColdStartNotice(`${API_BASE}/predict/cardiomegaly`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'X-ray analysis failed');
    }
    return res.json();
  }
};
