
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-16 pb-20">
        
        {/* Inspiration Section */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-200">✨</div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Inspiration</h1>
          </div>
          <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-xl leading-relaxed text-slate-600 font-medium">
            <p className="text-lg lg:text-xl">
              Africa is a continent of immense talent, with a projected workforce of <span className="text-orange-600 font-black">1.1 billion</span> by 2034. Yet, many face significant barriers: language nuances in global markets, lack of access to high-quality professional design tools, and the difficulty of finding vetted local and remote opportunities. 
            </p>
            <p className="mt-6">
              <span className="font-black text-slate-800 uppercase italic">AfriAssist AI</span> was born from a desire to democratize professional excellence. We wanted to build a "Command Center" where an emerging leader in Lagos or a skilled developer in Nairobi can refine their voice, craft a world-class profile, and find their next big leap—all powered by the most advanced multimodal AI on the planet.
            </p>
          </div>
        </section>

        {/* What it does Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:200ms]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">🛠️</div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">What it does</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Opportunity Engine", desc: "Uses Gemini Google Search Grounding to find verified jobs, grants, and hubs." },
              { title: "CV Intelligence", desc: "AI-powered resume building and real-time review with strategic snippet corrections." },
              { title: "Live Coach", desc: "Native Audio multimodal mock interviews for real-time career preparation." },
              { title: "Global Translator", desc: "Neural bridge for Africa's major languages with text-to-speech capabilities." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:border-orange-200 transition-colors group">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-2 group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How we built it Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:400ms]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">⚡</div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">How we built it</h2>
          </div>
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -m-20"></div>
            <p className="text-slate-400 font-medium leading-relaxed italic relative z-10">
              AfriAssist is built on a foundation of modern web technologies and the full spectrum of the <span className="text-orange-500 font-bold">Google Gemini 3 API</span> ecosystem.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <li className="flex items-start space-x-3">
                <span className="text-orange-500">▶</span>
                <p className="text-[10px] font-black uppercase tracking-widest"><span className="text-white">Gemini 3 Pro:</span> For deep reasoning and CV analysis.</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-orange-500">▶</span>
                <p className="text-[10px] font-black uppercase tracking-widest"><span className="text-white">Gemini Live API:</span> For low-latency native audio interviews.</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-orange-500">▶</span>
                <p className="text-[10px] font-black uppercase tracking-widest"><span className="text-white">Veo Video Engine:</span> For creating cinematic motivational content.</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-orange-500">▶</span>
                <p className="text-[10px] font-black uppercase tracking-widest"><span className="text-white">Tailwind CSS:</span> For high-performance, fluid responsive UI.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Challenges & Accomplishments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:600ms]">
          <section>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic mb-6">Challenges we ran into</h2>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                One of our biggest hurdles was implementing <span className="font-black text-slate-800">Gapless Live Playback</span> for the Live Coach. We had to manually implement PCM decoding for raw audio streams to ensure a natural conversation flow without standard container headers.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Ensuring <span className="font-black text-slate-800">Mobile Fluidity</span> was another key mission. We prioritized non-breaking scrollable navigation and adaptive UI elements that scale effectively across low-end and high-end devices.
              </p>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic mb-6">Accomplishments</h2>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                We are incredibly proud of the <span className="font-black text-slate-800">Facial Heatmap Mapping</span>. Using Gemini's visual grounding capabilities, we provide real-time articulation feedback that was previously only accessible to elite executive coaches.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Successfully integrating <span className="font-black text-slate-800">Google Grounding</span> for both Search and Maps ensures our users get information that isn't just intelligent, but historically accurate and locally relevant.
              </p>
            </div>
          </section>
        </div>

        {/* What we learned Section with LaTeX */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:800ms]">
           <div className="bg-orange-50 p-12 rounded-[4rem] border border-orange-100 text-center space-y-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">What we learned</h2>
              <div className="max-w-xl mx-auto space-y-4">
                <p className="text-sm text-slate-600 font-medium italic">
                  We discovered that the probability of career success $P(S)$ in emerging markets is directly proportional to the integration of AI-assisted tools $A(t)$ over time $T$.
                </p>
                <div className="bg-white p-6 rounded-3xl shadow-inner inline-block">
                  <code className="text-orange-600 font-bold text-lg">
                    {/* Fix LaTeX formula by wrapping in template literal to avoid JSX interpolation of curly braces */}
                    {`$P(S) = \\lim_{T \\to \\infty} \\int_{0}^{T} \\frac{\\alpha \\cdot A(t)}{\\text{Barriers}(t)} dt$`}
                  </code>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-4">
                  AI isn't just an assistant; it's an equalizer that reduces professional friction.
                </p>
              </div>
           </div>
        </section>

        {/* Next Steps Section */}
        <section className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:1000ms]">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">What's next for AfriAssist AI</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {["Offline Modes", "LMS Integration", "Local Job APIs", "Direct Hiring"].map((step, i) => (
               <div key={i} className="bg-slate-900 text-white py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                  {step}
               </div>
             ))}
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Africa is the future. We are the bridge.</p>
        </section>

      </div>
    </div>
  );
};

export default About;
