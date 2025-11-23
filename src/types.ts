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
  //headposition, tiles optional for maps
}

export type Level = {
  //name: string
  tiles: Coordinate[],
  pieces: any[]
}