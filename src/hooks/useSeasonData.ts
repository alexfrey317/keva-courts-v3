import { useState, useEffect, useRef } from 'react';
import type { Game } from '../types';
import { fetchAllSeasonGames } from '../api/daysmart';

export function useSeasonData(hasTeams: boolean) {
  const [allSeasonGames, setAllSeasonGames] = useState<Game[] | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !hasTeams) return;
    fetched.current = true;
    fetchAllSeasonGames().then(setAllSeasonGames).catch(() => {});
  }, [hasTeams]);

  return allSeasonGames;
}
