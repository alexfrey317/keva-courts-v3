import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState } from '../types';
import { fetchGames, fetchAllDayEvents } from '../api/daysmart';
import { parseGames, discoverCourts, buildGrid, computeVbStart, detectMissingCourts, hasCourt3Basketball } from '../utils/courts';
import { isToday, getSlotsForDay } from '../utils/dates';
import { REFRESH_INTERVAL_MS } from '../utils/constants';

const INITIAL_STATE: GameState = {
  status: 'loading',
  courts: [],
  grid: { rows: [], openTotal: 0 },
  ct3bb: false,
  missing: [],
  vbStart: {},
  rawGames: [],
  updatedAt: '',
};

export function useGameData(dateStr: string, myTeamIds: Set<number> | null) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const refreshRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const slots = getSlotsForDay(dateStr);

  const fetchDay = useCallback(() => {
    return Promise.all([fetchGames(dateStr), fetchAllDayEvents(dateStr)])
      .then(([raw, allEvts]) => {
        const games = parseGames(raw);
        const courts = discoverCourts(games);
        const grid = buildGrid(games, courts, slots, myTeamIds);
        const ct3bb = hasCourt3Basketball(raw);
        const missing = detectMissingCourts(courts);
        const vbStart = computeVbStart(allEvts, courts);

        setGameState({
          status: 'ok',
          courts,
          grid,
          ct3bb,
          missing,
          vbStart,
          rawGames: games,
          updatedAt: new Date().toLocaleTimeString(),
        });
      })
      .catch((e) =>
        setGameState({ ...INITIAL_STATE, status: 'error', message: e.message }),
      );
  }, [dateStr, myTeamIds, slots]);

  useEffect(() => {
    setGameState(INITIAL_STATE);
    fetchDay();
    clearInterval(refreshRef.current);

    if (isToday(dateStr)) {
      refreshRef.current = setInterval(() => {
        if (!document.hidden) fetchDay();
      }, REFRESH_INTERVAL_MS);
    }

    return () => clearInterval(refreshRef.current);
  }, [fetchDay]);

  return { gameState, refetch: fetchDay };
}
