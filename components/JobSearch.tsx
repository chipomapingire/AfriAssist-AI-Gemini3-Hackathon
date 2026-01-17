
import React, { useState, useEffect } from 'react';
import { searchOpportunities, searchLocalMap, SearchFilters } from '../geminiService';
import { UserProfile } from '../types';

interface JobSearchProps {
  profile?: UserProfile;
}

const JobSearch: React.FC<JobSearchProps> = ({ profile }) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    experienceLevel: profile?.experienceLevel || '',
    industry: '',
    salaryRange: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[], places?: any[] } | null>(null);

  useEffect(() => {
    if (profile?.experienceLevel) {
      setFilters(prev => ({ ...prev, experienceLevel: profile.experienceLevel }));
    }
  }, [profile]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (viewMode === 'map') {
        // Fallback or demo coordinates if geolocation not available
        const pos = { lat: 6.5244, lng: 3.3792 }; // Lagos default
        navigator.geolocation.getCurrentPosition(async (position) => {
          const data = await searchLocalMap(query || "Job Centers", { lat: position.coords.latitude, lng: position.coords.longitude });
          setResult({ text: data.text, sources: [], places: data.places });
          setLoading(false);
        }, async () => {
          const data = await searchLocalMap(query || "Job Centers", pos);
          setResult({ text: data.text, sources: [], places: data.places });
          setLoading(false);
        });
      } else {
        const data = await searchOpportunities(query, profile, filters);
        setResult(data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col h-full bg-slate-50">
      <div className="max-w-5xl mx-auto w-full text-center mb-10">
        <div className="flex justify-between items-end mb-6">
          <div className="text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Opportunity Engine</h2>
            <p className="text-slate-500 font-medium">Global jobs and local business hubs at your fingertips.</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Map (Beta)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={viewMode === 'map' ? "Search for job centers or startup hubs near you..." : "Tech jobs, creative grants, or remote gigs..."}
              className="w-full pl-14 pr-44 py-5 bg-white border-2 border-slate-100 focus:border-orange-500 rounded-[2rem] outline-none transition-all text-lg shadow-xl font-medium"
            />
            <div className="absolute right-3 top-3 bottom-3 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                  showFilters || Object.values(filters).some(v => v !== '') 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-8 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 disabled:bg-slate-300 transition-all shadow-xl active:scale-95"
              >
                {loading ? '...' : 'Launch'}
              </button>
            </div>
          </form>

          {showFilters && viewMode === 'list' && (
            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                <select name="experienceLevel" value={filters.experienceLevel} onChange={(e) => setFilters(f=>({...f, experienceLevel: e.target.value}))} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold">
                  <option value="">Any</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                <input type="text" placeholder="e.g. Fintech" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold" onChange={(e)=>setFilters(f=>({...f, industry: e.target.value}))}/>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Salary Goal</label>
                <input type="text" placeholder="e.g. $2000/mo" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold" onChange={(e)=>setFilters(f=>({...f, salaryRange: e.target.value}))}/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full space-y-8 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">🦁</div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Syncing with African Markets...</p>
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-8">
              <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {result.text}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(viewMode === 'list' ? result.sources : (result.places || [])).map((item, i) => (
                <a
                  key={i}
                  href={item.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-6 bg-white border-2 border-slate-50 rounded-3xl hover:border-orange-500 hover:shadow-2xl transition-all group"
                >
                  <div className="bg-orange-50 p-4 rounded-2xl mr-5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {viewMode === 'list' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-orange-600 transition-colors truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider truncate">{new URL(item.uri).hostname}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none">
            <span className="text-9xl mb-6">🌍</span>
            <p className="text-2xl font-black uppercase tracking-widest text-slate-800">The continent is calling</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
