
export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  groundingSources?: Array<{
    title: string;
    uri: string;
  }>;
}

export type FeatureTab = 'profile' | 'jobs' | 'resume' | 'resume-maker' | 'coach' | 'translate' | 'coach-live' | 'admin' | 'about';

export interface UserProfile {
  fullName: string;
  location: string;
  skills: string;
  education: string;
  careerAspirations: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Expert';
  avatarUrl?: string;
  installDate?: string;
  isSubscribed?: boolean;
  email?: string;
  phone?: string;
  password?: string;
  hasUsedSpecialCode?: boolean;
}

export interface UserQuery {
  id: string;
  userName: string;
  userEmail: string;
  query: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface SpecialCode {
  code: string;
  isUsed: boolean;
  claimedAt?: string;
  claimedBy?: string;
}

export interface ResumeData {
  summary: string;
  experience: Array<{ company: string; role: string; period: string; description: string }>;
  education: Array<{ school: string; degree: string; year: string }>;
  languages: string[];
}

export interface FacialMarker {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  label: string;
  clarity: 'low' | 'medium' | 'high';
}

export interface ImprovementHighlight {
  originalText: string;
  suggestedText: string;
  reason: string;
}

export interface AnalysisResult {
  score: number;
  feedback: string;
  recommendations: string[];
  highlights?: ImprovementHighlight[];
  facial_markers?: FacialMarker[];
}

export interface JobAlert {
  id: string;
  query: string;
  filters: {
    experienceLevel: string;
    industry: string;
    salaryRange: string;
  };
  frequency: 'daily' | 'weekly';
  createdAt: string;
}
