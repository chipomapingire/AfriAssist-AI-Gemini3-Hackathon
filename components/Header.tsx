
import React from 'react';
import { FeatureTab } from '../types';

interface HeaderProps {
  activeTab: FeatureTab;
  setActiveTab: (tab: FeatureTab) => void;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isAdmin, isLoggedIn, onLoginClick }) => {
  const tabs = [
    { id: 'jobs', label: 'Jobs', icon: '🌍' },
    { id: 'resume-maker', label: 'Builder', icon: '🛠️' },
    { id: 'resume', label: 'Review', icon: '📄' },
    { id: 'coach', label: 'Analysis', icon: '🎙️' },
    { id: 'coach-live', label: 'Interview', icon: '⚡' },
    { id: 'translate', label: 'Speak', icon: '🔤' },
    { id: 'profile', label: 'Account', icon: '👤' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin', icon: '🔐' });
  }

  return (
    <header className="bg-gradient-to-r from-orange-700 to-amber-600 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 lg:py-4 space-y-3 lg:space-y-0">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('jobs')}>
              <div className="bg-white p-1.5 rounded-lg shadow-md">
                <span className="text-xl">🦁</span>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight italic leading-none">AfriAssist</h1>
                <p className="text-[7px] font-black text-orange-100 opacity-80 uppercase tracking-[0.2em]">Talent Unleashed</p>
              </div>
            </div>
            {!isLoggedIn && (
              <button 
                onClick={onLoginClick}
                className="lg:hidden bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4 w-full lg:w-auto overflow-hidden">
            <nav className="flex items-center space-x-1 bg-white/10 rounded-full p-1 border border-white/20 overflow-x-auto no-scrollbar w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FeatureTab)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-700 shadow-lg scale-105'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {!isLoggedIn && (
              <button 
                onClick={onLoginClick}
                className="hidden lg:block bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
