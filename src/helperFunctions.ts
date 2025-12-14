import type { Coordinate } from "./types";
import type { Piece } from "./Pieces";

function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

function getOccupiedTileSet(activePieces: Piece[]): Set<string> {
  const occupied = new Set<string>();

  for (const piece of activePieces) {
    for (const tile of piece.tiles) {
      occupied.add(coordKey(tile));
    }
  }

  return occupied;
}

export function getRandomUnoccupiedTile(
  tiles: Coordinate[],
  activePieces: Piece[]
): Coordinate | null {
  const occupied = getOccupiedTileSet(activePieces);

  const freeTiles = tiles.filter(tile => 
    !occupied.has(coordKey(tile))
  );

  if (freeTiles.length === 0) return null;

  const index = Math.floor(Math.random() * freeTiles.length);
  return freeTiles[index];
}