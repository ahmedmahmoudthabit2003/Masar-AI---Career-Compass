
import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { StorageService } from '../../services/storageService';
import { optimizeCVContent } from '../../services/geminiService';
import { LinkedInImportedData, ResumeAnalysisResult } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const CVOptimizer: React.FC = () => {
  const [profile, setProfile] = useState<LinkedInImportedData | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    StorageService.getLinkedInData().then(data => { if (data) setProfile(data); });
  }, []);

  const handleOptimize = async () => {
    if (!profile || !targetRole) return;
    setLoading(true);
    try {
      const res = await optimizeCVContent(profile, targetRole);
      setResult(res);
      showToast('اكتملت هندسة المحتوى المهني', 'success');
    } catch (e) { showToast('فشل التحسين. حاول مرة أخرى.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {!result ? (
        <Card className="product-card border-none shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">✍️</div>
            <h3 className="text-2xl font-black text-slate-800">مهندس المحتوى المهني</h3>
            <p className="text-slate-500 mt-2">حوّل مهامك العادية إلى إنجازات رقمية تخطف أنظار المدراء.</p>
          </div>
          <div className="max-w-md mx-auto space-y-6">
             <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="المسمى الوظيفي المستهدف..." className="w-full p-4 rounded-2xl border border-slate-200 outline-none" />
             <Button onClick={handleOptimize} isLoading={loading} disabled={!profile || !targetRole} variant="gradient" fullWidth size="xl">تحسين السيرة الذاتية</Button>
          </div>
        </Card>
      ) : (
        <div className="animate-fade-in-up space-y-8">
           <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white flex items-center justify-between shadow-lg">
                 <div><p className="text-[10px] font-black text-slate-400">Impact Factor</p><h4 className="text-4xl font-black text-primary-600">{result?.impactScore || 0}%</h4></div>
                 <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500" style={{ width: `${result?.impactScore || 0}%` }}></div></div>
              </Card>
           </div>
           <div className="space-y-6">
              {result?.narrativeRedesign?.map((item, idx) => (
                <Card key={idx} className="border-none shadow-xl bg-white overflow-visible">
                   <div className="grid lg:grid-cols-2 gap-8 p-8">
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-[10px] font-black text-red-500">الوصف الحالي</div>
                         <p className="text-sm text-slate-500 italic">"{item.original}"</p>
                      </div>
                      <div className="space-y-4">
                         <div className="text-[10px] font-black text-green-600">تطوير Masar AI</div>
                         <p className="text-base font-bold text-slate-800">{item.suggested}</p>
                         <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{item.logic}</div>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
           <div className="flex justify-center"><Button onClick={() => setResult(null)} variant="secondary">تحسين دور آخر</Button></div>
        </div>
      )}
    </div>
  );
};
export default CVOptimizer;
