
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMedia, generateMotivationalVideo, generateSpeech, decodeBase64, decodeAudioData } from '../geminiService';
import { AnalysisResult, UserProfile, FacialMarker } from '../types';

interface AccentCoachProps {
  profile?: UserProfile;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

const AccentCoach: React.FC<AccentCoachProps> = ({ profile, isLoggedIn, onLoginClick }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isPlayingCorrection, setIsPlayingCorrection] = useState<number | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<FacialMarker | null>(null);
  
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
    if (!isLoggedIn) {
        onLoginClick?.();
        return;
    }
    setIsPlayingCorrection(idx);
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        // Correct usage of PCM decoding as API returns raw PCM data.
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
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
    if (!isLoggedIn) {
        onLoginClick?.();
        return;
    }
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
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto w-full text-center mb-10">
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic">Pitch & Articulation</h2>
        <p className="text-slate-600 font-medium">Test your clarity with our AI articulation engine. See your facial heatmap live.</p>
        
        {!showCamera && !loading && !result && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={startCamera}
              className="w-full sm:w-auto bg-slate-900 text-white py-4 px-10 rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center space-x-3 transform active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
              </svg>
              <span>Launch Live Coach</span>
            </button>
            {!isLoggedIn && (
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 border-l border-slate-200">
                  Guest preview limited to facial mapping
               </div>
            )}
          </div>
        )}
      </div>

      {(showCamera || result) && (
        <div className="max-w-2xl mx-auto w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-slate-800 mb-8 aspect-video">
          {showCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
              <span className="text-white font-black text-2xl italic opacity-50 uppercase tracking-widest">Articulation Analysis Map</span>
              
              {result?.facial_markers?.map((marker, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredMarker(marker)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl animate-pulse cursor-help transition-all transform hover:scale-150 ${
                    marker.clarity === 'high' ? 'bg-green-500/40' : marker.clarity === 'medium' ? 'bg-amber-500/40' : 'bg-red-500/40'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className={`w-2 h-2 rounded-full ${marker.clarity === 'high' ? 'bg-green-400' : marker.clarity === 'medium' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  </div>
                </div>
              ))}

              {hoveredMarker && (
                <div 
                  className="absolute bottom-10 left-10 right-10 bg-black/80 backdrop-blur-xl p-4 rounded-2xl text-white animate-in fade-in slide-in-from-bottom-2 border border-white/10"
                >
                   <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">{hoveredMarker.label}</p>
                   <p className="text-sm font-bold">Clarity Rating: <span className="uppercase text-orange-400">{hoveredMarker.clarity}</span></p>
                </div>
              )}
            </div>
          )}
          
          <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-2xl text-white text-xs font-black tracking-widest flex items-center space-x-2 border border-white/10">
            {isRecording && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
            <span>{isRecording ? `RECORDING ${formatTime(recordingTime)}` : showCamera ? 'READY' : 'MAP COMPLETE'}</span>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-6">
            {showCamera && !isRecording && (
              <button
                onClick={startRecording}
                className="bg-white text-slate-900 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90"
              >
                <div className="w-8 h-8 bg-red-600 rounded-full"></div>
              </button>
            )}
            {showCamera && isRecording && (
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
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-800 font-black uppercase tracking-widest text-sm animate-pulse">Scanning Visual Cues...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-12 animate-in zoom-in-95 duration-700">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] flex flex-col items-center justify-center md:w-1/3 shadow-2xl relative overflow-hidden group">
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Articulation Score</span>
              <span className="text-8xl font-black italic tracking-tighter mb-4">{result.score}</span>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-[1.5s]" style={{ width: `${result.score}%` }}></div>
              </div>
            </div>
            
            <div className="flex-1 space-y-8 relative">
              {!isLoggedIn && (
                <div className="absolute inset-0 z-20 bg-slate-50/70 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center text-center p-8">
                    <span className="text-3xl mb-4">🔒</span>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Detailed Analysis Locked</h4>
                    <p className="text-slate-500 text-sm font-bold mb-6 max-w-xs">Sign in to read strategic visual feedback and hear AI corrections.</p>
                    <button onClick={onLoginClick} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Start Your Journey</button>
                </div>
              )}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <h3 className="font-black text-2xl text-slate-800 mb-6">Strategic Visual Feedback</h3>
                <p className="text-slate-600 text-lg leading-relaxed italic font-medium blur-sm">"HIDDEN FOR GUEST PREVIEW"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 blur-sm">
                {[1,2,3,4].map((_, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-[2rem] flex items-start space-x-4">
                    <div className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-slate-400">?</div>
                    <div className="space-y-2 flex-1"><div className="h-4 bg-slate-200 rounded w-full"></div><div className="h-3 bg-slate-100 rounded w-2/3"></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccentCoach;
