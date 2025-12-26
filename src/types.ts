// Define a coordinate type for readability
export type Coordinate = { x: number; y: number }
import { Item } from "./Items";
import { Admin } from "./AdminPrograms";

export type PieceBlueprint = {
  id: string
  name: string
  description: string
  unicode: string
  maxSize: number
  moves: number
  range: number
  attack: number
  defence: number
  rarity: number
  color: string
  isPlaced: boolean
  cost: number
  hybridName?: string
  extraUnicode?: string
}

export interface HybridBlueprint extends PieceBlueprint {
  kind: 'hybrid'
  primary: PieceBlueprint
  secondary: PieceBlueprint
}

export type OS = {
  name: string
  unicode: string
  money: number
  memory: number
  adminSlots: number
  blueprints: PieceBlueprint[]
  items: Item[]
  admins: Admin[]
  lives: number
  description: string
}

export type StatModifier = {
  moves?: number
  attack?: number
  defence?: number
  range?: number
  maxSize?: number
  actions?: number
}

export type Level = {
  name: string,
  tiles: Coordinate[],
  pieces: any[]
}

export type Statuses = {
  //negative
  diseased: boolean //-1 max size every turn //FACE WITH OPEN MOUTH VOMITING, U+1F92E
  slowed: boolean //-1 moves every turn //FACE WITH OPEN MOUTH AND COLD SWEAT, U+1F630
  blinded: boolean //range = -= //  DIZZY FACE, U+1F635
  burning: boolean //-1 size every turn //OVERHEATED FACE, U+1F975
  poisoned: boolean //-1 defence every turn //NAUSEATED FACE, U+1F922
  frozen: boolean //movesRemaining = 0 // FREEZING FACE, U+1F976
  charmed: boolean //controlled by the opposite team, requires editing targeting // SMILING FACE WITH HEART-SHAPED EYES, U+1F60D
  confused: boolean //move buttons scrambled, requires editing controller // FACE WITH HEAD-BANDAGE, U+1F915
  exposed: boolean //immune to hiding
  //positive
  hidden: boolean// not visible to opposite team, requires editing targeting  //FACE WITH FINGER COVERING CLOSED LIPS, U+1F92B
  negative: boolean// can occupy the same space as another piece, requires editing movement // DOTTED LINE FACE, U+1FAE5
}

export function createDefaultStatuses(): Statuses {
  return {
    diseased: false,
    slowed: false,
    blinded: false,
    burning: false,
    poisoned: false,
    frozen: false,
    charmed: false,
    confused: false,
    exposed: false,

    hidden: false,
    negative: false,
  };
}

export type StatusKey = keyof Statuses;


export type Immunities = {
  [K in StatusKey]?: boolean;
};

/*
export const statusUnicodes: Record<keyof typeof props.piece.statuses, string> = {
  diseased: '🤮', // U+1F92E
  slowed: '😰',   // U+1F630
  blinded: '😵',  // U+1F635
  burning: '🥵',  // U+1F975
  poisoned: '🤢', // U+1F922
  frozen: '🥶',   // U+1F976
  charmed: '😍',  // U+1F60D
  confused: '🤕', // U+1F915
  hidden: '🤫',   // U+1F92B
  negative: '🫥'  // U+1FAE5
}*/

export type Company = {
  name: string,
  abbr: string,
  unicode: string
}

export type SkipReward =
  | { kind: "blueprint"; value: PieceBlueprint }
  | { kind: "admin"; value: Admin }
  | { kind: "item"; value: Item };