
import React, { useState, useEffect, useRef } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../../services/geminiService';
import { InterviewQuestion, InterviewFeedback, InterviewPersona } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const PERSONAS: InterviewPersona[] = [
  { id: '1', name: 'المدير التنفيذي الصارم', role: 'CEO / CTO', description: 'يركز على النتائج الملموسة والذكاء الاستراتيجي وسرعة البديهة.', style: 'harsh', avatar: '👨🏻‍💼' },
  { id: '2', name: 'المنسق الودود', role: 'HR Manager', description: 'يهتم بالتوافق الثقافي، العمل الجماعي، والذكاء العاطفي.', style: 'empathetic', avatar: '👩🏻‍💼' },
  { id: '3', name: 'المهندس العميق', role: 'Technical Lead', description: 'يغوص في التفاصيل التقنية، الخوارزميات، ومنطق حل المشكلات.', style: 'technical', avatar: '👨🏻‍💻' },
];

const MockInterviewer = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<InterviewPersona | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
      showToast('فشل تحميل الأسئلة. جرب مرة أخرى.', 'error');
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
      setAnswers(prev => ({ ...prev, [q.id]: currentInput }));
      setState('feedback');
    } catch (e) {
      showToast('فشل التقييم الذكي.', 'error');
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = questions[currentIdx];
  const currentFeedback = feedbacks[currentQuestion?.id];

  return (
    <div className="animate-fade-in w-full pb-10">
      <AnimatePresence mode="wait">
        {state === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="product-card p-8 md:p-12 border-none shadow-2xl">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🎤</div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">محاكي المقابلات الشخصية الذكي</h3>
                <p className="text-slate-500 mt-3 font-medium text-lg">اختر وظيفتك ونمط المقابلة للبدء في جلسة محاكاة حقيقية.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {PERSONAS.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedPersona(p)}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-right group relative overflow-hidden ${
                      selectedPersona?.id === p.id 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-xl scale-[1.03]' 
                      : 'border-slate-100 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-primary-200'
                    }`}
                  >
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{p.avatar}</div>
                    <h4 className="font-black text-xl text-slate-800 dark:text-white mb-1">{p.name}</h4>
                    <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mb-3">{p.role}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.description}</p>
                    {selectedPersona?.id === p.id && <div className="absolute top-4 left-4 text-primary-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg></div>}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="المسمى الوظيفي المستهدف"
                  className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-950 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold shadow-sm"
                />
                <Button onClick={handleStart} isLoading={loading} disabled={!jobTitle || !selectedPersona} variant="gradient" size="xl" className="rounded-2xl px-12 shadow-xl">بدء الجلسة ➜</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {state === 'interview' && currentQuestion && (
          <motion.div key="interview" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="product-card p-8 md:p-12 border-none shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-surface-800">
                  <div className="h-full bg-primary-500 transition-all duration-1000 shadow-[0_0_10px_#4A90E2]" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
               </div>
               
               <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-surface-900 px-3 py-1 rounded-lg">السؤال {currentIdx + 1} من {questions.length}</span>
                  <div className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-2xl font-black text-sm shadow-sm border border-red-100">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     {formatTime(timer)}
                  </div>
               </div>

               <div className="flex items-start gap-8 mb-12">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-surface-900 flex items-center justify-center text-6xl shadow-inner shrink-0">{selectedPersona?.avatar}</div>
                  <div className="pt-2">
                    <h4 className="text-xs font-black text-primary-600 uppercase mb-3 tracking-widest">نوع السؤال: {currentQuestion.type}</h4>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">{currentQuestion.question}</p>
                  </div>
               </div>

               <textarea 
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder="ابدأ بكتابة إجابتك هنا بوضوح... (حاول استخدام نموذج STAR)"
                  className="w-full h-52 p-8 rounded-[2.5rem] border border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 focus:ring-8 focus:ring-primary-100/50 focus:bg-white outline-none transition-all mb-8 resize-none font-medium leading-relaxed text-lg shadow-inner"
               />

               <div className="flex justify-between items-center">
                  <Button variant="secondary" onClick={() => {if(confirm('هل أنت متأكد من إنهاء الجلسة؟')) setState('setup')}} className="rounded-xl">إنهاء المقابلة</Button>
                  <Button onClick={handleAnswerSubmit} isLoading={evaluating} disabled={!currentInput.trim()} variant="gradient" size="lg" className="px-12 rounded-2xl shadow-xl">تسليم الإجابة لـ AI</Button>
               </div>
            </Card>
          </motion.div>
        )}

        {state === 'feedback' && currentFeedback && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="product-card p-8 md:p-12 border-none shadow-2xl">
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-surface-700">
                  <span className="text-3xl">⚡</span>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">تقييم الإجابة الذكي</h3>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <div className="bg-slate-50 dark:bg-surface-900 p-6 rounded-3xl border border-slate-100 dark:border-surface-700 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الوضوح</p>
                     <p className="text-3xl font-black text-blue-600">{currentFeedback.clarity}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-surface-900 p-6 rounded-3xl border border-slate-100 dark:border-surface-700 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الكلمات المفتاحية</p>
                     <p className="text-3xl font-black text-purple-600">{currentFeedback.keywords}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-surface-900 p-6 rounded-3xl border border-slate-100 dark:border-surface-700 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الثقة</p>
                     <p className="text-3xl font-black text-emerald-600">{currentFeedback.confidence}%</p>
                  </div>
                  <div className="bg-primary-600 p-6 rounded-3xl text-center text-white shadow-xl shadow-primary-500/20 scale-110 md:scale-100">
                     <p className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">النتيجة الكلية</p>
                     <p className="text-4xl font-black">{currentFeedback.overallScore}%</p>
                  </div>
               </div>

               <div className="space-y-8 mb-12">
                  <div className="bg-blue-50/50 dark:bg-surface-900/50 p-8 rounded-[2rem] border border-blue-100 dark:border-surface-700">
                     <h5 className="font-black text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2"><span className="text-lg">📄</span> تحليل الخبير:</h5>
                     <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{currentFeedback.feedbackText}</p>
                  </div>

                  <div className="space-y-4">
                     <h5 className="font-black text-slate-800 dark:text-white px-2">💡 نصائح لتحسين هذه الإجابة:</h5>
                     <div className="grid gap-4">
                        {currentFeedback.suggestions.map((s, i) => (
                           <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-surface-800 border border-slate-100 dark:border-surface-700 rounded-2xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 group hover:border-primary-200 transition-colors">
                              <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">✨</span>
                              {s}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex justify-between items-center border-t border-slate-100 dark:border-surface-700 pt-8">
                  <Button variant="outline" onClick={() => {setTimer(0); setState('interview')}} className="rounded-xl px-8">إعادة إجابة هذا السؤال</Button>
                  <Button variant="primary" onClick={nextQuestion} size="lg" className="px-14 rounded-2xl shadow-xl">السؤال التالي ➜</Button>
               </div>
            </Card>
          </motion.div>
        )}

        {state === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="product-card p-12 md:p-20 border-none shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-0"></div>
                <div className="relative z-10">
                   <div className="text-8xl mb-8">🏆</div>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">تهانينا! أتممت المقابلة بنجاح</h3>
                   <p className="text-slate-500 max-w-lg mx-auto mb-12 text-lg leading-relaxed font-medium">لقد أثبتّ قدرة عالية في الرد على {selectedPersona?.name}. تم تسجيل نتائجك وتحديث 'معدل الجاهزية' في لوحة التحكم.</p>
                   
                   <div className="bg-primary-50 dark:bg-primary-900/30 p-10 rounded-[3rem] border border-primary-100 dark:border-surface-700 mb-12 max-w-md mx-auto shadow-inner">
                      <p className="text-xs font-black text-primary-600 uppercase mb-3 tracking-widest">متوسط نتيجة المقابلة</p>
                      <p className="text-7xl font-black text-primary-700 dark:text-primary-400">
                        {Math.round((Object.values(feedbacks).reduce((acc: number, f: InterviewFeedback) => acc + (f.overallScore || 0), 0) as number) / (questions.length || 1))}%
                      </p>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-5 justify-center">
                      <Button onClick={() => setState('setup')} variant="gradient" size="xl" className="px-14 rounded-2xl shadow-2xl">بدء مقابلة جديدة</Button>
                      <Button variant="secondary" size="xl" className="px-14 rounded-2xl border-2" onClick={() => window.location.reload()}>الذهاب للوحة التحكم</Button>
                   </div>
                </div>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockInterviewer;
