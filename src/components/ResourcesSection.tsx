
import React, { useState, Suspense } from 'react';
import Card from './UI/Card';
import ArchitectureView from './ArchitectureView';
import { AdaptiveProfile } from '../types';

const CareersLibrary = React.lazy(() => import('./CareersLibrary'));
const SuccessStories = React.lazy(() => import('./SuccessStories'));
const BlogSection = React.lazy(() => import('./BlogSection'));
const ToolsLibrary = React.lazy(() => import('./ToolsLibrary'));
const Dashboard = React.lazy(() => import('./Dashboard'));

type Tab = 'dashboard' | 'tools' | 'blog' | 'careers' | 'stories' | 'architecture';

interface ResourcesSectionProps {
  adaptiveProfile?: AdaptiveProfile;
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ adaptiveProfile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'tools', label: 'أدوات ذكية', icon: '🛠️' },
    { id: 'blog', label: 'المقالات', icon: '📰' },
    { id: 'careers', label: 'مكتبة المهن', icon: '🏛️' },
    { id: 'stories', label: 'قصص النجاح', icon: '🎙️' },
    { id: 'architecture', label: 'نظامنا التقني', icon: '⚙️' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in w-full">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
          🚀 رحلة تطويرك المهني
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          أدواتك للسيطرة على مستقبلك المهني بذكاء ووضوح.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 sticky top-20 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md p-2 rounded-2xl mx-auto max-w-fit shadow-sm border border-slate-100 dark:border-surface-800">
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
        <Suspense fallback={<div className="flex justify-center py-20 animate-pulse font-black text-slate-400">جاري تحميل البيانات...</div>}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tools' && <ToolsLibrary adaptiveProfile={adaptiveProfile} />}
          {activeTab === 'blog' && <BlogSection />}
          {activeTab === 'careers' && <CareersLibrary />}
          {activeTab === 'stories' && <SuccessStories />}
          {activeTab === 'architecture' && <ArchitectureView />}
        </Suspense>
      </div>
    </div>
  );
};

export default ResourcesSection;
