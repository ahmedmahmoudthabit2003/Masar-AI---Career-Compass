
import React from 'react';
import { motion } from 'framer-motion';

const ArchitectureView = () => {
  const nodes = [
    { id: 'ui', label: 'واجهة المستخدم (React)', icon: '📱', color: 'bg-blue-500' },
    { id: 'val', label: 'التحقق (Zod)', icon: '🛡️', color: 'bg-green-500' },
    { id: 'client', label: 'genaiClient', icon: '🔌', color: 'bg-purple-500' },
    { id: 'ai', label: 'Gemini 3.0 Pro', icon: '🧠', color: 'bg-indigo-600' },
    { id: 'search', label: 'Google Search', icon: '🌐', color: 'bg-amber-500' }
  ];

  return (
    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden relative">
      <div className="text-center mb-10">
        <h3 className="text-xl font-bold text-white mb-2">البنية الهندسية لـ مسار AI</h3>
        <p className="text-slate-400 text-sm">كيف تتدفق بياناتك بأمان وذكاء</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
        {nodes.map((node, i) => (
          <React.Fragment key={node.id}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`${node.color} p-4 rounded-2xl text-white text-center w-full md:w-32 shadow-lg relative z-10`}
            >
              <div className="text-2xl mb-2">{node.icon}</div>
              <div className="text-[10px] font-bold leading-tight">{node.label}</div>
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.2 + 0.5 }}
                className="hidden md:block h-0.5 bg-slate-700 flex-1 relative"
              >
                <motion.div 
                   animate={{ x: [0, 100], opacity: [0, 1, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="absolute top-[-4px] w-2 h-2 rounded-full bg-white blur-[2px]"
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
         <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-slate-400 mb-1 uppercase">Local Security</h4>
            <p className="text-xs text-white">بياناتك تعالج محلياً قبل التشفير والإرسال.</p>
         </div>
         <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-slate-400 mb-1 uppercase">Grounding</h4>
            <p className="text-xs text-white">ربط النتائج بالواقع عبر Google Search المباشر.</p>
         </div>
         <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-slate-400 mb-1 uppercase">Thinking</h4>
            <p className="text-xs text-white">استخدام 'ميزانية التفكير' لتحليل الخطط المعقدة.</p>
         </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
