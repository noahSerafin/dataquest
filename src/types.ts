// Define a coordinate type for readability
export type Coordinate = { x: number; y: number }
import { Piece } from "./Pieces";

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
  //name: string
  tiles: Coordinate[],
  pieces: any[]
}

//statuses
//status symbols
//negative:
//burning, poisoned/diseased, slowed, charmed
//OVERHEATED FACE, U+1F975 overheating
//NAUSEATED FACE, U+1F922
//FACE WITH OPEN MOUTH VOMITING, U+1F92E
//FACE WITH OPEN MOUTH AND COLD SWEAT, U+1F630
// SNEEZING FACE, U+1F927
// FACE WITH HEAD-BANDAGE, U+1F915
//FREEZING FACE, U+ slowed
//HEART WITH ARROW, U+1F498 charmed
//positive:
//FACE WITH FINGER COVERING CLOSED LIPS, U+1F92B hidden
//negative
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

    hidden: false,
    negative: false,
  };
}

export type Immunities = {
  //negative only
  burnImmune: boolean
  slowImmune: boolean
  poisonImmune: boolean
  diseaseImmune: boolean
  freezeImmune: boolean
  blindImmune: boolean
  charmImmune: boolean
  confuseImmune: boolean
  //positive immunity (bad)
  hideImmune: boolean
}

export function createDefaultImmunities() {
  return{
    //negative only
    burnImmune: false,
    slowImmune: false,
    poisonImmune: false,
    diseaseImmune: false,
    freezeImmune: false,
    blindImmune: false,
    charmImmune: false,
    confuseImmune: false,
    //positive immunity (bad)
    hideImmune: false //FACE WITH PEEKING EYE, U+1FAE3
  }
}