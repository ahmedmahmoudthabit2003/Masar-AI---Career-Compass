
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
  const levelName = GamificationService.getLevelName(level);

  return (
    <header className={`backdrop-blur-xl border-b sticky top-0 z-50 print:hidden shadow-sm transition-all duration-300 ${theme === 'dark' ? 'bg-surface-900/70 border-surface-700' : 'bg-white/70 border-surface-200/60'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onViewChange('wizard')}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className={`font-bold text-xl hidden sm:inline ${theme === 'dark' ? 'text-surface-50' : 'text-surface-900'}`}>مسار AI</span>
        </div>

        {/* Gamification Badge */}
        <div className="flex-1 flex justify-center px-4">
           <motion.div 
             key={careerPoints}
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm"
           >
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[9px] font-black text-primary-500 uppercase tracking-tighter">{levelName}</span>
                 <span className="text-xs font-bold text-primary-700 dark:text-primary-300">المستوى {level}</span>
              </div>
              <div className="h-6 w-[1px] bg-primary-200 dark:bg-primary-800"></div>
              <div className="flex items-center gap-1.5">
                 <span className="text-sm font-black text-primary-600">🏆 {careerPoints}</span>
              </div>
           </motion.div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-1">
            <button onClick={() => onViewChange('wizard')} className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'wizard' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>الأداة</button>
            <button onClick={() => onViewChange('resources')} className={`px-4 py-2 rounded-xl text-sm font-bold ${view === 'resources' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>المركز</button>
          </div>
          <button onClick={onToggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800">{theme === 'dark' ? '🌙' : '☀️'}</button>
          <button onClick={onOpenSettings} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800">⚙️</button>
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
