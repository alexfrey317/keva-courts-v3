import { useState, useEffect, useRef, useCallback } from 'react';
import type { Game, DataSource } from '../types';
import { fetchAllSeasonGames } from '../api/daysmart';

export function useSeasonData(hasTeams: boolean) {
  const [allSeasonGames, setAllSeasonGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);
  const [fetchedAt, setFetchedAt] = useState('');
  const fetched = useRef(false);

  const load = useCallback((force = false) => {
    if (!hasTeams || (fetched.current && !force)) return Promise.resolve();
    setLoading(true);
    return fetchAllSeasonGames()
      .then((result) => {
        fetched.current = true;
        setAllSeasonGames(result.data);
        setSource(result.source);
        setFetchedAt(result.fetchedAt);
        setError(null);
      })
      .catch((err: Error) => {
        setAllSeasonGames(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [hasTeams]);

  useEffect(() => {
    if (!hasTeams) {
      fetched.current = false;
      setAllSeasonGames(null);
      setLoading(false);
      setError(null);
      setSource(null);
      setFetchedAt('');
      return;
    }

    void load();
  }, [hasTeams, load]);

  return {
    allSeasonGames,
    loading,
    error,
    source,
    fetchedAt,
    reload: () => {
      fetched.current = false;
      return load(true);
    },
  };
}
