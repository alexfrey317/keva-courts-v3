import { useState, useEffect, useMemo, useRef } from 'react';
import type { DataSource } from '../types';
import type { OpenPlaySession } from '../types';
import { fetchAllOpenPlay } from '../api/daysmart';

export function useOpenPlay(dateStr: string) {
  const [sessions, setSessions] = useState<OpenPlaySession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);
  const [fetchedAt, setFetchedAt] = useState('');
  const loaded = useRef(false);

  const load = (force = false) => {
    if (loaded.current && !force) return Promise.resolve();
    setLoading(true);
    return fetchAllOpenPlay()
      .then((result) => {
        loaded.current = true;
        setSessions(result.data);
        setSource(result.source);
        setFetchedAt(result.fetchedAt);
        setError(null);
      })
      .catch((err: Error) => {
        setSessions(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const opDates = useMemo(
    () => (sessions ? new Set(sessions.map((s) => s.date)) : new Set<string>()),
    [sessions],
  );

  const todaySessions = useMemo(
    () => (sessions ? sessions.filter((s) => s.date === dateStr) : []),
    [sessions, dateStr],
  );

  return {
    sessions,
    loading,
    error,
    source,
    fetchedAt,
    opDates,
    todaySessions,
    reload: () => {
      loaded.current = false;
      return load(true);
    },
  };
}
