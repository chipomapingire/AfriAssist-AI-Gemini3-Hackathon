
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateProfessionalAvatar } from '../geminiService';

interface ProfileProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Please provide your professional name.';
    if (!formData.location.trim()) newErrors.location = 'A location hub is required to find local opportunities.';
    if (!formData.skills.trim()) newErrors.skills = 'At least one core skill is required for AI matching.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleGenerateAvatar = async () => {
    if (!formData.fullName || !formData.skills) {
      alert("Please enter your name and skills first to personalize the headshot!");
      return;
    }
    
    if (!(window as any).aistudio?.hasSelectedApiKey || !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGeneratingAvatar(true);
    try {
      const url = await generateProfessionalAvatar(formData);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      onSave({ ...formData, avatarUrl: url });
    } catch (err) {
      console.error(err);
      alert("Failed to generate avatar. Please try again.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto w-full mb-10 flex flex-col items-center">
        {/* Professional Avatar Section */}
        <div className="relative mb-6 group">
          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-orange-400 to-amber-600 p-1 shadow-2xl overflow-hidden">
            <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden flex items-center justify-center">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">👤</span>
              )}
              {isGeneratingAvatar && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleGenerateAvatar}
            disabled={isGeneratingAvatar}
            className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-3 rounded-2xl shadow-xl hover:bg-orange-700 transition-all hover:scale-110 active:scale-95 disabled:bg-slate-400"
            title="Generate AI Professional Headshot"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-2">Build Your Identity</h2>
        <p className="text-slate-500 max-w-lg text-center leading-relaxed">
          AfriAssist helps you create a professional presence that commands respect globally. 
          Use our AI to generate a polished headshot and refine your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Professional Name</span>
                {errors.fullName && <span className="text-red-500 normal-case tracking-normal font-bold">Required</span>}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Kofi Mensah"
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all font-semibold ${errors.fullName ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
              />
              {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Location Hub</span>
                {errors.location && <span className="text-red-500 normal-case tracking-normal font-bold">Required</span>}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Lagos, Nigeria"
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all font-semibold ${errors.location ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
              />
              {errors.location && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Education Level</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.Sc in Engineering"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expertise Tier</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-semibold appearance-none"
              >
                <option value="Entry">Emerging Talent (Entry)</option>
                <option value="Mid">Skilled Professional (Mid)</option>
                <option value="Senior">Industry Leader (Senior)</option>
                <option value="Expert">Global Authority (Expert)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              <span>Skill Stack</span>
              {errors.skills && <span className="text-red-500 normal-case tracking-normal font-bold">Required</span>}
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="What are your core powers? e.g. React, Logistics, Sales..."
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all h-28 resize-none font-semibold ${errors.skills ? 'border-red-200 bg-red-50/30' : 'border-transparent'}`}
            />
            {errors.skills && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.skills}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vision & Aspirations</label>
            <textarea
              name="careerAspirations"
              value={formData.careerAspirations}
              onChange={handleChange}
              placeholder="What is your ultimate career goal? Be bold!"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all h-28 resize-none font-semibold"
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between pt-4">
          <p className="text-sm text-slate-400 italic max-w-xs font-medium">Your professional data is encrypted locally for maximum privacy.</p>
          <button
            type="submit"
            className={`px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center space-x-3 ${
              saved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-orange-600'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Profile Secure!</span>
              </>
            ) : (
              <span>Seal Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
