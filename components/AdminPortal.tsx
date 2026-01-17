
import React, { useState, useEffect } from 'react';
import { UserQuery, SpecialCode } from '../types';

const CODES_KEY = 'afriassist_master_codes';

const AdminPortal: React.FC = () => {
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [specialCodes, setSpecialCodes] = useState<SpecialCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'codes' | 'security'>('support');

  useEffect(() => {
    const savedQueries = JSON.parse(localStorage.getItem('afriassist_queries') || '[]');
    setQueries(savedQueries);
    
    const savedCodes = JSON.parse(localStorage.getItem(CODES_KEY) || '[]');
    setSpecialCodes(savedCodes);

    const currentPass = localStorage.getItem('afriassist_admin_pass') || "AfriAdmin2025";
    setAdminPass(currentPass);
  }, []);

  const handleUpdateAdminPass = () => {
    if (adminPass.length < 6) {
      alert("Passcode must be at least 6 characters.");
      return;
    }
    localStorage.setItem('afriassist_admin_pass', adminPass);
    alert("System Security Passcode Updated Successfully.");
  };

  const handleResolve = (id: string) => {
    const updated = queries.map(q => q.id === id ? { ...q, status: 'resolved' as const } : q);
    setQueries(updated);
    localStorage.setItem('afriassist_queries', JSON.stringify(updated));
  };

  const handleAddCode = () => {
    if (!newCode.trim()) return;
    const codeStr = newCode.toUpperCase().trim();
    if (specialCodes.some(c => c.code === codeStr)) {
      alert("This code already exists in the system.");
      return;
    }
    const updated = [...specialCodes, { code: codeStr, isUsed: false }];
    setSpecialCodes(updated);
    localStorage.setItem(CODES_KEY, JSON.stringify(updated));
    setNewCode('');
  };

  const handleClearBurned = () => {
    if (window.confirm("Permanently remove all used/burned codes from the system?")) {
      const activeOnly = specialCodes.filter(c => !c.isUsed);
      setSpecialCodes(activeOnly);
      localStorage.setItem(CODES_KEY, JSON.stringify(activeOnly));
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Admin Command Hub</h2>
            <p className="text-slate-500 font-medium">Monitoring system integrity and single-use access protocols.</p>
          </div>
          
          <nav className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
             {['support', 'codes', 'security'].map((t) => (
               <button 
                 key={t}
                 onClick={() => setActiveTab(t as any)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {t}
               </button>
             ))}
          </nav>
        </div>

        {activeTab === 'support' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center">
               <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></span> Student Support Inbox
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {queries.length === 0 ? (
                 <div className="md:col-span-2 p-20 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center opacity-30 italic">
                   <p className="font-bold">No student activity logged yet.</p>
                 </div>
               ) : queries.slice().reverse().map(q => (
                 <div key={q.id} className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl transition-all ${q.status === 'resolved' ? 'opacity-50 grayscale' : 'hover:border-orange-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{q.userName}</h4>
                          <p className="text-[10px] text-orange-600 font-bold">{q.userEmail}</p>
                       </div>
                       <div className="flex space-x-2">
                         <button 
                          onClick={() => handleResolve(q.id)} 
                          className={`text-[8px] font-black uppercase px-3 py-1 rounded-full transition-all ${q.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                         >
                           {q.status === 'resolved' ? 'Closed / Resolved' : 'Mark as Resolved'}
                         </button>
                       </div>
                    </div>
                    <p className="text-slate-600 text-[11px] font-medium italic mb-4">"{q.query}"</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Code Generator</h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                     <input 
                       value={newCode}
                       onChange={(e) => setNewCode(e.target.value)}
                       placeholder="e.g. VIP-2025"
                       className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-transparent focus:border-orange-500 outline-none font-bold text-xs"
                     />
                     <button onClick={handleAddCode} className="bg-orange-600 text-white px-6 rounded-xl hover:bg-orange-700 font-black text-[10px] uppercase">Add</button>
                  </div>
                </div>
             </div>
             
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Code Registry</h3>
                  <button onClick={handleClearBurned} className="text-[8px] font-black text-red-500 uppercase">Purge Used</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                   {specialCodes.map((c, i) => (
                     <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${c.isUsed ? 'bg-slate-50 opacity-50' : 'bg-white border-orange-100'}`}>
                        <span className="font-black text-xs tracking-widest">{c.code}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${c.isUsed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {c.isUsed ? 'Burned' : 'Active'}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 space-y-8">
                <div className="text-center">
                   <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🛡️</div>
                   <h3 className="text-xl font-black uppercase tracking-widest">System Vault</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Master Passcode Control</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Admin Passcode</label>
                      <div className="relative">
                        <input 
                          type={showPass ? "text" : "password"}
                          value={adminPass}
                          onChange={(e) => setAdminPass(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-black tracking-widest outline-none focus:border-orange-500 transition-all text-center"
                        />
                        <button 
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showPass ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                   </div>

                   <button 
                     onClick={handleUpdateAdminPass}
                     className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl active:scale-95"
                   >
                     Update Security Key
                   </button>
                </div>

                <div className="pt-6 border-t border-white/10 text-center">
                   <p className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-medium leading-relaxed">
                     Caution: Changing the master passcode will immediately log out all other active admin sessions.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
