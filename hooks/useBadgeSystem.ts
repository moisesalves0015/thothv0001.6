import { useState, useRef, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { BadgeSlot } from '../types';

export const useBadgeSystem = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [tileSize, setTileSize] = useState(33);
    const [slots, setSlots] = useState<BadgeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dragging state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const gridRef = useRef<HTMLDivElement>(null);
    const slotsRef = useRef<BadgeSlot[]>([]);

    const LOGIC_COLS = 20;
    const LOGIC_ROWS = 8;

    // Fetch Badges
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

    // Resize Handler
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

    // Coordinate Helpers
    const toVisual = (lx: number, ly: number) => {
        if (!isMobile) return { vx: lx, vy: ly };
        // Mobile: Split 20 cols into two stacks of 10 cols
        // 0-9 -> Top Block (rows 0-7)
        // 10-19 -> Bottom Block (rows 8-15)
        if (lx < 10) {
            return { vx: lx, vy: ly };
        } else {
            return { vx: lx - 10, vy: ly + 8 };
        }
    };

    const toLogical = (vx: number, vy: number) => {
        if (!isMobile) return { lx: vx, ly: vy };
        // Reverse mapping
        if (vy < 8) {
            return { lx: vx, ly: vy };
        } else {
            return { lx: vx + 10, ly: vy - 8 };
        }
    };

    const isPositionValid = (badgeId: string, lx: number, ly: number, w: number, h: number, currentSlots: BadgeSlot[]) => {
        // Basic bounds
        if (lx < 0 || ly < 0 || lx + w > LOGIC_COLS || ly + h > LOGIC_ROWS) return false;

        // Mobile Constraint (ALWAYS ENFORCED for consistency): Cannot cross the x=10 boundary
        // This effectively splits the grid into two independent areas (0-9 and 10-19)
        // A badge cannot start in one and end in the other.
        const startBlock = lx < 10 ? 1 : 2;
        const endBlock = (lx + w - 1) < 10 ? 1 : 2;

        if (startBlock !== endBlock) {
            return false;
        }

        // Collision check
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

    // Drag Event Listeners
    useEffect(() => {
        if (!draggingId) return;

        const onMove = (e: MouseEvent | TouchEvent) => {
            if (e.type === 'touchmove') e.preventDefault(); // Prevent scrolling while dragging
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
                // Only update if position is valid
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

    return {
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
        draggingSlot // Exported needed for render
    };
};
