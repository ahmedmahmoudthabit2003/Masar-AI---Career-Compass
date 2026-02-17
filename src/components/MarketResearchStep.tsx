
import React, { useState, useEffect } from 'react';
import { MarketData, MarketAnalysisResult } from '../types';
import { analyzeMarketStrategic } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import Autocomplete from './UI/Autocomplete';
import { useToast } from '../contexts/ToastContext';

interface Props {
  initialData: MarketData;
  initialAnalysis?: MarketAnalysisResult | null;
  onNext: (data: MarketData, analysis: MarketAnalysisResult) => void;
  onBack: () => void;
}

const commonJobs = ["مطور برمجيات", "أخصائي أمن سيبراني", "عالم بيانات", "مدير منتج", "مسوق رقمي", "محاسب", "مهندس مدني", "أخصائي موارد بشرية", "محلل مالي", "مصمم جرافيك"];
const commonLocations = [
  "الرياض، السعودية", 
  "جدة، السعودية", 
  "دبي، الإمارات", 
  "أبو ظبي، الإمارات", 
  "القاهرة، مصر", 
  "عمان، الأردن", 
  "الدوحة، قطر", 
  "المنامة، البحرين", 
  "الكويت العاصمة، الكويت", 
  "الدار البيضاء، المغرب", 
  "تونس العاصمة، تونس", 
  "العمل عن بعد (الوطن العربي)"
];

const LoadingState = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "جاري مسح قواعد بيانات التوظيف العربية...",
    "تحليل الرواتب في الخليج ومصر والمغرب العربي...",
    "فحص فجوات المهارات في السوق الإقليمي...",
    "رصد التوجهات التقنية في عواصم الابتكار العربية...",
    "صياغة التقرير الاستراتيجي لمستقبلك..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-surface-800 rounded-3xl p-8 border border-slate-100 dark:border-surface-700 shadow-xl">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-surface-600 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-primary-600">MENA</div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 animate-pulse text-center">
        {messages[msgIndex]}
      </h3>
      <p className="text-slate-500 text-sm">يستخدم هذا التحليل محرك Google Search المباشر للوصول لبيانات 2025</p>
    </div>
  );
};

