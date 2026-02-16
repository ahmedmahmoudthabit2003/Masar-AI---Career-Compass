
import React, { useState, useEffect, useRef } from 'react';
import { SelfAwarenessData, ChatMessage, AdaptiveProfile } from '../types';
import { getProbingQuestion } from '../services/geminiService';
import Card from './UI/Card';
import Button from './UI/Button';
import { useToast } from '../contexts/ToastContext';
import { POINTS_MAP } from '../services/gamificationService';

interface Props {
  initialData: SelfAwarenessData;
  adaptiveProfile?: AdaptiveProfile;
  onNext: (data: SelfAwarenessData) => void;
  onBack: () => void;
  onUpdateAdaptive?: (action: any) => void;
  onAddPoints?: (pts: number) => void;
}

const SelfAwarenessStep: React.FC<Props> = ({ adaptiveProfile, onNext, onBack, onUpdateAdaptive, onAddPoints }) => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgStartTime, setMsgStartTime] = useState<number>(Date.now());
  const { showToast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chat.length === 0) startAssessment();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const startAssessment = async () => {
    setLoading(true);
    const q = await getProbingQuestion([]);
    setChat([{ id: '1', role: 'model', text: q }]);
    setLoading(false);
    setMsgStartTime(Date.now());
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const duration = Date.now() - msgStartTime;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    
    // Adaptive Tracking
    onUpdateAdaptive?.({ type: 'msg', text: input, duration });
    onAddPoints?.(POINTS_MAP.CHAT_MESSAGE);

    setChat(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...chat, userMsg].map(m => ({ role: m.role, text: m.text }));
      
      // If user is rushing, request shorter scenarios from AI
      const systemMod = adaptiveProfile?.isRushing ? " (Keep the scenario extremely short and simple as the user is in a hurry)" : "";
      const nextQ = await getProbingQuestion(history.map(h => ({...h, text: h.text + systemMod})));
      
      setChat(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: nextQ }]);
    } catch (e) {
      showToast("عذراً، حدث خطأ في التواصل.", "error");
    } finally {
      setLoading(false);
      setMsgStartTime(Date.now());
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 font-bold text-sm mb-4">
          {adaptiveProfile?.isRushing && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] ml-2 animate-pulse">وضع المعاينة السريعة</span>}
          التقييم المعرفي النشط
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">مرآة القدرات 🪞</h2>
        <p className="text-slate-500 mt-2">نحلل أسلوبك في التفكير لإيجاد المسار الأنسب.</p>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-slate-200 dark:border-surface-700 h-[500px] flex flex-col shadow-2xl overflow-hidden mb-6 relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {chat.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-primary-600 text-white rounded-br-sm' 
                : 'bg-slate-50 dark:bg-surface-700 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-surface-600'
              }`}>
                <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-slate-100 dark:bg-surface-700 px-4 py-3 rounded-2xl flex gap-1 items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-slate-50 dark:bg-surface-900 border-t border-slate-100 dark:border-surface-700">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="أرنا كيف ستحل هذا الموقف..."
              className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} className="w-14 h-14 rounded-2xl">
              <svg className="w-6 h-6 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/50 dark:bg-surface-800/50 backdrop-blur p-4 rounded-2xl border border-slate-200 dark:border-surface-700">
        <Button onClick={onBack} variant="secondary">رجوع</Button>
        <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">اكتمال التحليل</span>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-500" style={{width: `${Math.min(chat.length * 15, 100)}%`}}></div>
                </div>
            </div>
        </div>
        <Button 
          onClick={() => onNext({} as any)} 
          disabled={chat.length < 4}
          variant="gradient"
          className="px-8 shadow-xl"
        >
          متابعة
        </Button>
      </div>
    </div>
  );
};

export default SelfAwarenessStep;
