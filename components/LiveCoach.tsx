
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserProfile } from '../types';
import { decodeBase64, decodeAudioData, encodeBase64 } from '../geminiService';

interface LiveCoachProps {
  profile?: UserProfile;
}

const LiveCoach: React.FC<LiveCoachProps> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready for your mock interview?');
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setStatus('Session ended. Ready for another?');
  };

  const startSession = async () => {
    if (isActive) return;

    try {
      setStatus('Initializing AI Coach...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Fix: Initialize GoogleGenAI strictly using process.env.API_KEY directly as per guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Coach is listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-10), `Coach: ${text}`]);
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(
                decodeBase64(audioData),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are a world-class career coach for African talent. Your name is AfriCoach. 
          Help the user prepare for an interview for: ${profile?.careerAspirations || 'a professional role'}.
          The user's skills are: ${profile?.skills || 'varied'}.
          Be encouraging, provide constructive feedback, and ask realistic interview questions. 
          Respond concisely to keep the conversation flowing.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to start. Check microphone permissions.');
    }
  };

  return (
    <div className="p-8 h-full flex flex-col items-center bg-slate-50">
      <div className="max-w-4xl w-full text-center space-y-6">
        <div className="inline-block p-4 bg-orange-100 rounded-3xl text-4xl shadow-inner mb-2 animate-bounce">🎙️</div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Real-time Mock Interview</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Practice your pitch with our AI Coach. Speak naturally, and receive instant audio guidance and mock questions.
        </p>

        <div className="mt-12 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${isActive ? 'opacity-100' : ''}`}></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-orange-600 scale-110 shadow-2xl' : 'bg-slate-200'}`}>
              {isActive ? (
                <div className="flex space-x-1">
                  <div className="w-1.5 h-8 bg-white rounded-full animate-[bounce_0.6s_infinite]"></div>
                  <div className="w-1.5 h-12 bg-white rounded-full animate-[bounce_0.6s_0.1s_infinite]"></div>
                  <div className="w-1.5 h-16 bg-white rounded-full animate-[bounce_0.6s_0.2s_infinite]"></div>
                  <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_0.6s_0.3s_infinite]"></div>
                </div>
              ) : (
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </div>

            <div className="text-center">
              <p className={`text-xl font-black tracking-tight ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                {status}
              </p>
            </div>

            <div className="flex space-x-4">
              {!isActive ? (
                <button
                  onClick={startSession}
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all transform active:scale-95 shadow-xl flex items-center space-x-3"
                >
                  <span>Start Coaching Session</span>
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-red-700 transition-all transform active:scale-95 shadow-xl"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        {transcription.length > 0 && (
          <div className="mt-10 bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-left border-4 border-slate-800 max-h-60 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Live Transcription</h4>
            <div className="space-y-3">
              {transcription.map((line, i) => (
                <p key={i} className="text-slate-300 font-medium text-sm animate-in fade-in slide-in-from-left-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full pb-10">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <div className="text-2xl mb-2">💡</div>
          <h5 className="font-bold text-slate-800 text-sm">Actionable Tips</h5>
          <p className="text-slate-500 text-xs">AI analyzes your speech patterns in real-time.</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <div className="text-2xl mb-2">⚡</div>
          <h5 className="font-bold text-slate-800 text-sm">Zero Latency</h5>
          <p className="text-slate-500 text-xs">Talk naturally with human-like responsiveness.</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <div className="text-2xl mb-2">🏆</div>
          <h5 className="font-bold text-slate-800 text-sm">Global Standards</h5>
          <p className="text-slate-500 text-xs">Modeled on top international interview rubrics.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveCoach;
