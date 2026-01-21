
import React from 'react';
import { LifeBuoy, MessageSquare, Book, ShieldQuestion } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header">
        <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Suporte Thoth
        </h1>
        <p className="text-slate-500 text-sm">Estamos aqui para ajudar você com qualquer dúvida.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-8 border border-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#006c55]/10 rounded-2xl flex items-center justify-center text-[#006c55] mb-6">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Chat ao Vivo</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Fale agora mesmo com um assistente humano em tempo real.</p>
          <button className="mt-8 px-8 py-3 bg-[#006c55] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#006c55]/20">Iniciar Chat</button>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
            <Book size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Central de Ajuda</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Consulte nossa base de conhecimento e tutoriais rápidos.</p>
          <button className="mt-8 px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">Abrir Wiki</button>
        </div>
      </div>
    </div>
  );
};

export default Support;
