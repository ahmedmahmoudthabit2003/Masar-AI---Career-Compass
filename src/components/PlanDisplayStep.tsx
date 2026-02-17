
import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { AppState, GeneratedPlanData, SkillNode } from '../types';
import { generateCareerPlan } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface Props {
  userData: AppState['userData'];
  marketData: AppState['marketData'];
  marketAnalysis: any;
  initialPlan?: any;
  onRestart: () => void;
}

const SkillGalaxyGraph: React.FC<{ skills: SkillNode[] }> = ({ skills }) => {
  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const centerRadius = 50;

  // تحسين الأداء: حساب مواقع العقد مرة واحدة فقط عند تغير قائمة المهارات
  const graphData = useMemo(() => {
    const hardSkills = (skills || []).filter(s => s.type === 'hard');
    const softSkills = (skills || []).filter(s => s.type === 'soft');

    const layout = (items: SkillNode[], startAngle: number, endAngle: number, radius: number) => {
      if (!items || items.length === 0) return [];
      const span = endAngle - startAngle;
      const step = items.length > 1 ? span / (items.length - 1) : 0;
      
      return items.map((skill, i) => {
        const angle = items.length === 1 ? startAngle + span/2 : startAngle + (i * step);
        const r = radius + (i % 2 === 0 ? 15 : -15);
        return {
          ...skill,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          size: skill.importance === 'critical' ? 24 : 16
        };
      });
    };

    const hardNodes = layout(hardSkills, -Math.PI / 3, Math.PI / 3, 200);
    const softNodes = layout(softSkills, Math.PI * 0.7, Math.PI * 1.3, 200);
    return [...hardNodes, ...softNodes];
  }, [skills]);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="w-full overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-700 shadow-2xl relative h-[500px]">
      <div className="absolute top-6 right-8 z-10 flex flex-col gap-3">
         <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span> مهارة تقنية
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span> مهارة ناعمة
         </div>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Core Connection Lines */}
        {graphData.map((node, i) => (
          <line 
            key={`link-${i}`}
            x1={cx} y1={cy} x2={node.x} y2={node.y} 
            stroke={node.type === 'hard' ? '#3b82f6' : '#a855f7'} 
            strokeWidth="1" 
            opacity="0.2"
          />
        ))}

        {/* Center Mastery Node */}
        <circle cx={cx} cy={cy} r={centerRadius} fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <text x={cx} y={cy} textAnchor="middle" dy=".3em" fill="#94a3b8" fontSize="10" fontWeight="900" className="uppercase tracking-widest">Mastery</text>

        {/* Dynamic Skill Nodes */}
        {graphData.map((node, i) => (
           <g 
             key={`node-${i}`} 
             onMouseEnter={() => setHoveredNode(node.name)}
             onMouseLeave={() => setHoveredNode(null)}
             className="cursor-pointer transition-all"
           >
             <circle 
               cx={node.x} cy={node.y} r={node.size + (hoveredNode === node.name ? 6 : 0)} 
               fill={node.type === 'hard' ? '#3b82f6' : '#a855f7'} 
               className="transition-all duration-300"
               style={{ filter: `blur(${hoveredNode === node.name ? '0px' : '1px'}) opacity(0.8)` }}
             />
             <text 
               x={node.x} 
               y={node.y + node.size + 18} 
               textAnchor="middle" 
               fill={hoveredNode === node.name ? "#fff" : "#64748b"} 
               fontSize="11" 
               fontWeight="bold"
               className="select-none transition-colors"
             >
               {node.name}
             </text>
           </g>
        ))}
      </svg>
    </div>
  );
};

const PlanDisplayStep: React.FC<Props> = ({ userData, marketData, marketAnalysis, initialPlan, onRestart }) => {
  const [planData, setPlanData] = useState<GeneratedPlanData | null>(initialPlan || null);
  const [loading, setLoading] = useState(!initialPlan);
  const [activeTab, setActiveTab] = useState<'timeline' | 'skills' | 'report'>('timeline');
  const { showToast } = useToast();

  useEffect(() => {
    if (planData) { setLoading(false); return; }
    generateCareerPlan(userData, marketData, marketAnalysis)
      .then(res => setPlanData(res))
      .catch(() => showToast('فشل في هندسة الخطة', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin mb-6"></div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-white">جاري هندسة مستقبلك...</h2>
      <p className="text-slate-500 mt-2">نقوم الآن بتحويل رؤية 2030 ومهاراتك إلى خارطة تنفيذية.</p>
    </div>
  );

  return (
    <div className="w-full pb-24 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-center gap-2 bg-slate-100 dark:bg-surface-800 p-2 rounded-2xl max-w-md mx-auto sticky top-20 z-40 shadow-xl border border-white/10">
        {(['timeline', 'skills', 'report'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
          >
            {tab === 'timeline' ? 'الخارطة' : tab === 'skills' ? 'المجرات' : 'التقرير'}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && (
        <div className="animate-fade-in-up space-y-12">
          {planData?.timeline.map((phase, idx) => (
            <Card key={idx} className="border-none shadow-2xl p-8 rounded-[2rem] hover:-translate-y-1 transition-transform overflow-visible">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black shadow-lg shrink-0 mt-[-20px]">{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{phase.phaseName}</h3>
                    <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase">{phase.duration}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> التركيز الاستراتيجي: {phase.focus}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {phase.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-surface-900 rounded-xl border border-slate-100 dark:border-surface-700">
                        <div className="w-5 h-5 rounded-full border-2 border-primary-200"></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'skills' && <SkillGalaxyGraph skills={planData?.skillTree || []} />}

      {activeTab === 'report' && (
        <Card className="p-10 border-none shadow-2xl rounded-[3rem]">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{planData?.markdownPlan || ''}</ReactMarkdown>
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-10">
        <Button onClick={onRestart} variant="secondary" size="lg" className="rounded-2xl px-12">بدء رحلة جديدة</Button>
      </div>
    </div>
  );
};

export default PlanDisplayStep;
