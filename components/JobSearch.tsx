
import React, { useState, useEffect } from 'react';
import { searchOpportunities, searchLocalMap, SearchFilters } from '../geminiService';
import { UserProfile, JobAlert } from '../types';

interface JobSearchProps {
  profile?: UserProfile;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

const ALERTS_STORAGE_KEY = 'afriassist_job_alerts';

const JobSearch: React.FC<JobSearchProps> = ({ profile, isLoggedIn, onLoginClick }) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    experienceLevel: profile?.experienceLevel || '',
    industry: '',
    salaryRange: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[], places?: any[] } | null>(null);
  const [alertFrequency, setAlertFrequency] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (profile?.experienceLevel) {
      setFilters(prev => ({ ...prev, experienceLevel: profile.experienceLevel }));
    }
    const savedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error("Failed to load alerts", e);
      }
    }
  }, [profile]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (viewMode === 'map') {
        const pos = { lat: 6.5244, lng: 3.3792 };
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

  const saveAlert = () => {
    if (!isLoggedIn) {
      onLoginClick?.();
      return;
    }
    const newAlert: JobAlert = {
      id: Math.random().toString(36).substr(2, 9),
      query: query || "General Opportunities",
      filters: {
        experienceLevel: filters.experienceLevel || '',
        industry: filters.industry || '',
        salaryRange: filters.salaryRange || ''
      },
      frequency: alertFrequency,
      createdAt: new Date().toISOString()
    };
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    alert("Alert configured!");
    setShowAlertsModal(false);
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-8 flex flex-col h-full bg-slate-50 relative overflow-x-hidden">
      {!isLoggedIn && (
        <div className="mb-6 lg:mb-10 bg-gradient-to-r from-slate-900 to-orange-950 p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] transition-all duration-700"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left space-y-1">
                 <h3 className="text-xl lg:text-3xl font-black text-white italic tracking-tighter uppercase">Unlock Personalized Growth</h3>
                 <p className="text-orange-200/60 font-medium text-[10px] lg:text-sm max-w-md uppercase tracking-widest leading-relaxed">
                   Sign in for tailored matches and AI CV tools.
                 </p>
              </div>
              <button 
                onClick={onLoginClick}
                className="w-full lg:w-auto bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95"
              >
                Sign In Now
              </button>
           </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full text-center mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">Opportunity Engine</h2>
            <p className="text-slate-500 text-xs lg:text-sm font-medium">Global jobs and local business hubs at your fingertips.</p>
          </div>
          <div className="flex space-x-2 items-center">
            <button 
              onClick={() => setShowAlertsModal(true)}
              className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 text-slate-500 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{alerts.length}</span>
              )}
            </button>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>List</button>
              <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>Map</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={viewMode === 'map' ? "Startup hubs near you..." : "Tech jobs, grants, or remote gigs..."}
                className="w-full pl-12 pr-4 py-4 lg:py-5 bg-white border-2 border-slate-100 focus:border-orange-500 rounded-2xl lg:rounded-[2rem] outline-none transition-all text-sm lg:text-lg shadow-lg font-medium"
              />
            </div>
            <div className="flex gap-2 h-[54px] lg:h-auto">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 lg:flex-none px-6 rounded-2xl border-2 transition-all flex items-center justify-center ${
                  showFilters || Object.values(filters).some(v => v !== '') 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-transparent bg-slate-200 text-slate-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] lg:flex-none bg-orange-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 disabled:bg-slate-300 transition-all shadow-xl active:scale-95"
              >
                {loading ? '...' : 'Launch'}
              </button>
            </div>
          </form>

          {showFilters && viewMode === 'list' && (
            <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                <select value={filters.experienceLevel} onChange={(e) => setFilters(f=>({...f, experienceLevel: e.target.value}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-xs">
                  <option value="">Any</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                <input type="text" value={filters.industry} placeholder="e.g. Fintech" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-xs" onChange={(e)=>setFilters(f=>({...f, industry: e.target.value}))}/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Goal</label>
                <input type="text" value={filters.salaryRange} placeholder="e.g. $2k/mo" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-xs" onChange={(e)=>setFilters(f=>({...f, salaryRange: e.target.value}))}/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full space-y-6 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing African Markets...</p>
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter">Market Results</h3>
               <button 
                 onClick={saveAlert}
                 className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95"
               >
                 <span>Save Alert</span>
               </button>
            </div>

            {viewMode === 'list' ? (
              <div className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl overflow-x-hidden">
                <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium text-sm lg:text-base">
                  {result.text}
                </div>
                {result.sources && result.sources.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Verified Channels</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.sources.map((source, i) => (
                        <a 
                          key={i} href={source.uri} target="_blank" rel="noopener noreferrer"
                          className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-500 transition-all"
                        >
                          <div className="w-6 h-6 bg-white rounded flex items-center justify-center mr-3 shadow-sm text-xs">🔗</div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-slate-800 truncate">{source.title}</p>
                            <p className="text-[8px] text-slate-400 truncate uppercase tracking-widest">{new URL(source.uri).hostname}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {result.places?.map((place, i) => (
                     <a 
                      key={i} href={place.uri} target="_blank" rel="noopener noreferrer"
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xl flex items-center space-x-4"
                     >
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">📍</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-800 uppercase tracking-tight text-xs truncate">{place.title}</h4>
                          <p className="text-[8px] text-orange-600 font-bold uppercase tracking-widest">Maps View</p>
                        </div>
                     </a>
                   ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20 grayscale">
            <span className="text-6xl">🔎</span>
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">No active search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
