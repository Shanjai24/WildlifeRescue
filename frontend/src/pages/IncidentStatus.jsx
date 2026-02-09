import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function IncidentStatus() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get('/incidents');
        setItems(res.data);
      } catch (err) {
        setError('Failed to load your incidents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (role === 'animal_lover') load();
  }, [role]);

  if (role !== 'animal_lover') {
    return (
      <div className="page-container">
        <div className="alert alert-info max-w-2xl mx-auto">
          <p className="font-medium">Access Restricted</p>
          <p className="text-sm mt-1">Only registered animal lovers can view incidents. Please login or create an account to continue.</p>
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
            <span className="text-3xl">📋</span>
            <h1 className="page-title">Your Incident Reports</h1>
          </div>
          {items.length > 0 && (
            <span className="badge badge-primary">{items.length} Total</span>
          )}
        </div>
        <p className="page-subtitle">Track the status of your reported incidents and see rescue organization responses</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-sm">Loading your incidents...</p>
          </div>
        </div>
      )}

      {/* Incidents List */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-4">
          {items.map((incident) => (
            <div key={incident.id} className="card hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="card-header">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="card-title text-primary-600">
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
                  <p className="text-sm text-neutral-600 mt-1">{incident.addressText || 'Location not provided'}</p>
                </div>
                <PriorityBadge value={incident.priority} />
              </div>

              {/* Card Body */}
              <div className="card-padding space-y-3">
                {/* Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">
                      {incident.status === 'open' && '🔴 Open'}
                      {incident.status === 'assigned' && '🟡 Assigned'}
                      {incident.status === 'in_progress' && '🟠 In Progress'}
                      {incident.status === 'resolved' && '✅ Resolved'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Animal Type</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">{incident.animalCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Incident Type</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">{incident.incidentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Priority</p>
                    <p className="text-sm font-semibold text-neutral-900 capitalize">{incident.priority}</p>
                  </div>
                </div>

                {/* Description */}
                {incident.description && (
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1">Description</p>
                    <p className="text-sm text-neutral-700 line-clamp-2">{incident.description}</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="card-footer text-xs text-neutral-500">
                <span>Reported on {new Date(incident.createdAt || Date.now()).toLocaleDateString()}</span>
                {incident.assignedOrganization && (
                  <span>Assigned to {incident.assignedOrganization}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="card card-padding text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Incidents Yet</h3>
          <p className="text-neutral-600 mb-6">You haven't reported any incidents. When you do, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}
