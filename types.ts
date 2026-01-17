
export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  groundingSources?: Array<{
    title: string;
    uri: string;
  }>;
}

export type FeatureTab = 'profile' | 'jobs' | 'resume' | 'coach' | 'translate' | 'coach-live';

export interface UserProfile {
  fullName: string;
  location: string;
  skills: string;
  education: string;
  careerAspirations: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Expert';
  avatarUrl?: string;
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
}
