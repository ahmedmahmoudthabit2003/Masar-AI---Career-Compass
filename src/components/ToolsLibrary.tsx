
import React, { useState, Suspense, useMemo } from 'react';
import { AdaptiveProfile } from '../types';

const JobsDashboard = React.lazy(() => import('./tools/JobsDashboard'));
const ResumeAnalyzer = React.lazy(() => import('./tools/ResumeAnalyzer'));
const MockInterviewer = React.lazy(() => import('./tools/MockInterviewer'));
const LinkedInHelper = React.lazy(() => import('./tools/LinkedInHelper'));
const LearningRoadmap = React.lazy(() => import('./tools/LearningRoadmap'));
const SkillQuiz = React.lazy(() => import('./tools/SkillQuiz'));
const CVOptimizer = React.lazy(() => import('./tools/CVOptimizer'));

interface ToolsLibraryProps {
  adaptiveProfile?: AdaptiveProfile;
}

const TOOLS_CONFIG = [
  { id: 'jobs', label: 'لوحة الوظائف الذكية', icon: '💼', color: 'border-amber-500' },
  { id: 'optimizer', label: 'مهندس المحتوى المهني', icon: '✍️', color: 'border-indigo-500' },
  { id: 'resume', label: 'محلل السيرة الذاتية', icon: '📄', color: 'border-primary-500' },
  { id: 'roadmap', label: 'خارطة التعلم', icon: '🗺️', color: 'border-purple-500' },
  { id: 'interview', label: 'محاكي المقابلات', icon: '🎤', color: 'border-emerald-500' },
  { id: 'quiz', label: 'الاختبار التقني', icon: '🧠', color: 'border-rose-500' },
  { id: 'linkedin', label: 'مساعد LinkedIn', icon: '👤', color: 'border-blue-500' }
];

const ToolsLibrary: React.FC<ToolsLibraryProps> = ({ adaptiveProfile }) => {
  const [activeTool, setActiveTool] = useState<string>('jobs');

  const sortedTools = useMemo(() => {
    if (!adaptiveProfile) return TOOLS_CONFIG;
    const tools = [...TOOLS_CONFIG];
    if (adaptiveProfile.techScore > 60) {
      const techHeavy = ['quiz', 'resume', 'roadmap'];
      return tools.sort((a, b) => {
        const aTech = techHeavy.indexOf(a.id);
        const bTech = techHeavy.indexOf(b.id);
        if (aTech !== -1 && bTech === -1) return -1;
        if (aTech === -1 && bTech !== -1) return 1;
        return 0;
      });
    }
    return tools;
  }, [adaptiveProfile]);

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="font-bold">جاري تحميل الأداة المهنية...</p>
    </div>
  );

  const navItemClass = (id: string, colorClass: string) => `
    w-full text-right p-4 rounded-xl font-bold flex items-center justify-between transition-all duration-300
    ${activeTool === id 
      ? `bg-white dark:bg-surface-800 shadow-md border-r-4 ${colorClass} text-slate-800 dark:text-white translate-x-[-4px]` 
      : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}
  `;

  return (
    <div className="animate-fade-in w-full pb-20">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">🛠️ أدوات مسار الذكية</h2>
         <p className="text-slate-500 font-medium">اختر الأداة التي تحتاجها لتسريع رحلتك المهنية اليوم.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
         {/* Sidebar Navigation */}
         <div className="md:col-span-1 space-y-2">
            {sortedTools.map(tool => (
               <button 
                 key={tool.id} 
                 onClick={() => setActiveTool(tool.id)} 
                 className={navItemClass(tool.id, tool.color)}
               >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-sm">{tool.label}</span>
                  </div>
                  {adaptiveProfile?.techScore && adaptiveProfile.techScore > 50 && ['quiz', 'resume'].includes(tool.id) && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="md:col-span-3 min-h-[600px]">
            <Suspense fallback={<LoadingFallback />}>
               {activeTool === 'jobs' && <JobsDashboard />}
               {activeTool === 'optimizer' && <CVOptimizer />}
               {activeTool === 'roadmap' && <LearningRoadmap />}
               {activeTool === 'resume' && <ResumeAnalyzer />}
               {activeTool === 'interview' && <MockInterviewer />}
               {activeTool === 'linkedin' && <LinkedInHelper />}
               {activeTool === 'quiz' && <SkillQuiz />}
            </Suspense>
         </div>
      </div>
    </div>
  );
};

export default ToolsLibrary;
