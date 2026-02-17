
import React, { useState, useMemo } from 'react';
import { getJobDetails } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';

const CAREER_DATABASE = {
  "التقنية والذكاء الاصطناعي": { icon: "💻", jobs: ["Software Engineer", "Data Scientist", "Cybersecurity Specialist", "Product Manager", "DevOps Engineer", "UI/UX Designer"] },
  "الإدارة والأعمال": { icon: "💼", jobs: ["Project Manager", "Business Analyst", "Marketing Manager", "HR Director", "Management Consultant", "Financial Controller"] },
  "الهندسة والصناعة": { icon: "🏗️", jobs: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Renewable Energy Engineer", "Industrial Designer"] },
  "الرعاية الصحية": { icon: "🩺", jobs: ["Family Physician", "Clinical Pharmacist", "Health Informatics Specialist", "Critical Care Nurse"] },
  "الإبداع والإعلام": { icon: "🎨", jobs: ["Graphic Designer", "Content Strategist", "Filmmaker", "Creative Director", "PR Specialist"] }
};

const CareersLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // تحسين البحث عبر useMemo لمنع إعادة المعالجة في كل رندر
  const filteredJobs = useMemo(() => {
    const allJobs: {category: string, title: string}[] = [];
    Object.entries(CAREER_DATABASE).forEach(([cat, data]) => {
      data.jobs.forEach(job => allJobs.push({ category: cat, title: job }));
    });

    const query = searchQuery.toLowerCase().trim();
    return allJobs.filter(item => {
      const matchesCategory = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchesSearch = !query || item.title.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

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
    <div className="max-w-7xl mx-auto p-4 animate-fade-in pb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">🏛️ مكتبة المهن الذكية</h2>
        <p className="text-slate-500 mt-2">استكشف المسارات المهنية الأنسب لسوق العمل الحالي.</p>
      </div>

      <div className="mb-8 space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <input type="text" placeholder="ابحث عن مهنة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-5 pr-14 rounded-2xl border border-slate-200 shadow-sm outline-none" />
          <span className="absolute top-1/2 -translate-y-1/2 right-5 text-slate-400">🔍</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["الكل", ...Object.keys(CAREER_DATABASE)].map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredJobs.map((item, idx) => (
          <div key={idx} onClick={() => handleJobClick(item.title)} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl">{(CAREER_DATABASE as any)[item.category]?.icon || "💼"}</span>
              <span className="text-[10px] font-black bg-primary-50 text-primary-600 px-2 py-1 rounded-lg uppercase">{item.category}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-xl">{item.title}</h3>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">{selectedJob}</h3>
              <button onClick={() => setSelectedJob(null)} className="p-2">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {loading ? <div className="text-center py-10 animate-pulse font-black">جاري التحليل...</div> : jobDetails && (
                <>
                  <p className="text-xl text-slate-600 leading-relaxed">{jobDetails.description}</p>
                  <div className="bg-emerald-500 p-6 rounded-3xl text-white">
                    <h4 className="text-xs font-black uppercase opacity-80">الراتب الشهري</h4>
                    <p className="text-3xl font-black">{jobDetails.salaryRange}</p>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 bg-slate-50"><Button onClick={() => setSelectedJob(null)} variant="secondary" fullWidth>إغلاق</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CareersLibrary;
