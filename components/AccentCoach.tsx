
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMedia, generateMotivationalVideo, generateSpeech, decodeBase64 } from '../geminiService';
import { AnalysisResult, UserProfile } from '../types';

interface AccentCoachProps {
  profile?: UserProfile;
}

const AccentCoach: React.FC<AccentCoachProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isPlayingCorrection, setIsPlayingCorrection] = useState<number | null>(null);
  
  // Veo related state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgressMsg, setVideoProgressMsg] = useState("");
  const [motivationalVideoUrl, setMotivationalVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      setResult(null);
      setMotivationalVideoUrl(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      processVideoBlob(blob);
    };

    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopStream();
      setShowCamera(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processVideoBlob = async (blob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await analyzeMedia(base64, blob.type);
        setResult(data);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setMotivationalVideoUrl(null);
    setShowCamera(false);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await analyzeMedia(base64, file.type);
        setResult(data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playCorrection = async (text: string, idx: number) => {
    setIsPlayingCorrection(idx);
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await audioContext.decodeAudioData(audioBytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => setIsPlayingCorrection(null);
      }
    } catch (err) {
      console.error(err);
      setIsPlayingCorrection(null);
    }
  };

  const handleGenerateVeo = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey || !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGeneratingVideo(true);
    setVideoProgressMsg("Initializing your cinematic vision...");
    
    try {
      const careerGoal = profile?.careerAspirations || "a successful professional";
      const location = profile?.location || "Africa";
      const prompt = `A cinematic, ultra-high quality 5-second video of a confident person achieving success as ${careerGoal} in ${location}. Bright, inspiring, realistic style, 4k detail.`;
      
      const videoUrl = await generateMotivationalVideo(prompt, (msg) => setVideoProgressMsg(msg));
      setMotivationalVideoUrl(videoUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full text-center mb-10">
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Pitch & Accent Excellence</h2>
        <p className="text-slate-600 font-medium">Practice your introduction live or upload a recorded pitch. Get instant feedback on clarity and global impact.</p>
        
        {!showCamera && !loading && !result && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={startCamera}
              className="w-full sm:w-auto bg-slate-900 text-white py-4 px-10 rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center space-x-3 transform active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
              </svg>
              <span>Launch Live Studio</span>
            </button>

            <label className="w-full sm:w-auto cursor-pointer">
              <div className="bg-white text-slate-800 border-2 border-slate-200 py-4 px-10 rounded-2xl font-black hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center space-x-3 shadow-md transform active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Media</span>
              </div>
              <input type="file" className="hidden" accept="video/*,audio/*" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>

      {showCamera && (
        <div className="max-w-2xl mx-auto w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-slate-800 mb-8 aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-2xl text-white text-xs font-black tracking-widest flex items-center space-x-2 border border-white/10">
            {isRecording && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
            <span>{isRecording ? `RECORDING ${formatTime(recordingTime)}` : 'READY'}</span>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-6">
            {!isRecording ? (
              <>
                <button
                  onClick={startRecording}
                  className="bg-white text-slate-900 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full"></div>
                </button>
                <button
                  onClick={() => { stopStream(); setShowCamera(false); }}
                  className="bg-white/10 backdrop-blur-xl text-white px-8 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
          </div>
          <p className="text-slate-800 font-black uppercase tracking-widest text-sm animate-pulse">Analyzing Dynamics...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-12 animate-in zoom-in-95 duration-700">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] flex flex-col items-center justify-center md:w-1/3 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Clarity Metrics</span>
              <span className="text-8xl font-black italic tracking-tighter mb-4">{result.score}</span>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                <div className="bg-orange-500 h-full transition-all duration-[1.5s]" style={{ width: `${result.score}%` }}></div>
              </div>
              <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Global Index Ranking</p>
            </div>
            
            <div className="flex-1 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative">
                <div className="absolute -top-4 -left-4 bg-orange-600 text-white p-3 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-black text-2xl text-slate-800 mb-6">Expert Verdict</h3>
                <p className="text-slate-600 text-lg leading-relaxed italic font-medium">"{result.feedback}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.recommendations.slice(0, 4).map((rec, i) => (
                  <div key={i} className="group bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-orange-200 hover:bg-white transition-all shadow-sm flex items-start space-x-4">
                    <div className="bg-white group-hover:bg-orange-600 group-hover:text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-slate-400 shadow-md transition-all shrink-0">
                      {i + 1}
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-700 font-bold leading-tight">{rec}</p>
                      <button 
                        onClick={() => playCorrection(rec, i)}
                        disabled={isPlayingCorrection !== null}
                        className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 disabled:opacity-50 flex items-center space-x-1"
                      >
                        {isPlayingCorrection === i ? (
                          <>
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
                            <span>Speaking...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            <span>Hear Correction</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Motivational Video Visualizer */}
          <div className="mt-12 bg-slate-900 text-white rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group border border-white/5">
            <div className="absolute top-0 right-0 -m-10 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] group-hover:bg-orange-600/20 transition-all duration-1000"></div>
            
            {!motivationalVideoUrl && !isGeneratingVideo && (
              <div className="relative z-10 text-center space-y-8">
                <div className="bg-orange-600/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-5xl">🎬</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase">Manifest Your Growth</h3>
                  <p className="text-slate-400 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    Generate a cinematic vision of your success journey. Powered by Veo.
                  </p>
                </div>
                <button
                  onClick={handleGenerateVeo}
                  className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-orange-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
                >
                  Generate Success Clip
                </button>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">BETA FEATURE • REQUIRES BILLING KEY</p>
              </div>
            )}

            {isGeneratingVideo && (
              <div className="relative z-10 py-16 flex flex-col items-center space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-[6px] border-white/5 border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">✨</div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black tracking-tight italic">{videoProgressMsg}</p>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-widest animate-pulse">Rendering Future Realities...</p>
                </div>
              </div>
            )}

            {motivationalVideoUrl && (
              <div className="relative z-10 space-y-10 animate-in fade-in duration-1000">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black flex items-center italic">
                    <span className="text-orange-500 mr-4">✦</span> 
                    The Vision
                  </h3>
                  <a 
                    href={motivationalVideoUrl} 
                    download="AfriAssist_Vision.mp4"
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    Save to Device
                  </a>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5 aspect-video bg-black group/video">
                  <video 
                    src={motivationalVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                   <span>Personalized for</span>
                   <span className="text-white bg-orange-600 px-2 py-0.5 rounded-md">{profile?.fullName || "A Future Leader"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !loading && !showCamera && (
        <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none py-20">
          <span className="text-[12rem] mb-10 grayscale">🦁</span>
          <p className="text-3xl font-black uppercase tracking-[0.5em] text-slate-800">Unleash Your Power</p>
        </div>
      )}
    </div>
  );
};

export default AccentCoach;
