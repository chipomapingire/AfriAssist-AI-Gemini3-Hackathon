
import React, { useState, useEffect } from 'react';
import { FeatureTab, UserProfile } from './types';
import Header from './components/Header';
import JobSearch from './components/JobSearch';
import ResumeReview from './components/ResumeReview';
import AccentCoach from './components/AccentCoach';
import Translator from './components/Translator';
import Profile from './components/Profile';
import LiveCoach from './components/LiveCoach';

const STORAGE_KEY = 'afriassist_profile';

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  location: '',
  skills: '',
  education: '',
  careerAspirations: '',
  experienceLevel: 'Entry'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('jobs');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load profile on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <Profile profile={profile} onSave={handleSaveProfile} />;
      case 'jobs': return <JobSearch profile={profile} />;
      case 'resume': return <ResumeReview />;
      case 'coach': return <AccentCoach profile={profile} />;
      case 'coach-live': return <LiveCoach profile={profile} />;
      case 'translate': return <Translator />;
      default: return <JobSearch profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Subtle Profile Completion Prompt */}
        {activeTab === 'jobs' && !profile.fullName && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between animate-in slide-in-from-top-4 duration-700 shadow-sm">
            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
              <div className="bg-orange-100 p-2 rounded-xl text-xl">✨</div>
              <div>
                <p className="text-orange-900 font-bold text-sm">Personalize your journey</p>
                <p className="text-orange-700 text-xs">Complete your profile to help AfriAssist AI find opportunities that match your specific skills.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-full sm:w-auto bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-orange-700 transition-all shadow-md active:scale-95 whitespace-nowrap uppercase tracking-wider"
            >
              Get Started
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[70vh] flex flex-col border border-slate-100">
          {renderContent()}
        </div>

        {/* Floating Call to Action */}
        <div className="fixed bottom-8 right-8 hidden lg:block">
          <div 
            onClick={() => setActiveTab('coach-live')}
            className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center space-x-3 cursor-pointer hover:bg-orange-600 transition-all transform hover:scale-105 border border-white/10"
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </div>
            <span className="font-bold tracking-tight">AI Interview Prep</span>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 font-bold text-slate-200">AfriAssist AI — Built for the Future of Africa</p>
          <p className="text-sm">Powered by Gemini 3. Helping youth access global opportunities.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
