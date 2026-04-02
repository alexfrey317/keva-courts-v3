import { useMemo } from 'react';
import type { Game, Team } from '../../types';
import { computeStandings } from '../../utils/courts';

interface StandingsViewProps {
  allGames: Game[];
  teamMap: Record<number, Team>;
  myTeamObjs: Team[];
  myTeamIds: Set<number>;
}

export function StandingsView({ allGames, teamMap, myTeamObjs, myTeamIds }: StandingsViewProps) {
  const leagueIds = useMemo(
    () => [...new Set(myTeamObjs.map((t) => t.leagueId))],
    [myTeamObjs],
  );

  return (
    <>
      {leagueIds.map((lid) => {
        const lg = myTeamObjs.find((t) => t.leagueId === lid);
        const rows = computeStandings(allGames, teamMap, lid);

        return (
          <div key={lid} className="standings">
            <div className="standings-title">{lg?.leagueName || 'League'}</div>
            <table>
              <thead>
                <tr>
                  <th className="rank">#</th>
                  <th>Team</th>
                  <th className="rec">Record</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={myTeamIds.has(r.id) ? 'me' : ''}>
                    <td className="rank">{i + 1}</td>
                    <td>{r.name}</td>
                    <td className="rec">{r.w}-{r.l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
