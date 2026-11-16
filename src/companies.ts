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

export const shopCompany: Company = Object.freeze({ iconID: 499, name: 'SPEC', abbr: 'SHOP', unicode: "", pieceList: allPieces, tileColor: "rgb(34, 53, 12)", edgeColor: "rgb(156, 201, 84)" });
export const playerCompany: Company = Object.freeze({ iconID: 499, name: 'SPEC', abbr: '???', unicode: "", pieceList: allPieces, tileColor: "rgb(34, 53, 12)", edgeColor: "rgb(156, 201, 84)" });
export const bossCompany: Company = Object.freeze({ iconID: 499, name: 'Umbrella', abbr: 'BOSS', unicode: "", pieceList: allPieces, tileColor: "rgb(34, 53, 12)", edgeColor: "rgb(156, 201, 84)" });
export const companies: Company[] = [
  { iconID: 444, name: 'Saturn Solutions', abbr: 'SSL', unicode: "U+1FA90", pieceList: allPieces, tileColor: "rgb(34, 53, 12)", edgeColor: "rgb(255, 139, 31)", description: "A well equipped tech company specialising in red hat operations for hire. Has access to every program in cyberspace to facilitate these goals. Nothing is beyond their reach." },
  { iconID: 445, name: 'Nightbridge Corp', abbr: 'NBC', unicode: "U+1F309", pieceList: NightbridgePieces, tileColor: "rgb(47, 11, 86)", edgeColor: "rgb(247, 172, 238)", description: "A mysterious and reclusive corporation famed for their surveillance tech and cyberwarfare expertise. Known to use programs with high attack, and make use of trap and bomb type programs." },
  { iconID: 446, name: 'Meridian Security Inc.', abbr: 'MSI', unicode: "U+1F310", pieceList: MeridianPieces, tileColor: "rgb(14, 10, 77)", edgeColor: "rgb(89, 240, 243)", description: "A security company with a disposition for defensive software. Known for their shield and wall type programs." },
  { iconID: 447, name: 'Longhouse Web Services', abbr: 'LWS', unicode: "U+1F6D6", pieceList: longHousePieces, tileColor: "rgb(63, 28, 4)", edgeColor: "rgb(227, 151, 64)", description: "A globally established web service provider. Longhouse uses a select group of programs favouring simplicity and reliability." },
  { iconID: 448, name: 'Tsukimi Group', abbr: 'TKG', unicode: "U+1F391", pieceList: TsukimiPieces, tileColor: "rgb(78, 78, 78)", edgeColor: "rgb(228, 228, 228)", description: "Tsukimi are specialists in on-site defence for server farms, using a mix of high powered, ranged, and trap programs to neutralise threats early." },
  { iconID: 449, name: 'Zenith Ltd.', abbr: 'ZEN', unicode: "U+1F304", pieceList: zenithPieces, tileColor: "rgb(234, 234, 234)", edgeColor: "rgb(161, 161, 161)", description: "As a large company with many subsidiaries, Zenith Ltd. has access to a diverse range of programs. They choose to focus particularly on large programs, and ones with special abilities." },
  { iconID: 450, name: 'Starlane Technologies', abbr: 'SLT', unicode: "U+1F30C", pieceList: starlanePieces, tileColor: "rgba(2, 1, 19, 1)", edgeColor: "rgba(252, 255, 228, 1)", description: "Starlane Technologies specialise in aerospace and satellite tech. They are known to favour high range programs." },
  { iconID: 451, name: 'Sunrise Associates', abbr: 'SRA', unicode: "U+1F305", pieceList: sunrisePieces, tileColor: "rgb(184, 98, 0)", edgeColor: "rgb(246, 252, 79)", description: "Publically facing, Sunrise Associates work in conservation and various ecology projects. Although they also have ties to areas in global finance. They speciliase in animal themed programs." },
  { iconID: 452, name: 'Flyby Surveilance', abbr: 'FBS', unicode: "U+1FAB0", pieceList: flybyPieces, tileColor: "rgb(105, 108, 105)", edgeColor: "rgb(243, 249, 125)", description: `Flyby Surveillance is a corporate intelligence and counter-intelligence agency that specializes in "bug sweeping" and digital forensics. Their approach combines high-speed data extraction with "sticky" (hindering) software to trap opposing programs.` },
  { iconID: 453, name: 'Monkey Media', abbr: 'MMD', unicode: "U+1F412", pieceList: monkeyPieces, tileColor: "rgb(80, 6, 66)", edgeColor: "rgb(248, 43, 238)", description: `The go to corporation for manufactured "soft power", Monkey Media run the world's largest collection of online news and entertainment platforms. Frequently aqquiring competitors to maintain their dominance. Their programs utilise high movement and the use of statuses.` },//"U+1F435" },
  { iconID: 454, name: 'Red Sky Dynamics', abbr: 'RSD', unicode: "U+1F3B4", pieceList: redskyPieces, tileColor: "rgb(113, 0, 0)", edgeColor: "rgb(251, 125, 63)", description: "RSD are the largest supplier of arms and munitions globally. Their programs focus on the pure utility of range and damage output, along with large defensive and support programs." },
  { iconID: 455, name: 'Whiteflower Global', abbr: 'WFG', unicode: "U+1F4AE", pieceList: whiteflowerPieces, tileColor: "rgb(238, 239, 218)", edgeColor: "rgb(128, 83, 126)", description: `Originally a pharmacutical company, Whiteflower now meets every definition of an "umbrella" corporation, with assets in nearly every conceivable branch of industry. As such they have a diverse selection of programs, with a focus on status applying software.` },
  { iconID: 456, name: 'Cook.io', abbr: 'CKI', unicode: "U+1F36A", pieceList: cookiePieces, tileColor: "rgb(204, 148, 36)", edgeColor: "rgb(66, 28, 1)", description: "Primarily an online ditributor of foodstuffs, Cook industries is also heavily invested in various branches of agriculture. Their programs are more limited in scope, frequently opting for simplicity over complex mechanics." },
  { iconID: 457, name: 'Sakura Robotics', abbr: 'SRB', unicode: "U+1F338", pieceList: sakuraPieces, tileColor: "rgb(165, 33, 150)", edgeColor: "rgb(247, 216, 244)", description: "Sakura Robotics works in highly specialised physical tech and software. Their programs will use every trick in the book to gain the edge." },
  { iconID: 458, name: 'Panda Holdings LLC', abbr: 'PAN', unicode: "U+1F43C", pieceList: pandaPieces, tileColor: "rgb(22, 45, 19)", edgeColor: "rgb(255, 216, 132)", description: "Panda Holdings operates as a custodian of financial assets, and manages a number of high profile clients through a network of offshore shell companies. Their programs are designed more to slow down and pin would be attackers, rather than go on the offensive themselves." }
].map(c => Object.freeze(c));

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





