
import React from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

interface Props {
  onNext: () => void;
  onLoadSaved?: (data: any) => void;
}

const WelcomeStep: React.FC<Props> = ({ onNext, onLoadSaved }) => {
  const { showToast } = useToast();

  const handleLoad = () => {
    const saved = localStorage.getItem('masar_master_v5_prod');
    if (saved && onLoadSaved) {
      try {
        onLoadSaved(JSON.parse(saved));
        showToast('تم استعادة رحلتك المهنية السابقة', 'success');
      } catch (e) { showToast('لا توجد بيانات محفوظة صالحة', 'error'); }
    } else { showToast('لا توجد بيانات محفوظة', 'info'); }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden py-12 px-4">
      
      {/* الخلفية: الدوائر المركزية (Concentric Circles) كما في الصورة */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-slate-100/40 dark:bg-surface-800/20 border border-slate-200/50 dark:border-surface-700/30 flex items-center justify-center">
          <div className="w-[70%] h-[70%] rounded-full bg-slate-100/60 dark:bg-surface-800/40 border border-slate-200/50 dark:border-surface-700/30 flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-surface-900 dark:to-surface-950 shadow-inner"></div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 text-center max-w-5xl mx-auto space-y-16">
        
        {/* العناوين */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight">
            خطط لمستقبلك بذكاء مع <span className="text-primary-600">مسار AI</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            المنصة العربية المتكاملة لتحديد المسار المهني باستخدام أقوى نماذج الذكاء الاصطناعي التوليدي.
          </p>
        </motion.div>

        {/* البطاقات الثلاث (المثلث الذهبي) بتنسيق الصورة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          
          {/* البطاقة 1: فهم الذات */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-white dark:border-surface-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-center h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-blue-100/50">🧠</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">1. فهم الذات</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold">تحليل عميق للقدرات الذهنية والشغف الحقيقي لبناء أساس متين.</p>
            </Card>
          </motion.div>

          {/* البطاقة 2: واقع السوق */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-white dark:border-surface-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-center h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-indigo-100/50">🌐</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">2. واقع السوق</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold">كشف الفرص الحقيقية في سوقك المحلي مقارنة بالسوق العالمي.</p>
            </Card>
          </motion.div>

          {/* البطاقة 3: الانطلاق */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-white dark:border-surface-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-center h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-emerald-100/50">🚀</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">3. الانطلاق</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold">خطة تنفيذية تشمل بناء الهوية المهنية ودمج المهارات.</p>
            </Card>
          </motion.div>
        </div>

        {/* أزرار العمليات */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <Button onClick={onNext} size="xl" variant="gradient" className="shadow-2xl shadow-primary-500/30 w-full sm:w-auto min-w-[240px] rounded-[1.5rem] py-5 font-black text-lg">
            ابدأ رحلة النجاح
          </Button>
          <Button onClick={handleLoad} size="xl" variant="secondary" className="w-full sm:w-auto min-w-[200px] rounded-[1.5rem] py-5 font-black text-lg bg-white/50 backdrop-blur">
            استكمال التقدم
          </Button>
        </motion.div>

      </div>
      
      {/* تذييل الصفحة البسيط */}
      <div className="absolute bottom-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        Empowering Arab Youth Through AI
      </div>
    </div>
  );
};

export default WelcomeStep;
