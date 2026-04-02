import type { Theme, TeamColor } from '../types';
import { TEAM_COLORS } from './constants';

/** Get themed color for a team by index */
export function getTeamColor(index: number, theme: Theme): TeamColor {
  const c = TEAM_COLORS[index % TEAM_COLORS.length];
  const isDark = theme === 'dark';
  return {
    t: c[isDark ? 0 : 4],
    bg1: c[isDark ? 1 : 5],
    bg2: c[isDark ? 2 : 6],
    b: c[isDark ? 3 : 7],
  };
}

/** Read a preference from localStorage */
export function getPref(key: string, defaultValue: string | null): string | null {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Save a preference to localStorage */
export function setPref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

/** Apply theme to the document */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0e14');
  }
}
