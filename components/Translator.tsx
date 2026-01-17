
import React, { useState, useEffect, useCallback } from 'react';
import { translateText, generateSpeech, decodeBase64, decodeAudioData } from '../geminiService';

const LANG_PREFS_KEY = 'afriassist_lang_prefs';

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('Auto-Detect');
  const [targetLang, setTargetLang] = useState('English');
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const africanLanguages = [
    'Swahili', 'Hausa', 'Yoruba', 'Amharic', 'Arabic', 'Zulu', 'Igbo', 
    'Kinyarwanda', 'Shona', 'Oromo', 'Somali', 'Twi', 'Wolof', 'Afrikaans'
  ];

  const globalLanguages = [
    'English', 'French', 'Portuguese', 'Spanish', 'Chinese (Mandarin)', 'Hindi', 'German'
  ];

  const allLanguages = [...africanLanguages, ...globalLanguages].sort();

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LANG_PREFS_KEY);
    if (saved) {
      try {
        const { source, target } = JSON.parse(saved);
        if (source) setSourceLang(source);
        if (target) setTargetLang(target);
      } catch (e) {
        console.error("Failed to load language preferences", e);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(LANG_PREFS_KEY, JSON.stringify({ source: sourceLang, target: targetLang }));
  }, [sourceLang, targetLang]);

  const handleTranslate = useCallback(async (inputText: string, sLang: string, tLang: string) => {
    if (!inputText.trim()) {
      setTranslated('');
      return;
    }
    setLoading(true);
    try {
      const prompt = sLang === 'Auto-Detect' 
        ? inputText 
        : `From ${sLang}: ${inputText}`;
      const res = await translateText(prompt, tLang);
      setTranslated(res || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time translation with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim()) {
        handleTranslate(text, sourceLang, targetLang);
      } else {
        setTranslated('');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [text, sourceLang, targetLang, handleTranslate]);

  const handleCopy = () => {
    if (!translated) return;
    navigator.clipboard.writeText(translated);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const speakTranslation = async () => {
    if (!translated || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const base64Audio = await generateSpeech(translated);
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        // Correct usage of manual PCM decoding as API returns raw PCM data.
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50">
      <div className="max-w-4xl mx-auto w-full text-center mb-10">
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Global Voice Bridge</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Instant, culturally-aware translation across Africa's major languages. 
          AfriAssist helps you communicate clearly for business, travel, or networking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 max-w-6xl mx-auto w-full">
        {/* Input Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Input Language</span>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black outline-none focus:border-orange-500 shadow-sm transition-all cursor-pointer hover:border-orange-200"
              >
                <option value="Auto-Detect">✨ Auto-Detect</option>
                {allLanguages.map(lang => (
                  <option key={`source-${lang}`} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setText('')}
              className="text-[10px] text-slate-400 font-black hover:text-orange-600 transition-all uppercase tracking-widest"
            >
              Clear Text
            </button>
          </div>
          <div className="relative flex-1 group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full min-h-[350px] p-10 bg-white border-2 border-slate-100 rounded-[3rem] outline-none focus:border-orange-500 transition-all shadow-2xl resize-none text-slate-700 text-xl font-medium leading-relaxed"
              placeholder="What's on your mind? Type to start bridging gaps..."
            />
            {text.length > 0 && (
              <div className="absolute bottom-8 right-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {text.length} glyphs
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Output Language</span>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black outline-none focus:border-orange-500 shadow-sm transition-all cursor-pointer hover:border-orange-200"
              >
                {allLanguages.map(lang => (
                  <option key={`target-${lang}`} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative flex-1 group">
            <div className="w-full h-full min-h-[350px] p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl overflow-y-auto border-8 border-slate-800 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="flex space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 animate-pulse">Capturing Nuance</p>
                </div>
              ) : (
                <div className={`transition-all duration-700 ${translated ? 'opacity-100' : 'opacity-10 grayscale'}`}>
                  {translated ? (
                    <p className="text-xl font-medium leading-relaxed tracking-tight">{translated}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 py-20">
                      <span className="text-8xl">🦁</span>
                      <p className="text-center font-black uppercase tracking-widest text-slate-600">Waiting to roar...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {translated && !loading && (
              <div className="absolute top-8 right-8 flex flex-col space-y-3">
                <button 
                  onClick={handleCopy}
                  className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 border border-white/10 ${
                    copySuccess ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Copy Translation"
                >
                  {copySuccess ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={speakTranslation}
                  disabled={isSpeaking}
                  className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 border border-white/10 ${
                    isSpeaking ? 'bg-orange-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Listen to Translation"
                >
                  {isSpeaking ? (
                    <div className="flex space-x-1 items-center justify-center">
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-5 bg-white rounded-full animate-pulse [animation-delay:0.1s]"></div>
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    </div>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.982 5.982 0 0115 10a5.982 5.982 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center pb-12">
        <div className="flex items-center space-x-3 text-slate-400 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine High-Performance Mode</span>
        </div>
      </div>
    </div>
  );
};

export default Translator;
