import type { Immunities } from "./types";

export const DEFAULT_VERSION = 1.0;

// How much each +1 of a stat contributes to a program's version number
export const VERSION_WEIGHTS: Record<string, number> = {
  maxSize: 0.2,
  moves: 0.2,
  attack: 0.3,
  defence: 0.3,
  range: 0.3,
};
export const IMMUNITY_VERSION_WEIGHT = 0.1;

// Work in tenths to avoid floating point drift (e.g. 1.0 + 0.2 + 0.1 = 1.3000000000000003)
const round1 = (n: number) => Math.round(n * 10) / 10;

export function getStatVersionDelta(stats: Partial<Record<string, number>>): number {
  let delta = 0;
  for (const [key, val] of Object.entries(stats)) {
    if (!val) continue;
    const weight = VERSION_WEIGHTS[key];
    if (weight) delta += weight * val;
  }
  return round1(delta);
}

/** Net number of immunities gained (negative if lost) */
export function countImmunityChange(before: Immunities = {}, after: Immunities = {}): number {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<keyof Immunities>;
  let change = 0;
  keys.forEach(k => {
    const was = !!before[k];
    const now = !!after[k];
    if (!was && now) change++;
    if (was && !now) change--;
  });
  return change;
}

export function addVersion(current: number | undefined, delta: number): number {
  return round1((current ?? DEFAULT_VERSION) + delta);
}

/** Whether a version suffix should be shown (anything other than the default 1.0) */
export function hasVersionSuffix(version: number | undefined): boolean {
  return round1(version ?? DEFAULT_VERSION) !== DEFAULT_VERSION;
}

/** "v1.3", or "v0.err" when the version has dropped below 1.0 */
export function formatVersion(version: number | undefined): string {
  const v = round1(version ?? DEFAULT_VERSION);
  if (v < DEFAULT_VERSION) return 'v0.err';
  return `v${v.toFixed(1)}`;
}
