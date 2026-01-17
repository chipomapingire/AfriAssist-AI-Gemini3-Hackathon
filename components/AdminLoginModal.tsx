
import React, { useState } from 'react';

interface AdminLoginModalProps {
  onAuth: (success: boolean) => void;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onAuth, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminPass = localStorage.getItem('afriassist_admin_pass') || "AfriAdmin2025";
    
    if (passcode === currentAdminPass) {
      onAuth(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className={`bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transform transition-all ${error ? 'animate-shake' : 'animate-in zoom-in-95'}`}>
        <div className="bg-slate-900 p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">🔐</div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Secure Entry</h3>
          <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest opacity-50">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Passcode</label>
            <input 
              autoFocus
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-center font-black tracking-[0.5em] outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-orange-500'}`}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default AdminLoginModal;
