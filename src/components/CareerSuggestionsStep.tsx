
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelfAwarenessData, CareerSuggestion } from '../types';
import { getCareerSuggestions } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  userData: SelfAwarenessData;
  onSelect: (suggestion: string) => void;
  onBack: () => void;
}

const CACHE_KEY = 'masar_career_suggestions_cache';

const MarketInsightDashboard: React.FC<{ insights: CareerSuggestion['marketInsights'] }> = ({ insights }) => {
  if (!insights) return (
    <div className="bg-slate-50 dark:bg-surface-700/30 p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
      بيانات السوق مدمجة في التحليل...
    </div>
  );

  const demandColors = { 'Very High': 'bg-emerald-500', 'High': 'bg-blue-500', 'Medium': 'bg-amber-500', 'Low': 'bg-red-500' };
  const demandLabels = { 'Very High': 'طلب مرتفع جداً', 'High': 'طلب مرتفع', 'Medium': 'طلب متوسط', 'Low': 'طلب منخفض' };

  return (
    <div className="bg-slate-50 dark:bg-surface-700/50 p-6 rounded-3xl space-y-5 border border-slate-100 dark:border-surface-600 relative group/insights">
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">متوسط الراتب</p>
           <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{insights.averageSalary}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حالة الطلب</p>
           <span className="text-xs font-bold text-slate-700 dark:white">{(demandLabels as any)[insights.demandRate] || insights.demandRate}</span>
        </div>
      </div>

      <div className="space-y-2">
         <div className="h-2 w-full bg-slate-200 dark:bg-surface-600 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: insights.demandRate === 'Very High' ? '90%' : '60%' }}
               className={`h-full rounded-full ${(demandColors as any)[insights.demandRate] || 'bg-blue-500'}`}
            />
         </div>
      </div>

      <div className="pt-2 border-t border-slate-200/50 dark:border-surface-600 flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">📈</div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">التوجه المستقبلي</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{insights.growthTrend}</p>
         </div>
      </div>
    </div>
  );
};

const CareerSuggestionsStep: React.FC<Props> = ({ userData, onSelect, onBack }) => {
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      // 1. فحص التخزين المؤقت أولاً
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp, userId } = JSON.parse(cached);
          // صلاحية الكاش 30 دقيقة، ونفس المستخدم
          if (Date.now() - timestamp < 30 * 60 * 1000 && userId === userData.name) {
            setSuggestions(data);
            setLoading(false);
            return;
          }
        } catch (e) { localStorage.removeItem(CACHE_KEY); }
      }

      // 2. طلب جديد إذا لم يوجد كاش
      try {
        const results = await getCareerSuggestions(userData);
        setSuggestions(results);
        // حفظ في الكاش
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: results,
          timestamp: Date.now(),
          userId: userData.name
        }));
      } catch (error: any) {
        const isRateLimit = error?.message?.includes("429");
        showToast(isRateLimit ? 'النظام مزدحم حالياً، جاري المحاولة بنموذج بديل...' : 'فشل في تحليل المسارات', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [userData, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white dark:bg-surface-900 rounded-[3rem] shadow-2xl">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-6xl mb-8">🔮</motion.div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">جاري تحليل مستقبلك المهني...</h2>
        <p className="text-slate-500 mt-2">نحن نستخدم ذكاء اصطناعي مكثف لمطابقة مهاراتك مع السوق.</p>
      </div>
    );
  }

  const currentSuggestion = suggestions[currentIndex];
  if (!currentSuggestion) return <div className="text-center p-20 font-black">لا توجد مقترحات حالياً.</div>;

  return (
    <div className="max-w-6xl mx-auto w-full p-4 animate-fade-in relative pb-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">مساراتك الواعدة 🚀</h2>
        <p className="text-slate-500 text-lg">المسارات مرتبة حسب "تطابق المهارات" و"قوة الطلب" في 2025.</p>
      </div>

      <div className="relative h-auto md:min-h-[550px] flex items-center justify-center mb-10">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-4xl"
          >
            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] shadow-2xl border border-slate-100 dark:border-surface-800">
               <Card className="p-10 border-none bg-white dark:bg-surface-800 flex flex-col rounded-none md:rounded-r-[3rem]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="bg-primary-600 text-white px-5 py-2 rounded-2xl font-black text-sm">
                      {currentSuggestion.matchPercentage}% تطابق
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-6 leading-tight">{currentSuggestion.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8 font-medium">"{currentSuggestion.reason}"</p>
                  <div className="mt-auto">
                     <Button onClick={() => onSelect(currentSuggestion.title)} variant="gradient" fullWidth size="xl" className="rounded-2xl shadow-xl">اختيار هذا المسار ➜</Button>
                  </div>
               </Card>

               <Card className="p-10 border-none bg-slate-50 dark:bg-surface-900 rounded-none md:rounded-l-[3rem] flex flex-col justify-center">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> نبض السوق 2025
                  </h4>
                  <MarketInsightDashboard insights={currentSuggestion.marketInsights} />
               </Card>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 flex justify-between px-2 md:-px-10 pointer-events-none z-10">
           <button onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} className="w-12 h-12 rounded-full bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center pointer-events-auto disabled:opacity-20" disabled={currentIndex === 0}>
              <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
           </button>
           <button onClick={() => currentIndex < suggestions.length - 1 && setCurrentIndex(currentIndex + 1)} className="w-12 h-12 rounded-full bg-white dark:bg-surface-800 shadow-xl flex items-center justify-center pointer-events-auto disabled:opacity-20" disabled={currentIndex === suggestions.length - 1}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-surface-800">
        <Button onClick={onBack} variant="secondary">رجوع</Button>
        <div className="flex gap-2">
           {suggestions.map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-primary-600' : 'w-2 bg-slate-200'}`} />
           ))}
        </div>
      </div>
    </div>
  );
};

export default CareerSuggestionsStep;
