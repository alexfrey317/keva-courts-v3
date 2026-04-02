import type { OpenPlaySession } from '../../types';
import { formatTime12 } from '../../utils/dates';
import { simpleCourtName } from '../../utils/courts';

interface OpenPlayViewProps {
  sessions: OpenPlaySession[];
}

export function OpenPlayView({ sessions }: OpenPlayViewProps) {
  if (!sessions.length) {
    return (
      <div className="summary no-op">No open play scheduled for this date</div>
    );
  }

  return (
    <>
      <div className="summary has-op">
        <span className="count">{sessions.length}</span>
        <span className="label">
          open play session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="op-list">
        {sessions.map((s, i) => (
          <div key={i} className="op-card">
            <div className="op-name">{s.desc}</div>
            <div className="op-time">
              {formatTime12(s.start)} &ndash; {formatTime12(s.end)}
            </div>
            <div className="op-court">{simpleCourtName(s.res)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
