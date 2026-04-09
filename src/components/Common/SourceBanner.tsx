interface SourceBannerProps {
  kind: 'live' | 'cached' | 'unavailable';
  fetchedAt?: string;
}

function formatStamp(fetchedAt?: string): string {
  if (!fetchedAt) return '';
  return new Date(fetchedAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SourceBanner({ kind, fetchedAt }: SourceBannerProps) {
  const stamp = formatStamp(fetchedAt);

  if (kind === 'unavailable') {
    return (
      <div className="source-banner unavailable" role="alert">
        <strong>DaySmart unavailable</strong>
        <span>Live schedule data is not responding right now. Try a refresh in a minute.</span>
      </div>
    );
  }

  if (kind === 'cached') {
    return (
      <div className="source-banner cached" role="status">
        <strong>Using saved DaySmart data</strong>
        <span>{stamp ? `Last successful refresh ${stamp}` : 'Showing the most recent saved schedule snapshot.'}</span>
      </div>
    );
  }

  return (
    <div className="source-banner live" role="status">
      <strong>Live DaySmart data</strong>
      <span>{stamp ? `Last refreshed ${stamp}` : 'Connected to the live KEVA schedule feed.'}</span>
    </div>
  );
}
