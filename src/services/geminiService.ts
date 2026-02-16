
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { 
  SelfAwarenessData, 
  MarketData, 
  MarketAnalysisResult, 
  ResumeAnalysisResult, 
  JobListing, 
  CareerSuggestion,
  GeneratedPlanData,
  LinkedInImportedData,
  PersonalizedRoadmap,
  JobMarketInsights,
  InterviewQuestion,
  InterviewFeedback
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

const repairJson = (jsonString: string): string => {
  try {
    return JSON.parse(jsonString) && jsonString;
  } catch (e) {
    let repaired = jsonString.trim();
    if (repaired.startsWith("```json")) repaired = repaired.replace(/^```json/, "");
    if (repaired.startsWith("```")) repaired = repaired.replace(/^```/, "");
    const stack: string[] = [];
    let inString = false;
    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        if (char === '"' && (i === 0 || repaired[i-1] !== '\\')) inString = !inString;
        if (!inString) {
            if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
            if (char === '}' || char === ']') stack.pop();
        }
    }
    while (stack.length > 0) repaired += stack.pop();
    return repaired;
  }
};

/**
 * FEATURE: Generate Targeted Interview Questions
 */
export const generateInterviewQuestions = async (jobTitle: string, profile: SelfAwarenessData): Promise<InterviewQuestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Act as a Top-tier HR Manager. Generate 5 unique and challenging interview questions for the role of "${jobTitle}".
    Take this candidate profile into account: ${JSON.stringify(profile)}.
    Include a mix of Behavioral, Technical, and Situational questions. 
    Language: Arabic. Return JSON array matching schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['behavioral', 'technical', 'situational'] }
          }
        }
      }
    }
  });
  return JSON.parse(repairJson(response.text || "[]"));
};

/**
 * FEATURE: Evaluate Interview Answer with Scores
 */
export const evaluateInterviewAnswer = async (question: string, answer: string, jobTitle: string): Promise<InterviewFeedback> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Question: "${question}"
    Candidate Answer: "${answer}"
    Target Role: "${jobTitle}"
    
    Analyze the answer for:
    1. Clarity (Clear structure, STAR method).
    2. Keywords (Relevant technical and professional terms).
    3. Confidence (Assertive language, tone).
    
    Provide scores out of 100, feedback text, and 3 suggestions.
    Language: Arabic. Return JSON.`,
    config: {
      thinkingConfig: { thinkingBudget: 4000 },
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
  return JSON.parse(repairJson(response.text || "{}"));
};

/**
 * FEATURE: Real-time Job Market Data Enrichment
 */
export const getJobMarketInsights = async (jobTitle: string, location: string): Promise<JobMarketInsights> => {
  const searchResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Search current job market for "${jobTitle}" in "${location}" (2025). Extract: average salary, demand rate, growth trend.`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const formatting = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Format to JSON in Arabic. Text: ${searchResponse.text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          averageSalary: { type: Type.STRING },
          demandRate: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low'] },
          growthTrend: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(repairJson(formatting.text || "{}"));
};

/**
 * FEATURE: Bridge the Gap - Personalized Learning Roadmap
 */
export const generateJobRoadmap = async (job: JobListing | string, userSkills: string): Promise<PersonalizedRoadmap> => {
  const jobTitle = typeof job === 'string' ? job : job.title;
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Analyze gap between user skills: "${userSkills}" and job: "${jobTitle}". 
    Create a concrete learning roadmap to bridge this gap. Include courses, projects and certifications with estimated time.
    Return JSON.`,
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
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
                type: { type: Type.STRING, enum: ['course', 'project', 'certification'] },
                provider: { type: Type.STRING },
                duration: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(repairJson(response.text || "{}"));
};

export const getCareerSuggestions = async (user: SelfAwarenessData): Promise<CareerSuggestion[]> => {
  const initialResponse = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Suggest 4 high-match career paths for: ${JSON.stringify(user)}. Return JSON.`,
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            matchPercentage: { type: Type.INTEGER },
            reason: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            trending: { type: Type.BOOLEAN }
          }
        }
      }
    }
  });

  const suggestions: CareerSuggestion[] = JSON.parse(repairJson(initialResponse.text || "[]"));
  return Promise.all(suggestions.map(async (s) => {
    try {
      const insights = await getJobMarketInsights(s.title, user.location || 'Saudi Arabia');
      return { ...s, marketInsights: insights };
    } catch (e) { return s; }
  }));
};

