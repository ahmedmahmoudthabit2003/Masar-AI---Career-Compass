
import React, { Suspense, useEffect } from 'react';
import { Step } from './types';
import ResourcesSection from './components/ResourcesSection';
import { ToastProvider } from './contexts/ToastContext';
import { useAppEngine } from './hooks/useAppEngine';
import MainLayout from './layouts/MainLayout';

const WelcomeStep = React.lazy(() => import('./components/WelcomeStep'));
const SelfAwarenessStep = React.lazy(() => import('./components/SelfAwarenessStep'));
const CareerSuggestionsStep = React.lazy(() => import('./components/CareerSuggestionsStep'));
const MarketResearchStep = React.lazy(() => import('./components/MarketResearchStep'));
const PlanDisplayStep = React.lazy(() => import('./components/PlanDisplayStep'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse text-lg font-bold">جاري التحميل...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { state, actions } = useAppEngine();
  const { 
    step, view, userData, marketData, marketAnalysis, 
    generatedPlan, direction, isExiting, isSettingsOpen,
    careerPoints, adaptiveProfile 
  } = state;

  const getStepAnimation = () => {
    if (isExiting) {
      return direction === 'forward' ? 'animate-slide-out-right' : 'animate-slide-out-left';
    }
    return direction === 'forward' ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };
  
  return (
    <MainLayout
      view={view}
      step={step}
      careerPoints={careerPoints}
      isSettingsOpen={!!isSettingsOpen}
      onCloseSettings={() => actions.setIsSettingsOpen(false)}
      onOpenSettings={() => actions.setIsSettingsOpen(true)}
      onViewChange={actions.setView}
    >
        {view === 'resources' ? (
          <div className={`w-full max-w-7xl ${isExiting ? 'animate-slide-out-left' : 'animate-slide-in-right'}`}>
            <ResourcesSection />
          </div>
        ) : (
          <div className={`w-full ${step === Step.PLANNING ? 'max-w-5xl' : 'max-w-4xl'} ${getStepAnimation()}`} key={step}>
            <Suspense fallback={<LoadingFallback />}>
              {step === Step.WELCOME && <WelcomeStep onNext={actions.nextStep} onLoadSaved={(data) => { /* منطق التحميل مدمج في Hook */ }} />}
              {step === Step.CONVERSATIONAL_ASSESSMENT && (
                <SelfAwarenessStep 
                  initialData={userData} 
                  adaptiveProfile={adaptiveProfile}
                  onNext={(data) => { actions.setUserData(data); actions.nextStep(); }} 
                  onBack={actions.prevStep}
                  onUpdateAdaptive={actions.updateAdaptive}
                  onAddPoints={actions.logActivity}
                />
              )}
              {step === Step.SUGGESTIONS && (
                <CareerSuggestionsStep 
                  userData={userData} 
                  onSelect={(title) => { actions.setMarketData({ field: title }); actions.nextStep(); }} 
                  onBack={actions.prevStep} 
                />
              )}
              {step === Step.MARKET_RESEARCH && (
                <MarketResearchStep 
                  initialData={marketData} 
                  initialAnalysis={marketAnalysis} 
                  onNext={(data, analysis) => { actions.setMarketData(data); actions.setMarketAnalysis(analysis); actions.nextStep(); }} 
                  onBack={actions.prevStep} 
                />
              )}
              {step === Step.PLANNING && (
                <PlanDisplayStep 
                  userData={userData} 
                  marketData={marketData} 
                  marketAnalysis={marketAnalysis} 
                  initialPlan={generatedPlan} 
                  onRestart={actions.resetApp} 
                />
              )}
            </Suspense>
          </div>
        )}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
