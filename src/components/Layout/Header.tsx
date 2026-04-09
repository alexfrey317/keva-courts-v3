import type { Theme } from '../../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onShowMap: () => void;
  onShare: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  copied: boolean;
}

function RefreshIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5 9 4l6 2 5-2v13l-5 2-6-2-5 2z" />
      <path d="M9 4v13" />
      <path d="M15 6v13" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m10 14 4-4" />
      <path d="M8.5 17.5 6 20a3.5 3.5 0 1 1-5-5l2.5-2.5a3.5 3.5 0 0 1 5 0" />
      <path d="M15.5 6.5 18 4a3.5 3.5 0 1 1 5 5l-2.5 2.5a3.5 3.5 0 0 1-5 0" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.25" />
      <path d="M12 19.25v2.25" />
      <path d="m5.28 5.28 1.6 1.6" />
      <path d="m17.12 17.12 1.6 1.6" />
      <path d="M2.5 12h2.25" />
      <path d="M19.25 12h2.25" />
      <path d="m5.28 18.72 1.6-1.6" />
      <path d="m17.12 6.88 1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 14.5A6.5 6.5 0 0 1 9.5 6a7.5 7.5 0 1 0 8.5 8.5Z" />
    </svg>
  );
}

export function Header({
  theme,
  onToggleTheme,
  onShowMap,
  onShare,
  onRefresh,
  refreshing,
  copied,
}: HeaderProps) {
  return (
    <>
      <div className="header">
        <h1>KEVA Volleyball</h1>
      </div>
      {copied && <div className="copied">Link copied!</div>}
      <div className="subtitle">
        <span>Courts, Teams &amp; Open Play</span>
        <div className="hdr-btns">
          <button className="icon-btn" type="button" onClick={onShowMap} title="Court map" aria-label="Court map">
            <MapIcon />
          </button>
          <button
            className={'icon-btn' + (refreshing ? ' is-busy' : '')}
            type="button"
            onClick={onRefresh}
            title={refreshing ? 'Refreshing data...' : 'Refresh data'}
            aria-label={refreshing ? 'Refreshing data' : 'Refresh data'}
            aria-busy={refreshing}
            disabled={refreshing}
          >
            <RefreshIcon />
          </button>
          <button className="icon-btn" type="button" onClick={onShare} title="Copy link" aria-label="Copy link">
            <LinkIcon />
          </button>
          <button className="icon-btn" type="button" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </>
  );
}
