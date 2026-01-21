
import React from 'react';
import { Users, UserPlus } from 'lucide-react';

const Conexoes: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header">
        <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Minha Rede
        </h1>
        <p className="text-slate-500 text-sm">Gerencie suas conexões e encontre novos talentos.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-[20px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="aspect-[3/4] glass-panel rounded-3xl p-4 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 group hover:border-[#006c55]/30 transition-all">
             <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition-transform">
               <Users size={24} />
             </div>
             <div className="w-16 h-2 bg-slate-100 rounded-full mb-2"></div>
             <div className="w-10 h-1.5 bg-slate-50 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="w-full h-[200px] glass-panel rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-slate-300/50">
        <UserPlus size={32} className="text-slate-200 mb-3" />
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Solicitações Pendentes</h3>
        <div className="mt-4 flex gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Conexoes;
