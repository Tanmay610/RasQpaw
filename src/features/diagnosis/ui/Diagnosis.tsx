import React, { useState } from 'react';
import { Bot, AlertTriangle, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import api from '../../../services/api';

export const Diagnosis = () => {
  const [animalType, setAnimalType] = useState('Dog');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe the symptoms.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/ai/diagnose', {
        animal_type: animalType,
        symptoms: symptoms
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get diagnosis from AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-600" />
          AI Veterinary Assistant
        </h1>
        <p className="text-slate-600">
          Describe the symptoms or condition of the animal. Our AI will analyze the details
          using advanced veterinary models to provide an immediate preliminary assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Animal Species
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Wildlife">Wildlife (Other)</option>
                <option value="Livestock">Livestock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Observed Symptoms & Details
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-colors resize-none"
                placeholder="E.g., The dog is limping on its left hind leg, has not eaten in 24 hours, and appears lethargic..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Get AI Diagnosis
                </>
              )}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${
                  result.urgency >= 80 ? 'bg-red-100 text-red-600' :
                  result.urgency >= 50 ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Diagnosis Results</h3>
                  <p className="text-sm text-slate-500">Urgency Score: {result.urgency}/100</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Likely Condition</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.diagnosis}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Recommended First-Aid</h4>
                  <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-xl text-indigo-900 border border-indigo-100">
                    <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                    <p>{result.recommendation}</p>
                  </div>
                </div>

                {result.requires_vet && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <p className="font-medium">Immediate veterinary attention is highly recommended based on these symptoms.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Bot className="w-16 h-16 mb-4 text-slate-300" />
              <p className="max-w-xs">
                Submit symptoms on the left to receive a rapid AI-driven veterinary assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
