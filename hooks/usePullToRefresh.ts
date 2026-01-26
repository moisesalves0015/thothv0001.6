import { useState, useEffect, useCallback } from 'react';

export const usePullToRefresh = (onRefresh: () => void, threshold = 80) => {
    const [startY, setStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Só ativa se estiver no topo absoluto da página
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (startY === 0 || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const distance = currentY - startY;

        if (distance > 0 && window.scrollY === 0) {
            // Adiciona uma resistência física ao puxar
            const resistance = 0.5;
            const dampedDistance = distance * resistance;
            setPullDistance(Math.min(dampedDistance, threshold + 20));

            // Impede o scroll nativo se estiver puxando
            if (dampedDistance > 10) {
                if (e.cancelable) e.preventDefault();
            }
        }
    }, [startY, isRefreshing, threshold]);

    const handleTouchEnd = useCallback(() => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            onRefresh();
        }
        setStartY(0);
        setPullDistance(0);

        // Cleanup refreshing state após um tempo se a página não recarregar
        setTimeout(() => setIsRefreshing(false), 2000);
    }, [pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return { pullDistance, isRefreshing };
};
