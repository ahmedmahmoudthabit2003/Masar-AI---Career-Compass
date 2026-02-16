
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { generateLinkedInContent, generateConnectionRequest } from '../../services/geminiService';
import { useToast } from '../../contexts/ToastContext';

const LinkedInHelper = () => {
  const [mode, setMode] = useState<'bio' | 'post' | 'connect'>('bio');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let res = "";
      if (mode === 'connect') {
         res = await generateConnectionRequest("Recruiter", input);
      } else {
         res = await generateLinkedInContent(mode as any, input);
      }
      setOutput(res);
      showToast("تم توليد المحتوى بنجاح", "success");
    } catch (e) { showToast("فشل التوليد", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in space-y-6">
       <Card className="product-card border-none shadow-2xl p-8">
          <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 dark:bg-surface-900 p-2 rounded-2xl">
             <button onClick={() => setMode('bio')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'bio' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>✨ Headline/Bio</button>
             <button onClick={() => setMode('post')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'post' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>📰 Post (Contextual)</button>
             <button onClick={() => setMode('connect')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'connect' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>🤝 Connection Request</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="block text-sm font-black text-slate-700 dark:text-white">
                   {mode === 'bio' ? 'أدخل خبراتك الأساسية' : mode === 'post' ? 'عن ماذا تريد أن تكتب؟' : 'لماذا تريد التواصل مع هذا الشخص؟'}
                </label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="w-full p-5 rounded-3xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 focus:ring-4 focus:ring-primary-100 outline-none resize-none"
                  placeholder="مثال: أريد التواصل مع مدير توظيف في شركة Aramco مهتم بمشاريع الاستدامة..."
                />
                <Button onClick={handleGenerate} isLoading={loading} fullWidth size="xl" variant="gradient">توليد المحتوى الاستراتيجي</Button>
             </div>

             <div className="bg-primary-50/30 dark:bg-surface-900/50 rounded-3xl p-8 border border-primary-100 dark:border-surface-700 relative min-h-[300px]">
                {output ? (
                   <div className="animate-fade-in-up">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-primary-600 bg-primary-100 px-3 py-1 rounded-full uppercase">Strategic Output</span>
                        <button onClick={() => {navigator.clipboard.writeText(output); showToast("تم النسخ!", "info")}} className="text-xs text-primary-600 font-bold hover:underline">نسخ النص</button>
                     </div>
                     <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</p>
                   </div>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                      <div className="text-6xl mb-4">✍️</div>
                      <p className="text-sm font-bold">سيظهر المحتوى المولد هنا بمنطق 'تأثير الشبكة'</p>
                   </div>
                )}
             </div>
          </div>
       </Card>
    </div>
  );
};

export default LinkedInHelper;
