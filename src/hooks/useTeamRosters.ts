import { useEffect, useMemo, useState } from 'react';
import type { TeamRosterMap } from '../types';
import { WORKER_URL } from '../utils/constants';

interface WorkerRosterPayload {
  teams?: Record<string, {
    teamId: number;
    teamName: string;
    players: string[];
    syncedAt: string;
  }>;
}

export type TeamRosterStatus = 'idle' | 'loading' | 'ready' | 'error';

async function fetchRosterPayload(url: string): Promise<WorkerRosterPayload | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json() as Promise<WorkerRosterPayload>;
}

function toRosterMap(payload: WorkerRosterPayload): TeamRosterMap {
  const next: TeamRosterMap = {};

  for (const [rawTeamId, roster] of Object.entries(payload.teams || {})) {
    const teamId = Number(rawTeamId);
    if (!Number.isInteger(teamId) || teamId <= 0) continue;
    next[teamId] = {
      teamId: roster.teamId,
      teamName: roster.teamName,
      players: Array.isArray(roster.players) ? roster.players : [],
      syncedAt: roster.syncedAt,
    };
  }

  return next;
}

export function useTeamRosters(teamIds: number[]): { rosters: TeamRosterMap; status: TeamRosterStatus } {
  const [rosters, setRosters] = useState<TeamRosterMap>({});
  const [status, setStatus] = useState<TeamRosterStatus>('idle');
  const key = useMemo(() => [...new Set(teamIds)].sort((a, b) => a - b).join(','), [teamIds.join(',')]);

  useEffect(() => {
    if (!key) {
      setRosters({});
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const staticUrl = `${import.meta.env.BASE_URL || '/'}rosters.json`;

    (async () => {
      try {
        const payload =
          await fetchRosterPayload(staticUrl) ||
          await fetchRosterPayload(`${WORKER_URL}/rosters`);

        if (!payload) {
          if (!cancelled) {
            setRosters({});
            setStatus('error');
          }
          return;
        }

        if (!cancelled) {
          setRosters(toRosterMap(payload));
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setRosters({});
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { rosters, status };
}
