
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ReactMarkdown from 'react-markdown';
import { searchJobsSmart, generateJobRoadmap, getJobMarketInsights } from '../../services/geminiService';
import { JobListing, SelfAwarenessData, PersonalizedRoadmap, JobMarketInsights } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const JobFinder = () => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState<string | null>(null);
  
  const [response, setResponse] = useState<{ text: string, jobs?: JobListing[] } | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'relevance'>('relevance');
  const [userProfile, setUserProfile] = useState<SelfAwarenessData | null>(null);
  
  const [selectedRoadmap, setSelectedRoadmap] = useState<PersonalizedRoadmap | null>(null);
  const [marketInsights, setMarketInsights] = useState<{[key: string]: JobMarketInsights}>({});
  
  const { showToast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem('masar_app_state_v4');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userData) {
          setUserProfile(parsed.userData);
          if (!role && parsed.userData.currentRole) setRole(parsed.userData.currentRole);
          if (!location && parsed.userData.location) setLocation(parsed.userData.location);
        }
      } catch (e) { console.error("Error loading profile", e); }
    }
  }, []);

  const analyzeSkillGap = (job: JobListing) => {
    if (!userProfile) return { matched: [], missing: [], score: 0 };
    const userSkillsList = (userProfile.skills || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 1);
    const jobText = (job.title + " " + job.description).toLowerCase();
    const matched = userSkillsList.filter(skill => jobText.includes(skill));
    const score = userSkillsList.length > 0 ? Math.round((matched.length / userSkillsList.length) * 100) : 0;
    return { matched, score };
  };

  const handleSearch = async () => {
    let query = role.trim();
    if (!query && !isAdvanced) return;
    if (isAdvanced) {
       if (experience) query = `${experience} ${query}`;
       if (skills) query += ` with ${skills} skills`;
       if (location) query += ` in ${location}`;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await searchJobsSmart(query || 'Saudi Arabia jobs');
      setResponse(res);
      if (res.jobs && res.jobs.length > 0) {
        showToast(`وجدنا ${res.jobs.length} فرصة جديدة`, 'success');
      }
    } catch (e) {
      showToast('حدث خطأ أثناء البحث', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMarketInsights = async (job: JobListing) => {
    setMarketLoading(job.id);
    try {
      const insights = await getJobMarketInsights(job.title, job.location.display_name);
      setMarketInsights(prev => ({ ...prev, [job.id]: insights }));
      showToast('تم جلب بيانات السوق الحية للمهنة', 'success');
    } catch (error) {
      showToast('تعذر جلب بيانات السوق حالياً', 'error');
    } finally {
      setMarketLoading(null);
    }
  };

  const handleBridgeGap = async (job: JobListing) => {
    setRoadmapLoading(true);
    try {
      const roadmap = await generateJobRoadmap(job, userProfile?.skills || '');
      setSelectedRoadmap(roadmap);
    } catch (error) {
      showToast('فشل في توليد الخارطة', 'error');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const calculateMatchScore = (job: JobListing) => {
    const { score } = analyzeSkillGap(job);
    let finalScore = score * 0.6;
    if (userProfile?.currentRole && job.title.toLowerCase().includes(userProfile.currentRole.toLowerCase())) {
      finalScore += 40;
    }
    return Math.floor(Math.min(finalScore, 100));
  };

  const filteredAndSortedJobs = useMemo(() => {
    if (!response?.jobs) return [];
    let result = [...response.jobs];
    if (minSalary > 0) result = result.filter(job => !job.salary_min || job.salary_min >= minSalary);
    result.sort((a, b) => {
      if (sortBy === 'salary') return (b.salary_min || 0) - (a.salary_min || 0);
      if (sortBy === 'date') return new Date(b.created).getTime() - new Date(a.created).getTime();
      return calculateMatchScore(b) - calculateMatchScore(a);
    });
    return result;
  }, [response, minSalary, sortBy, userProfile]);

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) { newSaved.delete(jobId); showToast('تمت إزالة الوظيفة', 'info'); }
    else { newSaved.add(jobId); showToast('تم الحفظ بنجاح', 'success'); }
    setSavedJobs(newSaved);
  };

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-5xl mx-auto pb-10">
      <Card className="product-card border-none shadow-2xl overflow-visible p-6 md:p-10">
         <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div className="flex-1">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <span className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-3xl shadow-sm">🔍</span>
                    باحث الوظائف الذكي
                </h3>
                <p className="text-slate-500 mt-3 font-medium leading-relaxed max-w-lg">اكتشف الفرص مع تحليل الفجوات المهارية وواقع السوق المباشر.</p>
            </div>
         </div>
         
         <div className="flex flex-col gap-5">
            <div className="flex gap-2">
                <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={isAdvanced ? "المسمى الوظيفي..." : "ابحث عن وظيفة (مثال: Frontend Developer)"}
                      className="w-full h-16 p-5 pr-14 rounded-2xl border border-slate-200 dark:border-surface-600 bg-slate-50 dark:bg-surface-800 focus:ring-4 focus:ring-primary-100 focus:bg-white outline-none transition-all shadow-sm font-bold text-slate-700 dark:text-white"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                <Button 
                   onClick={() => setIsAdvanced(!isAdvanced)} 
                   variant={isAdvanced ? "primary" : "secondary"}
                   className="h-16 px-5 rounded-2xl border-2 shrink-0 transition-transform active:scale-95"
                >
                   <svg className={`w-6 h-6 transition-transform ${isAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                   </svg>
                </Button>
                
                <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="h-16 px-10 rounded-2xl shadow-xl shrink-0 text-base">
                  اكتشاف الفرص
                </Button>
            </div>

            {isAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-slate-50 dark:bg-surface-900/50 rounded-[2.5rem] border border-slate-200 dark:border-surface-700 animate-fade-in-up">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الموقع</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="المدينة..." className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المستوى</label>
                        <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none cursor-pointer">
                            <option value="">كل المستويات</option>
                            <option value="Entry">مبتدئ</option><option value="Junior">جونيور</option><option value="Mid">متوسط</option><option value="Senior">خبير</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الحد الأدنى للراتب</label>
                        <input type="number" value={minSalary || ''} onChange={(e) => setMinSalary(Number(e.target.value))} placeholder="0" className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الفرز</label>
                        <div className="flex bg-white p-1.5 rounded-xl border border-slate-200">
                          <button onClick={() => setSortBy('relevance')} className={`flex-1 text-[10px] font-black py-2.5 rounded-lg transition-all ${sortBy === 'relevance' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500'}`}>الأنسب</button>
                          <button onClick={() => setSortBy('date')} className={`flex-1 text-[10px] font-black py-2.5 rounded-lg transition-all ${sortBy === 'date' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500'}`}>الأحدث</button>
                        </div>
                    </div>
                </div>
            )}
         </div>

         {response && (
           <div className="animate-fade-in-up space-y-10 mt-12">
              <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 p-7 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-800/50 flex items-start gap-6 shadow-sm">
                 <div className="w-16 h-16 rounded-2xl bg-white dark:bg-indigo-800 flex items-center justify-center text-4xl shadow-md shrink-0">🤖</div>
                 <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                    <ReactMarkdown className="font-medium text-slate-700 dark:text-slate-200 text-base leading-relaxed">{response.text}</ReactMarkdown>
                 </div>
              </div>

              <div className="grid gap-8">
                {filteredAndSortedJobs.map((job) => {
                    const isSaved = savedJobs.has(job.id);
                    const matchScore = calculateMatchScore(job);
                    const { matched } = analyzeSkillGap(job);
                    const userSkillsCount = (userProfile?.skills || '').split(',').length;
                    const missingCount = Math.max(0, userSkillsCount - matched.length);
                    const insights = marketInsights[job.id];

                    return (
                        <div key={job.id} className="group bg-white dark:bg-surface-800 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-surface-700 hover:border-primary-300 transition-all duration-500 relative flex flex-col gap-8">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {job.salary_min ? (
                                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">💰 {job.salary_min.toLocaleString()} ريال شهرياً</span>
                                            ) : (
                                                <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100">💰 الراتب حسب الخبرة</span>
                                            )}
                                            {userProfile && matchScore >= 40 && (
                                                <span className="text-[10px] font-black bg-primary-50 text-primary-600 px-3 py-1.5 rounded-xl border border-primary-100 animate-pulse">🔥 تطابق {matchScore}%</span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-2xl md:text-3xl text-slate-800 dark:text-white leading-tight">{job.title}</h4>
                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500 font-bold">
                                            <span>🏢 {job.company.display_name}</span>
                                            <span>📍 {job.location.display_name}</span>
                                            <span>📅 نُشر في {new Date(job.created).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    </div>
                                    <p className="text-base text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{job.description}</p>
                                    
                                    {/* SKILL GAP SECTION */}
                                    <div className="bg-slate-50 dark:bg-surface-900/50 p-6 rounded-3xl border border-slate-100 dark:border-surface-700/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تحليل فجوة المهارات (Skill Gap)</h5>
                                            <span className="text-[10px] font-bold text-primary-600">{matched.length} متوفرة / {missingCount} مطلوبة</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {matched.map((s, i) => <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-bold border border-emerald-100 flex items-center gap-1.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>{s}</span>)}
                                            {missingCount > 0 && <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[11px] font-bold border border-amber-100 border-dashed">⚠️ توجد مهارات إضافية</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-end items-stretch gap-4 shrink-0 lg:border-r lg:pr-10 lg:border-slate-100 dark:lg:border-surface-700">
                                    <a href={job.redirect_url} target="_blank" rel="noreferrer" className="flex-1 lg:flex-none bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-[1.75rem] font-black text-base shadow-xl flex items-center justify-center gap-4 group/btn">التقديم الآن <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
                                    <button onClick={() => toggleSaveJob(job.id)} className={`p-5 rounded-[1.75rem] border-2 transition-all flex items-center justify-center ${isSaved ? 'bg-amber-500 border-amber-500 text-white shadow-xl scale-[1.05]' : 'bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200'}`}><svg className="w-7 h-7" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg></button>
                                </div>
                            </div>

                            {/* MARKET INSIGHTS DASHBOARD */}
                            <div className="border-t border-slate-100 dark:border-surface-700 pt-6">
                                {insights ? (
                                    <div className="animate-fade-in-up bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="text-xl">📊</span>
                                            <h5 className="text-sm font-black text-blue-800 dark:text-blue-300">واقع سوق العمل (Market Reality)</h5>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-sm border border-blue-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">متوسط الراتب</p>
                                                <p className="text-lg font-black text-emerald-600">{insights.averageSalary}</p>
                                            </div>
                                            <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-sm border border-blue-50 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">معدل الطلب</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${insights.demandRate === 'Very High' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {insights.demandRate === 'Very High' ? 'طلب مرتفع جداً' : insights.demandRate === 'High' ? 'طلب مرتفع' : 'متوسط'}
                                                </span>
                                            </div>
                                            <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-sm border border-blue-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">اتجاه النمو</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{insights.growthTrend}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <button onClick={() => handleBridgeGap(job)} disabled={roadmapLoading} className="flex-1 bg-white dark:bg-surface-800 py-3 rounded-2xl border border-blue-200 text-blue-700 text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                                                {roadmapLoading ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <span className="text-lg">🗺️</span>}
                                                توليد خارطة تعلم لسد الفجوة
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-surface-900/40 p-4 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">💡</div>
                                            <p className="text-xs font-bold text-slate-500">هل هذه الوظيفة مستدامة؟ هل راتبها مجزي؟</p>
                                        </div>
                                        <Button 
                                          onClick={() => handleFetchMarketInsights(job)} 
                                          isLoading={marketLoading === job.id} 
                                          variant="outline" 
                                          size="sm" 
                                          className="font-black px-6 rounded-2xl border-primary-200 text-primary-600 hover:bg-primary-50"
                                        >
                                            تحليل واقع السوق لهذه المهنة 🚀
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
              </div>
           </div>
         )}
      </Card>

      {/* Roadmap Modal */}
      {selectedRoadmap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-surface-800 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up border border-white/20">
              <div className="p-8 border-b border-slate-100 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white">خارطة سد الفجوة المهنية 🗺️</h3>
                   <p className="text-sm font-bold text-primary-600 mt-1">{selectedRoadmap.jobTitle}</p>
                 </div>
                 <button onClick={() => setSelectedRoadmap(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><p className="text-[10px] font-black text-emerald-600 uppercase mb-2">المهارات المتوفرة</p><div className="flex flex-wrap gap-1">{selectedRoadmap.userSkills.map((s, i) => <span key={i} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md shadow-sm">{s}</span>)}</div></div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100"><p className="text-[10px] font-black text-amber-600 uppercase mb-2">الفجوة (Skills to Learn)</p><div className="flex flex-wrap gap-1">{selectedRoadmap.skillGap.map((s, i) => <span key={i} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md shadow-sm">{s}</span>)}</div></div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white">خطة التعلم المقترحة</h4>
                    <div className="space-y-4">
                       {selectedRoadmap.steps.map((step, idx) => (
                          <div key={idx} className="relative pr-8 border-r-2 border-slate-100 pb-4 last:pb-0">
                             <div className={`absolute top-0 -right-2.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ${step.priority === 'High' ? 'bg-red-500' : 'bg-primary-500'}`}></div>
                             <div className="bg-slate-50 dark:bg-surface-700/50 p-5 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-primary-100">
                                <div className="flex justify-between items-start mb-2"><h5 className="font-black text-slate-800 dark:text-white">{step.title}</h5><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${step.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>{step.priority === 'High' ? 'أولوية قصوى' : 'أولوية متوسطة'}</span></div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500"><span className="flex items-center gap-1">🏢 {step.provider}</span><span className="flex items-center gap-1">⏱️ {step.duration}</span><span className="flex items-center gap-1 bg-slate-200 dark:bg-surface-600 px-1.5 py-0.5 rounded text-slate-600 uppercase">{step.type}</span></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-surface-900 border-t border-slate-100 flex justify-center"><Button onClick={() => setSelectedRoadmap(null)} variant="primary" size="lg" className="px-12">فهمت، لنبدأ التعلم!</Button></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default JobFinder;
