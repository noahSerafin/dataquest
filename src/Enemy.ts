import type { Piece } from "./Pieces";
import type { Coordinate } from "./types";

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
      const target = findPlayerInRange(enemy, playerPieces);
      if (target) {
        attackPiece(enemy, target);
        await sleep(delay);
        continue;
      }

      // Otherwise, move toward nearest player piece
      const nearest = findNearestPlayerPiece(enemy, playerPieces);
      if (!nearest) break;

      const nextStep = getNextStepTowards(enemy.headPosition, nearest.headPosition, tileSet, activePieces);
      if (nextStep) {
        enemy.moveTo(nextStep);
        await sleep(delay);
      } else {
        // Cannot move, skip
        break;
      }
    }
  }
}

// --- HELPER FUNCTIONS ---

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function attackPiece(attacker: Piece, defender: Piece) {
  const damage = attacker.attack;
  defender.takeDamage(damage);
  attacker.actions--;
}

// Simple "nearest piece" by Manhattan distance
function findNearestPlayerPiece(enemy: Piece, playerPieces: Piece[]): Piece | null {
  if (playerPieces.length === 0) return null;

  let minDist = Infinity;
  let nearest: Piece | null = null;

  for (const player of playerPieces) {
    const dist = Math.abs(enemy.headPosition.x - player.headPosition.x)
               + Math.abs(enemy.headPosition.y - player.headPosition.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = player;
    }
  }

  return nearest;
}

// Check if any player piece is in range
function findPlayerInRange(enemy: Piece, playerPieces: Piece[]): Piece | null {
  for (const player of playerPieces) {
    const dx = Math.abs(enemy.headPosition.x - player.headPosition.x);
    const dy = Math.abs(enemy.headPosition.y - player.headPosition.y);
    if (dx + dy <= enemy.range) {
      return player;
    }
  }
  return null;
}

// Move one tile toward the target using simple orthogonal movement
function getNextStepTowards(
  start: Coordinate,
  end: Coordinate,
  tileSet: Set<string>,
  activePieces: Piece[]
): Coordinate | null {
  const directions: Coordinate[] = [
    { x: start.x + 1, y: start.y },
    { x: start.x - 1, y: start.y },
    { x: start.x, y: start.y + 1 },
    { x: start.x, y: start.y - 1 }
  ];

  const occupiedTiles = new Set<string>();
  for (const p of activePieces) {
    for (const t of p.tiles) {
      occupiedTiles.add(`${t.x},${t.y}`);
    }
  }

  // Filter out invalid/occupied tiles
  const validMoves = directions.filter(d => tileSet.has(`${d.x},${d.y}`) && !occupiedTiles.has(`${d.x},${d.y}`));

  if (validMoves.length === 0) return null;

  // Pick the move that minimizes Manhattan distance to the target
  validMoves.sort((a, b) => {
    const distA = Math.abs(a.x - end.x) + Math.abs(a.y - end.y);
    const distB = Math.abs(b.x - end.x) + Math.abs(b.y - end.y);
    return distA - distB;
  });

  return validMoves[0];
}
