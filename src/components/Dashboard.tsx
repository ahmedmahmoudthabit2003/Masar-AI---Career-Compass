
import React, { useMemo } from 'react';
import Card from './UI/Card';
import { motion } from 'framer-motion';

interface Props {
  state: any;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const { adaptiveProfile, careerPoints, activities } = state;
  const insight = adaptiveProfile.performanceInsight;

  const readinessScore = useMemo(() => {
    return insight?.predictedSuccessRate || 70;
  }, [insight]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-slate-100 dark:border-surface-800 pb-8">
         <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">لوحة القيادة الذكية</h2>
            <p className="text-slate-500 font-medium">مراقبة حية لأدائك المهني واحتمالات نجاحك.</p>
         </div>
         <div className="bg-primary-600 text-white px-8 py-4 rounded-3xl shadow-xl shadow-primary-500/20">
            <p className="text-[10px] font-black uppercase opacity-70">نقاط الخبرة</p>
            <p className="text-3xl font-black">🏆 {careerPoints}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none p-10 relative overflow-hidden">
            <div className="relative z-10">
               <p className="text-xs font-black uppercase opacity-80 mb-4">جاهزية سوق العمل 2025</p>
               <h4 className="text-8xl font-black mb-8">{readinessScore}%</h4>
               <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${readinessScore}%` }} 
                    className="h-full bg-white shadow-[0_0_15px_white]"
                  />
               </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
         </Card>

         <Card title="نبض الأداء الذكي ✨" className="lg:col-span-2 p-8 border-none shadow-2xl">
            {insight ? (
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{insight.message}"</p>
                     <div className="p-4 bg-slate-50 dark:bg-surface-900 rounded-2xl border border-slate-100 dark:border-surface-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase">التركيز الحالي</p>
                        <p className="text-sm font-black text-primary-600">{insight.focusArea}</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-xs font-black mb-2">
                           <span>تطور المهارات التقنية</span>
                           <span>{adaptiveProfile.techScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{width: `${adaptiveProfile.techScore}%`}}></div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">النشاط الأخير</p>
                        <div className="flex gap-2">
                           {activities.slice(-5).map((a: any, i: number) => (
                              <div key={i} className="w-2 h-8 bg-primary-100 dark:bg-surface-700 rounded-full relative overflow-hidden">
                                 <div className="absolute bottom-0 w-full bg-primary-500" style={{height: `${(a.score / 100) * 100}%`}}></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 font-bold italic">أكمل المزيد من الأنشطة لتفعيل التحليل الذكي.</div>
            )}
         </Card>
      </div>
    </div>
  );
};

export default Dashboard;
