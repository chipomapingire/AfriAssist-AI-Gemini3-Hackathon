
import React, { useState } from 'react';
import { UserProfile, UserQuery } from '../types';

interface SupportModalProps {
  profile: UserProfile;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ profile, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSending(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));

    const newQuery: UserQuery = {
      id: Math.random().toString(36).substr(2, 9),
      userName: profile.fullName || 'Guest User',
      userEmail: profile.email || 'guest@afriassist.ai',
      query: `[${subject.toUpperCase()}] ${message}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const existing = JSON.parse(localStorage.getItem('afriassist_queries') || '[]');
    localStorage.setItem('afriassist_queries', JSON.stringify([...existing, newQuery]));

    setSending(false);
    setSent(true);
    setTimeout(onClose, 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-8 text-center relative shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-16 h-16 bg-orange-600 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">📬</div>
          <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase">Support Hub</h2>
          <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest opacity-80">Direct Human Assistance</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {sent ? (
            <div className="p-16 text-center space-y-4 animate-in fade-in">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto">✓</div>
               <h3 className="text-xl font-black text-slate-800 uppercase">Message Logged</h3>
               <p className="text-slate-500 text-sm font-medium">Our team will review your inquiry in the Command Hub.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Subject</label>
                  <select 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all appearance-none text-slate-700"
                  >
                    <option value="">Select a topic...</option>
                    <option value="payment">Payment & Subscription</option>
                    <option value="jobs">Job Opportunity Help</option>
                    <option value="tech">Technical Issue</option>
                    <option value="business">Business Partnership</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you today?"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all h-40 resize-none text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
