
import { GoogleGenAI, Type } from "@google/genai";
import { 
  SelfAwarenessData, JobListing, MarketAnalysisResult, 
  GeneratedPlanData, CareerSuggestion, ResumeAnalysisResult, 
  PersonalizedRoadmap, SkillNode, InterviewQuestion, InterviewFeedback, QuizQuestion, LinkedInImportedData
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_FLASH = "gemini-3-flash-preview"; 
const MODEL_PRO = "gemini-3-pro-preview";

/**
 * دالة مركزية للتعامل مع استجابات JSON لضمان الاستقرار
 */
async function generateStructuredContent<T>(config: {
  model: string;
  systemInstruction: string;
  prompt: string | any[];
  schema: any;
  tools?: any[];
  thinkingBudget?: number;
}): Promise<T> {
  const response = await ai.models.generateContent({
    model: config.model,
    contents: typeof config.prompt === 'string' ? [{ parts: [{ text: config.prompt }] }] : config.prompt,
    config: {
      systemInstruction: config.systemInstruction,
      responseMimeType: "application/json",
      responseSchema: config.schema,
      tools: config.tools,
      thinkingConfig: config.thinkingBudget ? { thinkingBudget: config.thinkingBudget } : undefined
    }
  });

  if (!response.text) throw new Error("Empty AI Response");
  
  const parsed = JSON.parse(response.text);
  
  // دمج روابط المصادر إذا وجدت (Search Grounding)
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "مصدر خارجي",
    url: chunk.web?.uri || "#"
  })).filter((s: any) => s.url !== "#");

  return sources ? { ...parsed, sources } : parsed;
}

export const getProbingQuestion = async (history: any[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: history.length === 0 ? "ابدأ التقييم السلوكي." : history,
    config: {
      systemInstruction: "أنت مستشار مهني خبير. اطرح سؤالاً واحداً بنظام السيناريو المهني لاستكشاف ذكاء المستخدم العملي ومهاراته الكامنة. تحدث بالعربية بلهجة احترافية."
    }
  });
  return response.text || "حدث خطأ في جلب السؤال.";
};

export const getCareerSuggestions = async (user: SelfAwarenessData): Promise<CareerSuggestion[]> => {
  return generateStructuredContent<CareerSuggestion[]>({
    model: MODEL_PRO,
    thinkingBudget: 8000,
    systemInstruction: "حلل الملف الشخصي واقترح 4 مسارات مهنية تتوافق مع رؤية 2030 وتوجهات السوق العربي.",
    prompt: `بيانات المستخدم: ${JSON.stringify(user)}`,
    schema: {
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
              demandRate: { type: Type.STRING, enum: ["Very High", "High", "Medium", "Low"] },
              growthTrend: { type: Type.STRING }
            }
          }
        }
      }
    }
  });
};

