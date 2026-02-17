
import React, { useState, useEffect, useRef } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../../services/geminiService';
import { InterviewQuestion, InterviewFeedback, InterviewPersona } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const PERSONAS: InterviewPersona[] = [
  { id: '1', name: 'المدير الصارم', role: 'CEO', description: 'يركز على النتائج الملموسة وسرعة البديهة.', style: 'harsh', avatar: '👨🏻‍💼' },
  { id: '2', name: 'المنسق الودود', role: 'HR Manager', description: 'يهتم بالتوافق الثقافي والذكاء العاطفي.', style: 'empathetic', avatar: '👩🏻‍💼' },
  { id: '3', name: 'المهندس التقني', role: 'Tech Lead', description: 'يغوص في التفاصيل والمنطق البرمجي.', style: 'technical', avatar: '👨🏻‍💻' },
];

const MockInterviewer = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<InterviewPersona | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Record<string, InterviewFeedback>>({});
  const [state, setState] = useState<'setup' | 'interview' | 'feedback' | 'summary'>('setup');
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [timer, setTimer] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: any;
    if (state === 'interview' && !evaluating) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state, evaluating]);

  const handleStart = async () => {
    if (!jobTitle || !selectedPersona) return;
    setLoading(true);
    try {
      const qs = await generateInterviewQuestions(jobTitle, {} as any);
      setQuestions(qs);
      setState('interview');
      setTimer(0);
    } catch (e) {
      showToast('فشل تحميل الأسئلة.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentInput.trim()) return;
    setEvaluating(true);
    const q = questions[currentIdx];
    try {
      const feedback = await evaluateInterviewAnswer(q.question, currentInput, jobTitle);
      setFeedbacks(prev => ({ ...prev, [q.id]: feedback }));
      setState('feedback');
    } catch (e) {
      showToast('فشل التقييم.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCurrentInput('');
      setTimer(0);
      setState('interview');
    } else {
      setState('summary');
    }
  };

  const currentQuestion = questions[currentIdx];
  const currentFeedback = feedbacks[currentQuestion?.id];

  return (
    <div className="animate-fade-in w-full pb-10">
      <AnimatePresence mode="wait">
        {state === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="product-card p-10 border-none shadow-2xl">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">محاكي المقابلات المطور 🎤</h3>
                <p className="text-slate-500 mt-2">اختر شخصية المحاور والوظيفة للبدء.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {PERSONAS.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedPersona(p)}
                    className={`p-6 rounded-3xl border-2 transition-all text-right ${selectedPersona?.id === p.id ? 'border-primary-500 bg-primary-50 shadow-lg scale-105' : 'border-slate-100 hover:border-primary-200'}`}
                  >
                    <div className="text-4xl mb-4">{p.avatar}</div>
                    <h4 className="font-black text-lg mb-1">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="المسمى الوظيفي (مثال: AI Engineer)"
                  className="flex-1 p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 outline-none font-bold shadow-sm"
                />
                <Button onClick={handleStart} isLoading={loading} disabled={!jobTitle || !selectedPersona} variant="gradient" className="px-10 rounded-2xl">بدء المحاكاة</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {state === 'interview' && currentQuestion && (
          <motion.div key="interview" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="product-card p-10 border-none shadow-2xl relative">
               <div className="flex justify-between items-center mb-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">سؤال {currentIdx + 1} / {questions.length}</span>
                  <div className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl font-black text-sm">⏱️ {Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}</div>
               </div>

               <div className="flex items-start gap-6 mb-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-5xl shrink-0 shadow-inner">{selectedPersona?.avatar}</div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight pt-2">{currentQuestion.question}</p>
               </div>

               <textarea 
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder="اكتب إجابتك هنا بوضوح..."
                  className="w-full h-48 p-6 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all mb-8 font-medium text-lg"
               />

               <div className="flex justify-end">
                  <Button onClick={handleAnswerSubmit} isLoading={evaluating} disabled={!currentInput.trim()} variant="gradient" size="lg" className="px-12 rounded-2xl shadow-xl">تسليم الإجابة لـ AI</Button>
               </div>
            </Card>
          </motion.div>
        )}

        {state === 'feedback' && currentFeedback && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="product-card p-10 border-none shadow-2xl">
               <h3 className="text-2xl font-black mb-10 pb-6 border-b border-slate-100">تقييم الإجابة الذكي ⚡</h3>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-slate-400 mb-1">الوضوح</p>
                     <p className="text-2xl font-black text-blue-600">{currentFeedback.clarity}%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-slate-400 mb-1">الكلمات المفتاحية</p>
                     <p className="text-2xl font-black text-purple-600">{currentFeedback.keywords}%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-slate-400 mb-1">الثقة</p>
                     <p className="text-2xl font-black text-emerald-600">{currentFeedback.confidence}%</p>
                  </div>
                  <div className="bg-primary-600 p-4 rounded-2xl text-center text-white shadow-lg">
                     <p className="text-[10px] font-black opacity-80 mb-1">النتيجة</p>
                     <p className="text-3xl font-black">{currentFeedback.overallScore}%</p>
                  </div>
               </div>

               <div className="space-y-6 mb-10">
                  <div className="bg-blue-50 p-6 rounded-2xl">
                     <p className="text-sm font-bold text-blue-800 leading-relaxed">{currentFeedback.feedbackText}</p>
                  </div>
                  <div className="grid gap-3">
                     {currentFeedback.suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-700">
                           <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">✨</span> {s}
                        </div>
                     ))}
                  </div>
               </div>

               <Button onClick={nextQuestion} fullWidth variant="primary" size="lg" className="rounded-2xl">السؤال التالي</Button>
            </Card>
          </motion.div>
        )}

        {state === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="product-card p-12 border-none shadow-2xl text-center">
                <div className="text-8xl mb-6">🏆</div>
                <h3 className="text-4xl font-black text-slate-900 mb-4">أداء مهني متميز!</h3>
                <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg">لقد أكملت المقابلة الافتراضية بنجاح. تم تسجيل نتائجك وتحديث 'معدل الجاهزية' في لوحة التحكم الخاصة بك.</p>
                <Button onClick={() => setState('setup')} variant="gradient" size="xl" className="px-14 rounded-2xl">بدء محاكاة جديدة</Button>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockInterviewer;
