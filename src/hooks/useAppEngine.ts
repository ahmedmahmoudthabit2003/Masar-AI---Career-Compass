
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, SelfAwarenessData, MarketData, Step, MarketAnalysisResult, AdaptiveProfile } from '../types';
import { useToast } from '../contexts/ToastContext';
import { POINTS_MAP, GamificationService } from '../services/gamificationService';

const initialUserData: SelfAwarenessData = {
  name: '', ageGroup: '', gender: '', location: '', educationLevel: '', major: '', currentRole: '', experienceYears: '',
  skills: '', languages: '', workValues: [], workEnvironment: '', personalityType: '', interests: '',
  financialGoal: '', timeline: '', constraints: '', strengths: '', weaknesses: '', riskTolerance: 'medium',
  autonomyLevel: 'collaborative', communicationStyle: '', problemSolvingApproach: '', careerAspirations: ''
};

const initialMarketData: MarketData = {
  field: '', location: '', targetCompanies: '', industryFocus: '', companySize: '', keywords: '', specificSkills: ''
};

const initialAdaptive: AdaptiveProfile = {
  techScore: 0,
  isRushing: false,
  interactionCount: 0,
  preferredTools: ['jobfinder', 'optimizer', 'resume', 'roadmap', 'interview', 'quiz', 'linkedin']
};

const STORAGE_KEY = 'masar_app_state_v4';

export const useAppEngine = () => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [view, setView] = useState<'wizard' | 'resources'>('wizard');
  const [userData, setUserData] = useState<SelfAwarenessData>(initialUserData);
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [careerPoints, setCareerPoints] = useState<number>(0);
  const [adaptiveProfile, setAdaptiveProfile] = useState<AdaptiveProfile>(initialAdaptive);
  
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { showToast } = useToast();
  const isFirstRender = useRef(true);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: AppState = JSON.parse(savedState);
        setUserData(prev => ({ ...prev, ...parsed.userData }));
        setMarketData(prev => ({ ...prev, ...parsed.marketData }));
        if (parsed.marketAnalysis) setMarketAnalysis(parsed.marketAnalysis);
        setGeneratedPlan(parsed.generatedPlan);
        setCareerPoints(parsed.careerPoints || 0);
        if (parsed.adaptiveProfile) setAdaptiveProfile(parsed.adaptiveProfile);
        
        if (parsed.step > Step.WELCOME) {
           setStep(parsed.step);
        }
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (isRestored) {
      const timeoutId = setTimeout(() => {
        const stateToSave: AppState = { 
          step, view, userData, marketData, generatedPlan, marketAnalysis, 
          careerPoints, adaptiveProfile 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [step, view, userData, marketData, generatedPlan, marketAnalysis, careerPoints, adaptiveProfile, isRestored]);

  const addPoints = useCallback((points: number) => {
    setCareerPoints(prev => prev + points);
  }, []);

  const updateAdaptive = useCallback((action: any) => {
    setAdaptiveProfile(prev => GamificationService.updateAdaptiveProfile(prev, action));
  }, []);

  const transition = useCallback((newStep: Step, dir: 'forward' | 'backward') => {
    if (isExiting) return;
    setDirection(dir);
    setIsExiting(true);
    setTimeout(() => {
      setStep(newStep);
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [isExiting]);

  const nextStep = useCallback(() => transition(step + 1, 'forward'), [step, transition]);
  const prevStep = useCallback(() => transition(step - 1, 'backward'), [step, transition]);

  const handleSelfAwarenessSubmit = useCallback((data: SelfAwarenessData) => {
    setUserData(data);
    addPoints(POINTS_MAP.QUIZ_COMPLETION);
    nextStep();
  }, [nextStep, addPoints]);

  const handleSuggestionSelect = useCallback((title: string) => {
    setMarketData(prev => ({ ...prev, field: title }));
    updateAdaptive({ type: 'msg', text: title });
    nextStep();
  }, [nextStep, updateAdaptive]);

  const handleMarketSubmit = useCallback((data: MarketData, analysis: MarketAnalysisResult) => {
    setMarketData(data);
    setMarketAnalysis(analysis);
    nextStep();
  }, [nextStep]);

  const handleRestart = useCallback(() => {
    if (window.confirm("هل أنت متأكد من البدء من جديد؟")) {
        setStep(Step.WELCOME);
        setUserData(initialUserData);
        setMarketData(initialMarketData);
        setMarketAnalysis(null);
        setGeneratedPlan(null);
        setCareerPoints(0);
        setAdaptiveProfile(initialAdaptive);
        localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Added handleLoadSavedLegacy to fix the missing property error in App.tsx
  const handleLoadSavedLegacy = useCallback((data: any) => {
    if (isExiting) return;
    setDirection('forward');
    setIsExiting(true);
    setTimeout(() => {
        if (data.userData) setUserData(prev => ({...prev, ...data.userData}));
        if (data.marketData) setMarketData(data.marketData);
        if (data.marketAnalysis) setMarketAnalysis(data.marketAnalysis);
        
        if (data.plan) {
          setGeneratedPlan(data.plan);
          setStep(Step.PLANNING);
        } else {
          // In new types, Step.SELF_AWARENESS is CONVERSATIONAL_ASSESSMENT
          setStep(Step.CONVERSATIONAL_ASSESSMENT);
        }
        setIsExiting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [isExiting]);

  return {
    state: { step, view, userData, marketData, marketAnalysis, generatedPlan, careerPoints, adaptiveProfile, direction, isExiting, isSettingsOpen },
    actions: { 
        nextStep, prevStep, setView, setIsSettingsOpen, addPoints, updateAdaptive,
        handleSelfAwarenessSubmit, handleSuggestionSelect, handleMarketSubmit, handleRestart,
        handleLoadSavedLegacy
    }
  };
};
