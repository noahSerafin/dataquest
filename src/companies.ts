import type { Company } from "./types";
import { allPieces, cookiePieces, flybyPieces, monkeyPieces, NightbridgePieces, pandaPieces, redskyPieces, sakuraPieces } from "./Pieces";
import { MeridianPieces } from "./Pieces";
import { longHousePieces } from "./Pieces";
import { TsukimiPieces } from "./Pieces";
import { zenithPieces } from "./Pieces";
import { starlanePieces } from "./Pieces";
import { sunrisePieces } from "./Pieces";
//import saturnpieces just use allPieces for now

import { whiteflowerPieces } from "./Pieces";

export const bossCompany: Company = { name: 'Umbrella', abbr: 'BOSS', unicode: "", pieceList: allPieces, tileColor: "rgb(34, 53, 12)", edgeColor: "#9CC954"};
export const companies: Company[] = [
    { name: 'Saturn Solutions', abbr: 'SSL', unicode: "U+1FA90", pieceList: allPieces, tileColor: "rgb(74, 74, 74)", edgeColor: "#e9e9e9"},
    { name: 'Nightbridge Corp', abbr: 'NBC',  unicode: "U+1F309", pieceList: NightbridgePieces, tileColor: "rgb(62, 9, 66)", edgeColor: "#f7acee"},
    { name: 'Meridian Security Inc.', abbr: 'MSI', unicode: "U+1F310", pieceList: MeridianPieces, tileColor: "rgb(14, 10, 77)", edgeColor: "#59f0f3"},
    { name: 'Longhouse Web Services', abbr: 'LWS', unicode: "U+1F6D6", pieceList: longHousePieces, tileColor: "rgb(63, 28, 4)", edgeColor: "#e39740"},
    { name: 'Tsukimi Group', abbr: 'TKG', unicode: "U+1F391", pieceList: TsukimiPieces, tileColor: "rgb(78, 78, 78)", edgeColor: "#e4e4e4"},
    { name: 'Zenith Ltd.', abbr: 'ZNT', unicode: "U+1F304", pieceList: zenithPieces, tileColor: "rgb(234, 234, 234)", edgeColor: "#a1a1a1"},
    { name: 'Starlane Tech', abbr: 'SLT', unicode: "U+1F30C", pieceList: starlanePieces, tileColor: "rgb(29, 29, 29)", edgeColor: "#fffa92"},
    { name: 'Sunrise Associates', abbr: 'SRA', unicode: "U+1F305", pieceList: sunrisePieces, tileColor: "rgb(184, 98, 0)", edgeColor: "#f6fc4f"},
    { name: 'Flyby Surveilance', abbr: 'FBS', unicode: "U+1FAB0", pieceList: flybyPieces, tileColor: "rgb(105, 108, 105)", edgeColor: "#f3f97d"},
    { name: 'Monkey Media', abbr: 'MMD', unicode: "U+1F412", pieceList: monkeyPieces, tileColor: "rgb(80, 6, 66)", edgeColor: "#f82bee"},//"U+1F435" },
    { name: 'Red Sky Dynamics', abbr: 'RSD', unicode: "U+1F3B4", pieceList: redskyPieces, tileColor: "rgb(113, 0, 0)", edgeColor: "#fb7d3f"},
    { name: 'Whiteflower Global', abbr: 'WFG', unicode: "U+1F4AE", pieceList: whiteflowerPieces, tileColor: "rgb(238, 239, 218)", edgeColor: "#80537e"},
    { name: 'Cook.io', abbr: 'CKI', unicode: "U+1F36A", pieceList: cookiePieces, tileColor: "rgb(204, 148, 36)", edgeColor: "#421c01"},
    { name: 'Sakura Robotics', abbr: 'SRB', unicode: "U+1F338", pieceList: sakuraPieces, tileColor: "rgb(165, 33, 150)", edgeColor: "#f7d8f4"},
    { name: 'Panda Holdings LLC', abbr: 'PAN', unicode: "U+1F43C", pieceList: pandaPieces, tileColor: "rgb(22, 45, 19)", edgeColor: "#ffd884"},
]

// PANDA FACE, U+1F43C
//flavour of pieces 
//NBC - standard, trap, and bomb pieces
//export const NightbridgePieces = [Knife, Sling, Fence, Stonewall, Gate, Firewall, Pitfall, Cannon, Nerf, Dynamite, Bomb, Dataworm, Copycat, Trap, Trojan, Watchman, Highwayman, Fencer, Shark, Oni, Bug, Troll, Firebrand, Golem, Potato, Ghost, Helicopter, TP, UFO]

//Meridian - Emphasis on defensive pieces
//export const MeridianPieces = [Knife, Sling, Dagger, Arms, Shield, Aegis, Greatshield, Fence, Stonewall, Gate, Firewall, Trojan, Nerf]

//Longhouse - medival type pieces, sword, shield, tojaflute etc., traps

//Tsukimi - attacking, ranged, bomb pieces

//Zenith - large pieces, special move pieces

//Starlane - high range pieces

//Sunrise - animal pieces.

//FlyBy - exposers watchman, bug type pieces, small pieces

//Monkey - high move pieces, 

//Red Sky - high attack pieces, large defensive pieces, bombs

//Whiteflower - all pieces, traps

//Cook.io - Household object pieces

//Sakura - special move pieces, trap pieces

/*
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
*/





