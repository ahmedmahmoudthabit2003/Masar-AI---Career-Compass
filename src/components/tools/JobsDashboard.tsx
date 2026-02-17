
import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { searchJobsSmart, calculateJobMatchScore } from '../../services/geminiService';
import { JobListing, AppliedJob, SelfAwarenessData, SkillGapResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const JobsDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [userProfile, setUserProfile] = useState<SelfAwarenessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem('masar_app_state_v5');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userData) setUserProfile(parsed.userData);
      } catch (e) {}
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchJobsSmart(searchQuery || userProfile?.currentRole || 'Saudi Arabia');
      setJobs(res.jobs || []);
    } catch (e) {
      showToast('فشل جلب الوظائف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async (jobId: string) => {
    if (!userProfile) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.analysis) return;
    setAnalyzingId(jobId);
    try {
      const analysis = await calculateJobMatchScore(userProfile, job);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, analysis, successProbability: analysis.successProbability } : j));
      showToast('اكتمل تحليل الفجوة واحتمالية النجاح', 'success');
    } catch (e) {
      showToast('فشل التحليل', 'error');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleApply = (job: JobListing) => {
    const applied: AppliedJob = {
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      status: 'Applied',
      matchScore: job.analysis?.score || 0,
      successProbability: job.successProbability || 0,
      date: new Date().toISOString().split('T')[0]
    };

    const saved = localStorage.getItem('masar_applied_jobs');
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem('masar_applied_jobs', JSON.stringify([applied, ...list]));
    showToast('تمت إضافة الوظيفة لمدير التطبيقات', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="max-w-xl mx-auto flex gap-3 mb-8">
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث عن وظيفة (مثال: Product Manager)"
          className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none font-bold"
        />
        <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="px-8 rounded-2xl">بحث ذكي</Button>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <JobCard 
             key={job.id} 
             job={job} 
             onAnalyze={() => analyzeJob(job.id)} 
             onApply={() => handleApply(job)}
             isAnalyzing={analyzingId === job.id} 
          />
        ))}
      </div>
    </div>
  );
};

const MatchProgressBar = ({ label, percentage, color }: { label: string, percentage: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
      <span className="text-slate-500">{label}</span>
      <span className={color}>{percentage}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${percentage}%` }} 
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${color.replace('text', 'bg')}`}
      />
    </div>
  </div>
);

const JobCard: React.FC<{ job: JobListing, onAnalyze: () => void, onApply: () => void, isAnalyzing: boolean }> = ({ job, onAnalyze, onApply, isAnalyzing }) => {
  return (
    <motion.div layout className="bg-white dark:bg-surface-800 rounded-[2.5rem] border border-slate-100 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 space-y-4 text-right">
             <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-surface-700 rounded-lg text-[10px] font-black text-slate-500 uppercase">{job.platform || 'Job'}</span>
                {job.successProbability && (
                   <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">
                      احتمالية النجاح: {job.successProbability}%
                   </span>
                )}
             </div>
             <div>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white">{job.title}</h4>
                <p className="text-sm font-bold text-slate-400">{job.company.display_name} • {job.location.display_name}</p>
             </div>
             <p className="text-sm text-slate-500 line-clamp-2">{job.description}</p>
          </div>

          <div className="shrink-0 w-full md:w-48 space-y-3">
             {!job.analysis ? (
                <Button onClick={onAnalyze} isLoading={isAnalyzing} variant="outline" fullWidth className="rounded-2xl border-2 py-4">تحليل مطابقة المهارات</Button>
             ) : (
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-3xl border border-primary-100 dark:border-primary-800">
                   <p className="text-[10px] font-black text-primary-600 mb-1">المطابقة الإجمالية</p>
                   <p className="text-4xl font-black text-primary-700 dark:text-primary-300">{job.analysis.score}%</p>
                </div>
             )}
             <Button onClick={onApply} variant="primary" fullWidth className="rounded-2xl py-3 font-black">تسجيل كطلب وظيفي</Button>
             <a href={job.redirect_url} target="_blank" className="block w-full py-2 border-2 border-slate-100 dark:border-surface-700 text-slate-500 text-center rounded-2xl font-black text-[10px] hover:bg-slate-50 transition-colors uppercase">عرض المصدر</a>
          </div>
        </div>

        <AnimatePresence>
          {job.analysis && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-8 border-t border-slate-50 dark:border-surface-700 space-y-8 text-right">
               <div className="grid md:grid-cols-3 gap-6">
                  <MatchProgressBar label="توافق المهارات" percentage={job.analysis.skillsMatch} color="text-blue-600" />
                  <MatchProgressBar label="توافق الخبرة" percentage={job.analysis.experienceMatch} color="text-indigo-600" />
                  <MatchProgressBar label="المستوى التعليمي" percentage={job.analysis.educationMatch} color="text-emerald-600" />
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                     <h5 className="text-xs font-black text-emerald-700 mb-3 flex items-center gap-2">✅ مهارات تمتلكها</h5>
                     <div className="flex flex-wrap gap-2">
                        {job.analysis.matchedSkills?.map((s, i) => <span key={i} className="px-3 py-1 bg-white dark:bg-surface-700 rounded-lg text-[10px] font-bold shadow-sm">{s}</span>)}
                     </div>
                  </div>
                  <div className="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-900/30">
                     <h5 className="text-xs font-black text-red-700 mb-3 flex items-center gap-2">❌ فجوات مهارية</h5>
                     <div className="flex flex-wrap gap-2">
                        {job.analysis.missingSkills?.map((s, i) => <span key={i} className="px-3 py-1 bg-white dark:bg-surface-700 rounded-lg text-[10px] font-bold shadow-sm">{s}</span>)}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-4 bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                  <div className="text-3xl">🚀</div>
                  <div className="flex-1">
                     <p className="text-xs font-black text-amber-800 dark:text-amber-200">خارطة الطريق لسد الفجوة</p>
                     <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{job.analysis.quickPlan}</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JobsDashboard;
