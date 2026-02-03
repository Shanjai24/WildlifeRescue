import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function RescuerDashboard() {
  const { role, organization } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/rescuer/alerts');
        setAlerts(res.data);
      } catch (err) {
        setError('Failed to load alerts');
      }
    }
    if (role === 'rescuer' && organization?.verificationStatus === 'verified') {
      load();
    }
  }, [role, organization]);

  const accept = async (id) => {
    setError(null);
    try {
      const res = await api.post(`/rescuer/${id}/accept`);
      setInfo(`Accepted incident #${res.data.id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError('Failed to accept incident');
    }
  };

  const updateStatus = async (id, status) => {
    setError(null);
    try {
      await api.post(`/rescuer/${id}/status`, { status });
      setInfo(`Updated incident #${id} to ${status}`);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (role !== 'rescuer') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-gray-700">Please login as Rescuer to view dashboard.</div>
      </div>
    );
  }

  if (organization?.verificationStatus !== 'verified') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-gray-700">Your organization is not verified yet. Alerts are disabled.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-4">Rescuer Alerts</h2>
      {info && <div className="text-green-700 mb-3">{info}</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="space-y-3">
        {alerts.map((it) => (
          <div key={it.id} className="border rounded p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Incident #{it.id}</div>
              <PriorityBadge value={it.priority} />
            </div>
            <div className="text-sm text-gray-600 mt-2">Type: {it.incidentType} / {it.animalCategory}</div>
            <div className="text-sm text-gray-600">Address: {it.addressText}</div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => accept(it.id)}>Accept</button>
              <button className="px-3 py-2 rounded bg-yellow-500 text-white" onClick={() => updateStatus(it.id, 'in_progress')}>Mark In Progress</button>
              <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={() => updateStatus(it.id, 'completed')}>Mark Completed</button>
            </div>
          </div>
        ))}
        {!alerts.length && <div className="text-gray-600">No alerts at the moment.</div>}
      </div>
    </div>
  );
}
