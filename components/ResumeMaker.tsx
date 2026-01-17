
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ResumeData } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ResumeMakerProps {
  profile: UserProfile;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

type TemplateType = 'executive' | 'modernist' | 'minimalist';

const ResumeMaker: React.FC<ResumeMakerProps> = ({ profile, isLoggedIn, onLoginClick }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('executive');
  const [resumeData, setResumeData] = useState<ResumeData>({
    summary: 'A highly motivated professional dedicated to growth and excellence in the African tech ecosystem. Proven track record in streamlining operations and delivering high-impact solutions.',
    experience: [
      { 
        company: 'Global Solutions Africa', 
        role: 'Senior Project Lead', 
        period: 'Jan 2023 - Present', 
        description: 'Spearheading digital transformation initiatives across 5 regional hubs. Reduced operational overhead by 15% through strategic AI implementation.' 
      },
      { 
        company: 'Innovate Tech', 
        role: 'Operations Analyst', 
        period: 'June 2020 - Dec 2022', 
        description: 'Managed data-driven reporting for logistics management. Improved delivery efficiency by 22%.' 
      }
    ],
    education: [
      { 
        school: 'University of Africa', 
        degree: 'B.Sc. in Computer Science', 
        year: '2022' 
      }
    ],
    languages: ['English', 'Swahili', 'French']
  });

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: 'Hi! I can help you tailor your CV. Which template do you prefer today?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isSubscribed = profile.isSubscribed;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleUpdateField = (field: string, value: string) => {
    if (!isSubscribed) return;
    setResumeData({ ...resumeData, [field]: value });
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    if (!isSubscribed) return;
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const handleDownloadPDF = () => {
    if (!isLoggedIn) {
        onLoginClick?.();
        return;
    }
    if (!isSubscribed) {
      alert("Downloads are locked for Free Tier. Please subscribe to export.");
      return;
    }
    window.print();
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the AfriAssist CV Assistant.
        User Question: "${userText}"
        Keep it helpful and professional.`,
      });
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Connection error." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderPreview = () => {
    const commonStyles = "w-full max-w-[210mm] bg-white shadow-2xl overflow-hidden min-h-[297mm] flex flex-col print:shadow-none mx-auto";
    
    switch(selectedTemplate) {
      case 'modernist':
        return (
          <div className={commonStyles}>
            <div className="bg-slate-900 text-white p-8 lg:p-12 text-center border-b-8 border-orange-500">
               <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase mb-2">{profile.fullName || 'Talent Name'}</h1>
               <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-[10px]">{profile.careerAspirations || 'Professional Specialist'}</p>
            </div>
            <div className="p-8 lg:p-16 grid grid-cols-3 gap-8 lg:gap-12 flex-1">
               <div className="col-span-1 space-y-8 border-r border-slate-100 pr-6">
                  <section>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 mb-3">Contact</h3>
                    <p className="text-[9px] font-bold text-slate-800 break-words">{profile.email || 'guest@afriassist.ai'}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">{profile.location || 'Africa'}</p>
                  </section>
                  <section>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                       {(profile.skills || 'Strategy, Analysis').split(',').map((s, i) => (
                         <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-[8px] font-bold text-slate-600">{s.trim()}</span>
                       ))}
                    </div>
                  </section>
               </div>
               <div className="col-span-2 space-y-10">
                  <section>
                    <h3 className="text-base font-black uppercase text-slate-800 border-b-2 border-slate-100 pb-1 mb-4">Profile</h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic">{resumeData.summary}</p>
                  </section>
                  <section>
                    <h3 className="text-base font-black uppercase text-slate-800 border-b-2 border-slate-100 pb-1 mb-4">Experience</h3>
                    <div className="space-y-6">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-black text-slate-800 text-[11px] uppercase">{exp.role}</h4>
                            <span className="text-[8px] font-bold text-slate-400">{exp.period}</span>
                          </div>
                          <p className="text-[8px] font-black text-orange-600 uppercase mb-2">{exp.company}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
               </div>
            </div>
          </div>
        );
      case 'minimalist':
        return (
          <div className={`${commonStyles} p-12 lg:p-20 font-serif`}>
             <div className="border-b border-slate-200 pb-8 mb-8 text-center">
                <h1 className="text-3xl lg:text-4xl font-normal text-slate-900 mb-1">{profile.fullName || 'Talent Name'}</h1>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">{profile.location} • {profile.email}</p>
             </div>
             <div className="space-y-10">
                <section className="flex">
                   <h3 className="w-24 shrink-0 text-[8px] font-black uppercase tracking-widest text-slate-400">About</h3>
                   <p className="text-xs leading-relaxed text-slate-700">{resumeData.summary}</p>
                </section>
                <section className="flex">
                   <h3 className="w-24 shrink-0 text-[8px] font-black uppercase tracking-widest text-slate-400">History</h3>
                   <div className="flex-1 space-y-6">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i}>
                           <div className="flex justify-between font-bold text-slate-800 text-xs mb-1">
                              <span>{exp.company}</span>
                              <span className="font-normal text-slate-400">{exp.period}</span>
                           </div>
                           <p className="text-[10px] italic text-slate-500 mb-1">{exp.role}</p>
                           <p className="text-[10px] text-slate-600 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        );
      case 'executive':
      default:
        return (
          <div className={`${commonStyles} flex flex-col lg:flex-row print:flex-row`}>
            <div className="w-full lg:w-[260px] bg-slate-900 text-white p-8 flex flex-col items-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-orange-500 shadow-xl bg-slate-800 flex items-center justify-center mb-8">
                 <span className="text-4xl lg:text-5xl">👤</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-center leading-tight mb-2 tracking-tighter uppercase italic">{profile.fullName || 'Talent Name'}</h1>
              <p className="text-orange-500 text-[8px] font-black uppercase tracking-[0.3em] mb-8 text-center">{profile.experienceLevel} Tier</p>
              <div className="w-full space-y-4 pt-4 border-t border-white/10">
                 <div className="space-y-1">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Contact</p>
                    <p className="text-[9px] font-bold truncate">{profile.email}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate">{profile.location}</p>
                 </div>
              </div>
            </div>
            <div className="flex-1 p-8 lg:p-14 bg-white flex flex-col">
               <div className="mb-10">
                  <p className="text-sm lg:text-base font-medium leading-relaxed text-slate-700 italic border-l-4 border-orange-500 pl-4">
                     {resumeData.summary}
                  </p>
               </div>
               <div className="space-y-10">
                 <section>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6 italic">Professional History</h3>
                    <div className="space-y-8">
                       {resumeData.experience.map((exp, i) => (
                         <div key={i} className="relative pl-6 border-l border-slate-100">
                            <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-widest mb-0.5">{exp.role}</h4>
                            <p className="text-[8px] font-black text-orange-600 uppercase mb-2">{exp.company} — {exp.period}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{exp.description}</p>
                         </div>
                       ))}
                    </div>
                 </section>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden lg:flex-row print:bg-white">
      {/* Sidebar Editor */}
      <div className="w-full lg:w-[400px] bg-white lg:border-r border-slate-100 flex flex-col overflow-hidden print:hidden border-b lg:border-b-0">
        <div className="p-4 lg:p-6 border-b border-slate-50 space-y-3">
           <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blueprint</h3>
           <div className="grid grid-cols-3 gap-2">
              {(['executive', 'modernist', 'minimalist'] as TemplateType[]).map((t) => (
                <button key={t} onClick={() => setSelectedTemplate(t)} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border-2 ${selectedTemplate === t ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                  {t}
                </button>
              ))}
           </div>
        </div>

        <div className="p-4 lg:p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar relative min-h-[300px]">
          {!isSubscribed && (
            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
               <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl shadow-xl">🔒</div>
               <div className="space-y-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase">Editor Locked</h4>
                 <p className="text-slate-500 text-[10px] leading-relaxed">Customize with a Professional Tier account.</p>
               </div>
               <button onClick={onLoginClick} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Activate Sculptor</button>
            </div>
          )}

          <div className={`space-y-8 ${!isSubscribed ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span> Summary
              </label>
              <textarea 
                disabled={!isSubscribed}
                value={resumeData.summary}
                onChange={(e) => handleUpdateField('summary', e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl p-3 text-[10px] font-semibold h-24 outline-none transition-all resize-none shadow-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span> Roles
              </label>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                  <input placeholder="Company" value={exp.company} onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)} className="w-full bg-white text-[10px] p-2 rounded-lg font-bold outline-none" />
                  <input placeholder="Role" value={exp.role} onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)} className="w-full bg-white text-[10px] p-2 rounded-lg outline-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button onClick={handleDownloadPDF} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${isLoggedIn && isSubscribed ? 'bg-slate-900 text-white hover:bg-orange-600' : 'bg-slate-100 text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{isLoggedIn ? (isSubscribed ? 'Export PDF' : 'Locked') : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-4 lg:p-16 overflow-auto bg-slate-100 flex justify-center items-start print:p-0 print:bg-white custom-scrollbar">
        <div className="resume-preview-container w-full lg:max-w-none">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default ResumeMaker;
