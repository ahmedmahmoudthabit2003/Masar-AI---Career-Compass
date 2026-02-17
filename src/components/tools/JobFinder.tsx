
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { searchJobsSmart, generateJobRoadmap, calculateJobMatchScore } from '../../services/geminiService';
import { JobListing, SelfAwarenessData, PersonalizedRoadmap } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoredJob extends JobListing {
  matchScore?: number;
  matchReason?: string;
}

const JobFinder = () => {
  const [role, setRole] = useState('');
  const [userProfile, setUserProfile] = useState<SelfAwarenessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [response, setResponse] = useState<{ text: string, jobs?: ScoredJob[] } | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<PersonalizedRoadmap | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem('masar_app_state_v4');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userData) setUserProfile(parsed.userData);
      } catch (e) {}
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await searchJobsSmart(role || 'Saudi Arabia jobs');
      
      if (res.jobs && userProfile) {
        setMatchingLoading(true);
        // Calculate Match Score for each job using AI
        const scoredJobs = await Promise.all(res.jobs.map(async (job) => {
          const match = await calculateJobMatchScore(userProfile, job);
          return { ...job, matchScore: match.score, matchReason: match.reason };
        }));
        
        // Sort by match score descending
        const sortedJobs = scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setResponse({ ...res, jobs: sortedJobs });
        setMatchingLoading(false);
      } else {
        setResponse(res as any);
      }
      
      showToast('تم العثور على فرص جديدة', 'success');
    } catch (e) {
      showToast('فشل البحث', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeGap = async (job: JobListing) => {
    setRoadmapLoading(true);
    try {
      const roadmap = await generateJobRoadmap(job, userProfile?.skills || '');
      setSelectedRoadmap(roadmap);
    } catch (error) {
      showToast('فشل توليد الخطة', 'error');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="product-card border-none shadow-xl p-8">
         <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="ابحث عن وظيفة (مثال: UI/UX Designer in Riyadh)"
                  className="w-full p-4 pr-12 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 outline-none font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
            </div>
            <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="px-10 rounded-2xl shadow-lg">بحث ذكي</Button>
         </div>

         {matchingLoading && (
            <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 font-bold animate-pulse">جاري حساب نسب المطابقة بناءً على مهاراتك...</p>
            </div>
         )}

         <div className="grid gap-6">
            {response?.jobs?.map((job, idx) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-surface-800 p-6 rounded-[2rem] border border-slate-100 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row justify-between items-start gap-8"
              >
                 <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {job.matchScore !== undefined && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${getScoreColor(job.matchScore)}`}>
                           <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                           نسبة المطابقة: {job.matchScore}%
                        </div>
                      )}
                      {job.salary_min && (
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black border border-slate-100">
                          💰 {job.salary_min.toLocaleString()} ريال
                        </span>
                      )}
                    </div>
                    
                    <div>
                        <h4 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors">{job.title}</h4>
                        <p className="text-sm font-bold text-slate-400 mt-1">{job.company.display_name} • {job.location.display_name}</p>
                    </div>

                    {job.matchReason && (
                       <div className="bg-primary-50/30 dark:bg-primary-900/10 p-3 rounded-xl text-xs font-medium text-primary-700 dark:text-primary-300 border border-primary-50">
                          💡 {job.matchReason}
                       </div>
                    )}

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                 </div>

                 <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    <a href={job.redirect_url} target="_blank" className="bg-primary-600 text-white px-8 py-4 rounded-2xl text-center font-black text-sm shadow-md hover:bg-primary-700 transition-all active:scale-95">التقديم الفوري</a>
                    <button 
                      onClick={() => handleBridgeGap(job)}
                      className="bg-white dark:bg-surface-700 text-slate-700 dark:text-white border-2 border-slate-100 dark:border-surface-600 px-8 py-3 rounded-2xl font-black text-xs hover:border-primary-200 transition-all flex items-center justify-center gap-2"
                    >
                       {roadmapLoading ? <span className="animate-spin">⚙️</span> : <span>🗺️</span>}
                       خطة سد الفجوة
                    </button>
                 </div>
              </motion.div>
            ))}
         </div>
      </Card>

      <AnimatePresence>
        {selectedRoadmap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <Card className="bg-white dark:bg-surface-800 w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-none">
                  <div className="p-8 border-b border-slate-50 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">خارطة سد الفجوة (Roadmap) 🗺️</h3>
                    <button onClick={() => setSelectedRoadmap(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400 font-black">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3">المهارات التي تنقصك لهذه الوظيفة</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoadmap.skillGap.map((s, i) => (
                            <span key={i} className="bg-white dark:bg-surface-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-amber-100 dark:border-amber-800">{s}</span>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {selectedRoadmap.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-5 p-6 bg-slate-50 dark:bg-surface-900 rounded-[2rem] border border-slate-100 dark:border-surface-700 relative group transition-all hover:bg-white dark:hover:bg-surface-700">
                            <div className="w-12 h-12 bg-white dark:bg-surface-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50 dark:border-surface-600">{step.type === 'course' ? '💻' : step.type === 'project' ? '🏗️' : '📜'}</div>
                            <div className="flex-1">
                                <h5 className="font-black text-slate-800 dark:text-white text-base">{step.title}</h5>
                                <p className="text-xs font-bold text-slate-400 mt-1">{step.provider} • {step.duration}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${step.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{step.priority}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="p-8 bg-white dark:bg-surface-800 border-t border-slate-100 dark:border-surface-700">
                    <Button onClick={() => setSelectedRoadmap(null)} variant="primary" fullWidth size="xl" className="rounded-2xl shadow-xl">بدء رحلة التعلم 🚀</Button>
                  </div>
                </Card>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobFinder;
