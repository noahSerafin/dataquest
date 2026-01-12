import type { StatKey, PieceVariant } from "./types";

export const DIFFICULTY_RARITY: Record<number, { min: number; max: number }> = {
  1: { min: 1, max: 1 },
  2: { min: 1, max: 2 },
  3: { min: 2, max: 3 },
  4: { min: 3, max: 4 },
  5: { min: 4, max: 5 },
  6: { min: 5, max: 6 },
};

export const STAT_MIN: Record<StatKey, number> = {
  maxSize: 1,
  moves: 0,
  range: 0,
  attack: 0,
  defence: 0
};
//Giant, Fast/Speedy, Longshot, Vicious/Savage, Stalwart
//Lumbering +MS -moves, lightweight +moves -MS, overreaching +range -atk, beserker +atk -def, Ironclad +def - moves
export const PIECE_VARIANTS: PieceVariant[] = [
  {name: 'Large', mods: {maxSize: 1}, minDifficulty: 1},
  {name: 'Giant', mods: {maxSize: 2}, minDifficulty: 2},
  {name: 'Fast', mods: {moves: 1}, minDifficulty: 2},
  {name: 'Speedy', mods: {moves: 2}, minDifficulty: 3},
  {name: 'Longshot', mods: {range: 1}, minDifficulty: 2},
  {name: 'Keen', mods: {attack: 1}, minDifficulty: 2},
  {name: 'Stalwart', mods: {defence: 1}, minDifficulty: 2},
  {name: 'Lumbering', mods: {maxSize: 1, moves: -1}, minDifficulty: 1},
  {name: 'Lightweight', mods: {maxSize: -1, moves: +1}, minDifficulty: 1},
  {name: 'Overreaching', mods: {range: +1, attack: -1}, minDifficulty: 1},
  {name: 'Beserker', mods: {moves: +1, attack: +1, defence: -1}, minDifficulty: 3},
  {name: 'Hardshell', mods: {defence: +1, moves: -1}, minDifficulty: 1},
  {name: 'Towering', mods: {range: +1, moves: -1}, minDifficulty: 3},
  {name: 'Vicious', mods: {moves: +1, attack: +1}, minDifficulty: 4},
  {name: 'Savage', mods: {attack: +1, maxSize: -1, range: -1, defence: +1}, minDifficulty: 3},
  {name: 'Cautious', mods: {defence: +2, attack: -1}, minDifficulty: 3},
  {name: 'Ironclad', mods: {defence: +2, moves: -1}, minDifficulty: 3},
  {name: 'Reinforced', mods: {defence: +2}, minDifficulty: 4},
  {name: 'Overclocked', mods: {maxSize: -1, defence: -1, moves: +1, range: +1, attack: +1}, minDifficulty: 5},
]