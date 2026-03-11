
import React from 'react';
import MySubjectsBox from './components/MySubjectsBox';
import UnifiedScheduler from './components/UnifiedScheduler';
import { BookOpen, Sparkles } from 'lucide-react';

const Disciplinas: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Disciplinas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie sua grade acadêmica e calendário unificado.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-[#006c55] hover:bg-[#005a46] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#006c55]/20 transition-all active:scale-95">
            <Sparkles size={14} /> Solicitar Matrícula
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Row 1: Subjects Feed (Full Width) */}
        <section className="lg:col-span-3">
          <MySubjectsBox />
        </section>

        {/* Row 2: Unified Calendar (2 Cols) + Widgets (1 Col) */}
        <section className="lg:col-span-2 h-full">
          <UnifiedScheduler />
        </section>

        <section className="lg:col-span-1 flex flex-col gap-6">
          {/* Widget 1: Materiais */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">Materiais</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Repositório Central</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Acesse todos os PDFs, slides e gravações das suas aulas em um único lugar organizado.
            </p>
            <button className="w-full py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Acessar Arquivos
            </button>
          </div>

          {/* Widget 2: IA Tutor */}
          <div className="glass-panel p-6 rounded-3xl bg-[#006c55]/5 border border-[#006c55]/10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#006c55] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#006c55]/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#006c55] dark:text-emerald-400 uppercase tracking-tight mb-0.5">IA Tutor Lumina</h4>
                <p className="text-[10px] text-[#006c55]/60 dark:text-emerald-400/60 font-bold uppercase tracking-wide">Tire Dúvidas Agora</p>
              </div>
            </div>
            <p className="text-xs text-[#006c55]/80 dark:text-emerald-400/80 font-medium leading-relaxed">
              Nossa IA analisa o conteúdo das suas disciplinas para responder perguntas específicas.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Disciplinas;