import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConservationDashboard = () => {
  const [impact, setImpact] = useState(null);
  const [trends, setTrends] = useState(null);
  const [biodiversity, setBiodiversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState('Tiger');
  const [region, setRegion] = useState('Central Region');

  useEffect(() => {
    fetchData();
  }, [species, region]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [impactRes, trendsRes, bioRes] = await Promise.all([
        axios.get('/api/analytics/impact-report'),
        axios.post('/api/analytics/population-trends', { species, region }),
        axios.post('/api/analytics/biodiversity', { region })
      ]);
      setImpact(impactRes.data);
      setTrends(trendsRes.data);
      setBiodiversity(bioRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !impact) return <div className="flex items-center justify-center min-h-[60vh] text-2xl font-bold animate-pulse text-green-700">🌲 Loading Conservation Data...</div>;

  if (!impact && !loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-4xl text-neutral-300">📡</div>
      <p className="text-xl font-bold text-neutral-500">Wait for analytics to synchronize...</p>
      <button onClick={fetchData} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Conservation Intelligence</h1>
          <p className="text-gray-500 mt-2 font-medium">Real-time AI-powered wildlife analytics and impact reporting</p>
        </div>
        
        <div className="flex gap-4 p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <select 
            value={species} 
            onChange={(e) => setSpecies(e.target.value)}
            className="px-4 py-2 border-none bg-transparent font-bold text-green-700 focus:ring-0 cursor-pointer"
          >
            <option>Tiger</option>
            <option>Elephant</option>
            <option>Leopard</option>
            <option>Deer</option>
          </select>
          <div className="w-px h-8 bg-gray-200"></div>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-2 border-none bg-transparent font-bold text-emerald-700 focus:ring-0 cursor-pointer"
          >
            <option>Central Region</option>
            <option>Northern Region</option>
            <option>Eastern Region</option>
            <option>Wildlife Reserve</option>
          </select>
        </div>
      </header>

      {/* Impact Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Animals Rescued', value: impact?.impact_metrics.animals_rescued, icon: '🐾', color: 'from-blue-500 to-indigo-600', trend: impact?.trends.animals_rescued_change },
          { label: 'Success Rate', value: `${impact?.impact_metrics.success_rate}%`, icon: '⭐', color: 'from-green-500 to-emerald-600', trend: impact?.trends.success_rate_change },
          { label: 'Poaching Prevented', value: impact?.impact_metrics.poaching_incidents_prevented, icon: '🛡️', color: 'from-orange-500 to-red-600', trend: '+12%' },
          { label: 'Habitat Restored', value: `${impact?.impact_metrics.habitat_restored_hectares} ha`, icon: '🌿', color: 'from-emerald-400 to-green-500', trend: '+5.4%' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden relative group transition-all hover:-translate-y-2">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-gradient-to-br ${card.color}`}></div>
            <div className="flex flex-col gap-4 relative">
              <span className="text-4xl p-3 bg-gray-50 rounded-2xl w-fit shadow-inner">{card.icon}</span>
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`text-xs font-bold ${typeof card.trend === 'string' || card.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {typeof card.trend === 'string' 
                  ? card.trend 
                  : (card.trend !== undefined && card.trend !== null 
                      ? `${card.trend > 0 ? '+' : ''}${card.trend.toFixed(1)}%` 
                      : '0.0%')} vs last year
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Population Trends Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📈</span> Population Analytics: {species}
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {trends?.statistics.trend_direction}
              </span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-3 bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200 relative">
            {trends?.trend_data.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div 
                  className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-lg shadow-lg relative group transition-all duration-700" 
                  style={{ height: `${(data.population / trends.statistics.max_population) * 160}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {data.population}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold rotate-45 md:rotate-0 mt-2">{data.month.split('-')[1]}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Avg Population</p>
              <p className="text-lg font-bold text-gray-800">{trends?.statistics.average_population}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Min/Max</p>
              <p className="text-lg font-bold text-gray-800">{trends?.statistics.min_population} / {trends?.statistics.max_population}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Growth Rate</p>
              <p className="text-lg font-bold text-green-600">{trends?.statistics?.percent_change_12_months !== undefined ? `+${trends.statistics.percent_change_12_months.toFixed(1)}%` : '0.0%'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">3mo Prediction</p>
              <p className="text-lg font-bold text-indigo-600">↑ {trends?.forecast[2].predicted_population}</p>
            </div>
          </div>
        </div>

        {/* Biodiversity Stats */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <span className="text-2xl">🧬</span> Biodiversity Index
          </h3>
          
          <div className="flex-grow flex flex-col justify-center">
            <div className="relative w-48 h-48 mx-auto mb-10 group">
              <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${(biodiversity?.shannon_diversity_index / 4) * 528} 528`}
                  className="text-emerald-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black text-gray-900 tracking-tighter">{biodiversity?.shannon_diversity_index !== undefined ? biodiversity.shannon_diversity_index.toFixed(2) : '0.00'}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">{biodiversity?.biodiversity_health}</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Species Richness', value: biodiversity?.species_richness, color: 'bg-indigo-500' },
                { label: 'Species Evenness', value: `${(biodiversity?.evenness * 100).toFixed(0)}%`, color: 'bg-emerald-500' },
                { label: 'Total Individuals', value: biodiversity?.total_individuals, color: 'bg-blue-500' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stat.color} shadow-sm`}></div>
                    <span className="text-gray-500 font-bold text-sm tracking-tight">{stat.label}</span>
                  </div>
                  <span className="font-black text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 bg-indigo-500 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative">
            <span className="text-2xl">🌍</span> Regional Habitat Health
          </h3>
          <div className="space-y-6 relative">
            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold tracking-wider">HEALTH SCORE</span>
                <span className="text-3xl font-black">74.5<span className="text-sm opacity-50 ml-1">/100</span></span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[74.5%] shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] opacity-60 font-black tracking-widest">DRINKING WATER</p>
                <p className="text-lg font-bold">Good Quality</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] opacity-60 font-black tracking-widest">FOREST COVER</p>
                <p className="text-lg font-bold">65.2%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Key Achievements
          </h3>
          <div className="space-y-4">
            {impact?.top_achievements.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100 group hover:bg-green-100/50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">✅</div>
                <p className="text-green-900 font-bold text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConservationDashboard;
