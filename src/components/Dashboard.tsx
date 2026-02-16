
import React, { useState, useEffect } from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { AppliedJob, SkillProgress, ResumeAnalysisResult } from '../types';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [resumeInsights, setResumeInsights] = useState<Partial<ResumeAnalysisResult> | null>(null);

  useEffect(() => {
    // محاكاة تحميل البيانات أو جلبها من LocalStorage
    const savedJobs = localStorage.getItem('masar_applied_jobs');
    if (savedJobs) setAppliedJobs(JSON.parse(savedJobs));
    else {
      const dummyJobs: AppliedJob[] = [
        { id: '1', title: 'UX Designer', company: 'Neom', date: '2025-01-20', status: 'Interview', matchScore: 88 },
        { id: '2', title: 'Product Manager', company: 'STC', date: '2025-01-15', status: 'Applied', matchScore: 74 }
      ];
      setAppliedJobs(dummyJobs);
    }

    const dummySkills: SkillProgress[] = [
      { skill: 'React.js', progress: 85, targetLevel: 'Senior' },
      { skill: 'Product Discovery', progress: 40, targetLevel: 'Lead' },
      { skill: 'Critical Thinking', progress: 65, targetLevel: 'Expert' }
    ];
    setSkills(dummySkills);

    setResumeInsights({
      matchScore: 82,
      strengths: ['استخدام أفعال إنجاز قوية', 'أرقام واضحة في الخبرات', 'تنسيق متوافق مع ATS'],
      weaknesses: ['نقص الكلمات المفتاحية التقنية', 'الملخص المهني قصير جداً']
    });
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Interview': return 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse';
      case 'Accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Applied': return 'تم التقديم';
      case 'Interview': return 'موعد مقابلة';
      case 'Accepted': return 'مقبول 🎉';
      case 'Rejected': return 'مرفوض';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in space-y-10 pb-20">
      {/* Header Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-slate-100 dark:border-surface-800 pb-8">
         <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">لوحة التحكم المهنية 📊</h2>
            <p className="text-slate-500 font-medium text-lg">مرحباً بك مجدداً. إليك لمحة سريعة عن تقدمك نحو وظيفة أحلامك.</p>
         </div>
         <div className="flex gap-4">
            <Button variant="outline" className="rounded-2xl px-6">تصدير التقرير</Button>
            <Button variant="gradient" className="rounded-2xl px-8 shadow-xl">تحديث السيرة الذاتية ✍️</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT: Applications Tracking */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-2xl bg-white dark:bg-surface-800 overflow-hidden" padding="none">
               <div className="p-6 md:p-8 border-b border-slate-50 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <span className="w-2.5 h-7 bg-primary-600 rounded-full"></span>
                    الوظائف المتقدم لها
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tracking</span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                     <thead className="bg-slate-50/30 dark:bg-surface-900/30 border-b border-slate-50">
                        <tr className="text-xs font-black text-slate-400 uppercase">
                           <th className="px-8 py-5">الوظيفة والشركة</th>
                           <th className="px-8 py-5">التاريخ</th>
                           <th className="px-8 py-5">الحالة</th>
                           <th className="px-8 py-5 text-center">التطابق</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-surface-700">
                        {appliedJobs.map((job) => (
                           <tr key={job.id} className="group hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                              <td className="px-8 py-6">
                                 <div className="flex flex-col">
                                    <span className="font-black text-slate-800 dark:text-white text-lg">{job.title}</span>
                                    <span className="text-xs font-bold text-slate-400">{job.company}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-xs font-bold text-slate-500">{job.date}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-tighter ${getStatusStyle(job.status)}`}>
                                    {getStatusLabel(job.status)}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-xs font-black text-primary-600">{job.matchScore}%</span>
                                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                       <div className="h-full bg-primary-500 rounded-full" style={{ width: `${job.matchScore}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            {/* Resume Insights Card */}
            <div className="grid md:grid-cols-2 gap-6">
               <Card title="📈 نقاط القوة الحالية" className="border-none shadow-xl bg-emerald-50/30">
                  <div className="space-y-3">
                     {resumeInsights?.strengths?.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-surface-700 rounded-2xl border border-emerald-100 text-sm font-bold text-emerald-800">
                           <span className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center text-[10px]">✅</span>
                           {s}
                        </div>
                     ))}
                  </div>
               </Card>
               <Card title="⚠️ فجوات السيرة الذاتية" className="border-none shadow-xl bg-red-50/30">
                  <div className="space-y-3">
                     {resumeInsights?.weaknesses?.map((w, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-surface-700 rounded-2xl border border-red-100 text-sm font-bold text-red-800">
                           <span className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center text-[10px]">❌</span>
                           {w}
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </div>

         {/* RIGHT: Stats & Skill Progress */}
         <div className="space-y-8">
            <Card className="border-none shadow-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white p-8 overflow-hidden relative" padding="none">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
               <div className="relative z-10 text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-2">معدل الجاهزية (ATS Score)</p>
                  <h4 className="text-7xl font-black mb-4">{resumeInsights?.matchScore}%</h4>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${resumeInsights?.matchScore}%` }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-white shadow-[0_0_15px_white]"
                     />
                  </div>
                  <p className="text-[10px] mt-6 font-bold opacity-60">جاهزيتك لدخول سوق العمل التقني في عام 2025.</p>
               </div>
            </Card>

            <Card className="border-none shadow-2xl bg-white dark:bg-surface-800 p-8" title="تطور المهارات 🌳">
               <div className="space-y-8 mt-6">
                  {skills.map((s, i) => (
                     <div key={i} className="group">
                        <div className="flex justify-between items-center mb-3">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 dark:text-white">{s.skill}</span>
                              <span className="text-[10px] font-bold text-slate-400">المستهدف: {s.targetLevel}</span>
                           </div>
                           <span className="text-xs font-black text-primary-600">{s.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${s.progress}%` }}
                              transition={{ delay: i * 0.2, duration: 1.2 }}
                              className={`h-full rounded-full ${s.progress > 70 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                           />
                        </div>
                     </div>
                  ))}
               </div>
               <Button variant="outline" fullWidth className="mt-10 rounded-2xl">تعديل خارطة التعلم</Button>
            </Card>

            <Card className="border-none shadow-xl bg-amber-50/50 p-6 text-center">
               <div className="text-3xl mb-3">🎖️</div>
               <h4 className="font-black text-amber-800 text-sm mb-1">خبير مسارات (Level 4)</h4>
               <p className="text-[10px] text-amber-600 font-bold">بقي لك 150 نقطة للوصول لمرتبة 'سفير المستقبل'</p>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
