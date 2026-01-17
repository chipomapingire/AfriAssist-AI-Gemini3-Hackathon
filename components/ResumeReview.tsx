
import React, { useState } from 'react';
import { reviewDocument } from '../geminiService';
import { AnalysisResult } from '../types';

const ResumeReview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await reviewDocument(base64, file.type);
        setResult(data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Optimize Your Resume</h2>
        <p className="text-slate-600">Upload your CV (PDF or Image) to receive expert feedback, a readiness score, and specific phrasing improvements.</p>
        
        <div className="mt-8">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all bg-white relative overflow-hidden group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📂</span>
              <p className="mb-2 text-sm text-slate-500 font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 uppercase">PDF, PNG, JPG (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-orange-600 font-semibold animate-pulse">Our AI is analyzing your career path...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Total Score</span>
              <span className="text-5xl font-black text-orange-700">{result.score}%</span>
            </div>
            <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Expert Feedback</h3>
              <p className="text-slate-600 leading-relaxed">{result.feedback}</p>
            </div>
          </div>

          {/* New Highlighting & Phrasing Section */}
          {result.highlights && result.highlights.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✨</span>
                <h3 className="text-xl font-bold text-slate-800">Direct Phrasing Improvements</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {result.highlights.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Phrasing</span>
                        <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-sm italic font-medium">
                          "{item.originalText}"
                        </div>
                      </div>
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Suggested Upgrade</span>
                        <div className="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-100 text-sm font-bold">
                          "{item.suggestedText}"
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-start space-x-3">
                      <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1">Why?</div>
                      <p className="text-sm text-slate-500 font-medium">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center text-xl">
              <span className="mr-2">🚀</span> Priority Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start p-4 bg-slate-50 rounded-2xl">
                  <span className="bg-green-100 text-green-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center mr-4 shrink-0 shadow-sm">✓</span>
                  <span className="text-slate-700 font-medium text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center pt-6 pb-10">
             <button 
              onClick={() => { setResult(null); }}
              className="text-orange-600 font-bold hover:underline flex items-center space-x-2"
             >
               <span>Analyze another resume</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeReview;
