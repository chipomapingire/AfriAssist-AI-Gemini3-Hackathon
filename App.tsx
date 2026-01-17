
import React, { useState, useEffect } from 'react';
import { FeatureTab, UserProfile, SpecialCode } from './types';
import Header from './components/Header';
import JobSearch from './components/JobSearch';
import ResumeReview from './components/ResumeReview';
import ResumeMaker from './components/ResumeMaker';
import AccentCoach from './components/AccentCoach';
import Translator from './components/Translator';
import Profile from './components/Profile';
import LiveCoach from './components/LiveCoach';
import SubscriptionGate from './components/SubscriptionGate';
import ChatWidget from './components/ChatWidget';
import AdminPortal from './components/AdminPortal';
import AdminLoginModal from './components/AdminLoginModal';
import AuthModal from './components/AuthModal';
import SupportModal from './components/SupportModal';
import GuestGate from './components/GuestGate';
import Home from './components/Home';

const STORAGE_KEY = 'afriassist_active_user';
const ADMIN_KEY = 'afriassist_admin_auth';
const CODES_KEY = 'afriassist_master_codes';

// The secret bypass list
const VIP_BYPASS_NAMES = [
  'AfriAdmin', 
  'Chipo-VIP', 
  'Gemini-Master', 
  'African-Leader-2025',
  'VIP-ACCESS-GRANTED'
];

