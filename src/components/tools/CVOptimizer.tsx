
import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { StorageService } from '../../services/storageService';
import { optimizeCVContent } from '../../services/geminiService';
import { LinkedInImportedData, ResumeAnalysisResult } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const CVOptimizer: React.FC = () => {
  const [profile, setProfile] = useState<LinkedInImportedData | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    StorageService.getLinkedInData().then(data => {
      if (data) setProfile(data);
    });
  }, []);

  const handleOptimize = async () => {
    if (!profile) {
      showToast('يرجى استيراد ملف LinkedIn أولاً من شاشة "استيراد البيانات"', 'warning');
      return;
    }
    if (!targetRole) {
      showToast('يرجى تحديد الوظيفة المستهدفة', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await optimizeCVContent(profile, targetRole);
      setResult(res);
      showToast('اكتملت هندسة المحتوى المهني', 'success');
    } catch (e) {
      showToast('فشل التحسين. حاول مرة أخرى.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ النص المقترح', 'info');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {!result ? (
        <Card className="product-card border-none shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">✍️</div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">مهندس المحتوى المهني</h3>
            <p className="text-slate-500 mt-2">حوّل مهامك العادية إلى إنجازات رقمية تخطف أنظار المدراء.</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
             {profile ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex items-center gap-3">
                   <span className="text-2xl">✅</span>
                   <div className="text-sm">
                      <p className="font-bold text-green-800 dark:text-green-200">تم العثور على بياناتك المستوردة</p>
                      <p className="text-green-600 dark:text-green-400 text-xs">سيتم استخدام خبراتك من LinkedIn كأساس.</p>
                   </div>
                </div>
             ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-3">
                   <span className="text-2xl">⚠️</span>
                   <div className="text-sm">
                      <p className="font-bold text-amber-800 dark:text-amber-200">لا توجد بيانات مستوردة</p>
                      <p className="text-amber-600 dark:text-amber-400 text-xs">يرجى الذهاب لشاشة "الأداة" واستيراد ملفك الشخصي أولاً.</p>
                   </div>
                </div>
             )}

             <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300">ما هي الوظيفة التي تطمح إليها؟</label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="مثال: Senior Product Manager"
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
             </div>

             <Button 
               onClick={handleOptimize} 
               isLoading={loading} 
               disabled={!profile || !targetRole}
               variant="gradient" 
               fullWidth 
               size="xl"
             >
                بدء تحسين السيرة الذاتية
             </Button>
          </div>
        </Card>
      ) : (
        <div className="animate-fade-in-up space-y-8">
           {/* Scores Summary */}
           <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-surface-800 flex items-center justify-between border-none shadow-lg">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Factor</p>
                    <h4 className="text-4xl font-black text-primary-600">{result.impactScore}%</h4>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 mb-2">كثافة الإنجازات</span>
                    <div className="w-32 h-2 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                       <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${result.impactScore}%` }}></div>
                    </div>
                 </div>
              </Card>
              <Card className="p-6 bg-white dark:bg-surface-800 flex items-center justify-between border-none shadow-lg">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyword Alignment</p>
                    <h4 className="text-4xl font-black text-emerald-600">{result.matchScore}%</h4>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 mb-2">التوافق مع السوق</span>
                    <div className="w-32 h-2 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${result.matchScore}%` }}></div>
                    </div>
                 </div>
              </Card>
           </div>

           {/* Redesign Results */}
           <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">🚀</span>
                 تعديلات 'منطق التأثير' المقترحة
              </h4>
              
              <div className="grid gap-6">
                 {result.narrativeRedesign?.map((item, idx) => (
                    <Card key={idx} className="border-none shadow-xl bg-white dark:bg-surface-800 overflow-visible group">
                       <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8 relative">
                          {/* Indicator line */}
                          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-surface-700 -translate-x-1/2"></div>
                          
                          {/* Before */}
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                الوصف الحالي
                             </div>
                             <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">"{item.original}"</p>
                          </div>

                          {/* After */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase">
                                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                   تطوير Masar AI
                                </div>
                                <button 
                                  onClick={() => copyText(item.suggested)}
                                  className="text-[10px] font-black text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                                >
                                   نسخ النص
                                </button>
                             </div>
                             <p className="text-base font-bold text-slate-800 dark:text-white leading-relaxed">{item.suggested}</p>
                             <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">
                                الاستراتيجية: {item.logic}
                             </div>
                          </div>
                       </div>
                    </Card>
                 ))}
              </div>
           </div>

           {/* Keywords Analysis */}
           {result.missingKeywords && result.missingKeywords.length > 0 && (
             <Card title="💡 كلمات مفتاحية مفقودة (Missing Keywords)" className="border-none shadow-lg">
                <p className="text-xs text-slate-500 mb-4">أنظمة الـ ATS تبحث عن هذه الكلمات تحديداً. حاول دمجها في وصفك.</p>
                <div className="flex flex-wrap gap-2">
                   {result.missingKeywords.map((k, i) => (
                      <span key={i} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/50">
                         {k}
                      </span>
                   ))}
                </div>
             </Card>
           )}

           <div className="flex justify-center pt-8">
              <Button onClick={() => setResult(null)} variant="secondary" size="lg">تحسين دور آخر</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CVOptimizer;
