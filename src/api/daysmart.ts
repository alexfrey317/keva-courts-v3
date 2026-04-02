import { API_BASE, COMPANY, VB_RESOURCES } from '../utils/constants';
import type { ApiResponse, ApiEvent, Game, TeamData, OpenPlaySession } from '../types';
import { toDateStr, parseDayFromLeague } from '../utils/dates';
import { parseGames, discoverCourts, buildGrid } from '../utils/courts';

async function apiFetch(endpoint: string, params: Record<string, string> = {}): Promise<ApiResponse> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('company', COMPANY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/vnd.api+json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchGames(date: string): Promise<ApiEvent[]> {
  const res = await apiFetch('events', {
    'filter[start_date]': date,
    'filter[event_type_id]': 'g',
    sort: 'start',
    'page[size]': '500',
  });
  return res.data || [];
}

export async function fetchAllDayEvents(date: string): Promise<ApiEvent[]> {
  const res = await apiFetch('events', {
    'filter[start_date]': date,
    sort: 'start',
    'page[size]': '500',
  });
  return res.data || [];
}

export async function fetchAllOpenPlay(): Promise<OpenPlaySession[]> {
  const all: ApiEvent[] = [];
  let page = 1;

  while (true) {
    const batch = await apiFetch('events', {
      'filter[event_type_id]': '14',
      sort: 'start',
      'page[size]': '100',
      'page[number]': String(page),
    });
    all.push(...(batch.data || []));
    const meta = batch.meta?.page || {};
    if ((meta['current-page'] || 1) >= (meta['last-page'] || 1)) break;
    page++;
  }

  return all
    .filter((e) => /vb|volleyball/i.test(e.attributes.desc || ''))
    .map((e) => {
      const a = e.attributes;
      return {
        date: a.start.slice(0, 10),
        start: a.start.slice(11, 16),
        end: a.end.slice(11, 16),
        desc: a.desc || '',
        res: a.resource_id,
      };
    });
}

export async function fetchTeamData(): Promise<TeamData> {
  const seasonBatch = await apiFetch('seasons', { sort: '-id', 'page[size]': '50' });
  const today = toDateStr(new Date());

  // Find active VB adult season
  let season: ApiEvent | null = null;
  for (const s of seasonBatch.data || []) {
    const name = (s.attributes as any).name?.toLowerCase() || '';
    if (!name.includes('vb adult') || name.includes('sand')) continue;
    const st = (s.attributes as any).start_date?.slice(0, 10);
    const en = (s.attributes as any).end_date?.slice(0, 10);
    if (st && en && st <= today && today <= en) {
      season = s;
      break;
    }
  }
  // Fallback to most recent if no active season
  if (!season) {
    for (const s of seasonBatch.data || []) {
      const name = (s.attributes as any).name?.toLowerCase() || '';
      if (name.includes('vb adult') && !name.includes('sand')) {
        season = s;
        break;
      }
    }
  }

  if (!season) return { leagues: [], teams: [], teamMap: {} };

  const leagueBatch = await apiFetch('leagues', {
    'filter[season_id]': season.id,
    'page[size]': '100',
  });

  const skip = /waitlist|sub list|canceled/i;
  const leagues = (leagueBatch.data || [])
    .filter((l) => !skip.test((l.attributes as any).name))
    .map((l) => ({ id: l.id, name: (l.attributes as any).name as string }));

  const teamsByLeague = await Promise.all(
    leagues.map(async (lg) => {
      const tb = await apiFetch('teams', {
        'filter[league_id]': lg.id,
        'page[size]': '100',
      });
      return (tb.data || []).map((t) => ({
        id: Number(t.id),
        name: (t.attributes as any).name as string,
        leagueId: lg.id,
        leagueName: lg.name,
      }));
    }),
  );

  const teams = teamsByLeague.flat();
  const teamMap: Record<number, typeof teams[number]> = {};
  for (const t of teams) teamMap[t.id] = t;

  // Sort leagues: Epic teams first, then by level (upper > high int > int > rec), then by day
  const isEpic = (n: string) => (/epic/i.test(n) ? 0 : 1);
  const levelOrder = (n: string) => {
    const nl = n.toLowerCase();
    if (nl.includes('upper')) return 0;
    if (nl.includes('high int') || nl.includes('high-int')) return 1;
    if (nl.includes('intermediate') || nl.includes(' int')) return 2;
    if (nl.includes('rec')) return 3;
    return 1.5;
  };
  const dayOrder = (n: string) => {
    const d = parseDayFromLeague(n);
    return d < 0 ? 99 : [2, 3, 4, 0, 5, 6, 1][d] || 99;
  };

  leagues.sort(
    (a, b) =>
      isEpic(a.name) - isEpic(b.name) ||
      levelOrder(a.name) - levelOrder(b.name) ||
      dayOrder(a.name) - dayOrder(b.name),
  );

  return {
    leagues,
    teams,
    teamMap,
    seasonStart: (season.attributes as any).start_date?.slice(0, 10),
    seasonEnd: (season.attributes as any).end_date?.slice(0, 10),
  };
}

export async function fetchAllSeasonGames(): Promise<Game[]> {
  const first = await apiFetch('events', {
    'filter[event_type_id]': 'g',
    sort: 'start',
    'page[size]': '2000',
    'page[number]': '1',
  });
  const all = [...(first.data || [])];
  const totalPages = first.meta?.page?.['last-page'] || 1;

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiFetch('events', {
          'filter[event_type_id]': 'g',
          sort: 'start',
          'page[size]': '2000',
          'page[number]': String(i + 2),
        }),
      ),
    );
    for (const batch of remaining) {
      all.push(...(batch.data || []));
    }
  }

  return parseGames(all);
}

/** Quick check: how many open slots on a given day */
export async function fetchDayOpenCount(date: string): Promise<number> {
  const raw = await fetchGames(date);
  const games = parseGames(raw);
  const courts = discoverCourts(games);
  if (!courts.length) return -1;
  const dow = new Date(date + 'T12:00:00').getDay();
  const slots = dow === 0
    ? ['15:00', '15:50', '16:40', '17:30', '18:20', '19:10', '20:00', '20:50', '21:40']
    : ['18:00', '18:50', '19:40', '20:30', '21:20', '22:10'];
  return buildGrid(games, courts, slots, null).openTotal;
}