const GUEST_PROFILE: UserProfile = {
  fullName: '',
  location: '',
  skills: '',
  education: '',
  careerAspirations: '',
  experienceLevel: 'Entry',
  installDate: new Date().toISOString(),
  isSubscribed: false,
  email: 'guest@afriassist.ai'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('jobs');
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestNamed, setIsGuestNamed] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Load profile and check subscription
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const adminAuth = localStorage.getItem(ADMIN_KEY);
    
    if (!localStorage.getItem(CODES_KEY)) {
      const initialCodes: SpecialCode[] = [
        { code: 'VIP-STUDENT', isUsed: false },
        { code: 'AFRI-PRO-2025', isUsed: false },
        { code: 'TEST-ACCESS', isUsed: false }
      ];
      localStorage.setItem(CODES_KEY, JSON.stringify(initialCodes));
    }

    if (adminAuth === 'true') {
      setIsAdmin(true);
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed.email !== 'guest@afriassist.ai' || parsed.fullName) {
          setShowHome(false);
          setProfile(parsed);
          setIsGuestNamed(!!parsed.fullName);
          if (parsed.email !== 'guest@afriassist.ai') {
            setIsLoggedIn(true);
            const installDate = new Date(parsed.installDate || new Date().toISOString());
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - installDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays >= 3 && !parsed.isSubscribed) {
              setShowPaywall(true);
            }
          }
          // Check VIP status
          if (VIP_BYPASS_NAMES.includes(parsed.fullName)) {
             setProfile(prev => ({...prev, isSubscribed: true}));
          }
        }
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        setShowAdminModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGuestEntry = (name: string) => {
    const isVIP = VIP_BYPASS_NAMES.includes(name);
    const guestUser: UserProfile = {
      ...GUEST_PROFILE,
      fullName: name,
      isSubscribed: isVIP
    };
    setProfile(guestUser);
    setIsGuestNamed(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    
    if (isVIP) {
      alert(`Welcome, VIP guest ${name}. The platform is unlocked for you.`);
    }
  };

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, 'true');
      setActiveTab('admin');
      setShowAdminModal(false);
    } else {
      setShowAdminModal(false);
    }
  };

  const handleUserAuth = (user: UserProfile) => {
    setProfile(user);
    setIsLoggedIn(true);
    setIsGuestNamed(true);
    setShowHome(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setProfile(GUEST_PROFILE);
    setIsLoggedIn(false);
    setIsGuestNamed(false);
    setIsAdmin(false);
    setShowHome(true);
    setActiveTab('jobs');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    if (!isLoggedIn && !VIP_BYPASS_NAMES.includes(profile.fullName)) {
      setShowAuthModal(true);
      return;
    }
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    
    const users: UserProfile[] = JSON.parse(localStorage.getItem('afriassist_users') || '[]');
    const index = users.findIndex(u => u.email === updatedProfile.email);
    if (index !== -1) {
      users[index] = updatedProfile;
      localStorage.setItem('afriassist_users', JSON.stringify(users));
    }
  };

  const handleSubscribe = (method: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const updated = { ...profile, isSubscribed: true };
    handleSaveProfile(updated);
    setShowPaywall(false);
  };

  const handleApplySpecialCode = (enteredCode: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const rawCodes = localStorage.getItem(CODES_KEY);
    const codes: SpecialCode[] = rawCodes ? JSON.parse(rawCodes) : [];
    const targetCodeIndex = codes.findIndex(c => c.code.toUpperCase() === enteredCode.trim().toUpperCase());

    if (targetCodeIndex === -1) {
      alert("Invalid Access Code. Please contact Support.");
      return;
    }

    const targetCode = codes[targetCodeIndex];
    if (targetCode.isUsed) {
      alert("This code has already been redeemed.");
      return;
    }

    codes[targetCodeIndex] = {
      ...targetCode,
      isUsed: true,
      claimedAt: new Date().toISOString(),
      claimedBy: profile.fullName || 'Unknown User'
    };

    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    const updated = { ...profile, isSubscribed: true, hasUsedSpecialCode: true };
    handleSaveProfile(updated);
    setShowPaywall(false);
    alert("Professional Tier Activated.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': 
        return isLoggedIn ? <Profile profile={profile} onSave={handleSaveProfile} /> : <div className="p-20 text-center"><button onClick={() => setShowAuthModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Sign In to Edit Profile</button></div>;
      case 'jobs': return <JobSearch profile={profile} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />;
      case 'resume': return <ResumeReview profile={profile} onSaveProfile={handleSaveProfile} isLoggedIn={isLoggedIn || profile.isSubscribed} onLoginClick={() => setShowAuthModal(true)} />;
      case 'resume-maker': return <ResumeMaker profile={profile} isLoggedIn={isLoggedIn || profile.isSubscribed} onLoginClick={() => setShowAuthModal(true)} />;
      case 'coach': return <AccentCoach profile={profile} isLoggedIn={isLoggedIn || profile.isSubscribed} onLoginClick={() => setShowAuthModal(true)} />;
      case 'coach-live': return <LiveCoach profile={profile} />;
      case 'translate': return <Translator />;
      case 'admin': return isAdmin ? <AdminPortal /> : <JobSearch profile={profile} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />;
      default: return <JobSearch profile={profile} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin} 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuthModal(true)}
      />
      
      {showHome && <Home onGetStarted={() => setShowHome(false)} />}
      
      {!showHome && !isGuestNamed && <GuestGate onEnter={handleGuestEntry} />}

      {showAuthModal && (
        <AuthModal onAuth={handleUserAuth} onClose={() => setShowAuthModal(false)} />
      )}

      {showPaywall && isLoggedIn && (
        <SubscriptionGate 
          onSubscribe={handleSubscribe} 
          onApplyCode={handleApplySpecialCode}
        />
      )}

      {showAdminModal && (
        <AdminLoginModal onAuth={handleAdminAuth} onClose={() => setShowAdminModal(false)} />
      )}

      {showSupportModal && (
        <SupportModal profile={profile} onClose={() => setShowSupportModal(false)} />
      )}

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-4 flex items-center justify-between px-2">
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
               <div className={`w-2 h-2 rounded-full ${profile?.isSubscribed ? 'bg-orange-500 animate-pulse' : isLoggedIn ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                 {profile?.isSubscribed ? 'VIP Professional Tier' : isLoggedIn ? 'Verified Account' : 'Guest Explorer'}
               </span>
             </div>
             {isGuestNamed && (
               <span className="text-[10px] font-black uppercase text-slate-400 opacity-60">Session: {profile.fullName}</span>
             )}
           </div>
           {!profile?.isSubscribed && isLoggedIn && (
             <button 
               onClick={() => setShowPaywall(true)}
               className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest border-b border-orange-200"
             >
               Unlock Pro Features
             </button>
           )}
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden min-h-[75vh] flex flex-col border border-slate-100">
          {renderContent()}
        </div>
      </main>

      <ChatWidget profile={profile} onOpenSupport={() => setShowSupportModal(true)} />

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 font-bold text-slate-200 tracking-tight italic">AfriAssist AI — The Future of African Talent</p>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-6">
               {(isLoggedIn || isGuestNamed) && (
                 <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors">Logout Session</button>
               )}
               {!isAdmin ? (
                  <button onClick={() => setShowAdminModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">System Access</button>
                ) : (
                  <button onClick={() => { localStorage.removeItem(ADMIN_KEY); setIsAdmin(false); setActiveTab('jobs'); }} className="text-[10px] text-red-500 font-bold uppercase underline">Exit Admin</button>
                )}
            </div>
            <button onClick={() => setShowSupportModal(true)} className="text-[10px] uppercase tracking-widest opacity-60 mt-4 hover:text-orange-500 hover:opacity-100 transition-all font-black border-b border-transparent hover:border-orange-500 pb-1">For more inquiries, contact our support team through the official hub.</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
