import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function IncidentStatus() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/incidents');
        setItems(res.data);
      } catch (err) {
        setError('Failed to load incidents');
      }
    }
    if (role === 'animal_lover') load();
  }, [role]);

  if (role !== 'animal_lover') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-gray-700">Please login as Animal Lover to view your incidents.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-4">My Incidents</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Incident #{it.id}</div>
              <PriorityBadge value={it.priority} />
            </div>
            <div className="text-sm text-gray-600 mt-2">Status: {it.status}</div>
            <div className="text-sm text-gray-600">Type: {it.incidentType} / {it.animalCategory}</div>
            <div className="text-sm text-gray-600">Address: {it.addressText}</div>
          </div>
        ))}
        {!items.length && <div className="text-gray-600">No incidents yet.</div>}
      </div>
    </div>
  );
}
