
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { 
  SelfAwarenessData, 
  MarketData, 
  JobListing, 
  CareerSuggestion,
  PersonalizedRoadmap,
  SkillGapResponse,
  ResumeAnalysisResult,
  InterviewQuestion,
  InterviewFeedback,
  GeneratedPlanData,
  MarketAnalysisResult,
  LinkedInImportedData,
  AdaptiveProfile,
  PerformanceInsight
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = "gemini-3-flash-preview"; 
const MODEL_PRO = "gemini-3-pro-preview";     

export interface JobDetailsResponse {
  description: string;
  salaryRange: string;
  tasks: string[];
  careerPath: string[];
  hardSkills: string[];
  softSkills: string[];
  education: string[];
  certifications: string[];
  courses: Array<{ title: string; provider: string }>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

/**
 * ADAPTIVE AI: Comprehensive behavioral and performance history analysis
 */
export const getAdaptivePerformanceAnalysis = async (profile: AdaptiveProfile, currentGoal: string): Promise<PerformanceInsight> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Analyze this user's behavioral and activity history for the target career goal: "${currentGoal}".
    
    Current Skill Level: ${profile.currentSkillLevel}
    Total Activities: ${profile.activities?.length || 0}
    Recent Activity History (Log): ${JSON.stringify(profile.activities?.slice(-10) || [])}
    
    1. Determine the performance trend (improving/stable/declining).
    2. Provide a motivating message in Arabic summarizing their progress.
    3. Predict an overall 'Market Success Rate' (0-100).
    4. Recommend if they should move to the next skill tier (beginner -> intermediate -> advanced).
    5. Identify a specific 'Focus Area' for next week.
    
    Output JSON in Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trend: { type: Type.STRING, enum: ['improving', 'stable', 'declining'] },
          message: { type: Type.STRING },
          suggestedLevelAdjustment: { type: Type.STRING, enum: ['beginner', 'intermediate', 'advanced'] },
          predictedSuccessRate: { type: Type.NUMBER },
          strengthsSummary: { type: Type.STRING },
          focusArea: { type: Type.STRING }
        },
        required: ["trend", "message", "predictedSuccessRate", "focusArea"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const calculateJobMatchScore = async (userProfile: SelfAwarenessData, job: JobListing): Promise<SkillGapResponse & { successProbability: number }> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Detailed match score between user and job listing. 
    User Profile: ${JSON.stringify(userProfile)}
    Job: ${job.title} - ${job.description}
    
    In addition to matching, predict the "Probability of Landing an Offer" based on the match score and market trends.
    Output JSON Arabic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          skillsMatch: { type: Type.NUMBER },
          experienceMatch: { type: Type.NUMBER },
          educationMatch: { type: Type.NUMBER },
          successProbability: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          quickPlan: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const searchJobsSmart = async (userQuery: string, location: string = 'Saudi Arabia'): Promise<{ text: string, jobs: JobListing[] }> => {
  const searchResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Find jobs for "${userQuery}" in "${location}". Use Arabic for response summary.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  const formattingResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Format this search result into a JSON array of JobListing objects: ${searchResponse.text}. Ensure the output is valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.OBJECT, properties: { display_name: { type: Type.STRING } } },
            location: { type: Type.OBJECT, properties: { display_name: { type: Type.STRING } } },
            description: { type: Type.STRING },
            redirect_url: { type: Type.STRING }
          }
        }
      }
    }
  });
  return { text: "نتائج البحث الحالية:", jobs: JSON.parse(formattingResponse.text || "[]") };
};

export const getCareerSuggestions = async (user: SelfAwarenessData, adaptiveProfile?: AdaptiveProfile): Promise<CareerSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Suggest 4 high-potential career paths for ${user.currentRole}. 
    User profile: ${JSON.stringify(user)}. 
    Behavioral trends/Skills Level: ${adaptiveProfile?.currentSkillLevel || 'beginner'}.
    Past Performance: ${JSON.stringify(adaptiveProfile?.performanceInsight || 'none')}.
    
    Adjust recommendations: If performance is high, suggest more ambitious 'Advanced' roles. If rushing, suggest more linear paths. 
    JSON Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            trending: { type: Type.BOOLEAN },
            marketInsights: {
              type: Type.OBJECT,
              properties: {
                averageSalary: { type: Type.STRING },
                demandRate: { type: Type.STRING },
                growthTrend: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const analyzeResumeNarrative = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [
      { inlineData: { mimeType: "application/pdf", data: fileBase64 } },
      { text: `Analyze resume impact and ATS compatibility for "${targetJob}". JSON Arabic.` }
    ],
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          impactScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          narrativeRedesign: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                logic: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateInterviewQuestions = async (jobTitle: string, userLevel: string = 'beginner'): Promise<InterviewQuestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Generate 5 interview questions for "${jobTitle}" at ${userLevel} level. JSON Arabic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const evaluateInterviewAnswer = async (question: string, answer: string, jobTitle: string): Promise<InterviewFeedback> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Evaluate interview answer. Question: ${question}. Answer: ${answer}. Job: ${jobTitle}. JSON Arabic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarity: { type: Type.NUMBER },
          keywords: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          overallScore: { type: Type.NUMBER },
          feedbackText: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateQuiz = async (topic: string, level: string = 'Intermediate'): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Generate a 3-question technical quiz on ${topic} at ${level} level. JSON Arabic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: MarketData, marketAnalysis: any): Promise<GeneratedPlanData> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Create a detailed career plan for ${user.name || 'user'} targeting ${market.field}. JSON Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getProbingQuestion = async (history: any[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: history.length === 0 ? "ابدأ التقييم الوظيفي السلوكي." : history,
    config: { systemInstruction: "You are a senior career psychologist probing behavioral latent skills via crisis scenarios. Arabic." }
  });
  return response.text || "";
};

export const analyzeMarketStrategic = async (field: string, location: string, companies?: string, industry?: string): Promise<MarketAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Conduct a real-time market analysis for "${field}" in "${location}". Focus on ${companies || 'top firms'} and ${industry || 'relevant industry'}. JSON Arabic.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLinkedInContent = async (type: 'bio' | 'post', details: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Generate LinkedIn ${type} based on: ${details}. Professional Tone. Arabic.`,
    config: { thinkingConfig: { thinkingBudget: 8000 } }
  });
  return response.text || "";
};

export const generateConnectionRequest = async (persona: string, details: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Write a short, high-impact LinkedIn connection request to ${persona}: ${details}. Arabic.`,
  });
  return response.text || "";
};

export const optimizeCVContent = async (profile: LinkedInImportedData, targetRole: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Optimize CV bullet points for "${targetRole}" based on this profile: ${JSON.stringify(profile)}. JSON Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Detailed career information for: ${jobTitle} in Saudi Arabia. JSON Arabic.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

// Added generateJobRoadmap to bridge skill gaps for a specific job listing
export const generateJobRoadmap = async (job: JobListing, userSkills: string): Promise<PersonalizedRoadmap> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Create a highly specific learning roadmap for the role of "${job.title}" at "${job.company.display_name}".
    
    The user's current skills are: ${userSkills}.
    Job Description: ${job.description}
    
    1. Identify the core skill gaps.
    2. Suggest concrete learning steps (courses, projects, certifications).
    3. Output the result in Arabic as JSON matching the PersonalizedRoadmap interface.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          userSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillGap: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                provider: { type: Type.STRING },
                duration: { type: Type.STRING },
                priority: { type: Type.STRING }
              },
              required: ["title", "type", "provider", "duration", "priority"]
            }
          }
        },
        required: ["jobTitle", "requiredSkills", "userSkills", "skillGap", "steps"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};