import { useEffect, useState } from 'react';
import type { TeamRecordBreakdown } from '../../types';
import { formatShort, formatTime12 } from '../../utils/dates';

interface RecordBreakdownModalProps {
  teamName: string;
  breakdown: TeamRecordBreakdown;
  onClose: () => void;
}

function BreakdownSection({
  title,
  entries,
  emptyCopy,
  tone,
}: {
  title: string;
  entries: TeamRecordBreakdown['wins'];
  emptyCopy: string;
  tone: 'win' | 'loss';
}) {
  const [activeEntryKey, setActiveEntryKey] = useState<string | null>(null);

  return (
    <div className="record-section">
      <div className={'record-section-title ' + tone}>{title}</div>
      {entries.length > 0 ? (
        <div className="record-entry-list">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="record-entry"
              onMouseLeave={() => setActiveEntryKey((current) => (current === `${tone}-${entry.id}` ? null : current))}
            >
              <span className="record-entry-name">{entry.name}</span>
              <div className="record-entry-meta">
                <button
                  type="button"
                  className="record-entry-count"
                  aria-label={`Show ${entry.name} ${title.toLowerCase()} game times`}
                  onMouseEnter={() => setActiveEntryKey(`${tone}-${entry.id}`)}
                  onFocus={() => setActiveEntryKey(`${tone}-${entry.id}`)}
                  onBlur={() => setActiveEntryKey((current) => (current === `${tone}-${entry.id}` ? null : current))}
                  onClick={() =>
                    setActiveEntryKey((current) => (current === `${tone}-${entry.id}` ? null : `${tone}-${entry.id}`))
                  }
                >
                  {entry.count}
                </button>
                {activeEntryKey === `${tone}-${entry.id}` && (
                  <div className="record-entry-popover" role="status">
                    <div className="record-entry-popover-title">Game times</div>
                    <div className="record-entry-times">
                      {entry.games.map((game, index) => (
                        <div key={`${game.date}-${game.time}-${index}`} className="record-entry-time">
                          {formatShort(game.date)} at {formatTime12(game.time)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="record-empty">{emptyCopy}</div>
      )}
    </div>
  );
}

export function RecordBreakdownModal({ teamName, breakdown, onClose }: RecordBreakdownModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="record-overlay" onClick={onClose}>
      <div
        className="record-popup"
        role="dialog"
        aria-modal="true"
        aria-label={`${teamName} record breakdown`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="record-header">
          <div>
            <div className="record-kicker">Record Breakdown</div>
            <h3>{teamName}</h3>
          </div>
          <button type="button" className="record-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="record-summary">
          <span className="record-pill win">{breakdown.w} wins</span>
          <span className="record-pill loss">{breakdown.l} losses</span>
        </div>

        <div className="record-sections">
          <BreakdownSection
            title="Won Against"
            entries={breakdown.wins}
            emptyCopy="No completed wins yet."
            tone="win"
          />
          <BreakdownSection
            title="Lost Against"
            entries={breakdown.losses}
            emptyCopy="No completed losses yet."
            tone="loss"
          />
        </div>
      </div>
    </div>
  );
}
