
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProgressIndicator from '../components/UI/ProgressIndicator';
import AccessibilityToolbar from '../components/UI/AccessibilityToolbar';
import ScrollToTop from '../components/UI/ScrollToTop';
import SettingsPanel from '../components/SettingsPanel';
import { Step } from '../types';
import { GamificationService } from '../services/gamificationService';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  view: 'wizard' | 'resources';
  step: Step;
  careerPoints: number;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  onViewChange: (view: 'wizard' | 'resources') => void;
  onOpenSettings: () => void;
}

const StickyHeader: React.FC<{
  view: 'wizard' | 'resources';
  step: Step;
  careerPoints: number;
  theme: string;
  onViewChange: (view: 'wizard' | 'resources') => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}> = ({ view, step, careerPoints, theme, onViewChange, onToggleTheme, onOpenSettings }) => {
  const level = GamificationService.calculateLevel(careerPoints);

  return (
    <header className={`backdrop-blur-xl border-b sticky top-0 z-50 print:hidden shadow-sm transition-all duration-300 ${theme === 'dark' ? 'bg-surface-900/70 border-surface-700' : 'bg-white/70 border-surface-200/60'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('wizard')}>
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className={`font-black text-2xl tracking-tighter ${theme === 'dark' ? 'text-surface-50' : 'text-surface-900'}`}>مسار AI</span>
        </div>

        {/* Navigation - مطابق للأيقونات في الصورة */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-surface-800 p-1 rounded-2xl border border-slate-200/50 dark:border-surface-700">
            <button 
              onClick={() => onViewChange('wizard')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-[1.1rem] text-sm font-black transition-all ${view === 'wizard' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>🧭</span>
              <span className="hidden sm:inline">الأداة</span>
            </button>
            <button 
              onClick={() => onViewChange('resources')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-[1.1rem] text-sm font-black transition-all ${view === 'resources' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>📚</span>
              <span className="hidden sm:inline">المركز</span>
            </button>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-surface-700 mx-2 hidden md:block"></div>
          
          <div className="flex items-center gap-1">
            <button onClick={onToggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-xl">
              {theme === 'dark' ? '☀️' : '⚙️'}
            </button>
            <button onClick={onOpenSettings} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-xl">
              ⚙️
            </button>
          </div>
        </div>

      </div>
      {view === 'wizard' && step > Step.WELCOME && step < Step.RESULT && (
          <div className="absolute bottom-0 left-0 w-full"><ProgressIndicator currentStep={step} totalSteps={4} /></div>
      )}
    </header>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, view, step, careerPoints, isSettingsOpen, onCloseSettings, onViewChange, onOpenSettings 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${theme === 'dark' ? 'dark bg-surface-950 text-surface-50' : 'bg-[#F9F9F9] text-surface-900'}`}>
      <StickyHeader 
        view={view} step={step} careerPoints={careerPoints} theme={theme} 
        onViewChange={onViewChange} onToggleTheme={toggleTheme} onOpenSettings={onOpenSettings}
      />
      <main className="flex flex-col items-center pt-6 sm:pt-10 pb-16 px-4 relative z-10 w-full min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <AccessibilityToolbar />
      <ScrollToTop />
      <SettingsPanel isOpen={isSettingsOpen} onClose={onCloseSettings} />
    </div>
  );
};

export default MainLayout;
