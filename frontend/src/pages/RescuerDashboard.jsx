import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function RescuerDashboard() {
  const { role, organization } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get('/rescuer/alerts');
        setAlerts(res.data);
      } catch (err) {
        setError('Failed to load alerts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (role === 'rescuer' && organization?.verificationStatus === 'verified') {
      load();

      // Subscribe to real-time notifications with auth token
      const token = sessionStorage.getItem('token');
      const eventSource = new EventSource(`http://localhost:4000/notifications/stream?token=${token}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log(data.message);
        } else if (data.type === 'new_incident') {
          // Add new incident to alerts
          setAlerts((prev) => [data.payload, ...prev]);
          // Show toast notification
          // Using a simple alert for now, could be enhanced with a toast library
          setSuccessMsg(`🚨 New Incident Reported: ${data.payload.incidentType} ${data.payload.animalCategory}`);
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMsg(null), 5000);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [role, organization]);

  const accept = async (id) => {
    setError(null);
    setSuccessMsg(null);
    setProcessingId(id);
    try {
      const res = await api.post(`/rescuer/${id}/accept`);
      setSuccessMsg(`✅ Successfully accepted incident #${res.data.id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError('Failed to accept incident. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const updateStatus = async (id, status) => {
    setError(null);
    setSuccessMsg(null);
    setProcessingId(id);
    try {
      await api.post(`/rescuer/${id}/status`, { status });
      const statusLabel = {
        in_progress: 'In Progress',
        completed: 'Completed',
      }[status] || status;
      setSuccessMsg(`✅ Updated incident #${id} to ${statusLabel}`);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status } : a
        )
      );
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (role !== 'rescuer') {
    return (
      <div className="page-container">
        <div className="alert alert-info max-w-2xl mx-auto">
          <p className="font-medium">Access Restricted</p>
          <p className="text-sm mt-1">Only registered rescue organizations can access the rescuer dashboard. Please login or create an organization account.</p>
        </div>
      </div>
    );
  }

  if (organization?.verificationStatus !== 'verified') {
    return (
      <div className="page-container">
        <div className="alert alert-warning max-w-2xl mx-auto">
          <p className="font-medium">⏳ Verification Pending</p>
          <p className="text-sm mt-1">Your organization is currently under review. Once verified, you'll be able to view and respond to rescue incidents.</p>
          <p className="text-xs mt-2 opacity-75">Organization: {organization?.name || 'N/A'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚑</span>
            <div>
              <h1 className="page-title">Rescuer Dashboard</h1>
              <p className="text-sm text-neutral-600 mt-1">{organization?.name}</p>
            </div>
          </div>
          {alerts.length > 0 && (
            <span className="badge badge-danger text-lg px-4 py-2">{alerts.length} Active</span>
          )}
        </div>
        <p className="page-subtitle">Respond to wildlife rescue alerts and coordinate rapid response operations</p>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="alert alert-success mb-6">
          <p className="font-medium">{successMsg}</p>
        </div>
      )}
      {error && (
        <div className="alert alert-danger mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mx-auto mb-3"></div>
            <p className="text-sm">Loading rescue alerts...</p>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {!isLoading && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((incident) => (
            <div key={incident.id} className="card hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="card-header">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="card-title text-accent-600">
                      Incident #{incident.id}
                    </h3>
                    <span className="text-xs font-medium text-neutral-500">
                      {incident.animalCategory === 'dog' && '🐕'}
                      {incident.animalCategory === 'cat' && '🐈'}
                      {incident.animalCategory === 'bird' && '🦅'}
                      {incident.animalCategory === 'wildlife' && '🦁'}
                      {incident.animalCategory === 'other' && '❓'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">📍 {incident.addressText || 'Location not provided'}</p>
                </div>
                <PriorityBadge value={incident.priority} />
              </div>

              {/* Card Body */}
              <div className="card-padding space-y-3">
                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Animal Type</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">{incident.animalCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Incident Type</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">{incident.incidentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">
                      {incident.status === 'open' && '🔴 Open'}
                      {incident.status === 'assigned' && '🟡 Assigned'}
                      {incident.status === 'in_progress' && '🟠 In Progress'}
                      {incident.status === 'resolved' && '✅ Resolved'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {incident.description && (
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                    <p className="text-xs font-medium text-neutral-600 mb-1">Details</p>
                    <p className="text-sm text-neutral-700">{incident.description}</p>
                  </div>
                )}

                {/* Coordinates */}
                {incident.latitude && incident.longitude && (
                  <div className="text-xs text-neutral-500">
                    📌 Coordinates: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
                  {incident.status === 'open' && (
                    <button
                      onClick={() => accept(incident.id)}
                      disabled={processingId === incident.id}
                      className="btn btn-primary btn-sm"
                    >
                      {processingId === incident.id ? 'Processing...' : '✓ Accept Alert'}
                    </button>
                  )}

                  {(incident.status === 'assigned' || incident.status === 'open') && (
                    <button
                      onClick={() => updateStatus(incident.id, 'in_progress')}
                      disabled={processingId === incident.id}
                      className="btn btn-warning btn-sm"
                    >
                      {processingId === incident.id ? 'Processing...' : '🚗 In Progress'}
                    </button>
                  )}

                  {incident.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(incident.id, 'completed')}
                      disabled={processingId === incident.id}
                      className="btn btn-success btn-sm"
                    >
                      {processingId === incident.id ? 'Processing...' : '✅ Mark Completed'}
                    </button>
                  )}

                  {incident.status === 'completed' && (
                    <span className="badge badge-success">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && alerts.length === 0 && (
        <div className="card card-padding text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Active Alerts</h3>
          <p className="text-neutral-600">There are currently no rescue incidents that need your attention.</p>
          <p className="text-sm text-neutral-500 mt-4">Check back soon for new incident reports.</p>
        </div>
      )}
    </div>
  );
}
