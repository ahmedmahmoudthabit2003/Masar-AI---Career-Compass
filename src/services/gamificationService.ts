
import { AdaptiveProfile } from "../types";

export const POINTS_MAP = {
  RESUME_UPLOAD: 50,
  LINKEDIN_IMPORT: 50,
  MOCK_INTERVIEW: 30,
  QUIZ_COMPLETION: 25,
  PLAN_GENERATED: 100,
  CHAT_MESSAGE: 5
};

export class GamificationService {
  static calculateLevel(points: number): number {
    return Math.floor(Math.sqrt(points / 10)) + 1;
  }

  static getLevelName(level: number): string {
    if (level < 2) return "مكتشف مبتدئ";
    if (level < 5) return "مخطط استراتيجي";
    if (level < 8) return "خبير مسارات";
    return "سفير المستقبل";
  }

  static analyzeTechPropensity(text: string): number {
    const techKeywords = [
      'python', 'react', 'javascript', 'coding', 'software', 'developer', 
      'engineering', 'data', 'ai', 'cloud', 'aws', 'backend', 'frontend',
      'برمجيات', 'هندسة', 'تقنية', 'بيانات', 'ذكاء'
    ];
    let score = 0;
    const lower = text.toLowerCase();
    techKeywords.forEach(kw => {
      if (lower.includes(kw)) score += 10;
    });
    return Math.min(score, 100);
  }

  static updateAdaptiveProfile(
    current: AdaptiveProfile, 
    action: { type: 'msg' | 'upload' | 'import', text?: string, duration?: number }
  ): AdaptiveProfile {
    const next = { ...current };
    next.interactionCount += 1;

    if (action.text) {
      next.techScore = Math.max(next.techScore, this.analyzeTechPropensity(action.text));
    }

    if (action.duration && action.duration < 2000) {
      // If user replies in < 2 seconds multiple times, flag as rushing
      next.isRushing = true;
    } else {
      next.isRushing = false;
    }

    return next;
  }
}
