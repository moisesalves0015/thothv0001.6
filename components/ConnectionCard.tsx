
import React, { useState } from 'react';
import { Connection } from '../types';
import { User, Layers, Plus, Check } from 'lucide-react';

interface ConnectionCardProps {
  connection: Connection;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection }) => {
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex-shrink-0 w-[190px] h-[260px] relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-white/20">
      {/* Camada 1: Imagem de Fundo Total */}
      <img 
        src={connection.avatar} 
        alt={connection.name} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />

      {/* Camada 2 & 3: Painel com efeito Glassmorphism */}
      <div className="absolute bottom-2 left-2 right-2 p-3 rounded-xl bg-white/75 backdrop-blur-xl border border-white/40 flex flex-col gap-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300">
        
        {/* Camada 4: Conteúdo (Texto e Botões) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h4 className="text-[13px] font-black text-slate-900 leading-tight truncate">
              {connection.name}
            </h4>
            {connection.verified && (
              <div className="bg-[#006c55] rounded-full p-0.5 flex items-center justify-center flex-shrink-0">
                <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          <p className="text-[9px] font-bold text-slate-500 leading-tight line-clamp-1 mt-0.5">
            {connection.role}
          </p>
        </div>

        {/* Stats & Action */}
        <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <User size={10} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-700">{connection.followers}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Layers size={10} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-700">{connection.projects}</span>
            </div>
          </div>

          <button 
            onClick={() => setFollowing(!following)}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-90 shadow-sm ${
              following 
              ? 'bg-[#006c55] text-white' 
              : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
            title={following ? 'Seguindo' : 'Seguir'}
          >
            {following ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
