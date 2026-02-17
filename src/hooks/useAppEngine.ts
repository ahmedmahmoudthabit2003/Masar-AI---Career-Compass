
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Step, Activity, AdaptiveProfile } from '../types';
import { GamificationService } from '../services/gamificationService';

const STORAGE_KEY = 'masar_master_v5_final';

const initialState: AppState = {
  step: Step.WELCOME,
  view: 'wizard',
  userData: { skills: '', interests: '', careerAspirations: '' },
  marketData: { field: '', location: '' },
  marketAnalysis: null,
  generatedPlan: null,
  careerPoints: 0,
  activities: [],
  appliedJobs: [],
  adaptiveProfile: { techScore: 0, isRushing: false, interactionCount: 0, currentSkillLevel: 'beginner' },
  direction: 'forward',
  isExiting: false,
  isSettingsOpen: false
};

export const useAppEngine = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  // Fix: Error in file src/hooks/useAppEngine.ts on line 34: Cannot find namespace 'NodeJS'.
  const saveTimeout = useRef<any>(null);

  // الحفظ التلقائي مع Debounce لمنع ضغط القرص
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 1000);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [state]);

  const logActivity = useCallback((type: Activity['type'], score: number) => {
    setState(prev => ({
      ...prev,
      careerPoints: prev.careerPoints + 25,
      activities: [...prev.activities, { id: Math.random().toString(36).substring(7), type, score, timestamp: new Date().toISOString() }]
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (state.isExiting) return;
    setState(p => ({ ...p, direction: 'forward', isExiting: true }));
    setTimeout(() => {
      setState(p => ({ ...p, step: Math.min(Step.RESULT, p.step + 1), isExiting: false }));
    }, 400);
  }, [state.isExiting]);

  const prevStep = useCallback(() => {
    if (state.isExiting) return;
    setState(p => ({ ...p, direction: 'backward', isExiting: true }));
    setTimeout(() => {
      setState(p => ({ ...p, step: Math.max(Step.WELCOME, p.step - 1), isExiting: false }));
    }, 400);
  }, [state.isExiting]);

  const resetApp = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('masar_career_suggestions_cache');
    window.location.reload();
  }, []);

  return {
    state,
    actions: {
      setStep: (step: Step) => setState(p => ({ ...p, step })),
      setView: (view: AppState['view']) => setState(p => ({ ...p, view })),
      setUserData: (userData: any) => setState(p => ({ ...p, userData: { ...p.userData, ...userData } })),
      setMarketData: (marketData: any) => setState(p => ({ ...p, marketData: { ...p.marketData, ...marketData } })),
      setMarketAnalysis: (marketAnalysis: any) => setState(p => ({ ...p, marketAnalysis })),
      setGeneratedPlan: (generatedPlan: any) => setState(p => ({ ...p, generatedPlan })),
      setIsSettingsOpen: (isOpen: boolean) => setState(p => ({ ...p, isSettingsOpen: isOpen })),
      updateAdaptive: (action: any) => setState(prev => ({ ...prev, adaptiveProfile: GamificationService.updateAdaptiveProfile(prev.adaptiveProfile, action) })),
      logActivity,
      nextStep,
      prevStep,
      resetApp
    }
  };
};
