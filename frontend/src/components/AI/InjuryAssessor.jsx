import React, { useState } from 'react';
import axios from 'axios';

const InjuryAssessor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const assessInjury = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/api/ai/assess-injury', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assess injury');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'severe': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 max-w-2xl mx-auto my-8 transition-all hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-red-800 mb-6 flex items-center gap-2">
        <span className="text-4xl">🏥</span> AI Injury Assessor
      </h2>
      
      <p className="text-gray-600 mb-6">
        Upload a photo of the injured animal. Our AI will analyze the injury type and provide a severity assessment to help prioritize rescue efforts.
      </p>

      <div className="mb-8 p-4 border-2 border-dashed border-red-200 rounded-xl bg-red-50/20 text-center">
        {previewUrl ? (
          <div className="relative group">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-80 mx-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.02]" 
            />
            <button 
              onClick={() => {setSelectedImage(null); setPreviewUrl(null);}}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-3 py-12 group">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
              🩸
            </div>
            <span className="font-medium text-red-700">Click to upload or drag & drop</span>
            <span className="text-xs text-red-400">Please provide a clear shot of the injury</span>
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        )}
      </div>

      {selectedImage && !result && (
        <button
          onClick={assessInjury}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin text-xl">⏳</span> Analyzing Injury...
            </span>
          ) : '🧬 Analyze Injury'}
        </button>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-lg">
          ⚠️ {error}
        </div>
      )}

      {result && result.success && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl font-bold text-sm uppercase shadow-md ${getSeverityColor(result.severity.level)}`}>
                  {result.severity.level} Severity
                </span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Priority Status</p>
                <p className={`text-xl font-black uppercase ${result.priority === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                  {result.priority}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/80 p-4 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-400 mb-1">Injury Type</p>
                <p className="text-lg font-bold text-red-900 capitalize">{result.injury_type.type}</p>
                <p className="text-xs text-red-600">{(result.injury_type.confidence * 100).toFixed(0)}% confidence</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-400 mb-1">Severity Confidence</p>
                <p className="text-lg font-bold text-red-900">{(result.severity.confidence * 100).toFixed(1)}%</p>
                <div className="w-full bg-red-200 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{width: `${result.severity.confidence * 100}%`}}></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                📋 Rescue Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-red-900 bg-white/60 p-3 rounded-lg border border-red-100 shadow-sm transition-transform hover:translate-x-1">
                    <span className="text-red-500 font-bold">●</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InjuryAssessor;
