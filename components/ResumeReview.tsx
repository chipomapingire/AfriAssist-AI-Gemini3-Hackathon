
import React, { useState } from 'react';
import { reviewDocument } from '../geminiService';
import { AnalysisResult, UserProfile } from '../types';

interface ResumeReviewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

const ResumeReview: React.FC<ResumeReviewProps> = ({ profile, onSaveProfile, isLoggedIn, onLoginClick }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tempName, setTempName] = useState(profile.fullName || '');
  const [tempEmail, setTempEmail] = useState(profile.email || '');
  const [showUpload, setShowUpload] = useState(isLoggedIn || (!!profile.fullName && profile.email !== 'guest@afriassist.ai'));

  const handleStartReview = () => {
    if (!isLoggedIn && !tempName.trim()) {
      alert("Please provide your name to start the guest analysis.");
      return;
    }
    const updated = { ...profile, fullName: tempName, email: tempEmail };
    if (isLoggedIn) onSaveProfile(updated);
    setShowUpload(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await reviewDocument(base64, file.type);
        setResult(data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-slate-50">
      {!showUpload ? (
        <div className="max-w-md mx-auto w-full space-y-8 py-12 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-4">
             <div className="text-6xl">📄</div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">CV AI Intelligence</h2>
             <p className="text-slate-500 font-medium text-sm">Experience our Gemini 3 powered expert review engine.</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Name</label>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                  placeholder="e.g. Future Leader"
                />
             </div>
             <button 
               onClick={handleStartReview}
               className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
             >
               Try Analysis Now
             </button>
             <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">No credit card required for guest preview</p>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-3xl mx-auto w-full text-center mb-10">
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic">Professional CV Review</h2>
            {!isLoggedIn && (
              <div className="mb-6 bg-orange-100 text-orange-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center space-x-2">
                <span className="animate-pulse">✨</span>
                <span>Guest Preview Mode Active</span>
              </div>
            )}
            
            <div className="mt-8">
              <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:bg-white hover:border-orange-300 transition-all bg-slate-50/50 relative overflow-hidden group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="bg-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📂</div>
                  <p className="mb-2 text-sm text-slate-500 font-black uppercase tracking-widest">Select your Document</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">PDF, PNG, JPG (MAX. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-slate-800 font-black uppercase tracking-[0.2em] animate-pulse text-xs">AI is reading your profile...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent"></div>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4 relative z-10">AI Readiness Score</span>
                  <span className="text-7xl font-black italic tracking-tighter mb-2 relative z-10">{result.score}%</span>
                </div>
                <div className="md:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                  {!isLoggedIn && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Analysis Locked</div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Sign In to Read Expert Feedback</h4>
                        <button onClick={onLoginClick} className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl">Get Free Access</button>
                    </div>
                  )}
                  <h3 className="font-black text-xl text-slate-800 mb-4 uppercase tracking-tighter">Strategic Feedback</h3>
                  <p className={`text-slate-600 leading-relaxed font-medium text-lg italic ${!isLoggedIn ? 'blur-sm select-none' : ''}`}>"{result.feedback}"</p>
                </div>
              </div>

              {result.highlights && result.highlights.length > 0 && (
                <div className="space-y-8 relative">
                   {!isLoggedIn && (
                     <div className="absolute -inset-4 z-20 bg-slate-50/40 backdrop-blur-sm rounded-[4rem] flex flex-col items-center justify-center">
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center space-y-4">
                           <span className="text-4xl">🔒</span>
                           <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Unlock 3-5 Specific AI Corrections</h4>
                           <button onClick={onLoginClick} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 shadow-xl">Join the Platform</button>
                        </div>
                     </div>
                   )}
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">✨</span>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Identified Improvements</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {result.highlights.map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span> Current Draft
                            </span>
                            <div className="p-6 bg-red-50 text-red-900 rounded-3xl border border-red-100 text-sm font-medium italic">
                              "{item.originalText}"
                            </div>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span> AI Refined Version
                            </span>
                            <div className="p-6 bg-green-50 text-green-900 rounded-3xl border border-green-100 text-sm font-black blur-sm">
                              "HIDDEN FOR GUEST PREVIEW"
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeReview;
