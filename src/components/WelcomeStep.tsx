
import React from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  onNext: () => void;
  onLoadSaved?: (data: any) => void;
}

const WelcomeStep: React.FC<Props> = ({ onNext, onLoadSaved }) => {
  const { showToast } = useToast();

  const handleLoad = () => {
    const saved = localStorage.getItem('masar_app_state_v5');
    if (saved && onLoadSaved) {
      try {
        onLoadSaved(JSON.parse(saved));
        showToast('تم استعادة رحلتك المهنية السابقة', 'success');
      } catch (e) { showToast('لا توجد بيانات محفوظة صالحة', 'error'); }
    } else { showToast('لا توجد بيانات محفوظة', 'info'); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 w-full animate-fade-in text-center px-4">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mb-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-black mb-4 animate-fade-in-up uppercase tracking-widest">
           ✨ القوة الكاملة لـ Gemini 3.0 Pro
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1] animate-slide-in-up">
          ابنِ مسارك المهني في <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">الوطن العربي</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-in-up delay-100 font-medium">
          المنصة الذكية الأولى التي تدمج طموح الشباب العربي مع واقع سوق العمل الإقليمي، من الخليج إلى المحيط.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 animate-slide-in-up delay-200">
           <Button onClick={onNext} size="xl" variant="gradient" className="shadow-2xl shadow-primary-500/30 w-full sm:w-auto min-w-[240px] rounded-[1.5rem] py-5 font-black text-lg">
              ابدأ التقييم الشامل
           </Button>
           <Button onClick={handleLoad} size="xl" variant="secondary" className="w-full sm:w-auto min-w-[200px] rounded-[1.5rem] py-5 font-black text-lg">
              استكمال التقدم
           </Button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl animate-fade-in-up delay-300">
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-500 shadow-xl">
            <div className="text-5xl mb-6">🧠</div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tighter">تحليل سلوكي عميق</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">نحلل أسلوب تفكيرك وحلك للمشكلات عبر سيناريوهات مهنية واقعية لبيئة العمل العربية.</p>
         </Card>
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-500 shadow-xl">
            <div className="text-5xl mb-6">🌐</div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tighter">رؤية السوق الإقليمي</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">تغطية شاملة لأسواق السعودية، الإمارات، مصر، المغرب، وباقي الدول العربية ببيانات حية.</p>
         </Card>
         <Card className="bg-white/60 dark:bg-surface-800/60 backdrop-blur border-white/50 dark:border-surface-700/50 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-500 shadow-xl">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tighter">هندسة المستقبل</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">خطط تنفيذية تشمل سد الفجوات المهارية، بناء السيرة الذاتية، والتدريب على المقابلات.</p>
         </Card>
      </div>
      
      <p className="mt-20 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Built for the future of Arab Talent</p>
    </div>
  );
};

export default WelcomeStep;
