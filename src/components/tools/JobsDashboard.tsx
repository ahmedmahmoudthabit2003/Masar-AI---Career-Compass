
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { searchJobsSmart, calculateJobMatchScore } from '../../services/geminiService';
import { JobListing, AppliedJob, SelfAwarenessData, SavedSearch } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const SAVED_SEARCHES_KEY = 'masar_saved_searches';

const JobsDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [userProfile, setUserProfile] = useState<SelfAwarenessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  
  // Advanced Filters
  const [companyFilter, setCompanyFilter] = useState('');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match');
  const [showFilters, setShowFilters] = useState(false);

  const { showToast } = useToast();

  // Load persistence
  useEffect(() => {
    const savedState = localStorage.getItem('masar_app_state_v5');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userData) {
          setUserProfile(parsed.userData);
          // Auto-init search with user role if empty
          if (!searchQuery) setSearchQuery(parsed.userData.currentRole || '');
        }
      } catch (e) {}
    }

    const storedSearches = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (storedSearches) setSavedSearches(JSON.parse(storedSearches));
  }, []);

  // Debouncing Search Input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      }
    }, 1500); // 1.5s debounce to avoid spamming Gemini

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, location]);

  const handleSearch = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await searchJobsSmart(searchQuery || userProfile?.currentRole || 'السعودية', location || 'السعودية');
      setJobs(res.jobs || []);
    } catch (e) {
      showToast('فشل جلب الوظائف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentSearch = () => {
    if (!searchQuery && !location) return;
    const newSearch: SavedSearch = {
      id: Math.random().toString(36).substring(7),
      role: searchQuery,
      location: location,
      skills: userProfile?.skills || '',
      timestamp: new Date().toISOString()
    };
    const updated = [newSearch, ...savedSearches.slice(0, 4)];
    setSavedSearches(updated);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
    showToast('تم حفظ معايير البحث', 'success');
  };

  const loadSearch = (s: SavedSearch) => {
    setSearchQuery(s.role);
    setLocation(s.location);
    handleSearch();
  };

  const analyzeJob = async (jobId: string) => {
    if (!userProfile) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.analysis) return;
    setAnalyzingId(jobId);
    try {
      const analysis = await calculateJobMatchScore(userProfile, job);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, analysis, successProbability: analysis.successProbability } : j));
      showToast('اكتمل تحليل الفجوة المهنية', 'success');
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

    const saved = localStorage.getItem('masar_app_state_v5');
    if (saved) {
        const state = JSON.parse(saved);
        const currentApplied = state.appliedJobs || [];
        state.appliedJobs = [applied, ...currentApplied];
        localStorage.setItem('masar_app_state_v5', JSON.stringify(state));
    }
    showToast('تمت إضافة الوظيفة للوحة التحكم', 'success');
  };

  // Client-side filtering logic
  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => {
      const matchesCompany = j.company.display_name.toLowerCase().includes(companyFilter.toLowerCase());
      const matchesSalary = (j.salary_min || 0) >= minSalary;
      return matchesCompany && matchesSalary;
    });

    if (sortBy === 'match') {
      result.sort((a, b) => (b.analysis?.score || 0) - (a.analysis?.score || 0));
    } else {
      result.sort((a, b) => new Date(b.created || '').getTime() - new Date(a.created || '').getTime());
    }

    return result;
  }, [jobs, companyFilter, minSalary, sortBy]);

  return (
    <div className="animate-fade-in space-y-8 pb-24">
      {/* Header & Search Section */}
      <Card className="p-8 border-none shadow-xl bg-white dark:bg-surface-800 rounded-[2.5rem]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="المسمى الوظيفي أو المهارة..."
                className="w-full p-5 pr-14 rounded-2xl border border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none font-bold text-lg"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="المدينة أو المنطقة..."
                className="w-full p-5 pr-14 rounded-2xl border border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none font-bold text-lg"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 transition-opacity">📍</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
             <div className="flex flex-wrap gap-2">
                {savedSearches.map(s => (
                   <button 
                     key={s.id} 
                     onClick={() => loadSearch(s)}
                     className="px-4 py-2 bg-slate-100 dark:bg-surface-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black border border-slate-200 dark:border-surface-600 transition-all flex items-center gap-2"
                   >
                     <span>⭐</span> {s.role}
                   </button>
                ))}
                {searchQuery && (
                   <button onClick={saveCurrentSearch} className="px-4 py-2 text-primary-600 dark:text-primary-400 text-xs font-black hover:underline">+ حفظ هذا البحث</button>
                )}
             </div>

             <div className="flex gap-2">
                <Button onClick={() => setShowFilters(!showFilters)} variant="secondary" className="rounded-xl px-6">
                   {showFilters ? 'إخفاء الفلاتر' : 'تصفية متقدمة'}
                </Button>
                <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="rounded-xl px-10">بحث فوري</Button>
             </div>
          </div>

          <AnimatePresence>
            {showFilters && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }} 
                 animate={{ height: 'auto', opacity: 1 }} 
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                  <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-surface-700">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase">اسم الشركة</label>
                       <input 
                         type="text" 
                         value={companyFilter} 
                         onChange={e => setCompanyFilter(e.target.value)}
                         placeholder="شركة محددة..."
                         className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase">الراتب الأدنى (ريال)</label>
                       <input 
                         type="number" 
                         value={minSalary || ''} 
                         onChange={e => setMinSalary(Number(e.target.value))}
                         placeholder="0"
                         className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase">ترتيب حسب</label>
                       <select 
                         value={sortBy} 
                         onChange={e => setSortBy(e.target.value as any)}
                         className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                       >
                          <option value="match">أعلى مطابقة (AI Score)</option>
                          <option value="date">الأحدث أولاً</option>
                       </select>
                    </div>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* View Switcher & Counter */}
      <div className="flex justify-between items-center px-4">
         <p className="text-sm font-bold text-slate-400">وجدنا <span className="text-primary-600">{filteredJobs.length}</span> فرصة عمل واعدة</p>
         <div className="bg-slate-100 dark:bg-surface-800 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-surface-700 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
            >
              قائمة
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'map' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
            >
              خريطة
            </button>
         </div>
      </div>

      {/* Results Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6">
              {filteredJobs.length > 0 ? filteredJobs.map((job, idx) => (
                <JobCard 
                   key={job.id} 
                   job={job} 
                   onAnalyze={() => analyzeJob(job.id)} 
                   onApply={() => handleApply(job)}
                   isAnalyzing={analyzingId === job.id} 
                   idx={idx}
                />
              )) : (
                <div className="py-20 text-center space-y-4">
                   <div className="text-6xl grayscale opacity-30">🔍</div>
                   <p className="text-slate-400 font-bold italic text-lg">لم نجد نتائج تطابق معاييرك الحالية.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-slate-100 dark:bg-surface-900 rounded-[3rem] h-[600px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-surface-700 relative overflow-hidden group">
               {/* Mock Map Background */}
               <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4A90E2_1px,transparent_1px)] bg-[length:24px_24px]"></div>
               </div>
               
               <div className="relative z-10 text-center space-y-6 max-w-sm px-6">
                  <div className="w-24 h-24 bg-white dark:bg-surface-800 rounded-full shadow-2xl flex items-center justify-center text-4xl mx-auto border-4 border-primary-500 animate-pulse">🗺️</div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">العرض الجغرافي للوظائف</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">جاري ربط إحداثيات مقرات الشركات. ستظهر هنا دبابيس الوظائف بناءً على موقعها الحقيقي لتسهيل اختيار الأقرب إليك.</p>
                  <Button variant="outline" onClick={() => setViewMode('list')} className="rounded-xl">العودة لعرض القائمة</Button>
               </div>

               {/* Mock Pins */}
               {filteredJobs.slice(0, 5).map((j, i) => (
                  <motion.div 
                    key={j.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute bg-primary-600 text-white p-3 rounded-full shadow-xl shadow-primary-500/20 z-0 pointer-events-none"
                    style={{ top: `${20 + i * 12}%`, left: `${15 + i * 15}%` }}
                  >
                     <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                  </motion.div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
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

const JobCard: React.FC<{ job: JobListing, onAnalyze: () => void, onApply: () => void, isAnalyzing: boolean, idx: number }> = ({ job, onAnalyze, onApply, isAnalyzing, idx }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      layout 
      className="bg-white dark:bg-surface-800 rounded-[2.5rem] border border-slate-100 dark:border-surface-700 shadow-sm hover:shadow-2xl transition-all overflow-hidden group"
    >
      <div className="p-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex-1 space-y-6 text-right">
             <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-surface-700 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   {job.platform || 'فرصة مهنية'}
                </span>
                {job.successProbability && (
                   <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase border border-emerald-100 dark:border-emerald-800 shadow-sm">
                      احتمالية العرض: {job.successProbability}%
                   </span>
                )}
                {job.salary_min && (
                   <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl text-[10px] font-black border border-primary-100 dark:border-primary-800">
                      💰 {job.salary_min.toLocaleString()} ريال +
                   </span>
                )}
             </div>
             
             <div>
                <h4 className="text-3xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary-600 transition-colors">{job.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-base font-black text-slate-400">{job.company.display_name}</p>
                   <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                   <p className="text-sm font-bold text-slate-400 flex items-center gap-1">📍 {job.location.display_name}</p>
                </div>
             </div>
             
             <p className="text-base text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{job.description}</p>
          </div>

          <div className="shrink-0 w-full md:w-56 space-y-4">
             {!job.analysis ? (
                <Button onClick={onAnalyze} isLoading={isAnalyzing} variant="outline" fullWidth className="rounded-2xl border-2 py-5 font-black text-sm hover:scale-[1.02] active:scale-95 transition-transform">
                   تحليل المطابقة الذكي
                </Button>
             ) : (
                <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-[2rem] border border-primary-100 dark:border-primary-800 shadow-inner">
                   <p className="text-[11px] font-black text-primary-500 uppercase tracking-widest mb-1">المطابقة الشخصية</p>
                   <p className="text-5xl font-black text-primary-700 dark:text-primary-300">{job.analysis.score}%</p>
                </div>
             )}
             <Button onClick={onApply} variant="primary" fullWidth className="rounded-2xl py-4 font-black text-lg shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-transform">سجل اهتمامك</Button>
             <a href={job.redirect_url} target="_blank" className="block w-full py-2.5 text-slate-400 text-center rounded-2xl font-black text-[10px] hover:text-primary-600 transition-colors uppercase tracking-widest">تصفح المصدر الأصلي</a>
          </div>
        </div>

        <AnimatePresence>
          {job.analysis && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-12 pt-10 border-t border-slate-50 dark:border-surface-700 space-y-10 text-right">
               <div className="grid md:grid-cols-3 gap-8">
                  <MatchProgressBar label="توافق المهارات التقنية" percentage={job.analysis.skillsMatch} color="text-blue-600" />
                  <MatchProgressBar label="مطابقة المسار المهني" percentage={job.analysis.experienceMatch} color="text-indigo-600" />
                  <MatchProgressBar label="التوافق التعليمي" percentage={job.analysis.educationMatch} color="text-emerald-600" />
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                     <h5 className="text-xs font-black text-emerald-700 mb-4 flex items-center gap-2 uppercase tracking-widest">✅ نقاط القوة لديك</h5>
                     <div className="flex flex-wrap gap-2">
                        {job.analysis.matchedSkills?.map((s, i) => (
                           <span key={i} className="px-4 py-1.5 bg-white dark:bg-surface-700 rounded-xl text-xs font-bold shadow-sm border border-emerald-50 dark:border-emerald-900/30">{s}</span>
                        ))}
                     </div>
                  </div>
                  <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 shadow-sm">
                     <h5 className="text-xs font-black text-red-700 mb-4 flex items-center gap-2 uppercase tracking-widest">⚠️ المهارات المطلوبة للتطوير</h5>
                     <div className="flex flex-wrap gap-2">
                        {job.analysis.missingSkills?.map((s, i) => (
                           <span key={i} className="px-4 py-1.5 bg-white dark:bg-surface-700 rounded-xl text-xs font-bold shadow-sm border border-red-50 dark:border-red-900/30">{s}</span>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-6 bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group/plan">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-amber-800/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/plan:scale-150 transition-transform duration-700"></div>
                  <div className="text-5xl shrink-0 group-hover/plan:rotate-12 transition-transform">🚀</div>
                  <div className="flex-1 space-y-2">
                     <p className="text-xs font-black text-amber-800 dark:text-amber-200 uppercase tracking-widest">خارطة طريق سد الفجوة (Instant Blueprint)</p>
                     <p className="text-base font-bold text-amber-700 dark:text-amber-300 leading-relaxed">{job.analysis.quickPlan}</p>
                  </div>
                  <Button variant="outline" className="rounded-xl border-amber-200 text-amber-700 hover:bg-white px-6 shrink-0 font-black">تحويل لخطة تعلم</Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JobsDashboard;
