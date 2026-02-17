
export interface SavedSearch {
  id: string;
  role: string;
  location: string;
  skills: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'interview' | 'learning' | 'job_match' | 'quiz' | 'resume_scan';
  score: number;
  timestamp: string;
  metadata?: any;
}

export interface SkillProgress {
  skill: string;
  progress: number; // 0-100
  targetLevel: string;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  status: 'Applied' | 'Interview' | 'Accepted' | 'Rejected';
  matchScore: number;
  date: string;
  successProbability?: number;
}

export interface PerformanceInsight {
  trend: 'improving' | 'stable' | 'declining';
  message: string;
  suggestedLevelAdjustment: 'beginner' | 'intermediate' | 'advanced';
  predictedSuccessRate: number;
  strengthsSummary: string;
  focusArea: string;
}

export interface AdaptiveProfile {
  techScore: number;
  isRushing: boolean;
  interactionCount: number;
  preferredTools: string[];
  activities: Activity[];
  currentSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  performanceInsight?: PerformanceInsight;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface SelfAwarenessData {
  name?: string; ageGroup: string; gender: string; location: string; educationLevel: string;
  major: string; currentRole: string; experienceYears: string; skills: string;
  languages: string; workValues: string[]; workEnvironment: string; personalityType: string;
  interests: string; financialGoal: string; timeline: string; constraints: string;
  strengths: string; weaknesses: string; riskTolerance: string; autonomyLevel: string;
  communicationStyle: string; problemSolvingApproach: string; careerAspirations: string;
}

export interface MarketData {
  field: string; location: string; targetCompanies?: string; industryFocus?: string;
  companySize?: string; keywords?: string; specificSkills?: string; 
}

export interface JobListing {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  platform?: string;
  normalized_salary?: string;
  salary_min?: number;
  salary_max?: number;
  created?: string;
  analysis?: SkillGapResponse;
  successProbability?: number;
}

export interface SkillGapResponse {
  score: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  reason: string;
  matchedSkills: string[];
  missingSkills: string[];
  quickPlan: string;
  marketValueBoost?: string;
}

export interface CareerSuggestion {
  title: string;
  matchPercentage: number;
  reason: string;
  difficulty: string;
  trending: boolean;
  marketInsights?: {
    averageSalary: string;
    demandRate: 'Very High' | 'High' | 'Medium' | 'Low';
    growthTrend: string;
  };
}

export interface PersonalizedRoadmap {
  jobTitle: string;
  requiredSkills: string[];
  userSkills: string[];
  skillGap: string[];
  steps: {
    title: string;
    type: string;
    provider: string;
    duration: string;
    priority: string;
  }[];
}

export interface ResumeAnalysisResult {
  matchScore: number;
  impactScore?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementTips: string[];
  narrativeRedesign?: {
    original: string;
    suggested: string;
    logic: string;
  }[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
}

export interface InterviewPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  style: 'harsh' | 'empathetic' | 'technical';
  avatar: string;
}

export interface InterviewFeedback {
  clarity: number;
  keywords: number;
  confidence: number;
  overallScore: number;
  feedbackText: string;
  suggestions: string[];
}

export interface CareerPhase {
  phaseName: string;
  duration: string;
  focus: string;
  milestones: string[];
}

export interface SkillNode {
  name: string;
  type: 'hard' | 'soft';
  importance: string;
  level: string;
}

export interface RiskFactor {
  risk: string;
  impact: string;
  mitigation: string;
}

export interface GeneratedPlanData {
  markdownPlan: string;
  timeline: CareerPhase[];
  skillTree: SkillNode[];
  risks: RiskFactor[];
  resources: { title: string; type: string; description: string }[];
  actionPlan: { shortTerm: string[], mediumTerm: string[] };
  networkingStrategy: { targetPeople: string; approachMethod: string; suggestedPlatforms: string[] };
}

export interface MarketAnalysisResult {
  summary: string;
  salaryData: { level: string; min: number; max: number; currency: string }[];
  geoData: { city: string; percentage: number }[];
  demandTrend: { year: string; volume: number }[];
  topSkills: string[];
  competitionLevel: string;
  entryDifficulty: string;
  growthRate: string;
  sources?: { title: string; url: string }[];
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

export interface AppState {
  step: number;
  view: 'wizard' | 'resources';
  userData: SelfAwarenessData;
  marketData: MarketData;
  marketAnalysis: any;
  generatedPlan: any;
  careerPoints: number;
  activities: Activity[];
  appliedJobs: AppliedJob[];
  adaptiveProfile: AdaptiveProfile;
}

export enum Step {
  WELCOME = 0,
  CONVERSATIONAL_ASSESSMENT = 1,
  SUGGESTIONS = 2, 
  MARKET_RESEARCH = 3,
  PLANNING = 4,
  RESULT = 5
}