export const optimizeCVContent = async (profile: LinkedInImportedData, targetRole: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Optimize CV impact logic for "${targetRole}". Return JSON.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          impactScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          narrativeRedesign: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { original: {type:Type.STRING}, suggested: {type:Type.STRING}, logic: {type:Type.STRING} } } }
        }
      }
    }
  });
  return JSON.parse(repairJson(response.text || "{}"));
};

export const analyzeMarketStrategic = async (field: string, location: string, companies?: string, industry?: string): Promise<MarketAnalysisResult> => {
  const searchResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Analyze market for "${field}" in "${location}". Focus on AI risk, stability, and salary.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const formatting = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Format to JSON in Arabic. Text: ${searchResponse.text}`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(repairJson(formatting.text || "{}")), sources: [] };
};

export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  const searchResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Provide full job details for "${jobTitle}" in Saudi Arabia.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const formatting = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Format to JSON in Arabic. Text: ${searchResponse.text}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(repairJson(formatting.text || "{}"));
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: MarketData, marketAnalysis: MarketAnalysisResult): Promise<GeneratedPlanData> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Create execution career plan for ${user.name}. Return JSON.`,
    config: { thinkingConfig: { thinkingBudget: 32768 }, responseMimeType: "application/json" }
  });
  return JSON.parse(repairJson(response.text || "{}"));
};

export const getProbingQuestion = async (history: any[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: history.length === 0 ? "Start conversational career probing. Arabic." : history,
    config: { systemInstruction: "Expert career psychologist. Use scenario-based probing." }
  });
  return response.text || "";
};

export const analyzeResumeNarrative = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [{ inlineData: { mimeType: "application/pdf", data: fileBase64 } }, { text: `Analyze impact logic for ${targetJob}.` }],
    config: { thinkingConfig: { thinkingBudget: 16000 }, responseMimeType: "application/json" }
  });
  return JSON.parse(repairJson(response.text || "{}"));
};

export const generateConnectionRequest = async (targetRole: string, reason: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `LinkedIn connection for ${targetRole} based on ${reason}. Arabic.`
  });
  return response.text || "";
};

export const generateLinkedInContent = async (type: 'bio' | 'post', details: string, tone: string = 'Professional'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Generate LinkedIn ${type} for: ${details}. Tone: ${tone}. Arabic.`
  });
  return response.text || "";
};

export const searchJobsSmart = async (userQuery: string): Promise<{ text: string, jobs?: JobListing[] }> => {
  const adzunaTool: FunctionDeclaration = {
    name: "search_adzuna_jobs",
    description: "Search live jobs in Saudi Arabia.",
    parameters: { type: Type.OBJECT, properties: { what: { type: Type.STRING }, where: { type: Type.STRING } }, required: ["what"] }
  };
  const chat = ai.chats.create({ model: MODEL_FLASH, config: { tools: [{ functionDeclarations: [adzunaTool] }] } });
  const result = await chat.sendMessage({ message: userQuery });
  const call = result.functionCalls?.[0];
  if (call && call.name === "search_adzuna_jobs") {
     const { what, where } = call.args as any;
     const jobs = await fetchAdzunaJobs(what || '', where || 'sa');
     return { text: "Results:", jobs };
  }
  return { text: result.text || "" };
};

const fetchAdzunaJobs = async (what: string, where: string): Promise<JobListing[]> => {
  const APP_ID = process.env.VITE_ADZUNA_APP_ID;
  const APP_KEY = process.env.VITE_ADZUNA_APP_KEY;
  if (!APP_ID || !APP_KEY) return [];
  try {
     const response = await fetch(`https://api.adzuna.com/v1/api/jobs/sa/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=10&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&content-type=application/json`);
     const data = await response.json();
     return data.results || [];
  } catch (e) { return []; }
};

export const getInterviewQuestion = async (history: {role: string, text: string}[], jobTitle: string): Promise<string> => {
  const chat = ai.chats.create({ model: MODEL_FLASH, config: { systemInstruction: `HR recruiter for ${jobTitle}. Arabic.` } });
  const result = await chat.sendMessage({ message: history.length === 0 ? "Start." : history[history.length-1].text });
  return result.text || "";
};

export const generateQuiz = async (topic: string, level: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Generate 3-question quiz about ${topic}. JSON Arabic.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(repairJson(response.text || "[]"));
};

export const generateLearningRoadmap = async (role: string, level: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Learning roadmap for ${role} at ${level} level. Arabic.`
  });
  return response.text || "";
};
