
import { useState, useEffect, useCallback } from 'react';
import { AppState, SelfAwarenessData, MarketData, Step, Activity, AppliedJob, AdaptiveProfile, MarketAnalysisResult } from '../types';
import { useToast } from '../contexts/ToastContext';
import { GamificationService } from '../services/gamificationService';
import { getAdaptivePerformanceAnalysis } from '../services/geminiService';

const initialUserData: SelfAwarenessData = {
  name: '', ageGroup: '', gender: '', location: '', educationLevel: '', major: '', currentRole: '',
  experienceYears: '', skills: '', languages: '', workValues: [], workEnvironment: '',
  personalityType: '', interests: '', financialGoal: '', timeline: '', constraints: '',
  strengths: '', weaknesses: '', riskTolerance: 'medium', autonomyLevel: 'collaborative',
  communicationStyle: '', problemSolvingApproach: '', careerAspirations: ''
};

const initialMarketData: MarketData = {
  field: '', location: '', targetCompanies: '', industryFocus: '', companySize: '', keywords: '', specificSkills: ''
};

const initialAdaptiveProfile: AdaptiveProfile = {
  techScore: 0,
  isRushing: false,
  interactionCount: 0,
  preferredTools: [],
  activities: [], // Ensure initialized as array
  currentSkillLevel: 'beginner'
};

const STORAGE_KEY = 'masar_app_state_v5';

export const useAppEngine = () => {
  const [step, setStep] = useState<Step>(Step.WELCOME);
  const [view, setView] = useState<'wizard' | 'resources'>('wizard');
  const [userData, setUserData] = useState<SelfAwarenessData>(initialUserData);
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const [careerPoints, setCareerPoints] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [adaptiveProfile, setAdaptiveProfile] = useState<AdaptiveProfile>(initialAdaptiveProfile);
  
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        setUserData(parsed.userData || initialUserData);
        setMarketData(parsed.marketData || initialMarketData);
        setMarketAnalysis(parsed.marketAnalysis);
        setGeneratedPlan(parsed.generatedPlan);
        setCareerPoints(parsed.careerPoints || 0);
        setActivities(parsed.activities || []);
        setAppliedJobs(parsed.appliedJobs || []);
        setAdaptiveProfile(parsed.adaptiveProfile || initialAdaptiveProfile);
        if (parsed.step > Step.WELCOME) setStep(parsed.step);
      } catch (e) { console.error("Restore state error", e); }
    }
  }, []);

  useEffect(() => {
    const state: AppState = { 
        step, view, userData, marketData, marketAnalysis, generatedPlan, 
        careerPoints, activities, appliedJobs, 
        adaptiveProfile
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, view, userData, marketData, marketAnalysis, generatedPlan, careerPoints, activities, appliedJobs, adaptiveProfile]);

  const logActivity = useCallback(async (type: Activity['type'], score: number, metadata?: any) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(7),
      type,
      score,
      timestamp: new Date().toISOString(),
      metadata
    };

    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    
    const basePoints = 25;
    const bonus = Math.floor(score / 10);
    setCareerPoints(prev => prev + basePoints + bonus);

    // Trigger Adaptive AI analysis every 3 activities to re-evaluate the profile
    if (updatedActivities.length % 3 === 0) {
      try {
        const insight = await getAdaptivePerformanceAnalysis(
          { ...adaptiveProfile, activities: updatedActivities },
          marketData.field || 'General Path'
        );
        setAdaptiveProfile(prev => ({
          ...prev,
          performanceInsight: insight,
          currentSkillLevel: (insight.suggestedLevelAdjustment as any) || prev.currentSkillLevel
        }));
        showToast('تم تحديث بروفايلك الذكي بناءً على أدائك الأخير! ✨', 'success');
      } catch (e) {
        console.error("Adaptive analysis failed", e);
      }
    }
  }, [activities, adaptiveProfile, marketData.field, showToast]);

  const addPoints = useCallback((pts: number) => {
    setCareerPoints(prev => prev + pts);
  }, []);

  const updateAdaptive = useCallback((action: { type: 'msg' | 'upload' | 'import', text?: string, duration?: number }) => {
    setAdaptiveProfile(prev => {
        const updated = GamificationService.updateAdaptiveProfile(prev, action);
        return { ...updated, activities: prev.activities }; // preserve activities
    });
  }, []);

  const transition = (newStep: Step, dir: 'forward' | 'backward') => {
    setDirection(dir);
    setIsExiting(true);
    setTimeout(() => {
      setStep(newStep);
      setIsExiting(false);
    }, 400);
  };

  const nextStep = useCallback(() => transition(step + 1, 'forward'), [step]);
  const prevStep = useCallback(() => transition(step - 1, 'backward'), [step]);

  const handleSelfAwarenessSubmit = useCallback((data: SelfAwarenessData) => {
    setUserData(data);
    nextStep();
  }, [nextStep]);

  const handleSuggestionSelect = useCallback((title: string) => {
    setMarketData(prev => ({ ...prev, field: title }));
    nextStep();
  }, [nextStep]);

  const handleMarketSubmit = useCallback((data: MarketData, analysis: MarketAnalysisResult) => {
    setMarketData(data);
    setMarketAnalysis(analysis);
    nextStep();
  }, [nextStep]);

  const handleLoadSavedLegacy = useCallback((data: any) => {
    if (data.userData) setUserData(prev => ({...prev, ...data.userData}));
    if (data.marketData) setMarketData(data.marketData);
    if (data.marketAnalysis) setMarketAnalysis(data.marketAnalysis);
    if (data.generatedPlan) setGeneratedPlan(data.generatedPlan);
    if (data.careerPoints) setCareerPoints(data.careerPoints);
    if (data.step) setStep(data.step);
  }, []);

  return {
    state: { step, view, userData, marketData, marketAnalysis, generatedPlan, careerPoints, activities, appliedJobs, direction, isExiting, isSettingsOpen, adaptiveProfile },
    actions: { 
        setStep, setView, setUserData, setMarketData, setMarketAnalysis, setGeneratedPlan, 
        setCareerPoints, setAppliedJobs, setIsSettingsOpen, logActivity, updateAdaptive, addPoints,
        nextStep,
        prevStep,
        handleSelfAwarenessSubmit,
        handleSuggestionSelect,
        handleMarketSubmit,
        handleLoadSavedLegacy,
        handleRestart: () => { 
          setStep(Step.WELCOME); 
          setGeneratedPlan(null); 
          setUserData(initialUserData);
          setMarketData(initialMarketData);
          setMarketAnalysis(null);
          setAdaptiveProfile(initialAdaptiveProfile);
          setActivities([]);
          setAppliedJobs([]);
          localStorage.removeItem(STORAGE_KEY);
        }
    }
  };
};
