
import { z } from 'zod';

export const SelfAwarenessSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً").optional(),
  ageGroup: z.string({ required_error: "يرجى اختيار الفئة العمرية" }),
  location: z.string().min(2, "يرجى تحديد الموقع"),
  educationLevel: z.string(),
  major: z.string().optional(),
  currentRole: z.string().min(2, "يرجى كتابة دورك الحالي أو 'طالب'"),
  experienceYears: z.string(),
  skills: z.string().min(5, "يرجى ذكر بعض المهارات لضمان دقة التحليل"),
  personalityType: z.string(),
  interests: z.string().min(3, "يرجى ذكر اهتماماتك")
});

export const MarketDataSchema = z.object({
  field: z.string().min(2, "يرجى تحديد المجال المهني"),
  location: z.string().min(2, "يرجى تحديد الموقع الجغرافي"),
  targetCompanies: z.string().optional(),
  industryFocus: z.string().optional()
});

export const ResumeFileSchema = z.object({
  type: z.literal("application/pdf", { error_map: () => ({ message: "يجب أن يكون الملف بصيغة PDF فقط" }) }),
  size: z.number().max(2 * 1024 * 1024, "حجم الملف يجب أن لا يتجاوز 2 ميجابايت")
});
