import { useState, useEffect, useRef } from 'react';

export function usePullToRefresh(onRefresh: () => void) {
  const [pulling, setPulling] = useState(false);
  const ptrRef = useRef({ startY: 0, active: false });

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (window.scrollY === 0) {
        ptrRef.current = { startY: e.touches[0].clientY, active: true };
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!ptrRef.current.active) return;
      const dy = e.touches[0].clientY - ptrRef.current.startY;
      if (dy > 80) setPulling(true);
    }

    function handleTouchEnd() {
      if (pulling) {
        setPulling(false);
        onRefresh();
      }
      ptrRef.current.active = false;
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, onRefresh]);

  return pulling;
}
