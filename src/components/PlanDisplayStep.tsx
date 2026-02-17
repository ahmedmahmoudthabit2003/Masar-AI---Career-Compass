
import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { AppState, GeneratedPlanData, SkillNode } from '../types';
import { generateCareerPlan } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  userData: AppState['userData'];
  marketData: AppState['marketData'];
  marketAnalysis: any;
  initialPlan?: any;
  onRestart: () => void;
}

const PlanDisplayStep: React.FC<Props> = ({ userData, marketData, marketAnalysis, initialPlan, onRestart }) => {
  const [planData, setPlanData] = useState<GeneratedPlanData | null>(initialPlan || null);
  const [loading, setLoading] = useState(!initialPlan);
  const [activeTab, setActiveTab] = useState<'timeline' | 'skills' | 'risks' | 'report'>('timeline');
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    if (planData) { setLoading(false); return; }
    const fetchPlan = async () => {
      try {
        const result = await generateCareerPlan(userData, marketData, marketAnalysis);
        setPlanData(result);
      } catch (err) { showToast('حدث خطأ في توليد الخطة', 'error'); }
      finally { setLoading(false); }
    };
    fetchPlan();
  }, [userData, marketData, marketAnalysis]);

  const toggleMilestone = (milestone: string) => {
    const newSet = new Set(completedMilestones);
    if (newSet.has(milestone)) newSet.delete(milestone);
    else newSet.add(milestone);
    setCompletedMilestones(newSet);
  };

  const progressPercentage = useMemo(() => {
    if (!planData || !planData.timeline) return 0;
    const total = planData.timeline.reduce((acc, curr) => acc + (curr.milestones?.length || 0), 0);
    if (total === 0) return 0;
    return Math.round((completedMilestones.size / total) * 100);
  }, [planData, completedMilestones]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">جاري هندسة مستقبلك...</h2>
        <p className="text-slate-500 mt-2">نقوم الآن بتحويل أهدافك إلى خطوات تنفيذية ملموسة.</p>
      </div>
    );
  }

  if (!planData) return <div className="text-center p-10 font-bold text-red-500">عذراً، لم نتمكن من تحميل الخطة حالياً.</div>;

  return (
    <div className="w-full pb-24 max-w-6xl mx-auto animate-fade-in">
      <Card className="mb-8 border-none bg-gradient-to-br from-slate-900 to-primary-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-right">
            <h2 className="text-3xl font-black mb-2">معدل الإنجاز المهني</h2>
            <p className="text-primary-200 font-medium max-w-sm">حوّل خطتك إلى واقع عبر تتبع كل خطوة. التقدم في المهام يقربك من هدفك المنشود.</p>
          </div>
          <div className="text-center shrink-0">
             <div className="text-6xl font-black mb-4 flex items-baseline justify-center">
                {progressPercentage}
                <span className="text-2xl opacity-50">%</span>
             </div>
             <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
               <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
             </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-2 mb-10 sticky top-20 z-30 bg-surface-50/80 dark:bg-surface-900/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-surface-700">
        {[
          { id: 'timeline', label: '🗺️ الخط الزمني' },
          { id: 'skills', label: '🌳 المهارات' },
          { id: 'risks', label: '🛡️ المخاطر' },
          { id: 'report', label: '📄 التقرير' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${
              activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg' : 'bg-white dark:bg-surface-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && (
        <div className="space-y-12 relative mr-8 md:mr-12 border-r-4 border-slate-100 dark:border-surface-800 pr-12 text-right">
           {planData.timeline?.map((phase, idx) => (
             <div key={idx} className="relative animate-fade-in-up">
                <div className="absolute top-0 -right-[62px] w-14 h-14 rounded-full bg-primary-600 border-[6px] border-white dark:border-surface-900 flex items-center justify-center text-white font-black text-xl shadow-xl z-10">
                   {idx + 1}
                </div>
                <Card className="hover:shadow-2xl transition-all border-none bg-white dark:bg-surface-800 p-8 rounded-3xl">
                   <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-slate-50 dark:border-surface-700 pb-6">
                      <div className="text-right">
                         <h3 className="text-2xl font-black text-primary-600 dark:text-primary-400">{phase.phaseName}</h3>
                         <p className="text-slate-400 font-bold mt-1">المدة التقديرية: {phase.duration}</p>
                      </div>
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-xs font-black mt-4 md:mt-0 uppercase tracking-wider">التركيز: {phase.focus}</span>
                   </div>
                   <div className="grid md:grid-cols-2 gap-4">
                      {phase.milestones?.map((m, i) => {
                        const isDone = completedMilestones.has(m);
                        return (
                          <div 
                            key={i} 
                            onClick={() => toggleMilestone(m)}
                            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 group ${
                              isDone ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800 opacity-60' : 'bg-slate-50 dark:bg-surface-700 border-transparent hover:border-primary-200 shadow-sm'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                              isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white group-hover:border-primary-400'
                            }`}>
                              {isDone && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`font-bold text-sm leading-snug transition-all text-right flex-1 ${isDone ? 'text-emerald-700 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{m}</span>
                          </div>
                        );
                      })}
                   </div>
                </Card>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid gap-6 animate-fade-in-up">
           {planData.skillTree?.map((skill, idx) => (
             <Card key={idx} className="flex items-center justify-between p-6 text-right">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${skill.type === 'hard' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {skill.type === 'hard' ? '⚙️' : '🧠'}
                   </div>
                   <div>
                      <h4 className="font-black text-slate-800 dark:text-white">{skill.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{skill.type === 'hard' ? 'تقنية' : 'ناعمة'} • الأهمية: {skill.importance}</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-700 text-slate-500">المستوى المطلوب: {skill.level}</span>
                </div>
             </Card>
           ))}
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-6 animate-fade-in-up text-right">
           {planData.risks?.map((risk, idx) => (
             <Card key={idx} className="border-r-8 border-red-500 p-6">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xl font-black text-slate-800 dark:text-white">{risk.risk}</h3>
                   <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black">تأثير: {risk.impact}</span>
                </div>
                <div className="bg-slate-50 dark:bg-surface-900 p-4 rounded-xl">
                   <p className="text-xs font-black text-slate-400 uppercase mb-2">خطة المواجهة</p>
                   <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{risk.mitigation}</p>
                </div>
             </Card>
           ))}
        </div>
      )}

      {activeTab === 'report' && (
        <div id="full-report-content" className="animate-fade-in-up">
           <Card className="p-10 prose prose-slate dark:prose-invert max-w-none shadow-xl border-none text-right">
              <ReactMarkdown>{planData.markdownPlan || 'لا يوجد تقرير متاح.'}</ReactMarkdown>
           </Card>
           <div className="mt-8 flex justify-center">
              <Button onClick={() => {
                const element = document.getElementById('full-report-content');
                html2pdf().from(element).save('Masar_AI_Career_Plan.pdf');
              }} variant="outline" className="px-10">تحميل التقرير كـ PDF</Button>
           </div>
        </div>
      )}

      <div className="mt-16 flex justify-center gap-4">
         <Button onClick={onRestart} variant="secondary" size="lg">البدء من جديد</Button>
         <Button onClick={() => showToast('تم حفظ خطتك محلياً وفي بروفايلك الذكي', 'success')} variant="primary" size="lg">حفظ التقدم</Button>
      </div>
    </div>
  );
};

export default PlanDisplayStep;
