
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
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
  const [location, setLocation] = useState('');
  const [userProfile, setUserProfile] = useState<SelfAwarenessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [response, setResponse] = useState<{ text: string, jobs?: ScoredJob[] } | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<PersonalizedRoadmap | null>(null);
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
    setResponse(null);
    try {
      const res = await searchJobsSmart(role || 'وظائف تقنية', location || 'الوطن العربي');
      
      if (res.jobs && userProfile) {
        setMatchingLoading(true);
        const scoredJobs = await Promise.all(res.jobs.map(async (job) => {
          const match = await calculateJobMatchScore(userProfile, job);
          return { ...job, matchScore: match.score, matchReason: match.reason };
        }));
        
        const sortedJobs = scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setResponse({ ...res, jobs: sortedJobs });
        setMatchingLoading(false);
      } else {
        setResponse(res as any);
      }
      
      showToast('تم تحديث قائمة الوظائف الإقليمية', 'success');
    } catch (e) {
      showToast('عذراً، فشل البحث في قواعد البيانات', 'error');
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
      showToast('فشل في بناء خارطة الطريق', 'error');
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
      <Card className="product-card border-none shadow-2xl p-10 rounded-[3rem]">
         <div className="flex flex-col gap-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group">
                    <input 
                      type="text" 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="المسمى الوظيفي (مثال: مدير مشروع)"
                      className="w-full p-4 pr-12 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 outline-none font-black shadow-sm bg-slate-50 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary-500">💼</span>
                </div>
                <div className="relative group">
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="المنطقة (دبي، القاهرة، الرياض، المغرب...)"
                      className="w-full p-4 pr-12 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 outline-none font-black shadow-sm bg-slate-50 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary-500">📍</span>
                </div>
            </div>
            <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="w-full rounded-2xl shadow-xl py-5 font-black text-lg">بحث ذكي في الوطن العربي</Button>
         </div>

         {matchingLoading && (
            <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto shadow-sm"></div>
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">AI Matching Engine: Analyzing Skills Affinity</p>
            </div>
         )}

         <div className="grid gap-6">
            {response?.jobs?.map((job, idx) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-surface-700 shadow-sm hover:shadow-2xl transition-all group flex flex-col lg:flex-row justify-between items-start gap-10"
              >
                 <div className="space-y-6 flex-1">
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-slate-100 dark:bg-surface-900 border border-slate-200 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{job.platform || 'إقليمي'}</span>
                      {job.matchScore !== undefined && (
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm ${getScoreColor(job.matchScore)}`}>
                           <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                           المطابقة الشخصية: {job.matchScore}%
                        </div>
                      )}
                      {job.salary_min && (
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100">💰 راتب واعد</span>
                      )}
                    </div>
                    
                    <div>
                        <h4 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">{job.title}</h4>
                        <p className="text-base font-black text-slate-400 mt-2 flex items-center gap-2">
                           <span>🏢 {job.company.display_name}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <span>📍 {job.location.display_name}</span>
                        </p>
                    </div>

                    {job.matchReason && (
                       <div className="bg-indigo-50/50 dark:bg-primary-900/10 p-5 rounded-2xl text-sm font-bold text-primary-800 dark:text-primary-300 border border-indigo-100 relative">
                          <div className="absolute -top-3 right-5 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">AI Insight</div>
                          💡 {job.matchReason}
                       </div>
                    )}

                    <p className="text-base text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{job.description}</p>
                 </div>

                 <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0 mt-4 lg:mt-0">
                    <a href={job.redirect_url} target="_blank" className="bg-primary-600 text-white px-8 py-5 rounded-2xl text-center font-black text-base shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all active:scale-95">التقديم الفوري</a>
                    <button 
                      onClick={() => handleBridgeGap(job)}
                      className="bg-white dark:bg-surface-700 text-slate-700 dark:text-white border-2 border-slate-100 dark:border-surface-600 px-8 py-4 rounded-2xl font-black text-sm hover:border-primary-400 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                       {roadmapLoading ? <span className="animate-spin">⚙️</span> : <span className="group-hover/btn:rotate-12 transition-transform">🗺️</span>}
                       بناء خارطة سد الفجوة
                    </button>
                 </div>
              </motion.div>
            ))}
         </div>
      </Card>

      <AnimatePresence>
        {selectedRoadmap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
                <Card className="bg-white dark:bg-surface-800 w-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-none">
                  <div className="p-8 border-b border-slate-50 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
                    <div className="text-right">
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">خارطة سد الفجوة المهنية 🗺️</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personalized Growth Blueprint</p>
                    </div>
                    <button onClick={() => setSelectedRoadmap(null)} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-300 font-black">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800 shadow-inner">
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4">المهارات والخبرات المطلوبة للتطوير</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoadmap.skillGap.map((s, i) => (
                            <span key={i} className="bg-white dark:bg-surface-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm border border-amber-100 dark:border-amber-800">{s}</span>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-5">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase">
                           <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                           الخطوات التنفيذية المقترحة
                        </h4>
                        {selectedRoadmap.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-6 p-6 bg-slate-50 dark:bg-surface-900 rounded-[2rem] border border-slate-100 dark:border-surface-700 relative group transition-all hover:bg-white dark:hover:bg-surface-700 shadow-sm">
                            <div className="w-14 h-14 bg-white dark:bg-surface-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-50 dark:border-surface-600 shrink-0">
                               {step.type === 'course' ? '💻' : step.type === 'project' ? '🏗️' : '📜'}
                            </div>
                            <div className="flex-1">
                                <h5 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{step.title}</h5>
                                <p className="text-sm font-bold text-slate-400 mt-2">{step.provider} • <span className="text-primary-600">{step.duration}</span></p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm border ${step.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{step.priority}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="p-8 bg-white dark:bg-surface-800 border-t border-slate-100 dark:border-surface-700 flex gap-4">
                    <Button onClick={() => setSelectedRoadmap(null)} variant="secondary" className="rounded-2xl px-8 font-black">إغلاق</Button>
                    <Button onClick={() => {showToast("تم تحويل الخطة للوحة التحكم", "success"); setSelectedRoadmap(null)}} variant="primary" className="flex-1 rounded-2xl shadow-xl font-black text-lg py-5">اعتماد الخطة 🚀</Button>
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
