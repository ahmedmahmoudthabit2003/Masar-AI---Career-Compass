
import React, { useState, Suspense } from 'react';
import Card from './UI/Card';

const CareersLibrary = React.lazy(() => import('./CareersLibrary'));
const SuccessStories = React.lazy(() => import('./SuccessStories'));
const BlogSection = React.lazy(() => import('./BlogSection'));
const ToolsLibrary = React.lazy(() => import('./ToolsLibrary'));
const Dashboard = React.lazy(() => import('./Dashboard'));

type Tab = 'dashboard' | 'tools' | 'blog' | 'careers' | 'stories';

const ResourcesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'tools', label: 'أدوات ذكية', icon: '🛠️' },
    { id: 'blog', label: 'المقالات', icon: '📰' },
    { id: 'careers', label: 'مكتبة المهن', icon: '🏛️' },
    { id: 'stories', label: 'قصص النجاح', icon: '🎙️' }
  ];

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p className="font-bold">جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in w-full">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
          🚀 رحلة نجاحك المهني
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">أدواتك للسيطرة على مستقبلك المهني بذكاء ووضوح.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 sticky top-20 z-30 bg-surface-50/90 dark:bg-surface-900/90 backdrop-blur-md p-2 rounded-2xl mx-auto shadow-sm border border-slate-100 dark:border-surface-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
              ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-surface-800'}
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tools' && <ToolsLibrary />}
          {activeTab === 'blog' && <BlogSection />}
          {activeTab === 'careers' && <CareersLibrary />}
          {activeTab === 'stories' && <SuccessStories />}
        </Suspense>
      </div>
    </div>
  );
};

export default ResourcesSection;