// Updated: Fix src/components/MarketResearchStep.tsx line 82: Expected 2 arguments, but got 4.
export const analyzeMarketStrategic = async (field: string, location: string, targetCompanies?: string, industryFocus?: string): Promise<MarketAnalysisResult> => {
  return generateStructuredContent<MarketAnalysisResult>({
    model: MODEL_FLASH,
    tools: [{ googleSearch: {} }],
    systemInstruction: "حلل سوق العمل الحالي باستخدام محرك البحث للحصول على بيانات دقيقة لعام 2025.",
    prompt: `حلل وظيفة ${field} في ${location}. ركز على الرواتب والطلب. الشركات المستهدفة: ${targetCompanies || 'أي'}. القطاع: ${industryFocus || 'أي'}.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        salaryData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { level: { type: Type.STRING }, min: { type: Type.NUMBER }, max: { type: Type.NUMBER }, currency: { type: Type.STRING } } } },
        geoData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { city: { type: Type.STRING }, percentage: { type: Type.NUMBER } } } },
        topSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        growthRate: { type: Type.STRING },
        competitionLevel: { type: Type.STRING }
      }
    }
  });
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: any, analysis: any): Promise<GeneratedPlanData> => {
  return generateStructuredContent<GeneratedPlanData>({
    model: MODEL_PRO,
    thinkingBudget: 12000,
    systemInstruction: "ابنِ خطة مهنية استراتيجية شاملة تشمل خارطة زمنية وشجرة مهارات وتحليل مخاطر.",
    prompt: `المستخدم: ${JSON.stringify(user)}. السوق: ${JSON.stringify(market)}. التحليل: ${JSON.stringify(analysis)}`,
    schema: {
      type: Type.OBJECT,
      properties: {
        markdownPlan: { type: Type.STRING },
        timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phaseName: { type: Type.STRING }, duration: { type: Type.STRING }, focus: { type: Type.STRING }, milestones: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
        skillTree: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, importance: { type: Type.STRING }, level: { type: Type.STRING } } } },
        risks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, impact: { type: Type.STRING }, mitigation: { type: Type.STRING } } } },
        actionPlan: { type: Type.OBJECT, properties: { shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } }, mediumTerm: { type: Type.ARRAY, items: { type: Type.STRING } } } }
      }
    }
  });
};

export const searchJobsSmart = async (query: string, location: string): Promise<{ jobs: JobListing[] }> => {
  return generateStructuredContent<{ jobs: JobListing[] }>({
    model: MODEL_FLASH,
    tools: [{ googleSearch: {} }],
    systemInstruction: "ابحث عن وظائف حقيقية متاحة حالياً في المنطقة المحددة.",
    prompt: `ابحث عن وظائف ${query} في ${location}.`,
    schema: {
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
              redirect_url: { type: Type.STRING }
            }
          }
        }
      }
    }
  });
};

export const analyzeResumeNarrative = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  return generateStructuredContent<ResumeAnalysisResult>({
    model: MODEL_PRO,
    thinkingBudget: 8000,
    systemInstruction: "حلل السيرة الذاتية من منظور 'منطق التأثير' و ATS. قدم مقترحات عملية لإعادة الصياغة.",
    prompt: [
      { inlineData: { mimeType: "application/pdf", data: fileBase64 } },
      { text: `الوظيفة المستهدفة: ${targetJob}` }
    ],
    schema: {
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
  });
};

// Added missing members for libraries and tools
export const generateInterviewQuestions = async (jobTitle: string): Promise<InterviewQuestion[]> => {
  return generateStructuredContent<InterviewQuestion[]>({
    model: MODEL_FLASH,
    systemInstruction: "أنت خبير توظيف. ولد 5 أسئلة مقابلة ذكية لوظيفة معينة.",
    prompt: `الوظيفة: ${jobTitle}`,
    schema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING }
        }
      }
    }
  });
};

export const evaluateInterviewAnswer = async (question: string, answer: string, job: string): Promise<InterviewFeedback> => {
  return generateStructuredContent<InterviewFeedback>({
    model: MODEL_PRO,
    thinkingBudget: 4000,
    systemInstruction: "قيم إجابة المقابلة بناءً على الوضوح والكلمات المفتاحية والثقة.",
    prompt: `الوظيفة: ${job}\nالسؤال: ${question}\nالإجابة: ${answer}`,
    schema: {
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
  });
};

export const generateQuiz = async (topic: string, level: string): Promise<QuizQuestion[]> => {
  return generateStructuredContent<QuizQuestion[]>({
    model: MODEL_FLASH,
    systemInstruction: "ولد اختباراً تقنياً من 5 أسئلة اختيار من متعدد.",
    prompt: `الموضوع: ${topic}, المستوى: ${level}`,
    schema: {
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
  });
};

export const generateJobRoadmap = async (job: any, userSkills: string): Promise<PersonalizedRoadmap> => {
  return generateStructuredContent<PersonalizedRoadmap>({
    model: MODEL_FLASH,
    systemInstruction: "كيف اسد الفجوة بين مهارات المستخدم ومتطلبات الوظيفة.",
    prompt: `الوظيفة: ${job.title}, مهارات المستخدم: ${userSkills}`,
    schema: {
      type: Type.OBJECT,
      properties: {
        skillGap: { type: Type.ARRAY, items: { type: Type.STRING } },
        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, provider: { type: Type.STRING }, duration: { type: Type.STRING }, type: { type: Type.STRING }, priority: { type: Type.STRING } } } }
      }
    }
  });
};

export const calculateJobMatchScore = async (user: SelfAwarenessData, job: JobListing): Promise<{ score: number, reason: string }> => {
  return generateStructuredContent<{ score: number, reason: string }>({
    model: MODEL_FLASH,
    systemInstruction: "احسب درجة المطابقة بين الملف الشخصي والوظيفة مع ذكر السبب.",
    prompt: `المستخدم: ${JSON.stringify(user)}, الوظيفة: ${JSON.stringify(job)}`,
    schema: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        reason: { type: Type.STRING }
      }
    }
  });
};

export const generateLinkedInContent = async (mode: 'bio' | 'post', input: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `اكتب محتوى LinkedIn (${mode}) بناءً على: ${input}`,
  });
  return response.text || "";
};

export const generateConnectionRequest = async (target: string, context: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `اكتب رسالة طلب تواصل (Connection Request) لـ ${target}. السياق: ${context}`,
  });
  return response.text || "";
};

export const getJobDetails = async (jobTitle: string): Promise<any> => {
  return generateStructuredContent<any>({
    model: MODEL_FLASH,
    systemInstruction: "أعطني تفاصيل كاملة للمهنة المحددة.",
    prompt: `المهنة: ${jobTitle}`,
    schema: {
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
  });
};

export const optimizeCVContent = async (profile: LinkedInImportedData, targetRole: string): Promise<ResumeAnalysisResult> => {
  return generateStructuredContent<ResumeAnalysisResult>({
    model: MODEL_PRO,
    thinkingBudget: 8000,
    systemInstruction: "حسن محتوى السيرة الذاتية ليتناسب مع دور معين مع التركيز على منطق التأثير.",
    prompt: `البروفايل: ${JSON.stringify(profile)}, الدور المستهدف: ${targetRole}`,
    schema: {
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
  });
};
