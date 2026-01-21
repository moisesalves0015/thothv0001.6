
import React, { useRef } from 'react';
import { MOCK_CONNECTIONS } from '../constants';
import ConnectionCard from './ConnectionCard';

const ConnectionSuggestions: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 202; // Card width (190) + Gap (12)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full h-[350px] lg:h-[350px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Unified - Padronizado com SidebarFeed e RemindersBox */}
      <div className="flex flex-col px-6 pt-6 mb-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Sugestões de Conexão</h2>

          <div className="flex gap-2">
            <button 
              onClick={() => handleScroll('left')}
              className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">comunidade thoth</span>
      </div>

      {/* Horizontal List */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto overflow-y-hidden pt-1 pb-4 px-6 snap-x snap-mandatory no-scrollbar scroll-smooth flex-1 touch-pan-x bg-transparent"
      >
        {MOCK_CONNECTIONS.map((connection) => (
          <div key={connection.id} className="snap-center h-full flex items-center">
            <ConnectionCard connection={connection} />
          </div>
        ))}
        <div className="flex-shrink-0 w-2"></div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ConnectionSuggestions;
