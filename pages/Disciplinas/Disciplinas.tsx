import React from 'react';
import MySubjectsBox from './components/MySubjectsBox';
import { BookOpen, Sparkles } from 'lucide-react';

const Disciplinas: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
              Disciplinas
            </h1>
            <p className="text-slate-500 text-sm">Gerencie sua grade acadêmica e materiais de aula.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-[#006c55] hover:bg-[#005a46] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#006c55]/20 transition-all active:scale-95">
            <Sparkles size={14} /> Solicitar Matrícula
          </button>
        </div>
      </div>

      {/* Main Subjects Box */}
      <section className="w-full">
        <MySubjectsBox />
      </section>

      {/* Additional Info / Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
        <div className="glass-panel p-8 rounded-3xl bg-white border border-slate-100 flex items-start gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Materiais Didáticos</h4>
            <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">Acesse repositórios de PDF, slides e gravações das aulas passadas.</p>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl bg-[#006c55]/5 border border-[#006c55]/10 flex items-start gap-5">
          <div className="w-14 h-14 bg-[#006c55] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#006c55]/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#006c55] uppercase tracking-tight mb-1">IA Tutor Lumina</h4>
            <p className="text-xs text-[#006c55]/60 font-bold leading-relaxed uppercase tracking-tighter">Use nossa IA para tirar dúvidas específicas sobre o conteúdo das suas disciplinas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disciplinas;