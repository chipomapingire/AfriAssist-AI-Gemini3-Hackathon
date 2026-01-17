
import React, { useState } from 'react';

interface SubscriptionGateProps {
  onSubscribe: (method: string) => void;
  onApplyCode: (code: string) => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onSubscribe, onApplyCode }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialCode, setSpecialCode] = useState('');

  const receiverName = "Chipo Mapingire";
  const receiverPhone = "0772228439";
  const receiverCountry = "Zimbabwe";

  const methods = [
    { id: 'stripe', name: 'Stripe', logo: '💳', type: 'Gateway' },
    { id: 'paypal', name: 'PayPal', logo: '🅿️', type: 'Gateway' },
    { id: 'wise', name: 'Wise', logo: '🌐', type: 'Transfer' },
    { id: 'pioneer', name: 'Payoneer', logo: '🎯', type: 'Transfer' },
    { id: 'ecocash', name: 'EcoCash USD', logo: '📱', type: 'Mobile' },
    { id: 'mukuru', name: 'Mukuru', logo: '💸', type: 'Manual' },
    { id: 'westernunion', name: 'Western Union', logo: '🌍', type: 'Manual' },
    { id: 'moneygram', name: 'MoneyGram', logo: '💸', type: 'Manual' },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    onSubscribe(selectedMethod);
    setIsProcessing(false);
  };

  const getInstructions = () => {
    if (!selectedMethod) return null;
    if (['ecocash', 'mukuru', 'westernunion', 'moneygram'].includes(selectedMethod)) {
      return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold text-xs uppercase">Recipient:</span><span className="text-slate-900 font-black uppercase">{receiverName}</span></div>
          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold text-xs uppercase">Contact:</span><span className="text-orange-600 font-black">{receiverPhone}</span></div>
          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-400 font-bold text-xs uppercase">Region:</span><span className="text-slate-900 font-bold">{receiverCountry}</span></div>
        </div>
      );
    }
    return <p className="text-xs text-slate-600">Please send $5.00 to the official support handle and contact the team with your payment confirmation.</p>;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-slate-900 via-orange-950 to-orange-600 p-10 text-white text-center relative overflow-hidden">
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">Unlock Full Professional Mode</h2>
          <p className="text-orange-200/80 font-medium text-sm">Professional AI coaching and uneditable PDF downloads for only $5.</p>
        </div>

        <div className="p-10 flex-1 overflow-y-auto space-y-8 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {methods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-2 group ${
                  selectedMethod === method.id ? 'border-orange-500 bg-orange-50 shadow-xl scale-105' : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-2xl">{method.logo}</span>
                <p className="font-black text-slate-800 text-[10px] uppercase tracking-tighter">{method.name}</p>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Have a Special Access Code?</label>
            <div className="flex space-x-2">
              <input 
                value={specialCode} 
                onChange={(e) => setSpecialCode(e.target.value)}
                placeholder="Enter Code (e.g. VIP-STUDENT)" 
                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest outline-none transition-all"
              />
              <button 
                onClick={() => onApplyCode(specialCode)}
                className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase hover:bg-orange-600 transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>

          {selectedMethod && (
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner relative animate-in fade-in slide-in-from-top-4">
              <h4 className="font-black text-slate-800 mb-6 flex items-center space-x-2 uppercase text-xs tracking-widest">
                <span>Secure Hub</span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              </h4>
              <div className="space-y-6">
                {getInstructions()}
                <p className="text-[10px] leading-tight text-slate-400 italic bg-white p-3 rounded-xl border border-slate-100">
                  * All payments are verified manually for Student Accounts. Ensure proof is shared through the official channels.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">$5.00</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Professional License</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full sm:w-auto bg-slate-900 text-white px-14 py-5 rounded-3xl font-black text-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center space-x-3"
          >
            {isProcessing ? <span>Processing...</span> : <span>Confirm & Activate</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGate;
