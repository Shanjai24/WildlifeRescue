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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const res = await api.post('/incidents', payload);
      setResult(res.data);
    } catch (err) {
      setError('Failed to create incident');
    }
  };

  if (role !== 'animal_lover') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-gray-700">Please login as Animal Lover to report incidents.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-4">Report Incident</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 mb-6">
        <input className="border rounded px-3 py-2 col-span-2" placeholder="Address" value={form.addressText} onChange={(e) => setForm({ ...form, addressText: e.target.value })} />
        <input className="border rounded px-3 py-2" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <input className="border rounded px-3 py-2" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <select className="border rounded px-3 py-2" value={form.animalCategory} onChange={(e) => setForm({ ...form, animalCategory: e.target.value })}>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="wildlife">Wildlife</option>
          <option value="other">Other</option>
        </select>
        <select className="border rounded px-3 py-2" value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })}>
          <option value="injured">Injured</option>
          <option value="trapped">Trapped</option>
          <option value="endangered">Endangered</option>
          <option value="aggressive">Aggressive</option>
          <option value="other">Other</option>
        </select>
        <textarea className="border rounded px-3 py-2 col-span-2" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="col-span-2 bg-blue-600 text-white rounded px-3 py-2">Submit Report</button>
      </form>
      {result && (
        <div className="border rounded p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Incident #{result.id}</div>
            <PriorityBadge value={result.priority} />
          </div>
          <div className="text-sm text-gray-600 mt-2">Status: {result.status}</div>
          <div className="text-sm text-gray-600">Type: {result.incidentType} / {result.animalCategory}</div>
          <div className="text-sm text-gray-600">Address: {result.addressText}</div>
        </div>
      )}
    </div>
  );
}
