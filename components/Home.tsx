
import React from 'react';

interface HomeProps {
  onGetStarted: () => void;
}

const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  return (
    <div className="fixed inset-0 z-[250] bg-white overflow-y-auto overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-orange-100/50 rounded-full blur-[80px] lg:blur-[150px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-amber-100/50 rounded-full blur-[60px] lg:blur-[120px] translate-y-1/2 -translate-x-1/2 -z-10"></div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 lg:pt-24 pb-12 lg:pb-16 flex flex-col items-center text-center">
        <div className="bg-slate-900 w-16 h-16 lg:w-24 lg:h-24 rounded-[1.5rem] lg:rounded-[2.5rem] flex items-center justify-center text-3xl lg:text-5xl mb-6 lg:mb-10 shadow-2xl animate-bounce">🦁</div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9] mb-6 lg:mb-8">
          Africa's Talent <br />
          <span className="text-orange-600">Unleashed.</span>
        </h1>
        <p className="max-w-xl text-sm lg:text-xl text-slate-500 font-medium leading-relaxed mb-10 lg:mb-12">
          The all-in-one AI command center for the modern African professional. 
          Access global jobs, refine your CV, and master global communication.
        </p>
        <button 
          onClick={onGetStarted}
          className="group relative bg-slate-900 text-white px-8 lg:px-12 py-4 lg:py-6 rounded-2xl lg:rounded-[2.5rem] font-black text-base lg:text-xl uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl active:scale-95 overflow-hidden"
        >
          <span className="relative z-10">Launch My Future →</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </section>

      {/* Feature Showcase */}
      <section className="container mx-auto px-6 py-10 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
             <div className="text-3xl lg:text-4xl mb-4 lg:mb-6 group-hover:scale-110 transition-transform">🌍</div>
             <h3 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter mb-3 italic">Opportunity Engine</h3>
             <p className="text-slate-500 text-xs lg:text-sm font-medium leading-relaxed">
               Intelligent job matching across the continent and remote markets. Search with precision.
             </p>
          </div>
          <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
             <div className="text-3xl lg:text-4xl mb-4 lg:mb-6 group-hover:scale-110 transition-transform">📄</div>
             <h3 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter mb-3 italic">CV Intelligence</h3>
             <p className="text-slate-500 text-xs lg:text-sm font-medium leading-relaxed">
               ATS-optimized templates and AI reviews to make your profile stand out to recruiters.
             </p>
          </div>
          <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
             <div className="text-3xl lg:text-4xl mb-4 lg:mb-6 group-hover:scale-110 transition-transform">🎙️</div>
             <h3 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter mb-3 italic">Global Voice</h3>
             <p className="text-slate-500 text-xs lg:text-sm font-medium leading-relaxed">
               Real-time articulation coaching and translation to ensure your brilliance is heard.
             </p>
          </div>
        </div>
      </section>

      {/* Footer / Stats */}
      <section className="bg-slate-900 text-white py-16 lg:py-24 mt-12 lg:mt-20 rounded-t-[3rem] lg:rounded-t-[5rem]">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-8 lg:mb-12">Powered by Gemini 3</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 max-w-4xl mx-auto">
               <div>
                  <p className="text-2xl lg:text-4xl font-black tracking-tighter mb-1">200%</p>
                  <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Growth</p>
               </div>
               <div>
                  <p className="text-2xl lg:text-4xl font-black tracking-tighter mb-1">5k+</p>
                  <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Daily Jobs</p>
               </div>
               <div>
                  <p className="text-2xl lg:text-4xl font-black tracking-tighter mb-1">54</p>
                  <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nations</p>
               </div>
               <div>
                  <p className="text-2xl lg:text-4xl font-black tracking-tighter mb-1">100%</p>
                  <p className="text-[7px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Private</p>
               </div>
            </div>
            <p className="mt-12 lg:mt-20 text-slate-500 text-[10px] font-medium italic">Join thousands of leaders building the future of Africa.</p>
         </div>
      </section>
    </div>
  );
};

export default Home;
