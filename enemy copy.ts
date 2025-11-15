import type { Piece } from "./src/Pieces";
import type { Coordinate } from "./src/types";

// Utility functions that you’ll implement later
// function findNearestPlayerPiece(piece: Piece, playerPieces: Piece[]): Piece | null {}
// function pathfind(start: Coordinate, end: Coordinate, tileSet: Set<string>, occupiedTiles: Map<string, Piece>): Coordinate[] {}
// function isPlayerPieceInRange(piece: Piece, playerPieces: Piece[]): Piece | null {}

export async function takeEnemyTurn(
  enemyPieces: Piece[],
  playerPieces: Piece[],
  activePieces: Piece[],
  tileSet: Set<string>,
  removePieceCallback: (piece: Piece) => void,
  delay = 500 // ms between moves for visibility
) {
  for (const enemy of enemyPieces) {
    while (enemy.movesRemaining > 0 && enemy.actions > 0) {

      // Check for any player piece in attack range
      // const target = isPlayerPieceInRange(enemy, playerPieces);
      // if (target) {
      //   enemy.attack(target);
      //   await sleep(delay);
      //   continue; // Check if still has moves/actions
      // }

      // Otherwise, move toward nearest player piece
      // const nearest = findNearestPlayerPiece(enemy, playerPieces);
      // if (!nearest) break;

      // const path = pathfind(enemy.headPosition, nearest.headPosition, tileSet, new Map(activePieces.map(p => [`${p.headPosition.x},${p.headPosition.y}`, p])));
      // if (path.length > 0) {
      //   const nextStep = path[0];
      //   enemy.moveTo(nextStep);
      //   await sleep(delay);
      // }
    }
  }
}

// Simple async sleep helper
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
