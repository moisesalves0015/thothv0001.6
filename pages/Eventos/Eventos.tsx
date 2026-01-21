
import React from 'react';
import { Calendar, BellRing } from 'lucide-react';

const Eventos: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header">
        <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Eventos & Datas
        </h1>
        <p className="text-slate-500 text-sm">Fique por dentro de workshops, palestras e provas.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-[30px]">
        <div className="flex-1 h-[450px] glass-panel rounded-2xl flex flex-col p-6 border-dashed border-2 border-slate-300/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Calendário Semanal</h3>
            <div className="flex gap-1">
               {[1,2,3,4,5,6,7].map(d => <div key={d} className="w-6 h-6 rounded-md bg-slate-100"></div>)}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Calendar size={64} className="text-slate-100" />
          </div>
        </div>
        
        <div className="w-full lg:w-[315px] flex flex-col gap-[30px]">
          <div className="h-[210px] glass-panel rounded-2xl p-5 border-dashed border-2 border-slate-300/50">
            <div className="flex items-center gap-2 mb-4">
              <BellRing size={14} className="text-slate-300" />
              <div className="w-20 h-2 bg-slate-200/50 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-8 bg-slate-50 rounded-xl"></div>
              <div className="w-full h-8 bg-slate-50 rounded-xl"></div>
            </div>
          </div>
          <div className="flex-1 glass-panel rounded-2xl border-dashed border-2 border-slate-300/50 flex items-center justify-center">
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">Quick View</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventos;
