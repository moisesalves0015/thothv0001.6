import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, FlaskConical } from 'lucide-react';

const ResearchSuggestionsBox: React.FC = () => {
    const navigate = useNavigate();
    // Placeholder data since Pesquisas is "Coming Soon"
    const researches = [
        { 
            id: 1, 
            title: 'Inteligência Artificial na Educação', 
            category: 'Tecnologia',
            imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&auto=format&fit=crop&q=80'
        },
        { 
            id: 2, 
            title: 'Sustentabilidade Urbana', 
            category: 'Meio Ambiente',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80'
        },
        { 
            id: 3, 
            title: 'Data Science & Humanidades', 
            category: 'Ciência de Dados',
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80'
        },
        { 
            id: 4, 
            title: 'Exploração Espacial e Sensores', 
            category: 'Astronomia',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80'
        }
    ];

    return (
        <div className="w-full liquid-glass rounded-[24px] flex flex-col p-4 shadow-xl relative overflow-hidden transition-all duration-500 group min-h-[180px]">
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between mb-1.5">
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Pesquisas Recentes</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-0.5">
                        Expanda seu conhecimento
                    </span>
                </div>
                <button
                    onClick={() => navigate('/pesquisas')}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {researches.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate('/pesquisas')}
                            className="flex-shrink-0 w-[190px] flex flex-col gap-2 p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20 group/card shadow-sm"
                        >
                            <div className="w-full h-20 rounded-xl overflow-hidden relative group-hover/card:scale-[1.02] transition-transform border border-slate-100 dark:border-slate-700">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[8px] font-bold rounded uppercase font-mono tracking-wider">
                                    {item.category}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-0.5">{item.title}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-[#006c55] font-bold">
                                    <BookOpen size={10} />
                                    <span className="truncate uppercase tracking-wider text-[9px]">{item.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default ResearchSuggestionsBox;
