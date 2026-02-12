import React, { useState } from 'react';
import axios from 'axios';

const SpeciesIdentifier = () => {
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

  const identifySpecies = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/api/ai/identify-species', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to identify species');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-100 max-w-2xl mx-auto my-8 transition-all hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <span className="text-4xl">🔍</span> AI Species Identifier
      </h2>
      
      <p className="text-gray-600 mb-6">
        Upload a clear photo of the wildlife animal to identify its species and conservation status instantly.
      </p>

      <div className="mb-8 p-4 border-2 border-dashed border-green-200 rounded-xl bg-green-50/30 text-center">
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
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
              📸
            </div>
            <span className="font-medium text-green-700">Click to upload or drag & drop</span>
            <span className="text-xs text-green-500">JPG, PNG or WEBP (Max 10MB)</span>
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        )}
      </div>

      {selectedImage && !result && (
        <button
          onClick={identifySpecies}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin text-xl">⏳</span> Processing Image...
            </span>
          ) : '🚀 Identify Wildlife'}
        </button>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-lg">
          ⚠️ {error}
        </div>
      )}

      {result && result.success && (
        <div className="mt-8 animate-fade-in">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-green-900 leading-tight">
                  {result.top_prediction.species}
                </h3>
                <p className="text-green-600 italic font-medium">
                  {result.top_prediction.scientific_name}
                </p>
              </div>
              <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${
                result.top_prediction.conservation_status === 'Endangered' || result.top_prediction.conservation_status === 'Critically Endangered' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {result.top_prediction.conservation_status}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1 font-bold text-green-800">
                <span>AI Confidence</span>
                <span>{(result.top_prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000 shadow-lg" 
                  style={{ width: `${result.top_prediction.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {result.all_predictions.length > 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider">Alternative Matches</h4>
                {result.all_predictions.slice(1, 4).map((pred, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white/50 p-2 rounded-lg border border-green-100">
                    <span className="text-gray-700 font-medium">{pred.species}</span>
                    <span className="text-green-600 font-bold">{(pred.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesIdentifier;
