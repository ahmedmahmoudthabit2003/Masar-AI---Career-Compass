
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Step, Activity, AdaptiveProfile } from '../types';
import { StorageService } from '../services/storageService';
import { GamificationService } from '../services/gamificationService';

const STORAGE_KEY = 'masar_master_v5_prod';

export const useAppEngine = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
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
  });

  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(saveTimeout.current);
  }, [state]);

  const logActivity = useCallback((type: Activity['type'], score: number) => {
    setState(prev => {
      const newActivity: Activity = {
        id: Math.random().toString(36).substring(7),
        type, score, timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        careerPoints: prev.careerPoints + (score > 50 ? 50 : 20),
        activities: [...prev.activities, newActivity]
      };
    });
  }, []);

  const updateAdaptive = useCallback((action: any) => {
    setState(prev => ({
      ...prev,
      adaptiveProfile: GamificationService.updateAdaptiveProfile(prev.adaptiveProfile, action)
    }));
  }, []);

  const nextStep = () => {
    setState(p => ({ ...p, direction: 'forward', isExiting: true }));
    setTimeout(() => setState(p => ({ ...p, step: p.step + 1, isExiting: false })), 400);
  };

  const prevStep = () => {
    setState(p => ({ ...p, direction: 'backward', isExiting: true }));
    setTimeout(() => setState(p => ({ ...p, step: Math.max(0, p.step - 1), isExiting: false })), 400);
  };

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
      logActivity,
      updateAdaptive,
      nextStep,
      prevStep,
      handleRestart: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    }
  };
};
