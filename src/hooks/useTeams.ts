import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Team, TeamData } from '../types';
import { fetchTeamData } from '../api/daysmart';
import { getTeamColor } from '../utils/theme';
import { parseDayFromLeague, toDateStr } from '../utils/dates';
import type { Theme, TeamColor } from '../types';

function readTeamsFromUrl(): number[] {
  const qt = new URLSearchParams(window.location.search).get('teams');
  if (qt) {
    const ids = qt.split(',').map(Number).filter((n) => n > 0);
    if (ids.length) return ids;
  }
  try {
    const json = localStorage.getItem('keva-teams');
    if (json) return JSON.parse(json);
  } catch { /* ignore */ }
  return [];
}

function writeTeams(ids: number[]): void {
  try {
    if (ids.length) localStorage.setItem('keva-teams', JSON.stringify(ids));
    else localStorage.removeItem('keva-teams');
  } catch { /* ignore */ }
  const url = new URL(window.location.href);
  if (ids.length) url.searchParams.set('teams', ids.join(','));
  else url.searchParams.delete('teams');
  window.history.replaceState(null, '', url.toString());
}

export function useTeams() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [myTeams, setMyTeams] = useState<number[]>(() => {
    const teams = readTeamsFromUrl();
    if (teams.length) writeTeams(teams);
    return teams;
  });

  useEffect(() => {
    fetchTeamData()
      .then((d) => { setTeamData(d); setTeamLoading(false); })
      .catch(() => setTeamLoading(false));
  }, []);

  const saveTeams = useCallback((ids: number[]) => {
    setMyTeams(ids);
    writeTeams(ids);
  }, []);

  const myTeamObjs = useMemo<Team[]>(() => {
    if (!teamData) return [];
    return myTeams.map((id) => teamData.teamMap[id]).filter(Boolean);
  }, [myTeams, teamData]);

  const myTeamIdSet = useMemo(() => new Set(myTeams), [myTeams]);

  const teamColorMap = useMemo(() => {
    const m = new Map<number, number>();
    myTeams.forEach((id, i) => m.set(id, i));
    return m;
  }, [myTeams]);

  /** Map of dateStr -> team IDs that play on that date */
  const myTeamDateMap = useMemo(() => {
    if (!myTeamObjs.length || !teamData?.seasonStart) return new Map<string, number[]>();
    const map = new Map<string, number[]>();
    const start = new Date(teamData.seasonStart + 'T12:00:00');
    const end = new Date(teamData.seasonEnd! + 'T12:00:00');

    for (const t of myTeamObjs) {
      const dayNum = parseDayFromLeague(t.leagueName);
      if (dayNum < 0) continue;
      const d = new Date(start);
      while (d <= end) {
        if (d.getDay() === dayNum) {
          const s = toDateStr(d);
          if (!map.has(s)) map.set(s, []);
          map.get(s)!.push(t.id);
        }
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [myTeamObjs, teamData]);

  return {
    teamData,
    teamLoading,
    showPicker,
    setShowPicker,
    myTeams,
    saveTeams,
    myTeamObjs,
    myTeamIdSet,
    teamColorMap,
    myTeamDateMap,
  };
}
