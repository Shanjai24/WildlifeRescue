import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function ReportIncident() {
  const { role } = useAuth();
  const [form, setForm] = useState({
    addressText: '',
    latitude: '',
    longitude: '',
    animalCategory: 'dog',
    incidentType: 'injured',
    description: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const res = await api.post('/incidents', payload);
      setResult(res.data);
      setForm({
        addressText: '',
        latitude: '',
        longitude: '',
        animalCategory: 'dog',
        incidentType: 'injured',
        description: '',
      });
    } catch (err) {
      setError('Failed to submit incident report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (role !== 'animal_lover') {
    return (
      <div className="page-container">
        <div className="alert alert-info max-w-2xl mx-auto">
          <p className="font-medium">Access Restricted</p>
          <p className="text-sm mt-1">Only registered animal lovers can report incidents. Please login or create an account to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📍</span>
          <h1 className="page-title">Report Wildlife Incident</h1>
        </div>
        <p className="page-subtitle">Help us locate and assist animals in need. Your report will be reviewed and escalated to rescue organizations.</p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <div className="card card-padding">
            {error && (
              <div className="alert alert-danger mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 text-lg">Location</h3>

                {/* Address */}
                <div className="form-group">
                  <label className="form-label">Address or Landmark</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Near Central Park, Fifth Ave"
                    value={form.addressText}
                    onChange={(e) => setForm({ ...form, addressText: e.target.value })}
                    required
                  />
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="40.7580"
                      step="0.0001"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="-73.9855"
                      step="0.0001"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="divider"></div>

              {/* Incident Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 text-lg">Incident Details</h3>

                {/* Animal Category */}
                <div className="form-group">
                  <label className="form-label">Animal Type</label>
                  <select
                    className="form-select"
                    value={form.animalCategory}
                    onChange={(e) => setForm({ ...form, animalCategory: e.target.value })}
                    required
                  >
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐈 Cat</option>
                    <option value="bird">🦅 Bird</option>
                    <option value="wildlife">🦁 Wildlife</option>
                    <option value="other">❓ Other</option>
                  </select>
                </div>

                {/* Incident Type */}
                <div className="form-group">
                  <label className="form-label">Incident Type</label>
                  <select
                    className="form-select"
                    value={form.incidentType}
                    onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
                    required
                  >
                    <option value="injured">🩹 Injured</option>
                    <option value="trapped">🪤 Trapped</option>
                    <option value="endangered">⚠️ Endangered</option>
                    <option value="aggressive">😠 Aggressive</option>
                    <option value="other">❓ Other</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="divider"></div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 text-lg">Additional Information</h3>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the situation, animal condition, and any hazards nearby..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">Be as detailed as possible to help rescuers respond effectively</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-full"
              >
                {isLoading ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Tips */}
        <div className="md:col-span-1">
          <div className="card card-padding sticky top-24">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span>💡</span> Tips for Reporting
            </h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>Be specific about location for faster response</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>Include animal's condition and behavior</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>Mention any hazards (traffic, water, etc.)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>Check your incidents in real-time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-8 card card-padding border-primary-200 bg-primary-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Incident Reported Successfully</h3>
              <p className="text-sm text-neutral-600 mt-1">Your report has been submitted and is now visible to rescue organizations.</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>

          <div className="divider mb-4"></div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-1">Incident ID</p>
              <p className="text-lg font-bold text-primary-600">#{result.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
              <PriorityBadge value={result.priority} />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-1">Animal Type</p>
              <p className="font-medium text-neutral-900 capitalize">{result.animalCategory}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-1">Incident Type</p>
              <p className="font-medium text-neutral-900 capitalize">{result.incidentType}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-neutral-200">
            <p className="text-xs font-medium text-neutral-600 mb-1">Location</p>
            <p className="text-sm text-neutral-900">{result.addressText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
