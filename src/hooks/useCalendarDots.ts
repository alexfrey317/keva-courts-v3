import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mode, Theme } from '../types';
import { calendarDays } from '../utils/dates';
import { getTeamColor } from '../utils/theme';
import { fetchDayOpenCount } from '../api/daysmart';

export function useCalendarDots(
  calYear: number,
  calMonth: number,
  weekStart: number,
  mode: Mode,
  opDates: Set<string>,
  myTeamDateMap: Map<string, number[]>,
  teamColorMap: Map<number, number>,
  theme: Theme,
) {
  const gdCache = useRef(new Map<string, number>());
  const [gameDots, setGameDots] = useState(new Set<string>());

  // Fetch open court counts for calendar dots
  useEffect(() => {
    const cells = calendarDays(calYear, calMonth, weekStart);
    const vbDates = [...new Set(cells.filter((c) => c.isVb && !c.isPast).map((c) => c.str))];
    setGameDots(new Set(vbDates.filter((d) => (gdCache.current.get(d) || 0) > 0)));

    const uncached = vbDates.filter((d) => !gdCache.current.has(d));
    if (!uncached.length) return;

    let cancelled = false;
    async function run() {
      const queue = [...uncached];
      while (queue.length && !cancelled) {
        const batch = queue.splice(0, 6);
        await Promise.all(
          batch.map((d) =>
            fetchDayOpenCount(d)
              .then((n) => gdCache.current.set(d, n))
              .catch(() => gdCache.current.set(d, -1)),
          ),
        );
        if (!cancelled) {
          setGameDots(new Set(vbDates.filter((d) => (gdCache.current.get(d) || 0) > 0)));
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [calYear, calMonth, weekStart]);

  const getDots = useCallback(
    (dateStr: string): string[] => {
      if (mode === 'games') {
        return gameDots.has(dateStr)
          ? [getComputedStyle(document.documentElement).getPropertyValue('--open-t').trim()]
          : [];
      }
      if (mode === 'openplay') {
        return opDates.has(dateStr)
          ? [getComputedStyle(document.documentElement).getPropertyValue('--cyan-t').trim()]
          : [];
      }
      const tids = myTeamDateMap.get(dateStr);
      if (!tids) return [];
      return tids.map((id) => {
        const ci = teamColorMap.get(id);
        return ci !== undefined ? getTeamColor(ci, theme).t : '#c4b5fd';
      });
    },
    [mode, gameDots, opDates, myTeamDateMap, teamColorMap, theme],
  );

  return getDots;
}
