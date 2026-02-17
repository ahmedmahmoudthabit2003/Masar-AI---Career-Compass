
import React, { useState, useEffect, useMemo } from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { Activity, AppliedJob, SkillProgress, AdaptiveProfile, AppState } from '../types';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('masar_app_state_v5');
    if (saved) setState(JSON.parse(saved));
  }, []);

  const appliedJobs = state?.appliedJobs || [];
  const careerPoints = state?.careerPoints || 0;
  const adaptive = state?.adaptiveProfile;
  const insight = adaptive?.performanceInsight;

  const mockSkills: SkillProgress[] = [
    { skill: 'React.js', progress: 85, targetLevel: 'Senior' },
    { skill: 'Product Strategy', progress: 40, targetLevel: 'Lead' },
    { skill: 'System Design', progress: 60, targetLevel: 'Expert' }
  ];

  const readinessScore = useMemo(() => {
    if (appliedJobs.length === 0) return insight?.predictedSuccessRate || 75;
    const scores = appliedJobs.map(j => j.matchScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [appliedJobs, insight]);

  const trendIcon = (trend?: string) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '📊';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-slate-100 dark:border-surface-800 pb-8">
         <div className="text-center lg:text-right w-full lg:w-auto">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">لوحة القيادة الذكية (Adaptive AI) 📊</h2>
            <p className="text-slate-500 font-medium">مرحباً بك مجدداً. إليك لمحة سريعة عن تطور بروفايلك المهني.</p>
         </div>
         <div className="flex gap-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center gap-3">
               <span className="text-2xl">🏆</span>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">النقاط المهنية</p>
                  <p className="text-xl font-black text-primary-600">{careerPoints}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Adaptive Performance Panel */}
         <div className="space-y-8">
            <Card className="border-none shadow-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">جاهزية سوق العمل</p>
                  <h4 className="text-8xl font-black mb-6">{readinessScore}%</h4>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${readinessScore}%` }} transition={{ duration: 1.5 }} className="h-full bg-white shadow-[0_0_10px_white]" />
                  </div>
                  <p className="text-[10px] font-bold opacity-60">مستوى البروفايل: <span className="uppercase tracking-tighter">{adaptive?.currentSkillLevel || 'beginner'}</span></p>
               </div>
            </Card>

            {insight && (
               <Card title="نبض الأداء الذكي ✨" className="border-none shadow-xl bg-slate-900 text-white p-6">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="text-3xl">{trendIcon(insight.trend)}</div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase">Probability of Landing Offer</p>
                           <p className="text-4xl font-black text-emerald-400">{insight.predictedSuccessRate}%</p>
                        </div>
                     </div>
                     <p className="text-sm text-slate-300 font-bold leading-relaxed">{insight.message}</p>
                     <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                        <div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المستوى المقترح</span>
                           <p className="text-xs font-black text-primary-400 mt-1 uppercase">{insight.suggestedLevelAdjustment}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تركيز الأسبوع</span>
                           <p className="text-xs font-black text-amber-400 mt-1">{insight.focusArea}</p>
                        </div>
                     </div>
                  </div>
               </Card>
            )}

            <Card title="أهداف المهارات الحالية" className="border-none shadow-xl">
               <div className="space-y-6 mt-4">
                  {mockSkills.map((s, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-700 dark:text-white">{s.skill}</span>
                          <span className="text-primary-600">{s.progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ delay: i * 0.1 }} className="h-full bg-primary-500 rounded-full" />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Job Tracking & Predictions */}
         <div className="lg:col-span-2 space-y-8">
            <Card title="تتبع الوظائف واحتمالات النجاح" className="border-none shadow-2xl overflow-hidden" padding="none">
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                     <thead className="bg-slate-50/50 dark:bg-surface-900/50 border-b border-slate-100 dark:border-surface-700">
                        <tr className="text-[10px] font-black text-slate-400 uppercase">
                           <th className="px-8 py-5">المسمى الوظيفي</th>
                           <th className="px-8 py-5">الحالة</th>
                           <th className="px-8 py-5">تطابق AI</th>
                           <th className="px-8 py-5">احتمالية العرض</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-surface-700">
                        {appliedJobs.length > 0 ? appliedJobs.map((job) => (
                           <tr key={job.id} className="group hover:bg-primary-50/20 transition-colors">
                              <td className="px-8 py-6">
                                 <div className="font-black text-slate-800 dark:text-white">{job.title}</div>
                                 <div className="text-xs font-bold text-slate-400">{job.company}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${job.status === 'Interview' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {job.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="font-black text-primary-600">{job.matchScore}%</span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <span className={`font-black ${(job.successProbability || 0) > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{job.successProbability || 0}%</span>
                                    <div className="w-12 h-1 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                       <div className="h-full bg-current" style={{ width: `${job.successProbability || 0}%` }} />
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">لا توجد وظائف مسجلة حالياً. استخدم "باحث الوظائف" للبدء.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>

            {/* Adaptive Re-orderable suggestions or actions */}
            <div className="grid md:grid-cols-2 gap-6">
               <Card className="bg-emerald-50/30 dark:bg-emerald-900/10 border-none shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center text-xl">🚀</div>
                     <h4 className="font-black text-emerald-800 dark:text-emerald-400">تحسين القيمة السوقية</h4>
                  </div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 leading-relaxed">
                     بناءً على تحليلك الأخير، تعلم مهارة 'Cloud Architecture' سيرفع احتمالية قبولك في الوظائف المستهدفة بنسبة 25%.
                  </p>
                  <Button variant="outline" className="mt-4 text-xs h-10 border-emerald-200 text-emerald-700">تحديث خارطة التعلم</Button>
               </Card>
               <Card className="bg-amber-50/30 dark:bg-amber-900/10 border-none shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center text-xl">🎤</div>
                     <h4 className="font-black text-amber-800 dark:text-amber-400">تنبيه المقابلات</h4>
                  </div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-300 leading-relaxed">
                     لديك مقابلة غداً! هل تريد إجراء محاكاة سريعة مع "المدير التقني" للتدريب على أسئلة System Design؟
                  </p>
                  <Button variant="outline" className="mt-4 text-xs h-10 border-amber-200 text-amber-700">بدء تدريب ذكي</Button>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
