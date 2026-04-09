interface QuickStartCardProps {
  canPickTeams: boolean;
  onPickTeams: () => void;
  onShowTonight: () => void;
  onOpenAlerts: () => void;
}

export function QuickStartCard({
  canPickTeams,
  onPickTeams,
  onShowTonight,
  onOpenAlerts,
}: QuickStartCardProps) {
  return (
    <section className="quick-start-card" aria-label="Quick start">
      <div className="quick-start-copy">
        <div className="quick-start-kicker">First time here?</div>
        <h2>Set up the app in under a minute.</h2>
        <p>
          Save your teams once, keep tonight&apos;s courts one tap away, and turn on alerts when you&apos;re ready.
        </p>
      </div>

      <div className="quick-start-actions">
        <button className="quick-start-btn primary" onClick={onPickTeams} disabled={!canPickTeams}>
          Set My Teams
        </button>
        <button className="quick-start-btn" onClick={onShowTonight}>
          Tonight&apos;s Courts
        </button>
        <button className="quick-start-btn" onClick={onOpenAlerts}>
          Enable Alerts
        </button>
      </div>

      {!canPickTeams && (
        <p className="quick-start-hint">
          Team search is temporarily unavailable. The rest of the schedule is still usable.
        </p>
      )}
    </section>
  );
}
