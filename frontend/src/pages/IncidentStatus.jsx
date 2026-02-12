import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

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
      <div className="page-container flex items-center justify-center py-20">
        <div className="card card-padding max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-nature-cream text-nature-leaf rounded-3xl flex items-center justify-center mx-auto text-4xl">🔐</div>
          <h2 className="text-3xl font-black text-nature-slate">Access Restricted</h2>
          <p className="text-nature-slate/50 font-medium leading-relaxed">Only registered animal lovers can view incidents. Please login or create an account to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl px-6 py-20">
      {/* Page Header */}
      <div className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-nature-cream text-nature-leaf rounded-2xl flex items-center justify-center border border-nature-soft/20 shadow-soft">
            <ListIcon />
          </div>
          <div>
            <h1 className="text-4xl font-black text-nature-slate tracking-tight">Your Activity</h1>
            <p className="text-lg text-nature-slate/50 font-medium mt-1">Real-time status of your reported incidents</p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="px-6 py-3 bg-nature-soft/10 text-nature-leaf rounded-2xl border-2 border-nature-soft/20 font-black text-lg">
            {items.length} Reports Total
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-8 py-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-700 font-bold text-center mb-12">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-12 h-12 border-4 border-nature-soft/20 border-t-nature-soft rounded-full animate-spin"></div>
          <p className="text-nature-slate/50 font-black uppercase tracking-widest text-sm">Syncing with Central Command...</p>
        </div>
      )}

      {/* Incidents List */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((incident) => (
            <div key={incident.id} className="card group hover:-translate-y-1 transition-all overflow-hidden bg-white shadow-soft">
              {/* Card Header */}
              <div className="p-8 border-b border-nature-soft/10 bg-nature-bg/50 group-hover:bg-nature-cream/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1 bg-white border border-nature-soft/20 rounded-lg text-[10px] font-black text-nature-leaf uppercase">
                    Ref #AID-{incident.id.toString().slice(-4)}
                  </div>
                  <PriorityBadge value={incident.priority} />
                </div>
                <h3 className="text-xl font-black text-nature-slate line-clamp-1">{incident.addressText || 'Unknown Location'}</h3>
                <div className="flex items-center gap-2 mt-2 text-nature-slate/40 text-sm font-bold">
                  <ClockIcon /> {new Date(incident.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-nature-bg rounded-2xl border border-nature-soft/5">
                    <p className="text-[10px] font-black text-nature-slate/30 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-nature-slate capitalize flex items-center gap-2">
                       {incident.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-4 bg-nature-bg rounded-2xl border border-nature-soft/5">
                    <p className="text-[10px] font-black text-nature-slate/30 uppercase tracking-widest mb-1">Biological</p>
                    <p className="text-sm font-black text-nature-slate capitalize">{incident.animalCategory}</p>
                  </div>
                </div>

                {incident.description && (
                  <div>
                    <p className="text-[10px] font-black text-nature-slate/30 uppercase tracking-widest mb-2">Remarks</p>
                    <p className="text-sm text-nature-slate/70 font-medium line-clamp-3 leading-relaxed italic">
                      "{incident.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-8 pt-0 mt-auto">
                <div className={`px-6 py-4 rounded-2xl border-2 font-bold text-sm text-center ${
                  incident.assignedOrganization 
                  ? 'bg-nature-soft/10 border-nature-soft/20 text-nature-leaf' 
                  : 'bg-nature-cream/50 border-nature-soft/10 text-nature-slate/40'
                }`}>
                  {incident.assignedOrganization ? `Deployed: ${incident.assignedOrganization}` : 'Awaiting Responder Assignment'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="card card-padding text-center py-24 bg-white/50 border-dashed border-2 border-nature-soft/20">
          <div className="w-24 h-24 bg-nature-cream text-nature-leaf rounded-3xl flex items-center justify-center mx-auto text-4xl mb-8 opacity-50">📋</div>
          <h3 className="text-2xl font-black text-nature-slate mb-3">Silent Watch</h3>
          <p className="text-lg text-nature-slate/50 font-medium max-w-sm mx-auto mb-10">You haven't transmitted any incident signals yet. Your reports will appear here for tracking.</p>
        </div>
      )}
    </div>
  );
}