const MarketResearchStep: React.FC<Props> = ({ initialData, initialAnalysis, onNext, onBack }) => {
  const [field, setField] = useState(initialData.field);
  const [location, setLocation] = useState(initialData.location);
  const [companies, setCompanies] = useState(initialData.targetCompanies || '');
  const [industry, setIndustry] = useState(initialData.industryFocus || '');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAnalysisResult | null>(initialAnalysis || null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!field || !location) {
       showToast('يرجى تحديد المسار والموقع الجغرافي', 'warning');
       return;
    }
    setLoading(true);
    try {
      const data = await analyzeMarketStrategic(field, location, companies, industry);
      setResult(data);
      showToast('اكتمل مسح السوق العربي بنجاح', 'success');
    } catch (err) {
      showToast('فشل في تحليل السوق الإقليمي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageSalary = () => {
    if (!result || result.salaryData.length === 0) return 0;
    const midpoints = result.salaryData.map(s => (s.min + s.max) / 2);
    return midpoints.reduce((a, b) => a + b, 0) / midpoints.length;
  };

  const averageSalary = calculateAverageSalary();
  const highestMax = result ? Math.max(...result.salaryData.map(s => s.max)) * 1.1 : 10000;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full p-2 md:p-6 pb-24 animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Market Pulse: MENA Region</h2>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">تحليل الفرص في الوطن العربي 📊</h2>
        <p className="text-slate-500">بيانات حية حول الرواتب والطلب والمنافسة في أسواق الشرق الأوسط وشمال أفريقيا.</p>
      </div>

      {!result && (
        <Card variant="gradient" padding="lg" className="mb-8 border-indigo-100 dark:border-indigo-900 shadow-xl rounded-[2.5rem]">
           <div className="flex flex-col gap-6">
               <div className="grid md:grid-cols-2 gap-4">
                  <Autocomplete 
                    label="المسار المهني المستهدف" 
                    options={commonJobs} 
                    value={field} 
                    onChange={setField} 
                    placeholder="مثال: مطور ويب، مدير تسويق..." 
                    icon={<span>💼</span>}
                  />
                  <Autocomplete 
                    label="النطاق الجغرافي (الدولة أو المدينة)" 
                    options={commonLocations} 
                    value={location} 
                    onChange={setLocation} 
                    placeholder="مثال: دبي، القاهرة، الرياض..." 
                    icon={<span>📍</span>}
                  />
               </div>
               
               <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">شركات إقليمية مستهدفة (اختياري)</label>
                    <input 
                      type="text" 
                      value={companies}
                      onChange={(e) => setCompanies(e.target.value)}
                      placeholder="أرامكو، مبادلة، إعمار، اتصالات..."
                      className="w-full p-4 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">القطاع الاقتصادي (اختياري)</label>
                    <input 
                      type="text" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="الطاقة، التقنية، اللوجستيات، السياحة..."
                      className="w-full p-4 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                    />
                  </div>
               </div>
               
               <Button onClick={handleAnalyze} isLoading={loading} variant="primary" size="lg" className="w-full shadow-2xl py-5 rounded-2xl font-black text-lg">
                  فحص السوق الإقليمي
               </Button>
           </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="text-center p-5 border-none shadow-lg">
                <div className="text-3xl mb-1">📈</div>
                <div className="text-[10px] text-slate-400 font-black uppercase mb-1">معدل النمو</div>
                <div className="text-lg font-black text-green-600">{result.growthRate}</div>
             </Card>
             <Card className="text-center p-5 border-none shadow-lg">
                <div className="text-3xl mb-1">⚔️</div>
                <div className="text-[10px] text-slate-400 font-black uppercase mb-1">المنافسة</div>
                <div className={`text-lg font-black ${result.competitionLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`}>{result.competitionLevel}</div>
             </Card>
             <Card className="text-center p-5 border-none shadow-lg">
                <div className="text-3xl mb-1">💰</div>
                <div className="text-[10px] text-slate-400 font-black uppercase mb-1">المتوسط الإقليمي</div>
                <div className="text-lg font-black text-emerald-600">{Math.round(averageSalary).toLocaleString()} <span className="text-[10px]">{result.salaryData[0]?.currency || ''}</span></div>
             </Card>
             <Card className="text-center p-5 border-none shadow-lg">
                <div className="text-3xl mb-1">🌐</div>
                <div className="text-[10px] text-slate-400 font-black uppercase mb-1">النطاق</div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300 truncate px-2">{location}</div>
             </Card>
          </div>

          <Card title="💰 تحليل مستويات الدخل في المنطقة" className="rounded-[2.5rem] border-none shadow-xl">
             <div className="space-y-8 mt-12 relative">
                <div 
                  className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-600 z-0"
                  style={{ left: `${(averageSalary / highestMax) * 100}%` }}
                >
                  <div className="absolute -top-8 -translate-x-1/2 text-[10px] font-black bg-slate-100 dark:bg-surface-700 px-3 py-1 rounded-full text-slate-500 uppercase tracking-tighter shadow-sm border border-slate-200">المتوسط</div>
                </div>

                {result.salaryData.map((range, idx) => {
                   const mid = (range.min + range.max) / 2;
                   const isAbove = mid > averageSalary * 1.05;
                   const isBelow = mid < averageSalary * 0.95;
                   
                   const left = (range.min / highestMax) * 100;
                   const width = ((range.max - range.min) / highestMax) * 100;

                   return (
                     <div key={idx} className="relative z-10 group">
                        <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{range.level}</span>
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${isAbove ? 'bg-green-100 text-green-700' : isBelow ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {isAbove ? 'أعلى من المتوسط' : isBelow ? 'أقل من المتوسط' : 'متوافق'}
                              </span>
                           </div>
                           <span className="text-xs font-black text-slate-400 tracking-tighter">{range.max.toLocaleString()} {range.currency}</span>
                        </div>
                        <div className="h-4 bg-slate-50 dark:bg-surface-700 rounded-full w-full relative overflow-hidden shadow-inner border border-slate-100 dark:border-surface-600">
                           <div 
                             className={`absolute h-full rounded-full transition-all duration-1000 shadow-sm ${isAbove ? 'bg-gradient-to-r from-green-400 to-green-600' : isBelow ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                             style={{ left: `${left}%`, width: `${width}%` }}
                           ></div>
                        </div>
                     </div>
                   );
                })}
             </div>
             <p className="text-[10px] font-bold text-slate-400 mt-10 text-center uppercase tracking-widest">توقعات بناءً على تقارير التوظيف الإقليمية لعام 2025</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
             <Card title="🧠 مهارات تطلبها الأسواق العربية" className="rounded-3xl border-none shadow-lg">
                <div className="flex flex-wrap gap-2 mt-4">
                   {result.topSkills.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-black border border-primary-100 dark:border-primary-800 hover:scale-105 transition-transform cursor-default">
                         {s}
                      </span>
                   ))}
                </div>
             </Card>
             <Card title="📝 ملخص الذكاء الاصطناعي (MENA Context)" className="rounded-3xl border-none shadow-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic">"{result.summary}"</p>
             </Card>
          </div>

          <div className="flex justify-between items-center bg-white/80 dark:bg-surface-800/80 backdrop-blur p-5 rounded-[2rem] border border-slate-100 dark:border-surface-700 shadow-xl sticky bottom-4 z-40">
             <Button onClick={() => setResult(null)} variant="secondary" className="rounded-xl px-8">تعديل البحث</Button>
             <Button onClick={() => onNext({ ...initialData, field, location, targetCompanies: companies, industryFocus: industry }, result)} variant="gradient" className="px-10 shadow-xl rounded-xl font-black">
                بناء خطة النجاح العربية
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketResearchStep;
