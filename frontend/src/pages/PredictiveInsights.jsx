import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PredictiveInsights = () => {
  const [migration, setMigration] = useState(null);
  const [poaching, setPoaching] = useState(null);
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('Northern Region');

  useEffect(() => {
    fetchPredictions();
  }, [region]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const [migRes, poachRes, disRes] = await Promise.all([
        axios.post('/api/analytics/migration', { species: 'Deer', region, season: 'spring' }),
        axios.post('/api/analytics/poaching-hotspots', { region }),
        axios.post('/api/analytics/disease-risk', { species: 'Elephant', region, currentCases: 5 })
      ]);
      setMigration(migRes.data);
      setPoaching(poachRes.data);
      setDisease(disRes.data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !migration) return <div className="flex items-center justify-center min-h-[60vh] text-2xl font-bold animate-pulse text-indigo-700">🔮 Predicting Future Wildlife Patterns...</div>;

  if (!migration && !loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-4xl text-neutral-300">📡</div>
      <p className="text-xl font-bold text-neutral-500">Wait for predictive models to synchronize...</p>
      <button onClick={fetchPredictions} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Predictive Insights</h1>
        <p className="text-indigo-600 font-bold mt-2 flex items-center gap-2">
          <span className="p-2 bg-indigo-100 rounded-lg">🤖</span> AI-Forecasted Wildlife Activity & Risk Assessments
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Poaching Hotspot Map Placeholder */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-indigo-50 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-3xl">🔥</span> Poaching Risk Analysis
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Geospatial hotspot prediction for the next 30 days</p>
            </div>
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 bg-indigo-50 border-none rounded-xl font-bold text-indigo-700 cursor-pointer focus:ring-2 focus:ring-indigo-200"
            >
              <option>Northern Region</option>
              <option>Southern Region</option>
              <option>Wildlife Reserve A</option>
            </select>
          </div>

          <div className="flex-grow bg-slate-100 rounded-[2rem] relative overflow-hidden border-2 border-slate-200 group">
            {/* Synthetic Map Visualization */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            {poaching?.hotspots.map((spot, i) => (
              <div 
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/spot"
                style={{ 
                  left: `${20 + (i * 30)}%`, 
                  top: `${30 + (i * 20)}%` 
                }}
              >
                <div className={`w-32 h-32 rounded-full animate-ping absolute opacity-20 ${
                  spot.risk_level === 'high' ? 'bg-red-500' : 'bg-orange-400'
                }`}></div>
                <div className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center relative z-10 border-4 border-white ${
                  spot.risk_level === 'high' ? 'bg-red-600' : 'bg-orange-500'
                }`}>
                  <span className="text-white text-xs font-black">!</span>
                </div>
                
                {/* Popover */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl opacity-0 group-hover/spot:opacity-100 transition-all pointer-events-none scale-90 group-hover/spot:scale-100 z-20">
                  <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">{spot.risk_level} RISK</p>
                  <p className="font-bold text-sm mt-1">Risk Score: {spot.risk_score !== undefined ? (spot.risk_score * 100).toFixed(0) : '0'}%</p>
                  <p className="text-xs text-slate-400 mt-2">Predicted Incidents: {spot.predicted_incidents}</p>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-3 h-3 rounded-full bg-red-600"></div>
                 <span className="text-xs font-bold text-slate-600">High Risk Area</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                 <span className="text-xs font-bold text-slate-600">Medium Risk Area</span>
               </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {poaching?.recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Recommendation {i+1}</p>
                <p className="text-xs font-bold text-indigo-900 leading-tight">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Migration Predictions */}
          <div className="bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative">
              <span className="text-2xl">🦌</span> Migration patterns
            </h3>
            
            <div className="space-y-6 relative">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Target Species</p>
                  <p className="text-2xl font-black">{migration?.species}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Season</p>
                  <p className="text-lg font-bold capitalize">{migration?.season}</p>
                </div>
              </div>
              
              <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold tracking-wider">MIGRATION LIKELIHOOD</span>
                  <span className="text-3xl font-black">{migration?.migration_probability !== undefined ? (migration.migration_probability * 100).toFixed(0) : '0'}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" style={{ width: `${migration?.migration_probability * 100}%` }}></div>
                </div>
                <p className="text-[10px] mt-4 font-bold uppercase tracking-widest opacity-60">Peak Period: {migration?.peak_migration_period}</p>
              </div>
              
              <div className="space-y-3">
                {migration?.predicted_routes.map((route, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <span className="font-bold">{route.from} → {route.to}</span>
                    <span className="font-black text-emerald-400">{route.probability !== undefined ? (route.probability * 100).toFixed(0) : '0'}% Likely</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disease Outbreak Alert */}
          <div className="bg-rose-50 rounded-[2.5rem] p-8 shadow-xl border border-rose-100">
            <h3 className="text-xl font-bold text-rose-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">🦠</span> Disease Risk Alert
            </h3>
            
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-rose-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  disease?.alert_level === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                  {disease?.alert_level} RISK
                </span>
                <span className="text-2xl">⚠️</span>
              </div>
              
              <p className="text-sm text-slate-500 font-medium">Outbreak Probability for <span className="text-rose-600 font-bold">{disease?.species}</span></p>
              <p className="text-4xl font-black text-slate-900 mt-1">{disease?.outbreak_probability !== undefined ? (disease.outbreak_probability * 100).toFixed(1) : '0.0'}%</p>
              
              <div className="mt-6 flex gap-4 text-xs font-bold uppercase tracking-widest">
                <div>
                  <p className="text-slate-400">Current Cases</p>
                  <p className="text-lg text-slate-900">{disease?.current_cases}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 self-center"></div>
                <div>
                  <p className="text-rose-400">Predicted (30d)</p>
                  <p className="text-lg text-rose-600">{disease?.predicted_cases_30_days}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-2">Preventive Action Plan</p>
              {disease?.preventive_measures.slice(0, 3).map((measure, i) => (
                <div key={i} className="flex gap-3 text-xs text-rose-900 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></div>
                  <p className="font-medium">{measure}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsights;
