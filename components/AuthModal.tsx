
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onAuth: (user: UserProfile) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onAuth, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Simulate Network Latency
    await new Promise(r => setTimeout(r, 1500));

    const users: UserProfile[] = JSON.parse(localStorage.getItem('afriassist_users') || '[]');

    if (mode === 'signup') {
      if (users.some(u => u.email === formData.email || u.phone === formData.phone)) {
        setMsg({ text: 'Account already exists with this email/phone.', type: 'error' });
      } else {
        const newUser: UserProfile = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          location: '',
          skills: '',
          education: '',
          careerAspirations: '',
          experienceLevel: 'Entry',
          installDate: new Date().toISOString(),
          isSubscribed: false
        };
        users.push(newUser);
        localStorage.setItem('afriassist_users', JSON.stringify(users));
        onAuth(newUser);
      }
    } else if (mode === 'login') {
      const user = users.find(u => (u.email === formData.email || u.phone === formData.email) && u.password === formData.password);
      if (user) {
        onAuth(user);
      } else {
        setMsg({ text: 'Invalid credentials. Check your password.', type: 'error' });
      }
    } else if (mode === 'forgot') {
      setMsg({ text: 'Reset protocol initiated. A recovery link has been sent to your registered device.', type: 'success' });
      setTimeout(() => setMode('login'), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 p-10 text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">👤</div>
          <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Tribe' : 'Account Recovery'}
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest opacity-80">
            {mode === 'login' ? 'Login to access your opportunities' : mode === 'signup' ? 'Start your professional journey today' : 'Enter registered email/phone'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {msg && (
            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase text-center border-2 ${msg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
              {msg.text}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                  placeholder="Kofi Mensah"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Phone</label>
              <input 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                placeholder="kofi@afriassist.ai"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] text-orange-600 font-bold hover:underline">Forgot?</button>
                  )}
                </div>
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (Optional)</label>
                <input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                  placeholder="+263 77 222 8439"
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login Hub' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </button>

          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New to the platform? <button type="button" onClick={() => setMode('signup')} className="text-orange-600 hover:underline">Join Now</button>
              </p>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Already a member? <button type="button" onClick={() => setMode('login')} className="text-orange-600 hover:underline">Sign In</button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
