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
  range: 1,
  attack: 0,
  defence: 0
};
//Giant, Fast/Speedy, Longshot, Vicious/Savage, Stalwart
//Lumbering +MS -moves, lightweight +moves -MS, overreaching +range -atk, beserker +atk -def, Ironclad +def - moves
export const PIECE_VARIANTS: PieceVariant[] = [ //have visual variants instead of text?
  {name: 'Large', mods: {maxSize: 1}, minDifficulty: 1}, ///green
  {name: 'Giant', mods: {maxSize: 2}, minDifficulty: 2}, //shiny green
  {name: 'Fast', mods: {moves: 1}, minDifficulty: 2}, //blue/yellow??
  {name: 'Speedy', mods: {moves: 2}, minDifficulty: 3}, //shiny blue/yellow
  {name: 'Longshot', mods: {range: 1}, minDifficulty: 2}, //orange
  {name: 'Sharp', mods: {attack: 1}, minDifficulty: 2}, //steel
  {name: 'Bronze', mods: {defence: 1}, minDifficulty: 2},
  {name: 'Bloated', mods: {maxSize: 1, moves: -1}, minDifficulty: 1}, //dark green
  {name: 'Lightweight', mods: {maxSize: -1, moves: +1}, minDifficulty: 1}, //wood
  {name: 'Reaching', mods: {range: +1, attack: -1}, minDifficulty: 1}, //orange glas
  {name: 'Beserker', mods: {moves: +1, attack: +1, defence: -1}, minDifficulty: 3}, //red tint glass
  {name: 'Lead', mods: {defence: +1, moves: -1}, minDifficulty: 1},
  {name: 'Towering', mods: {range: +1, moves: -1}, minDifficulty: 3},
  {name: 'Vicious', mods: {moves: +1, attack: +1}, minDifficulty: 4},
  {name: 'Savage', mods: {attack: +1, maxSize: -1, range: -1, defence: +1}, minDifficulty: 3},
  {name: 'Cautious', mods: {defence: +2, attack: -1}, minDifficulty: 3},
  {name: 'Stone', mods: {defence: +2, moves: -1}, minDifficulty: 3},
  {name: 'Steel', mods: {defence: +2}, minDifficulty: 4},
  {name: 'Glass', mods: {attack: +3, maxSize: -1, defence: -2}, minDifficulty: 4},
  {name: 'Overclocked', mods: {maxSize: -1, defence: -1, moves: +1, range: +1, attack: +1}, minDifficulty: 3}, //pink/purple shiny
  {name: 'Gold', mods: {maxSize: +1, defence: +1, moves: +1, range: +1, attack: +1}, minDifficulty: 5}, //pink/purple shiny
  {name: 'Holographic', mods: {maxSize: +2, defence: +2, moves: +2, range: +2, attack: +2}, minDifficulty: 5}, //pink/purple shiny
  //holo +1 to all
  //red shiny +0.5 dmg mult
  //gold + money to player
] 
//instead of +- number, +- security level???
/*
.v_bronze
  color: #87442b;
.v_silver
  color: #838489;
.v_gold
  color: #ffd046;
.v_steel
  color: #8384c7;
.v_diamond
  color: #12add9;
.v_lead
  color: #424357;
.v_cobalt
  color: #002de0;
.v_verdigree
  color: #024a19;
.v_Giant
  color: #0ab342;
.v_wood
.v_stone
.v_plated
.v_phosphorous
.v_stilted
.v_bloody
.v_beserk
.v_holo
export const VARIANTS: PieceVariant[] = [ //have visual variants instead of text?
  {name: 'Verdigree', mods: {maxSize: 1}, minDifficulty: 1}, ///green
  {name: 'Giant', mods: {maxSize: 2}, minDifficulty: 2}, //shiny green
  {name: 'Fast', mods: {moves: 1}, minDifficulty: 2}, //blue/yellow??
  {name: 'Speedy', mods: {moves: 2}, minDifficulty: 3}, //shiny blue/yellow
  {name: 'Longshot', mods: {range: 1}, minDifficulty: 2}, //orange
  {name: 'Keen', mods: {attack: 1}, minDifficulty: 2}, //steel
  {name: 'Stalwart', mods: {defence: 1}, minDifficulty: 2}, //bronze
  {name: 'Lumbering', mods: {maxSize: 1, moves: -1}, minDifficulty: 1}, //dark green
  {name: 'Lightweight', mods: {maxSize: -1, moves: +1}, minDifficulty: 1}, //wood
  {name: 'Overreaching', mods: {range: +1, attack: -1}, minDifficulty: 1}, //orange glas
  {name: 'Beserker', mods: {moves: +1, attack: +1, defence: -1}, minDifficulty: 3}, //red tint glass
  {name: 'Hardshell', mods: {defence: +1, moves: -1}, minDifficulty: 1}, //lead
  {name: 'Towering', mods: {range: +1, moves: -1}, minDifficulty: 3}, //bolt pattern orange 
  {name: 'Vicious', mods: {moves: +1, attack: +1}, minDifficulty: 4}, //red/blood
  {name: 'Savage', mods: {attack: +1, maxSize: -1, range: -1, defence: +1}, minDifficulty: 3}, //stone/flint texture
  {name: 'Cautious', mods: {defence: +2, attack: -1}, minDifficulty: 3}, //yellow
  {name: 'Ironclad', mods: {defence: +2, moves: -1}, minDifficulty: 3}, //stone/granite
  {name: 'Reinforced', mods: {defence: +2}, minDifficulty: 4}, //steel
  {name: 'Overclocked', mods: {maxSize: -1, defence: -1, moves: +1, range: +1, attack: +1}, minDifficulty: 5}, //pink/purple shiny
  //holo +1 to all
  //red shiny +0.5 dmg mult
  //gold + money to player
] */