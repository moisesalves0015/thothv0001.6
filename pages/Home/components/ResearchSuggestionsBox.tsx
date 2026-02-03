import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, FlaskConical } from 'lucide-react';

const ResearchSuggestionsBox: React.FC = () => {
    const navigate = useNavigate();
    // Placeholder data since Pesquisas is "Coming Soon"
    const researches = [
        { id: 1, title: 'Inteligência Artificial na Educação', category: 'Tecnologia' },
        { id: 2, title: 'Sustentabilidade Urbana', category: 'Meio Ambiente' }
    ];

    return (
        <div className="w-full liquid-glass rounded-[24px] flex flex-col p-5 shadow-2xl relative overflow-hidden transition-all duration-500 group min-h-[180px]">
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Pesquisas Recentes</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
                        Expanda seu conhecimento
                    </span>
                </div>
                <button
                    onClick={() => navigate('/pesquisas')}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                    {researches.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate('/pesquisas')}
                            className="flex-shrink-0 w-[200px] flex flex-col gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20 group/card"
                        >
                            <div className="w-full h-24 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 group-hover/card:scale-[1.02] transition-transform">
                                <FlaskConical size={24} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1">{item.title}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    <BookOpen size={10} />
                                    <span className="truncate">{item.category}</span>
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
