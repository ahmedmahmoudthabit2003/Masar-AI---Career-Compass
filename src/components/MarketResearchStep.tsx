
import React, { useState, useEffect } from 'react';
import { MarketData, MarketAnalysisResult } from '../types';
// Fix: Import analyzeMarketStrategic instead of analyzeMarket which is not exported from geminiService
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

const commonJobs = ["مطور برمجيات", "أخصائي أمن سيبراني", "عالم بيانات", "مدير منتج", "مسوق رقمي", "محاسب", "مهندس مدني", "أخصائي موارد بشرية"];
const commonLocations = ["الرياض", "جدة", "الدمام", "دبي", "أبو ظبي", "القاهرة", "العمل عن بعد"];

const LoadingState = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "جاري الاتصال بقواعد بيانات السوق المباشرة...",
    "تحليل نطاقات الرواتب في منطقتك...",
    "فحص مستويات المنافسة والطلب...",
    "تجميع المهارات الأكثر طلباً...",
    "صياغة الملخص التنفيذي..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-surface-800 rounded-3xl p-8 border border-slate-100 dark:border-surface-700">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-surface-600 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-primary-600">AI</div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 animate-pulse">
        {messages[msgIndex]}
      </h3>
      <p className="text-slate-500 text-sm">يستخدم هذا التحليل محرك Google Search المباشر</p>
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
       showToast('يرجى تحديد المسار والموقع', 'warning');
       return;
    }
    setLoading(true);
    try {
      // Fix: Use analyzeMarketStrategic instead of analyzeMarket and adjust parameters to match exported signature
      const data = await analyzeMarketStrategic(field, location, companies, industry);
      setResult(data);
      showToast('تم جلب بيانات السوق الحية', 'success');
    } catch (err) {
      showToast('فشل في تحليل السوق', 'error');
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
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">جاري مسح السوق...</h2>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-2 md:p-6 animate-fade-in pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">تحليل واقع السوق 📊</h2>
        <p className="text-slate-500">بيانات حية ومباشرة حول الرواتب، الطلب، والمنافسة.</p>
      </div>

      {!result && (
        <Card variant="gradient" padding="lg" className="mb-8 border-indigo-100 dark:border-indigo-900 shadow-xl">
           <div className="flex flex-col gap-6">
               <div className="grid md:grid-cols-2 gap-4">
                  <Autocomplete 
                    label="المسار المهني المستهدف" 
                    options={commonJobs} 
                    value={field} 
                    onChange={setField} 
                    placeholder="اكتب اسم الوظيفة..." 
                    icon={<span>💼</span>}
                  />
                  <Autocomplete 
                    label="النطاق الجغرافي" 
                    options={commonLocations} 
                    value={location} 
                    onChange={setLocation} 
                    placeholder="المدينة أو المنطقة" 
                    icon={<span>📍</span>}
                  />
               </div>
               
               <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">شركات مستهدفة (اختياري)</label>
                    <input 
                      type="text" 
                      value={companies}
                      onChange={(e) => setCompanies(e.target.value)}
                      placeholder="أرامكو، STC، بنك الراجحي..."
                      className="w-full p-3 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">القطاع / الصناعة (اختياري)</label>
                    <input 
                      type="text" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="التقنية، الطاقة، السياحة..."
                      className="w-full p-3 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>
               </div>
               
               <Button onClick={handleAnalyze} isLoading={loading} variant="primary" size="lg" className="w-full shadow-lg">
                  بدء فحص السوق
               </Button>
           </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="text-center p-4">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-slate-500 font-bold mb-1">معدل النمو</div>
                <div className="text-lg font-black text-green-600">{result.growthRate}</div>
             </Card>
             <Card className="text-center p-4">
                <div className="text-2xl mb-1">⚔️</div>
                <div className="text-xs text-slate-500 font-bold mb-1">المنافسة</div>
                <div className={`text-lg font-black ${result.competitionLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`}>{result.competitionLevel}</div>
             </Card>
             <Card className="text-center p-4">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xs text-slate-500 font-bold mb-1">المتوسط العام</div>
                <div className="text-lg font-black text-emerald-600">{Math.round(averageSalary).toLocaleString()} ريال</div>
             </Card>
             <Card className="text-center p-4">
                <div className="text-2xl mb-1">🏙️</div>
                <div className="text-xs text-slate-500 font-bold mb-1">المنطقة</div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300">{location}</div>
             </Card>
          </div>

          <Card title="💰 تحليل الرواتب المقارن">
             <div className="space-y-8 mt-10 relative">
                {/* Average Benchmark Line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-600 z-0"
                  style={{ left: `${(averageSalary / highestMax) * 100}%` }}
                >
                  <div className="absolute -top-6 -translate-x-1/2 text-[10px] font-black bg-slate-100 dark:bg-surface-700 px-2 py-0.5 rounded text-slate-500 uppercase">المتوسط</div>
                </div>

                {result.salaryData.map((range, idx) => {
                   const mid = (range.min + range.max) / 2;
                   const isAbove = mid > averageSalary * 1.05;
                   const isBelow = mid < averageSalary * 0.95;
                   const isNeutral = !isAbove && !isBelow;
                   
                   const left = (range.min / highestMax) * 100;
                   const width = ((range.max - range.min) / highestMax) * 100;

                   return (
                     <div key={idx} className="relative z-10 group">
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-600 dark:text-slate-400">{range.level}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAbove ? 'bg-green-100 text-green-700' : isBelow ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {isAbove ? 'أعلى من المتوسط' : isBelow ? 'أقل من المتوسط' : 'ضمن المتوسط'}
                              </span>
                           </div>
                           <span className="text-xs font-bold text-slate-500">{range.max.toLocaleString()} ريال</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-surface-700 rounded-full w-full relative overflow-hidden">
                           <div 
                             className={`absolute h-full rounded-full transition-all duration-1000 ${isAbove ? 'bg-green-500' : isBelow ? 'bg-red-500' : 'bg-blue-500'}`}
                             style={{ left: `${left}%`, width: `${width}%` }}
                           ></div>
                        </div>
                     </div>
                   );
                })}
             </div>
             <p className="text-[11px] text-slate-400 mt-8 text-center italic">تحليل بناءً على بيانات البحث الحية لعام 2024</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
             <Card title="🧠 مهارات حرجة (Top Skills)">
                <div className="flex flex-wrap gap-2">
                   {result.topSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold border border-primary-100 dark:border-primary-800">
                         {s}
                      </span>
                   ))}
                </div>
             </Card>
             <Card title="📝 ملخص الذكاء الاصطناعي">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.summary}</p>
             </Card>
          </div>

          <div className="flex justify-between items-center bg-white/50 dark:bg-surface-800/50 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-surface-700">
             <Button onClick={() => setResult(null)} variant="secondary">تعديل البحث</Button>
             <Button onClick={() => onNext({ ...initialData, field, location, targetCompanies: companies, industryFocus: industry }, result)} variant="gradient" className="px-8 shadow-xl">
                بناء الخطة المستقبلية
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketResearchStep;
