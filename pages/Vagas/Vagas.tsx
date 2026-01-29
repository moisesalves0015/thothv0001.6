
import React from 'react';
import { Briefcase } from 'lucide-react';

const Vagas: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header hidden lg:block">
        <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Oportunidades
        </h1>
        <p className="text-slate-500 text-sm">Encontre estágios e vagas de emprego recomendadas para você.</p>
      </div>

      <div className="w-full h-[500px] glass-panel rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-slate-300">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Briefcase size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Em Breve</h3>
        <p className="text-slate-400 text-sm mt-2">Mural de vagas em processamento.</p>
      </div>
    </div>
  );
};

export default Vagas;
