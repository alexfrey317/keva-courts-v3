import { useEffect } from 'react';
import type { TeamRosterMap } from '../../types';

interface RosterModalTeam {
  id: number;
  name: string;
}

interface RosterModalProps {
  title: string;
  teams: RosterModalTeam[];
  rosters: TeamRosterMap;
  onClose: () => void;
}

export function RosterModal({ title, teams, rosters, onClose }: RosterModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const hasLoadedSnapshot = Object.keys(rosters).length > 0;

  return (
    <div className="roster-overlay" onClick={onClose}>
      <div
        className="roster-popup"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="roster-header">
          <div>
            <div className="roster-kicker">Team Roster</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="roster-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="roster-groups">
          {teams.map((team) => {
            const players = rosters[team.id]?.players ?? [];
            const syncedAt = rosters[team.id]?.syncedAt;

            return (
              <section key={team.id} className="roster-group">
                <div className="roster-team-name">{team.name}</div>
                {players.length > 0 ? (
                  <>
                    <div className="roster-team-meta">
                      {players.length} {players.length === 1 ? 'player' : 'players'}
                    </div>
                    <div className="roster-player-list">
                      {players.map((player) => (
                        <div key={player} className="roster-player">
                          {player}
                        </div>
                      ))}
                    </div>
                    {syncedAt && <div className="roster-team-sync">Synced {new Date(syncedAt).toLocaleString()}</div>}
                  </>
                ) : (
                  <div className="roster-empty">
                    {hasLoadedSnapshot ? 'Roster unavailable for this team.' : 'Roster snapshot still loading.'}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
