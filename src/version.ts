import type { Immunities, StatModifier, StatusKey } from "./types";
import type { Piece } from "./Pieces";
import { Random } from "./Random";

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

export const HARMFUL_IMMUNITIES: StatusKey[] = [
  'diseased',
  'slowed',
  'blinded',
  'burning',
  'poisoned',
  'frozen',
  'charmed',
  'confused',
  'exposed',
];

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
  if (v < DEFAULT_VERSION) return 'err';
  return `v${v.toFixed(1)}`;
}

/**
 * Randomly adds stat modifiers and immunities to `piece` using VERSION_WEIGHTS and
 * IMMUNITY_VERSION_WEIGHT so that `piece.rarity + piece.version === targetTotal`.
 */
export function upgradePieceToDifficulty(piece: Piece, targetTotal: number): void {
  let remainingTenths = Math.round((targetTotal - piece.rarity - (piece.version ?? DEFAULT_VERSION)) * 10);
  if (remainingTenths <= 0) return;

  const mods: StatModifier = {};
  let immunityCount = 0;
  const immunityCost = Math.round(IMMUNITY_VERSION_WEIGHT * 10);

  while (remainingTenths > 0) {
    const availableImmunities = HARMFUL_IMMUNITIES.filter(k => !piece.immunities[k]);

    const candidates: Array<
      | { type: 'stat'; key: keyof StatModifier; cost: number }
      | { type: 'immunity'; cost: number }
    > = [];

    for (const [stat, weight] of Object.entries(VERSION_WEIGHTS)) {
      const cost = Math.round(weight * 10);
      const remainder = remainingTenths - cost;
      if (cost <= remainingTenths && (remainder !== 1 || availableImmunities.length > 0)) {
        candidates.push({ type: 'stat', key: stat as keyof StatModifier, cost });
      }
    }

    if (availableImmunities.length > 0 && remainingTenths >= immunityCost) {
      const remainder = remainingTenths - immunityCost;
      if (remainder !== 1 || availableImmunities.length >= 2) {
        candidates.push({ type: 'immunity', cost: immunityCost });
      }
    }

    if (candidates.length === 0) break;

    const pick = Random.pick(candidates);
    if (pick.type === 'stat') {
      mods[pick.key] = (mods[pick.key] ?? 0) + 1;
    } else {
      const imm = Random.pick(availableImmunities);
      piece.immunities[imm] = true;
      immunityCount++;
    }
    remainingTenths -= pick.cost;
  }

  if (Object.keys(mods).length > 0) {
    piece.addModifier(mods);
  }
  if (immunityCount > 0) {
    piece.version = addVersion(piece.version, immunityCount * IMMUNITY_VERSION_WEIGHT);
  }
  piece.resetMoves();
  piece.resetDefence();
}
