
import React, { useState } from 'react';
import Button from './UI/Button';

interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  readTime: string;
  date: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    category: "رؤية 2030",
    title: "مستقبل الوظائف في السعودية: أين تكمن الفرص الحقيقية؟",
    excerpt: "تحليل شامل لنمو القطاعات غير النفطية وكيف يمكنك التموضع استراتيجياً للاستفادة من موجة التغيير القادمة.",
    readTime: "6 دقائق",
    date: "أكتوبر 2024",
    image: "🇸🇦",
    featured: true,
    content: `<p class="text-lg">تعتبر رؤية 2030 المحرك الأساسي لإعادة هيكلة سوق العمل في المملكة. الفرص الآن لم تعد تقتصر على المجالات التقليدية، بل توسعت لتشمل التقنية المالية، السياحة المستدامة، والطاقة المتجددة.</p>`
  },
  {
    id: 2,
    category: "تطوير مهني",
    title: "قوة 'منطق التأثير' في السير الذاتية",
    excerpt: "لماذا لم يعد كافياً سرد المسؤوليات، وكيف تبدأ بتحويل كل جملة في سيرتك الذاتية إلى قصة نجاح رقمية.",
    readTime: "4 دقائق",
    date: "سبتمبر 2024",
    image: "📈",
    content: `<p>منطق التأثير هو السر وراء تجاوز أنظمة ATS وجذب انتباه مدراء التوظيف. ركز على النتيجة (Result) بدلاً من الفعل (Action) فقط.</p>`
  },
  {
    id: 3,
    category: "ذكاء اصطناعي",
    title: "العمل مع الـ AI: كيف تصبح 'التعاوني الماهر'",
    excerpt: "الذكاء الاصطناعي لن يستبدلك، بل سيستبدلك من يعرف استخدامه بشكل أفضل. تعلم كيف تدمج Gemini و GPT في سير عملك اليومي.",
    readTime: "5 دقائق",
    date: "أغسطس 2024",
    image: "🤖",
    content: `<p>المهارات المطلوبة لعام 2025 تركز على الذكاء العاطفي والقدرة على توجيه نماذج الذكاء الاصطناعي للحصول على نتائج دقيقة.</p>`
  }
];

const BlogSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const activeArticle = ARTICLES.find(a => a.id === selectedArticle);
  const featured = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const others = ARTICLES.filter(a => a.id !== featured.id);

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto">
      {!selectedArticle ? (
        <div className="space-y-12">
            {/* Featured Article Section */}
            <div 
                onClick={() => setSelectedArticle(featured.id)}
                className="group cursor-pointer bg-white dark:bg-surface-800 rounded-[3rem] p-8 md:p-12 shadow-2xl hover:shadow-primary-500/10 border border-slate-100 dark:border-surface-700 transition-all duration-500 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden"
            >
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-[100px] -z-0"></div>
                
                <div className="w-full lg:w-1/2 h-64 md:h-80 bg-slate-50 dark:bg-surface-700 rounded-[2rem] flex items-center justify-center text-[10rem] shadow-inner relative z-10 transform group-hover:scale-105 transition-transform duration-700">
                    {featured.image}
                </div>
                
                <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-xs font-black text-primary-600 bg-primary-100 dark:bg-primary-900/40 px-4 py-1.5 rounded-full uppercase tracking-widest">مقال الأسبوع المميز</span>
                        <span className="text-xs text-slate-400 font-bold">{featured.date} • {featured.readTime}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors leading-tight mb-6">{featured.title}</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{featured.excerpt}</p>
                    <div className="flex items-center text-primary-600 font-black gap-2 text-lg">
                        اقرأ الآن 
                        <svg className="w-6 h-6 rtl:rotate-180 transform group-hover:translate-x-[-8px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                </div>
            </div>

            {/* Grid for Other Articles */}
            <div className="grid gap-8 md:grid-cols-2">
            {others.map((article) => (
                <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article.id)}
                className="group cursor-pointer bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-100 dark:border-surface-700 transition-all duration-300 flex flex-col h-full hover:-translate-y-2"
                >
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-surface-700 px-3 py-1 rounded-lg">{article.category}</span>
                    <span className="text-xs text-slate-400 font-bold">{article.readTime}</span>
                </div>
                <div className="flex items-center gap-6 mb-4">
                    <div className="text-5xl bg-slate-50 dark:bg-surface-700 w-20 h-20 flex items-center justify-center rounded-2xl shrink-0 group-hover:rotate-6 transition-transform">{article.image}</div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors leading-snug">{article.title}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">{article.excerpt}</p>
                </div>
            ))}
            </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-surface-700 overflow-hidden animate-fade-in-up max-w-4xl mx-auto">
           {activeArticle && (
             <>
               <div className="bg-slate-50 dark:bg-surface-900 p-8 md:p-12 border-b border-slate-100 dark:border-surface-700 relative">
                  <button onClick={() => setSelectedArticle(null)} className="mb-8 text-slate-400 hover:text-primary-600 transition-all flex items-center gap-2 text-sm font-black group">
                    <svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    العودة لمركز المعرفة
                  </button>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 leading-tight">{activeArticle.title}</h2>
                  <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                     <span>📅 {activeArticle.date}</span>
                     <span>⏱️ {activeArticle.readTime} قراءة</span>
                  </div>
               </div>
               <div className="p-8 md:p-12 prose prose-xl dark:prose-invert max-w-none font-medium leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: activeArticle.content }} />
               </div>
               <div className="p-8 border-t border-slate-100 dark:border-surface-700 bg-slate-50 dark:bg-surface-900 flex justify-center">
                  <Button onClick={() => setSelectedArticle(null)} variant="secondary" size="lg">استكشاف مقالات أخرى</Button>
               </div>
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default BlogSection;
