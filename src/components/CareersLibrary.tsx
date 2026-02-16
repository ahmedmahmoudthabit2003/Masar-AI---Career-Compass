
import React, { useState } from 'react';
import { getJobDetails, JobDetailsResponse } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';

const CAREER_DATABASE = {
  "التقنية والذكاء الاصطناعي": { icon: "💻", jobs: ["Software Engineer", "Data Scientist", "Cybersecurity Specialist", "Product Manager", "DevOps Engineer", "UI/UX Designer"] },
  "الإدارة والأعمال": { icon: "💼", jobs: ["Project Manager", "Business Analyst", "Marketing Manager", "HR Director", "Management Consultant", "Financial Controller"] },
  "الهندسة والصناعة": { icon: "🏗️", jobs: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Renewable Energy Engineer", "Industrial Designer"] },
  "الرعاية الصحية": { icon: "🩺", jobs: ["Family Physician", "Clinical Pharmacist", "Health Informatics Specialist", "Critical Care Nurse"] },
  "الإبداع والإعلام": { icon: "🎨", jobs: ["Graphic Designer", "Content Strategist", "Filmmaker", "Creative Director", "PR Specialist"] }
};

const normalize = (str: string) => str.toLowerCase().trim();

const getTrigrams = (str: string): Set<string> => {
  const s = "  " + normalize(str) + "  ";
  const trigrams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    trigrams.add(s.slice(i, i + 3));
  }
  return trigrams;
};

const trigramSimilarity = (str1: string, str2: string): number => {
  const t1 = getTrigrams(str1);
  const t2 = getTrigrams(str2);
  if (t1.size === 0 && t2.size === 0) return 1;
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersection = 0;
  t1.forEach(gram => { if (t2.has(gram)) intersection++; });
  return intersection / (t1.size + t2.size - intersection);
};

const robustFuzzyMatch = (text: string, query: string): boolean => {
    const t = normalize(text);
    const q = normalize(query);
    if (t.includes(q)) return true;
    const sim = trigramSimilarity(t, q);
    // Lowered threshold to 0.25 to catch more resilient typos
    return sim >= (q.length < 4 ? 0.4 : 0.25);
};

const CareersLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["الكل", ...Object.keys(CAREER_DATABASE)];

  const filteredJobs = () => {
    let jobs: {category: string, title: string}[] = [];
    Object.entries(CAREER_DATABASE).forEach(([cat, data]) => {
      data.jobs.forEach(job => jobs.push({ category: cat, title: job }));
    });
    return jobs.filter(item => {
      const matchesCategory = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchesSearch = !searchQuery || robustFuzzyMatch(item.title, searchQuery);
      return matchesCategory && matchesSearch;
    });
  };

  const handleJobClick = async (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setLoading(true);
    try {
      const details = await getJobDetails(jobTitle);
      setJobDetails(details);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">🏛️ مكتبة المهن الذكية</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">استكشف المسارات المهنية بمرونة عالية، حتى مع وجود أخطاء إملائية.</p>
      </div>

      <div className="mb-8 space-y-6">
        <div className="relative max-w-2xl mx-auto group">
          <input 
            type="text" 
            placeholder="ابحث عن مهنة (مثال: Software, Manage...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-5 pr-14 rounded-2xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-slate-100"
          />
          <svg className="w-6 h-6 absolute top-1/2 -translate-y-1/2 right-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-surface-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredJobs().map((item, idx) => (
          <div 
            key={idx}
            onClick={() => handleJobClick(item.title)}
            className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl bg-slate-50 dark:bg-surface-700 w-12 h-12 flex items-center justify-center rounded-2xl">
                {(CAREER_DATABASE as any)[item.category]?.icon || "💼"}
              </span>
              <span className="text-[10px] font-black uppercase bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg">
                {item.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
            <div className="mt-auto pt-6 flex items-center text-sm font-black text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              تفاصيل المسار 
              <svg className="w-4 h-4 mr-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in" onClick={() => setSelectedJob(null)}>
          <div className="bg-white dark:bg-surface-800 w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-surface-700 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{selectedJob}</h3>
              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-14 h-14 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-black animate-pulse">تحليل البيانات الوظيفية...</p>
                </div>
              ) : jobDetails ? (
                <>
                  <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{jobDetails.description}</p>
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">متوسط الراتب الشهري</h4>
                    <p className="text-3xl font-black">{jobDetails.salaryRange}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">🛠️ المهارات</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobDetails.hardSkills.map((s, i) => <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold border border-primary-100 dark:border-primary-800">{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">🎓 التعليم</h4>
                      <ul className="space-y-2">
                        {jobDetails.education.map((e, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"><span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 shrink-0"></span> {e}</li>)}
                      </ul>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-surface-900 border-t border-slate-100 dark:border-surface-700">
               <Button onClick={() => setSelectedJob(null)} variant="secondary" fullWidth size="lg">إغلاق</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersLibrary;
