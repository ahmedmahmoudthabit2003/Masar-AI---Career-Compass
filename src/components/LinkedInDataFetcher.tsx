
import React, { useState, useEffect } from 'react';
import { LinkedInService } from '../services/linkedinService';
import { StorageService } from '../services/storageService';
import { LinkedInImportedData } from '../types';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';

interface LinkedInDataFetcherProps {
  onDataFetched: (data: Partial<{
    name: string;
    skills: string;
    interests: string;
    careerAspirations: string;
  }>) => void;
}

const LinkedInDataFetcher: React.FC<LinkedInDataFetcherProps> = ({ onDataFetched }) => {
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasLocalData, setHasLocalData] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    StorageService.getLinkedInData().then(data => {
      if (data) setHasLocalData(true);
    });
  }, []);

  const handleApplyData = (data: LinkedInImportedData) => {
    onDataFetched({
      name: data.name,
      skills: data.skills.join(', '),
      interests: data.headline,
      careerAspirations: data.summary.slice(0, 100)
    });
    showToast('تم تطبيق بيانات LinkedIn بنجاح', 'success');
  };

  const handleLoadStored = async () => {
    const data = await StorageService.getLinkedInData();
    if (data) {
      handleApplyData(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('يرجى رفع ملف PDF فقط', 'error');
      return;
    }

    setIsLoading(true);
    setProgress(20);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          setProgress(50);
          const base64 = (reader.result as string).split(',')[1];
          const parsedData = await LinkedInService.parseLinkedInPDF(base64);
          setProgress(90);
          await StorageService.saveLinkedInData(parsedData);
          setHasLocalData(true);
          handleApplyData(parsedData);
          setIsLoading(false);
        } catch (err) {
          showToast('فشل تحليل ملف PDF. تأكد من أنه ملف LinkedIn صالح.', 'error');
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!linkedInUrl.includes('linkedin.com/in/')) {
      showToast('رابط LinkedIn غير صحيح', 'error');
      return;
    }

    setIsLoading(true);
    setProgress(10);
    try {
      const raw = await LinkedInService.fetchProfileViaRapidAPI(linkedInUrl);
      const processed = LinkedInService.processProfileData(raw);
      await StorageService.saveLinkedInData(processed);
      setHasLocalData(true);
      handleApplyData(processed);
    } catch (err) {
      showToast('تعذر الجلب عبر الرابط. جرب خيار رفع ملف PDF (Save to PDF).', 'warning');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-surface-800 dark:to-surface-800/50 p-6 rounded-3xl border border-blue-100 dark:border-surface-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-surface-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">💼</div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">استيراد الملف الشخصي</h3>
              <p className="text-xs text-slate-500">وفر وقتك عبر استيراد بياناتك من LinkedIn</p>
            </div>
          </div>
          <div className="flex bg-white dark:bg-surface-700 p-1 rounded-xl border border-slate-200 dark:border-surface-600">
            <button 
              onClick={() => setIsUrlMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isUrlMode ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >رابط URL</button>
            <button 
              onClick={() => setIsUrlMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isUrlMode ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >ملف PDF</button>
          </div>
        </div>

        {isUrlMode ? (
          <div className="flex gap-3">
            <input 
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
              className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-sm"
            />
            <Button onClick={handleFetchUrl} isLoading={isLoading} disabled={!linkedInUrl} variant="primary">جلب</Button>
          </div>
        ) : (
          <div className="relative">
            <div className="border-2 border-dashed border-primary-200 dark:border-surface-600 rounded-2xl p-6 text-center bg-white/50 dark:bg-surface-900/50 hover:bg-white transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center">
                 <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-300">ارفع ملف PDF الخاص بـ LinkedIn</p>
                 <p className="text-[10px] text-slate-400 mt-1">More -> Save to PDF من صفحة ملفك</p>
              </div>
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-2"></div>
                <p className="text-xs font-black text-primary-600">جاري تحليل البيانات عبر AI...</p>
              </div>
            )}
          </div>
        )}

        {hasLocalData && !isLoading && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-surface-700 flex items-center justify-between">
            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              توجد بيانات مخزنة محلياً
            </span>
            <button 
              onClick={handleLoadStored}
              className="text-[10px] font-black text-primary-600 hover:underline"
            >
              استخدام البيانات السابقة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInDataFetcher;
