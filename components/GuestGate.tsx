
import React, { useState } from 'react';

interface GuestGateProps {
  onEnter: (name: string) => void;
}

const GuestGate: React.FC<GuestGateProps> = ({ onEnter }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onEnter(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[180] bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden opacity-20">
         <div className="absolute top-0 left-0 w-96 h-96 bg-orange-600 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="bg-white max-w-md w-full rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4 mb-8">
           <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-xl">🌍</div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">AfriAssist AI</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enter your name to explore the continent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Full Name</label>
             <input 
               autoFocus
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-6 py-4 font-bold outline-none transition-all text-lg"
               placeholder="How should we address you?"
             />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95"
          >
            Access Platform
          </button>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            By entering, you agree to our terms of digital excellence and privacy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default GuestGate;
