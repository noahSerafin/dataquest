// Define a coordinate type for readability
export type Coordinate = { x: number; y: number }

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
  // maybe upgrade info later, etc...
  //tiles optional for maps
}

export type Level = {
  tiles: Coordinate[],
  pieces: any[]//change to blueprints later
}