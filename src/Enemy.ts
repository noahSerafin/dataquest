import type { Piece } from "./Pieces";
import type { Coordinate } from "./types";

export async function takeEnemyTurn(
  enemyPieces: Piece[],
  playerPieces: Piece[],
  activePieces: Piece[],
  removePieceCallback: (piece: Piece) => void,
  highlightMoves: (piece: Piece) => void,
  highlightTargets: (piece: Piece) => void,
  clearHighlights: () => void,
  tileSet: Set<string>,
  delay = 500 // ms between moves for visibility
) {
  for (const enemy of enemyPieces) {
    while (enemy.movesRemaining > 0 && enemy.actions > 0) {

      const isMaxSize = enemy.tiles.length === enemy.maxSize ? true : false

      // Check for any player piece in attack range
      const target = findPlayerInRange(enemy, playerPieces);
      if (target) {
        highlightTargets(enemy);
        await sleep(300);
        if(enemy.attack > target.defence){
          attackPiece(enemy, target);
          await sleep(delay);
          clearHighlights()
          if(isMaxSize){
            continue;
          }
        } else {
          clearHighlights();//move laterally to the player
        }
      }

      // Otherwise, move toward nearest player piece
      const nearestAttackable = findNearestAttackableCoordinate(enemy, playerPieces);
      const nearest = findNearestPieceCoordinate(enemy, activePieces);//differentiate between playerPieces/enemyPieces if enemy has a damaging/helpful special
      //also prioritise nearest if special move??
      //or decide randomly?
      
      //console.log('nearest:' , nearest);
      //console.log('nearestAttackable:' , nearestAttackable);
      if (!nearest && !nearestAttackable) break;

      let pathToNearest: Coordinate[] = [];
      if(nearestAttackable){
        pathToNearest = findShortestPath(enemy.headPosition, nearestAttackable, tileSet, activePieces) ?? []
      } else if(nearest){//can't attack but can increase enemies size
        pathToNearest = findShortestPath(enemy.headPosition, nearest, tileSet, activePieces) ?? []//move toward another piece
      }
      //console.log('path:' , pathToNearest);


      let nextStep = null;
      if(pathToNearest.length > 1){//if there is a path
        nextStep = pathToNearest[1]//next move should be along this path
      } else if(nearestAttackable){
        nextStep = getNextStepTowards(enemy.headPosition, nearestAttackable, tileSet, activePieces);//attempt to get in range
        //for ranged pieces only??
      } else if(nearest){
        nextStep = getNextStepTowards(enemy.headPosition, nearest, tileSet, activePieces);//attempt to get closer to another piece
      }
      if (nextStep) {
        highlightMoves(enemy);
        await sleep(300);
        enemy.moveTo(nextStep);
        await sleep(delay);
        clearHighlights();
      } else {
        // Cannot move, skip
        break;
      }

      const newTarget = findPlayerInRange(enemy, playerPieces);
      if (newTarget && enemy.attack > newTarget.defence) {
        highlightTargets(enemy);
        await sleep(300);
        attackPiece(enemy, newTarget);
        await sleep(delay);
        clearHighlights();
        continue; // still in loop if actions > 0
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

function findNearestAttackableCoordinate(
  enemy: Piece,
  playerPieces: Piece[]
): Coordinate | null {
  // Filter out pieces that the enemy can't damage
  const attackable = playerPieces.filter(p => enemy.attack > p.defence);
  if (attackable.length === 0) return null;

  let minDist = Infinity;
  let nearestCoord: Coordinate | null = null;

  for (const player of attackable) {
    for (const tile of player.tiles) {
      const dist = Math.abs(enemy.headPosition.x - tile.x)
                 + Math.abs(enemy.headPosition.y - tile.y);
      if (dist < minDist) {
        minDist = dist;
        nearestCoord = tile;
      }
    }
  }

  return nearestCoord;
}

function findNearestPieceCoordinate(//player/ enemy
  enemy: Piece,
  otherPieces: Piece[]
): Coordinate | null {

  let minDist = Infinity;
  let nearestCoord: Coordinate | null = null;

  for (const player of otherPieces) {
    for (const tile of player.tiles) {
      const dist = Math.abs(enemy.headPosition.x - tile.x)
                 + Math.abs(enemy.headPosition.y - tile.y);
      if (dist < minDist) {
        minDist = dist;
        nearestCoord = tile;
      }
    }
  }

  return nearestCoord;
}

// Check if any player piece is in range
function findPlayerInRange(enemy: Piece, playerPieces: Piece[]): Piece | null {
  const ex = enemy.headPosition.x;
  const ey = enemy.headPosition.y;

  for (const player of playerPieces) {
    for (const tile of player.tiles) {
      const dx = Math.abs(ex - tile.x);
      const dy = Math.abs(ey - tile.y);

      if (dx + dy <= enemy.range) {
        return player;//{ player, tile };
      }
    }
  }

  return null;
}

// Move one tile toward the target using simple orthogonal movement
function findShortestPath(
  start: Coordinate,
  goal: Coordinate,
  levelTiles: Set<string>,        // e.g., Set of "x,y" strings for walkable tiles
  activePieces: Piece[]
): Coordinate[] | null {
  const queue: { pos: Coordinate; path: Coordinate[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const occupiedTiles = new Set<string>();
  for (const p of activePieces) {
    for (const t of p.tiles) {
      occupiedTiles.add(`${t.x},${t.y}`);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { pos, path } = current;

    // Reached goal
    if (pos.x === goal.x && pos.y === goal.y) return path;

    for (const dir of directions) {
      const next = { x: pos.x + dir.x, y: pos.y + dir.y };
      const key = `${next.x},${next.y}`;

      // Skip if tile is invalid or occupied
      if (!levelTiles.has(key)) continue;
      if (occupiedTiles.has(key)) continue;
      if (visited.has(key)) continue;

      visited.add(key);
      queue.push({ pos: next, path: [...path, next] });
    }
  }

  return null; // No path found
}

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
  // if range is low, should really find a path to target around obstacles
  validMoves.sort((a, b) => {
    const distA = Math.abs(a.x - end.x) + Math.abs(a.y - end.y);
    const distB = Math.abs(b.x - end.x) + Math.abs(b.y - end.y);
    return distA - distB;
  });

  return validMoves[0];
}


