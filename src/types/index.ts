
export interface SelfAwarenessData {
  name?: string;
  ageGroup: string;
  gender: string;
  location: string;
  educationLevel: string;
  major: string;
  currentRole: string;
  experienceYears: string;
  skills: string;
  languages: string;
  workValues: string[];
  workEnvironment: string;
  personalityType: string;
  interests: string;
  financialGoal: string;
  timeline: string;
  constraints: string;
  strengths: string;
  weaknesses: string;
  riskTolerance: string;
  autonomyLevel: string;
  communicationStyle: string;
  problemSolvingApproach: string;
  careerAspirations: string;
  behavioralInsights?: string;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  date: string;
  status: 'Applied' | 'Interview' | 'Accepted' | 'Rejected';
  matchScore: number;
}

export interface SkillProgress {
  skill: string;
  progress: number; // 0-100
  targetLevel: string;
}

export interface InterviewFeedback {
  clarity: number;
  keywords: number;
  confidence: number;
  overallScore: number;
  feedbackText: string;
  suggestions: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
}

export interface InterviewPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  style: 'harsh' | 'empathetic' | 'technical';
  avatar: string;
}

export interface JobMarketInsights {
  averageSalary: string;
  demandRate: 'Very High' | 'High' | 'Medium' | 'Low';
  growthTrend: string;
  topEmployers?: string[];
  locationInsights?: string;
}

export interface CareerSuggestion {
  title: string;
  matchPercentage: number;
  reason: string;
  difficulty: 'High' | 'Medium' | 'Low';
  trending: boolean;
  marketInsights?: JobMarketInsights;
}

export interface LearningStep {
  title: string;
  type: 'course' | 'project' | 'certification';
  provider: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface PersonalizedRoadmap {
  jobTitle: string;
  requiredSkills: string[];
  userSkills: string[];
  skillGap: string[];
  steps: LearningStep[];
}

export interface LinkedInImportedData {
  name: string;
  headline: string;
  summary: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { school: string; degree: string; field: string }[];
  skills: string[];
  certifications: string[];
  importedAt: string;
}

export interface MarketData {
  field: string;
  location: string;
  targetCompanies?: string;
  industryFocus?: string;
  companySize?: string;
  keywords?: string; 
  specificSkills?: string; 
}

export interface MarketAnalysisResult {
  summary: string;
  salaryData: any[];
  geoData: any[];
  demandTrend: any[];
  topSkills: string[];
  competitionLevel: 'Low' | 'Medium' | 'High';
  entryDifficulty: 'Easy' | 'Medium' | 'Hard';
  growthRate: string;
  stabilityScore: number;
  sources: { title: string; url: string }[];
}

export interface SkillNode {
  name: string;
  type: 'hard' | 'soft';
  importance: 'critical' | 'bonus' | string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  impactScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementTips: string[];
  narrativeRedesign: {
    original: string;
    suggested: string;
    logic: string;
  }[];
}

export interface GeneratedPlanData {
  markdownPlan: string;
  timeline: any[];
  skillTree: SkillNode[];
  risks: any[];
  actionPlan: { shortTerm: string[], mediumTerm: string[] };
  networkingStrategy: { targetPeople: string; approachMethod: string; suggestedPlatforms: string[] };
}

export interface AdaptiveProfile {
  techScore: number;
  isRushing: boolean;
  interactionCount: number;
  preferredTools: string[];
}

export enum Step {
  WELCOME = 0,
  CONVERSATIONAL_ASSESSMENT = 1,
  SUGGESTIONS = 2, 
  MARKET_RESEARCH = 3,
  PLANNING = 4,
  RESULT = 5
}

export interface AppState {
  step: Step;
  view: 'wizard' | 'resources';
  userData: SelfAwarenessData;
  marketData: MarketData;
  marketAnalysis: MarketAnalysisResult | null;
  generatedPlan: any;
  careerPoints?: number;
  adaptiveProfile?: AdaptiveProfile;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface JobListing {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
}
