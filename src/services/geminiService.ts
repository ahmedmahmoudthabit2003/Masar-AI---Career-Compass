
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
 * ADAPTIVE AI: تحليل شامل لتاريخ الأنشطة والسلوك في سياق سوق العمل العربي
 */
export const getAdaptivePerformanceAnalysis = async (profile: AdaptiveProfile, currentGoal: string): Promise<PerformanceInsight> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `قم بتحليل تاريخ نشاط هذا المستخدم بالنسبة لهدفه المهني: "${currentGoal}" في سياق سوق العمل العربي (الشرق الأوسط وشمال أفريقيا).
    الأنشطة السابقة: ${JSON.stringify(profile.activities?.slice(-10) || [])}
    المستوى الحالي: ${profile.currentSkillLevel}
    
    1. حدد اتجاه الأداء (improving/stable/declining).
    2. قدم رسالة تحفيزية بالعربية تعكس الوعي بفرص العمل الإقليمية.
    3. توقع نسبة النجاح في السوق (Predicted Success Rate) من 0-100.
    4. اقترح منطقة التركيز للأسبوع القادم بناءً على متطلبات التوظيف في دول الخليج ومصر والشرق الأوسط.
    
    Output JSON Arabic.`,
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
    contents: `قم بحساب درجة المطابقة التفصيلية بين ملف المستخدم وهذه الوظيفة في السوق العربي. 
    الملف الشخصي: ${JSON.stringify(userProfile)}
    الوظيفة: ${job.title} - ${job.description}
    توقع "Success Probability" للحصول على هذه الوظيفة بناءً على معايير التوظيف الإقليمية.
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

export const searchJobsSmart = async (userQuery: string, location: string = 'الوطن العربي'): Promise<{ text: string, jobs: JobListing[] }> => {
  const searchResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `ابحث عن وظائف حقيقية لـ "${userQuery}" في "${location}". ركز على المواقع الكبرى مثل LinkedIn و Bayt و Wuzzuf. لخص النتائج بالعربية.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  const formattingResponse = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `حول نتائج البحث هذه إلى مصفوفة JSON من كائنات JobListing: ${searchResponse.text}. تأكد من أن أسماء الشركات والمواقع واضحة.`,
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
            redirect_url: { type: Type.STRING },
            salary_min: { type: Type.NUMBER },
            platform: { type: Type.STRING }
          }
        }
      }
    }
  });
  return { text: "أحدث الفرص الوظيفية في منطقتك:", jobs: JSON.parse(formattingResponse.text || "[]") };
};

export const getCareerSuggestions = async (user: SelfAwarenessData, adaptiveProfile?: AdaptiveProfile): Promise<CareerSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `اقترح 4 مسارات مهنية واعدة لـ ${user.currentRole} في سياق أسواق العمل العربية النشطة (السعودية، الإمارات، مصر، المغرب، الأردن). 
    ملف المستخدم: ${JSON.stringify(user)}. 
    الاتجاهات السلوكية: ${JSON.stringify(adaptiveProfile?.performanceInsight)}. 
    Output JSON Arabic.`,
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
                demandRate: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low'] },
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

export const analyzeMarketStrategic = async (field: string, location: string, companies?: string, industry?: string): Promise<MarketAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `أجرِ تحليلاً سوقياً استراتيجياً لمجال ${field} في منطقة ${location}. ابحث عن الرواتب، المنافسة، والمهارات المطلوبة لعام 2025 في العالم العربي.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
         type: Type.OBJECT,
         properties: {
            summary: { type: Type.STRING },
            growthRate: { type: Type.STRING },
            competitionLevel: { type: Type.STRING },
            salaryData: {
               type: Type.ARRAY,
               items: {
                  type: Type.OBJECT,
                  properties: {
                     level: { type: Type.STRING },
                     min: { type: Type.NUMBER },
                     max: { type: Type.NUMBER },
                     currency: { type: Type.STRING }
                  }
               }
            },
            topSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
         }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateJobRoadmap = async (job: JobListing, userSkills: string): Promise<PersonalizedRoadmap> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `قم ببناء خارطة طريق مفصلة للوصول لوظيفة ${job.title}. مهارات المستخدم الحالية: ${userSkills}. ركز على الدورات والمشاريع المتاحة للمتعلمين العرب.
    Output JSON Arabic.`,
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
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: MarketData, marketAnalysis: any): Promise<GeneratedPlanData> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `بصفتك مستشار مهني خبير في الشرق الأوسط، ابنِ خطة مهنية كاملة لـ ${user.name} في مجال ${market.field}.
    استند إلى تحليل السوق العربي: ${JSON.stringify(marketAnalysis)}.
    Output JSON Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `قدم معلومات تفصيلية عن مهنة: ${jobTitle} في سياق الوطن العربي. ركز على الرواتب في السعودية والإمارات ومصر والاردن، والمتطلبات الأكاديمية والتقنية الإقليمية.
    Output JSON Arabic.`,
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
    contents: `اكتب محتوى LinkedIn احترافي (${type}) لـ: ${details}. اللغة: العربية بلهجة احترافية تناسب مجتمعات الأعمال في دبي والرياض والقاهرة.`,
    config: { thinkingConfig: { thinkingBudget: 8000 } }
  });
  return response.text || "";
};

export const generateConnectionRequest = async (persona: string, details: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `صيغ رسالة طلب تواصل احترافية على LinkedIn موجهة لـ ${persona} بناءً على: ${details}. الأسلوب: لبق وعربي مهذب.`,
  });
  return response.text || "";
};

export const analyzeResumeNarrative = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [
      { inlineData: { mimeType: "application/pdf", data: fileBase64 } },
      { text: `حلل هذه السيرة الذاتية لوظيفة "${targetJob}" في السوق العربي. ركز على قوة صياغة الإنجازات والتوافق مع الـ ATS الإقليمي. 
      Output JSON Arabic.` }
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
    contents: `ولد 5 أسئلة مقابلة لوظيفة "${jobTitle}" في مستوى ${userLevel}. اجعل الأسئلة تشبه أسلوب المقابلات في الشركات الكبرى في العالم العربي.
    Output JSON Arabic.`,
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
    contents: `قيم إجابة المقابلة هذه. السؤال: ${question}. الإجابة: ${answer}. الوظيفة: ${jobTitle}. قدم تقييماً يعكس معايير التوظيف في الشرق الأوسط.
    Output JSON Arabic.`,
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

export const getProbingQuestion = async (history: any[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: history.length === 0 ? "ابدأ التقييم الوظيفي السلوكي للمستخدم العربي." : history,
    config: { systemInstruction: "أنت مستشار مهني ذكي وخبير في سيكولوجية العمل في الشرق الأوسط. مهمتك هي سبر أغوار مهارات المستخدم الكامنة عبر سيناريوهات أزمات مهنية واقعية في بيئات عمل عربية." }
  });
  return response.text || "";
};

export const optimizeCVContent = async (profile: LinkedInImportedData, targetRole: string): Promise<ResumeAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `حسن محتوى السيرة الذاتية لـ ${targetRole} بناءً على البروفايل: ${JSON.stringify(profile)}. استخدم لغة عربية قوية تناسب الأسواق التنافسية مثل دبي والرياض.
    Output JSON Arabic.`,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateQuiz = async (topic: string, level: string = 'Intermediate'): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `ولد اختباراً تقنياً في ${topic} بمستوى ${level}. 
    Output JSON Arabic.`,
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
