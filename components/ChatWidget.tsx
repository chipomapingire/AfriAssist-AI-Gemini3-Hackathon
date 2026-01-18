
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserProfile } from '../types';

interface ChatWidgetProps {
  profile: UserProfile;
  onOpenSupport?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ profile, onOpenSupport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Hello! I am your AfriAssist guide. How can I help you today? (Try asking about CVs or Jobs!)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Fix: Initialize GoogleGenAI strictly using process.env.API_KEY directly as per guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are AfriAssist Support AI. 
          Goal: Provide quick answers about job seeking in Africa and how to use the app.
          Special Rule: If the user asks about payments, refunds, technical errors, or very complex account issues, 
          you MUST direct them to contact the official support hub via the Admin Escalation system. 
          Keep responses friendly, helpful, and concise.`
        }
      });

      const responseText = response.text || '';
      setMessages(prev => [...prev, { role: 'model', text: responseText || 'I am having trouble connecting. Please try again or reach out through the official support hub.' }]);
      
      // Check if we should suggest human support
      if (responseText.toLowerCase().includes('support hub') || responseText.toLowerCase().includes('escalation')) {
        setShowEscalate(true);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, something went wrong. Please reach out through our official support channels.` }]);
      setShowEscalate(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center text-lg shadow-lg">🦁</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">AfriAssist Chat</p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Always Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl flex space-x-1 shadow-sm">
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            {showEscalate && onOpenSupport && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <button 
                  onClick={() => { setShowEscalate(false); onOpenSupport(); }}
                  className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  <span>Escalate to Human Support</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-3 text-[11px] font-bold outline-none transition-all"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-xl hover:bg-orange-600 transition-all active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-all transform hover:scale-110 active:scale-90 relative group border-4 border-white"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></span>
      </button>
    </div>
  );
};

export default ChatWidget;
