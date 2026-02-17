import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { analyzeResumeNarrative } from '../../services/geminiService';
import { ResumeAnalysisResult } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!file || !targetJob) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await analyzeResumeNarrative(base64, targetJob);
        setResult(res);
        showToast("اكتمل تحليل منطق التأثير", "success");
      } catch (e) { showToast("فشل التحليل", "error"); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {!result ? (
        <Card className="product-card p-10 border-none shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Narrative Architect 🏗️</h3>
            <p className="text-slate-500">نحن لا نفحص الكلمات فقط، بل نحلل 'منطق التأثير' في قصة نجاحك.</p>
          </div>
          <div className="space-y-6 max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="الوظيفة المستهدفة (مثال: Senior Data Architect)"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            />
            <div className="border-2 border-dashed border-primary-200 dark:border-surface-600 rounded-3xl p-12 text-center bg-primary-50/30 dark:bg-surface-900/30 relative">
               <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
               <div className="text-5xl mb-4">📄</div>
               <p className="font-bold text-primary-700 dark:text-primary-400">{file ? file.name : "اسحب سيرتك الذاتية هنا"}</p>
            </div>
            <Button onClick={handleAnalyze} isLoading={loading} fullWidth size="xl" variant="gradient">بدء هندسة القصة المهنية</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
           <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-surface-800 p-6 flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Impact Score</p>
                    <h4 className="text-4xl font-black text-primary-600">{result.impactScore || 0}%</h4>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-500">قوة الأرقام والنتائج</p>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-primary-500" style={{width: `${result.impactScore || 0}%`}}></div>
                    </div>
                 </div>
              </Card>
              <Card className="bg-white dark:bg-surface-800 p-6 flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase">ATS Match</p>
                    <h4 className="text-4xl font-black text-emerald-600">{result.matchScore || 0}%</h4>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-500">التوافق مع الأنظمة</p>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{width: `${result.matchScore || 0}%`}}></div>
                    </div>
                 </div>
              </Card>
           </div>

           <Card title="إعادة صياغة 'منطق التأثير' (Impact Redesign)" className="border-none shadow-xl">
              <div className="space-y-6 mt-4">
                 {result.narrativeRedesign?.map((item, idx) => (
                   <div key={idx} className="grid md:grid-cols-2 gap-4 border-b border-slate-100 dark:border-surface-700 pb-6 last:border-none">
                      <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                         <p className="text-[10px] font-black text-red-600 mb-2">النص الحالي (ضعيف التنافسية)</p>
                         <p className="text-sm text-slate-600 dark:text-slate-300 italic">{item.original}</p>
                      </div>
                      <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 relative">
                         <p className="text-[10px] font-black text-green-600 mb-2">النص المقترح (بمنطق التأثير)</p>
                         <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">{item.suggested}</p>
                         <div className="text-[10px] text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-100 inline-block px-2 py-0.5 rounded">
                            لماذا: {item.logic}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="flex justify-center">
              <Button onClick={() => setResult(null)} variant="secondary">تحليل ملف آخر</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;