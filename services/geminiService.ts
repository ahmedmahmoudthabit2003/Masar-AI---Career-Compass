
import { GoogleGenAI, Type } from "@google/genai";
import { 
  SelfAwarenessData, JobListing, MarketAnalysisResult, 
  GeneratedPlanData, CareerSuggestion,
  ResumeAnalysisResult, PersonalizedRoadmap
} from "../types";

// Initialize AI client using environment variable
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

export const getProbingQuestion = async (history: any[]): Promise<string> => {
  // Directly use generateContent for text queries
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: history.length === 0 ? "ابدأ التقييم السلوكي." : JSON.stringify(history),
    config: {
      systemInstruction: "أنت مستشار مهني خبير. اطرح سؤالاً واحداً بنظام السيناريو المهني لاستكشاف ذكاء المستخدم العملي. تحدث بالعربية."
    }
  });

  return response.text || "";
};

// Alias for getProbingQuestion to support interviewer tools
export const getInterviewQuestion = getProbingQuestion;

export const getCareerSuggestions = async (user: SelfAwarenessData): Promise<CareerSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `اقترح 4 مسارات مهنية بناءً على: ${JSON.stringify(user)} في سياق سوق العمل العربي 2025.`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 16000 },
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
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

  return JSON.parse(response.text || "[]");
};

export const analyzeMarketStrategic = async (field: string, location: string, companies?: string, industry?: string): Promise<MarketAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `حلل سوق العمل لـ ${field} في ${location}. عام 2025. الشركات المستهدفة: ${companies || 'أي شركة'}. القطاع: ${industry || 'أي قطاع'}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          salaryData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { level: { type: Type.STRING }, min: { type: Type.NUMBER }, max: { type: Type.NUMBER }, currency: { type: Type.STRING } } } },
          geoData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { city: { type: Type.STRING }, percentage: { type: Type.NUMBER } } } },
          topSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          growthRate: { type: Type.STRING },
          competitionLevel: { type: Type.STRING },
          entryDifficulty: { type: Type.STRING }
        }
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  // Extract URLs from groundingChunks as required by guidelines
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "مصدر بيانات",
    url: chunk.web?.uri || "#"
  })).filter((s: any) => s.url !== "#");

  return { ...result, sources };
};

// Export analyzeMarket as an alias for analyzeMarketStrategic
export const analyzeMarket = analyzeMarketStrategic;

export const generateCareerPlan = async (user: SelfAwarenessData, market: any, analysis: any): Promise<GeneratedPlanData> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `ابنِ خطة مهنية كاملة لـ ${user.name} للوصول لـ ${market.field}. البيانات: ${JSON.stringify(analysis)}`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          markdownPlan: { type: Type.STRING },
          timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phaseName: { type: Type.STRING }, duration: { type: Type.STRING }, focus: { type: Type.STRING }, milestones: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
          skillTree: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, importance: { type: Type.STRING }, level: { type: Type.STRING } } } },
          risks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, impact: { type: Type.STRING }, mitigation: { type: Type.STRING } } } },
          actionPlan: { type: Type.OBJECT, properties: { shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } }, mediumTerm: { type: Type.ARRAY, items: { type: Type.STRING } } } }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeResumeNarrative = async (base64: string, job: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [
      { inlineData: { mimeType: "application/pdf", data: base64 } },
      { text: `حلل منطق التأثير لهذه السيرة لوظيفة ${job}.` }
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
          narrativeRedesign: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { original: { type: Type.STRING }, suggested: { type: Type.STRING }, logic: { type: Type.STRING } } } }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// Alias for analyzeResumeNarrative
export const analyzeResume = analyzeResumeNarrative;

export const searchJobsSmart = async (query: string, location: string): Promise<{ jobs: JobListing[] }> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `ابحث عن وظائف ${query} في ${location} حالياً.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.OBJECT, properties: { display_name: { type: Type.STRING } } },
                location: { type: Type.OBJECT, properties: { display_name: { type: Type.STRING }, lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } } },
                description: { type: Type.STRING },
                redirect_url: { type: Type.STRING },
                created: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"jobs":[]}');
};

export const generateJobRoadmap = async (job: any, userSkills: string): Promise<PersonalizedRoadmap> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `كيف اسد الفجوة بين مهاراتي: ${userSkills} ومتطلبات: ${job.title}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skillGap: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, provider: { type: Type.STRING }, duration: { type: Type.STRING }, type: { type: Type.STRING }, priority: { type: Type.STRING } } } }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// Added missing exports for library tools
export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `أعطني تفاصيل كاملة لمهنة ${jobTitle} تشمل الوصف، الرواتب، المهام، المسار، المهارات، التعليم، والشهادات.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          salaryRange: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          careerPath: { type: Type.ARRAY, items: { type: Type.STRING } },
          hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          education: { type: Type.ARRAY, items: { type: Type.STRING } },
          certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
          courses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, provider: { type: Type.STRING } } } }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateLinkedInContent = async (mode: 'bio' | 'post', input: string, tone?: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `اكتب محتوى LinkedIn (${mode}) بناءً على: ${input}. نبرة الصوت: ${tone || 'Professional'}.`,
  });
  return response.text || "";
};

export const generateLearningRoadmap = async (role: string, level: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `اصنع خارطة تعلم (Roadmap) لـ ${role} بمستوى ${level}.`,
  });
  return response.text || "";
};
