
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

const MarketInsightDashboard: React.FC<{ insights: CareerSuggestion['marketInsights'] }> = ({ insights }) => {
  if (!insights) return (
    <div className="bg-slate-50 dark:bg-surface-700/30 p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
      جاري جلب بيانات السوق...
    </div>
  );

  const demandColors = {
    'Very High': 'bg-emerald-500',
    'High': 'bg-blue-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-red-500'
  };

  const demandLabels = {
    'Very High': 'طلب مرتفع جداً',
    'High': 'طلب مرتفع',
    'Medium': 'طلب متوسط',
    'Low': 'طلب منخفض'
  };

  return (
    <div className="bg-slate-50 dark:bg-surface-700/50 p-6 rounded-3xl space-y-5 border border-slate-100 dark:border-surface-600 relative group/insights">
      <div className="flex justify-between items-end">
        <div className="relative group/tooltip">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-help underline decoration-dotted">متوسط الراتب</p>
           <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{insights.averageSalary}</p>
           <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block bg-slate-800 text-white text-[10px] p-2 rounded-lg w-40 z-20">
             يمثل الراتب الإجمالي الشهري المتوقع في منطقتك الجغرافية.
           </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حالة الطلب</p>
           <span className="text-xs font-bold text-slate-700 dark:white">{demandLabels[insights.demandRate]}</span>
        </div>
      </div>

      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            <span>معدل التوظيف الحالي (Live)</span>
            <span>{insights.demandRate === 'Very High' ? '90%' : insights.demandRate === 'High' ? '70%' : insights.demandRate === 'Medium' ? '50%' : '20%'}</span>
         </div>
         <div className="h-2 w-full bg-slate-200 dark:bg-surface-600 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: insights.demandRate === 'Very High' ? '90%' : insights.demandRate === 'High' ? '70%' : insights.demandRate === 'Medium' ? '50%' : '20%' }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className={`h-full rounded-full ${demandColors[insights.demandRate]}`}
            />
         </div>
      </div>

      <div className="pt-2 border-t border-slate-200/50 dark:border-surface-600 flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">📈</div>
         <div className="relative group/trend">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter cursor-help underline decoration-dotted">التوجه المستقبلي (Growth)</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{insights.growthTrend}</p>
            <div className="absolute bottom-full mb-2 hidden group-hover/trend:block bg-slate-800 text-white text-[10px] p-2 rounded-lg w-48 z-20">
              توقعات نمو الوظائف لهذا المسار خلال الخمس سنوات القادمة.
            </div>
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
      try {
        const results = await getCareerSuggestions(userData);
        // Sort suggestions by demand rate priority
        const priorityMap = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const sorted = results.sort((a, b) => {
          const aDemand = priorityMap[a.marketInsights?.demandRate || 'Medium'];
          const bDemand = priorityMap[b.marketInsights?.demandRate || 'Medium'];
          return bDemand - aDemand;
        });
        setSuggestions(sorted);
      } catch (error) {
        showToast('فشل في تحليل المسارات المهنية المتوافقة', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [userData]);

  const nextCard = () => {
    if (currentIndex < suggestions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevCard = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-8"
        >🔮</motion.div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">جاري تحليل سوق العمل...</h2>
        <p className="text-slate-500 mt-2">نقوم الآن بالبحث في LinkedIn وBayt لمطابقة ملفك مع أعلى المهن طلباً في 2025</p>
      </div>
    );
  }

  const currentSuggestion = suggestions[currentIndex];

  return (
    <div className="max-w-6xl mx-auto w-full p-4 animate-fade-in relative pb-10">
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest mb-4">
           Market & AI Aligned Roadmap
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">مساراتك الواعدة 🚀</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">المسارات مرتبة حسب "تطابق المهارات" و"قوة الطلب" في {userData.location || 'منطقتك'}.</p>
      </div>

      <div className="relative h-auto md:h-[600px] flex items-center justify-center mb-10">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-4xl"
          >
            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] shadow-2xl border border-white/20">
               {/* Left Content Card */}
               <Card className="p-10 border-none bg-white dark:bg-surface-800 flex flex-col rounded-none md:rounded-r-[3rem]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="bg-primary-600 text-white px-5 py-2 rounded-2xl font-black text-sm shadow-lg shadow-primary-500/20">
                      {currentSuggestion.matchPercentage}% تطابق شخصي
                    </div>
                    {currentSuggestion.marketInsights?.demandRate === 'Very High' && (
                       <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          الأكثر طلباً 2025
                       </span>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-6 leading-tight">
                    {currentSuggestion.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8 font-medium">
                    "{currentSuggestion.reason}"
                  </p>
                  
                  <div className="mt-auto space-y-4">
                     <div className="flex gap-2">
                        <span className="bg-slate-100 dark:bg-surface-700 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase">
                           صعوبة الدخول: {currentSuggestion.difficulty === 'High' ? 'عالية' : 'متوسطة'}
                        </span>
                     </div>
                     <Button 
                        onClick={() => onSelect(currentSuggestion.title)}
                        variant="gradient" 
                        fullWidth 
                        size="xl"
                        className="rounded-2xl shadow-xl"
                      >
                        بناء خارطة تعلم سد الفجوة ➜
                      </Button>
                  </div>
               </Card>

               {/* Right Insights Card */}
               <Card className="p-10 border-none bg-slate-50 dark:bg-surface-900 rounded-none md:rounded-l-[3rem] flex flex-col justify-center">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                     نبض السوق (LinkedIn/Glassdoor Analysis)
                  </h4>
                  
                  <MarketInsightDashboard insights={currentSuggestion.marketInsights} />
                  
                  <div className="mt-8 p-5 bg-white dark:bg-surface-800 rounded-[2rem] border border-slate-100 dark:border-surface-700 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shadow-sm">🎯</div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">المهارات المطلوبة لـ {currentSuggestion.title} في سوقك حالياً تم دمجها في الخطة القادمة.</p>
                     </div>
                  </div>
               </Card>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 flex justify-between px-4 md:-px-20 pointer-events-none z-10">
           <button 
             onClick={prevCard} 
             disabled={currentIndex === 0}
             className="w-16 h-16 rounded-full bg-white dark:bg-surface-800 shadow-2xl border border-slate-100 dark:border-surface-700 flex items-center justify-center text-primary-600 pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-all"
           >
              <svg className="w-7 h-7 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
           </button>
           <button 
             onClick={nextCard} 
             disabled={currentIndex === suggestions.length - 1}
             className="w-16 h-16 rounded-full bg-white dark:bg-surface-800 shadow-2xl border border-slate-100 dark:border-surface-700 flex items-center justify-center text-primary-600 pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-all"
           >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
         {suggestions.map((_, i) => (
           <button 
             key={i} 
             onClick={() => setCurrentIndex(i)}
             className={`h-2.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-primary-600' : 'w-2.5 bg-slate-200 dark:bg-surface-700 hover:bg-slate-300'}`} 
           />
         ))}
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-slate-100 dark:border-surface-800">
        <Button onClick={onBack} variant="secondary" size="lg">تعديل الملف الشخصي</Button>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-4">Live Market Grounding Integrated</p>
      </div>
    </div>
  );
};

export default CareerSuggestionsStep;
