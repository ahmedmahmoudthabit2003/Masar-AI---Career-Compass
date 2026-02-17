
export enum Step {
  WELCOME = 0,
  CONVERSATIONAL_ASSESSMENT = 1,
  // Added alias for conversational assessment step
  SELF_AWARENESS = 1,
  SUGGESTIONS = 2, 
  MARKET_RESEARCH = 3,
  PLANNING = 4,
  RESULT = 5
}

export interface Activity {
  id: string;
  type: 'interview' | 'learning' | 'job_match' | 'quiz' | 'resume_scan';
  score: number;
  timestamp: string;
  metadata?: any;
}

export interface AdaptiveProfile {
  techScore: number;
  isRushing: boolean;
  interactionCount: number;
  currentSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  performanceInsight?: {
    trend: 'improving' | 'stable' | 'declining';
    predictedSuccessRate: number;
    message: string;
    focusArea: string;
    suggestedLevelAdjustment: string;
  };
}

export interface SelfAwarenessData {
  name?: string;
  skills: string;
  interests: string;
  careerAspirations: string;
  experienceYears?: string;
  educationLevel?: string;
  currentRole?: string;
  major?: string;
  location?: string;
  ageGroup?: string;
  workValues?: string[];
  financialGoal?: string;
  // Added missing properties
  gender?: string;
  languages?: string;
  workEnvironment?: string;
  personalityType?: string;
  timeline?: string;
  constraints?: string;
  strengths?: string;
  weaknesses?: string;
  riskTolerance?: string;
  autonomyLevel?: string;
  communicationStyle?: string;
  problemSolvingApproach?: string;
}

export interface MarketData {
  field: string;
  location: string;
  targetCompanies?: string;
  industryFocus?: string;
  // Added missing properties
  companySize?: string;
  keywords?: string;
  specificSkills?: string;
}

export interface MarketAnalysisResult {
  summary: string;
  salaryData: Array<{ level: string; min: number; max: number; currency: string }>;
  geoData: Array<{ city: string; percentage: number }>;
  topSkills: string[];
  growthRate: string;
  competitionLevel: string;
  entryDifficulty?: string;
  // Added sources for search grounding
  sources?: Array<{ title: string; url: string }>;
}

export interface JobListing {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; lat?: number; lng?: number };
  description: string;
  redirect_url: string;
  platform?: string;
  salary_min?: number;
  matchScore?: number;
  matchReason?: string;
  created: string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  impactScore?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementTips: string[];
  narrativeRedesign?: Array<{ original: string; suggested: string; logic: string }>;
}

export interface CareerSuggestion {
  title: string;
  matchPercentage: number;
  reason: string;
  difficulty: 'High' | 'Medium' | 'Low';
  trending: boolean;
  marketInsights?: {
    averageSalary: string;
    demandRate: 'Very High' | 'High' | 'Medium' | 'Low';
    growthTrend: string;
  };
}

export interface SkillNode {
  name: string;
  type: 'hard' | 'soft';
  importance: 'critical' | 'bonus';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedPlanData {
  markdownPlan: string;
  timeline: Array<{ phaseName: string; duration: string; focus: string; milestones: string[] }>;
  skillTree: Array<SkillNode>;
  risks: Array<{ risk: string; impact: string; mitigation: string }>;
  actionPlan: { shortTerm: string[]; mediumTerm: string[] };
}

export interface AppState {
  step: Step;
  view: 'wizard' | 'resources';
  userData: SelfAwarenessData;
  marketData: MarketData;
  marketAnalysis: MarketAnalysisResult | null;
  generatedPlan: GeneratedPlanData | null;
  careerPoints: number;
  activities: Activity[];
  adaptiveProfile: AdaptiveProfile;
  appliedJobs: JobListing[];
  direction: 'forward' | 'backward';
  isExiting: boolean;
  isSettingsOpen: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface PersonalizedRoadmap {
  skillGap: string[];
  steps: Array<{ title: string; provider: string; duration: string; type: 'course' | 'project' | 'cert'; priority: 'High' | 'Medium' }>;
}
