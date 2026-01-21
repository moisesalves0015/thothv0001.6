import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeSlot } from '../types';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { collection, onSnapshot, query, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const BadgeSystemBox: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [tileSize, setTileSize] = useState(33);
  const gridRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<BadgeSlot[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LOGIC_COLS = 20;
  const LOGIC_ROWS = 6;
  
  const [slots, setSlots] = useState<BadgeSlot[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const q = query(collection(db, 'badges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, 
      (snapshot) => {
        const badgesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            badge: {
              id: doc.id,
              name: data.name || "Sem Nome",
              imageUrl: data.imageUrl || "", 
              width: data.width || 1,
              height: data.height || 1,
              creatorId: data.creatorId,
              price: data.totalPaid || 0
            },
            x: Number(data.x) || 0,
            y: Number(data.y) || 0
          };
        }) as BadgeSlot[];
        
        setSlots(badgesData);
        slotsRef.current = badgesData;
        setLoading(false);
      },
      (err) => {
        console.error("Erro Firestore Mural:", err);
        setError("Erro ao sincronizar mural.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const toVisual = (lx: number, ly: number) => {
    if (!isMobile) return { vx: lx, vy: ly };
    return ly < 6 ? { vx: lx, vy: ly } : { vx: lx - 10, vy: ly + 6 };
  };

  const toLogical = (vx: number, vy: number) => {
    if (!isMobile) return { lx: vx, ly: vy };
    return vy < 6 ? { lx: vx, ly: vy } : { lx: vx + 10, ly: vy - 6 };
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (gridRef.current) {
        setTileSize(gridRef.current.offsetWidth / (mobile ? 10 : 20));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPositionValid = (badgeId: string, lx: number, ly: number, w: number, h: number, currentSlots: BadgeSlot[]) => {
    if (lx < 0 || ly < 0 || lx + w > LOGIC_COLS || ly + h > LOGIC_ROWS) return false;
    return !currentSlots.some(s => {
      if (s.badge.id === badgeId) return false;
      return !(lx + w <= s.x || s.x + s.badge.width <= lx || ly + h <= s.y || s.y + s.badge.height <= ly);
    });
  };

  const handleStartDrag = (clientX: number, clientY: number, slot: BadgeSlot) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { vx, vy } = toVisual(slot.x, slot.y);
    setDraggingId(slot.badge.id);
    setDragOffset({ x: (clientX - rect.left) - vx * tileSize, y: (clientY - rect.top) - vy * tileSize });
    setMousePos({ x: clientX - rect.left, y: clientY - rect.top });
  };

  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (e.type === 'touchmove') e.preventDefault();
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      setMousePos({ x: cx - rect.left, y: cy - rect.top });
    };

    const onEnd = async (e: MouseEvent | TouchEvent) => {
      const currentId = draggingId;
      if (!currentId) return;

      const rect = gridRef.current?.getBoundingClientRect();
      const cx = (e as TouchEvent).changedTouches ? (e as TouchEvent).changedTouches[0]?.clientX : (e as MouseEvent).clientX;
      const cy = (e as TouchEvent).changedTouches ? (e as TouchEvent).changedTouches[0]?.clientY : (e as MouseEvent).clientY;
      
      setDraggingId(null);

      if (rect && cx !== undefined && cy !== undefined) {
        const vx = Math.round((cx - rect.left - dragOffset.x) / tileSize);
        const vy = Math.round((cy - rect.top - dragOffset.y) / tileSize);
        const { lx, ly } = toLogical(vx, vy);
        
        const dragged = slotsRef.current.find(s => s.badge.id === currentId);
        if (dragged && isPositionValid(currentId, lx, ly, dragged.badge.width, dragged.badge.height, slotsRef.current)) {
          try {
            await updateDoc(doc(db, 'badges', currentId), { x: lx, y: ly });
          } catch (err) {
            console.error("Erro ao mover emblema:", err);
          }
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [draggingId, dragOffset, tileSize, isMobile]);

  const draggingSlot = useMemo(() => slots.find(s => s.badge.id === draggingId), [slots, draggingId]);
  const dragInfo = useMemo(() => {
    if (!draggingSlot) return null;
    const vx = Math.round((mousePos.x - dragOffset.x) / tileSize);
    const vy = Math.round((mousePos.y - dragOffset.y) / tileSize);
    const { lx, ly } = toLogical(vx, vy);
    const isValid = isPositionValid(draggingId!, lx, ly, draggingSlot.badge.width, draggingSlot.badge.height, slots);
    return { vx, vy, isValid };
  }, [mousePos, dragOffset, draggingSlot, draggingId, slots, tileSize, isMobile]);

  return (
    <div className="w-full lg:w-[660px] h-[500px] lg:h-[350px] glass-panel rounded-3xl flex flex-col p-6 shadow-xl relative overflow-hidden select-none">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex flex-col">
          <h3 className="text-lg font-black text-slate-900 leading-none">Mural de Ativos</h3>
          <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Drag & Connect</span>
        </div>
        <button 
          onClick={() => navigate('/badges/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#006c55] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#006c55]/20 hover:scale-105 transition-all active:scale-95"
        >
          <Sparkles size={12} /> Novo Emblema
        </button>
      </div>

      <div className="flex-1 bg-slate-100/30 rounded-none border-2 border-dashed border-slate-200/50 relative overflow-hidden">
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
          className="absolute inset-0 grid"
          style={{ 
            gridTemplateColumns: `repeat(${isMobile ? 10 : 20}, 1fr)`,
            gridTemplateRows: `repeat(${isMobile ? 12 : 6}, 1fr)` 
          }}
        >
          {Array.from({ length: (isMobile ? 10 : 20) * (isMobile ? 12 : 6) }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-slate-200/30" />
          ))}

          {slots.map((slot) => {
            if (slot.badge.id === draggingId) return null;
            const { vx, vy } = toVisual(slot.x, slot.y);
            return (
              <div
                key={slot.badge.id}
                onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY, slot)}
                onTouchStart={(e) => handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, slot)}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  width: `${slot.badge.width * tileSize}px`,
                  height: `${slot.badge.height * tileSize}px`,
                  transform: `translate(${vx * tileSize}px, ${vy * tileSize}px)`,
                  padding: 0
                }}
              >
                <div className="w-full h-full bg-white rounded-none border-[0.5px] border-white/50 overflow-hidden group">
                  <img src={slot.badge.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={slot.badge.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[7px] font-black text-white uppercase truncate">{slot.badge.name}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {draggingId && dragInfo && draggingSlot && (
            <>
              <div 
                className={`absolute pointer-events-none rounded-none border-2 border-dashed z-40 ${dragInfo.isValid ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-red-500/20 border-red-500/60'}`}
                style={{
                  width: `${draggingSlot.badge.width * tileSize}px`,
                  height: `${draggingSlot.badge.height * tileSize}px`,
                  transform: `translate(${dragInfo.vx * tileSize}px, ${dragInfo.vy * tileSize}px)`
                }}
              />
              <div 
                className="absolute z-50 pointer-events-none"
                style={{
                  width: `${draggingSlot.badge.width * tileSize}px`,
                  height: `${draggingSlot.badge.height * tileSize}px`,
                  transform: `translate(${mousePos.x - dragOffset.x}px, ${mousePos.y - dragOffset.y}px)`
                }}
              >
                <div className="w-full h-full bg-white/90 rounded-none shadow-2xl border-2 border-[#006c55] overflow-hidden scale-105">
                  <img src={draggingSlot.badge.imageUrl} className="w-full h-full object-cover" alt="Dragging" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystemBox;