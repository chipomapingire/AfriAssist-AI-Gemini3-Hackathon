
import React from 'react';
import { FeatureTab } from '../types';

interface HeaderProps {
  activeTab: FeatureTab;
  setActiveTab: (tab: FeatureTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'jobs', label: 'Opportunities', icon: '🌍' },
    { id: 'resume', label: 'Resume Review', icon: '📄' },
    { id: 'coach', label: 'Analysis', icon: '🎙️' },
    { id: 'coach-live', label: 'Mock Interview', icon: '⚡' },
    { id: 'translate', label: 'Translator', icon: '🔤' },
  ];

  return (
    <header className="bg-gradient-to-r from-orange-700 to-amber-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="bg-white p-2 rounded-xl shadow-md">
              <span className="text-2xl">🦁</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">AfriAssist AI</h1>
              <p className="text-xs font-medium text-orange-100 opacity-80 uppercase tracking-widest">Empowering African Talent</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 bg-white/10 rounded-full p-1 border border-white/20 overflow-x-auto max-w-full no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FeatureTab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-700 shadow-xl scale-105'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
