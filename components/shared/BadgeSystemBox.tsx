import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useBadgeSystem } from '../../hooks/useBadgeSystem';

const BadgeSystemBox: React.FC = () => {
  const navigate = useNavigate();
  const {
    isMobile,
    tileSize,
    slots,
    loading,
    error,
    gridRef,
    draggingId,
    dragInfo,
    dragOffset,
    mousePos,
    handleStartDrag,
    toVisual,
    draggingSlot
  } = useBadgeSystem();

  return (
    <div className={`w-full lg:w-[660px] h-auto liquid-glass rounded-[24px] flex flex-col p-6 shadow-2xl relative overflow-hidden select-none transition-all duration-500`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex flex-col">
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Mural de Ativos</h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Conquistas & Emblemas</span>
        </div>
        <button
          onClick={() => navigate('/badges/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#006c55] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#006c55]/20 hover:scale-105 transition-all active:scale-95"
        >
          <Sparkles size={12} /> Novo Emblema
        </button>
      </div>

      <div className="flex-1 bg-slate-100/30 rounded-none border-2 border-dashed border-slate-200/50 relative overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-[#006c55]" size={32} />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <AlertTriangle size={32} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div
          ref={gridRef}
          className="w-full relative bg-slate-50/50 rounded-xl overflow-hidden shadow-inner transition-all duration-300"
          style={{ height: tileSize * (isMobile ? 16 : 8) }}
        >
          {/* Red Line Divider for Mobile */}
          {isMobile && (
            <div className="absolute left-0 w-full h-[2px] bg-red-500/20 z-0 pointer-events-none flex items-center justify-center" style={{ top: `${tileSize * 8}px` }}>
              <span className="bg-red-50 text-[8px] font-black text-red-400 px-2 uppercase tracking-widest">Limite de Quadro</span>
            </div>
          )}

          {/* Grid Background */}
          <div
            className="absolute inset-0 z-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#006c55 1px, transparent 1px), linear-gradient(90deg, #006c55 1px, transparent 1px)`,
              backgroundSize: `${tileSize}px ${tileSize}px`
            }}
          />

          {/* Badges */}
          {slots.map(slot => {
            const { vx, vy } = toVisual(slot.x, slot.y);
            const isDragging = slot.badge.id === draggingId;

            return (
              <div
                key={slot.badge.id}
                onMouseDown={(e) => !isMobile && handleStartDrag(e.clientX, e.clientY, slot)}
                onTouchStart={(e) => isMobile && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, slot)}
                className={`absolute group cursor-grab active:cursor-grabbing transition-transform ${isDragging ? 'opacity-0 scale-95' : 'opacity-100 hover:scale-[1.02]'}`}
                style={{
                  left: vx * tileSize,
                  top: vy * tileSize,
                  width: slot.badge.width * tileSize,
                  height: slot.badge.height * tileSize,
                  padding: '0px'
                }}
              >
                <div className={`w-full h-full relative overflow-hidden rounded-sm bg-white ${isDragging ? 'shadow-none' : 'shadow-none'}`}>
                  <img
                    src={slot.badge.imageUrl}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    alt={slot.badge.name}
                  />
                </div>
              </div>
            );
          })}

          {/* Drag Preview */}
          {draggingId && dragInfo && draggingSlot && (
            <>
              {/* Box Indicator (Red/Green) */}
              <div
                className={`absolute pointer-events-none rounded-none border-2 border-dashed z-40 ${dragInfo.isValid ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-red-500/20 border-red-500/60'}`}
                style={{
                  left: dragInfo.vx * tileSize,
                  top: dragInfo.vy * tileSize,
                  width: draggingSlot.badge.width * tileSize,
                  height: draggingSlot.badge.height * tileSize,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystemBox;