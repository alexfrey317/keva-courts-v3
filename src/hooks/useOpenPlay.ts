import { useState, useEffect, useMemo, useRef } from 'react';
import type { OpenPlaySession } from '../types';
import { fetchAllOpenPlay } from '../api/daysmart';

export function useOpenPlay(dateStr: string) {
  const [sessions, setSessions] = useState<OpenPlaySession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    fetchAllOpenPlay()
      .then((s) => { setSessions(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const opDates = useMemo(
    () => (sessions ? new Set(sessions.map((s) => s.date)) : new Set<string>()),
    [sessions],
  );

  const todaySessions = useMemo(
    () => (sessions ? sessions.filter((s) => s.date === dateStr) : []),
    [sessions, dateStr],
  );

  return { sessions, loading, opDates, todaySessions };
}
