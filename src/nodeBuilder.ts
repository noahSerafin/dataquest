import type { Coordinate, Level } from "./types";
//rules for level generation:
/*
1: enemy spawn count, min difficultyValue+2, max difficultyValue +3
2: determine map grid size based on enemy count: max width/height is enemy count +2, one of either width or height must be the max, and the other dimension can be between enemy count and the max.
3: We do want gaps in the grid (exclude some random coordinates from the array, let's say roughly 1 in every 4 tiles of the regular grid) but all tiles must be connected to the rest by at least 1 horizontal or vertical neighbour
4: 1 player spawn, random position
5: closest point for an enemy spawn: 5 tiles away from player in distance travelled. For example a spawn can be closer than 5 in Manhattan distance if there is a gap that means it would take more than 5 moves to reach the player
6: enemy spawn sizes (head + extra tiles attached to the spawn head): at least 1 spawn > 3 but < 7, and at least difficultyValue spawn > 1 < 3
*/
//helpers
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

function key(x: number, y: number) {
  return `${x},${y}`;
}

function parseCoord(k: string): Coordinate {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
}

/*function shuffle(array: Array<any>) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
  */
//shorthand
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


//3
function generateFullGrid(width: number, height: number): Set<string> {
  const tiles = new Set<string>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.add(`${x},${y}`);
    }
  }

  return tiles;
}

function isConnected(tiles: Set<string>): boolean {
  if (tiles.size === 0) return true;

  const visited = new Set<string>();
  const start = tiles.values().next().value; // first tile
  const queue = [start];

  while (queue.length) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;

    visited.add(current);

    const { x, y } = parseCoord(current);

    const neighbors = [
      key(x + 1, y),
      key(x - 1, y),
      key(x, y + 1),
      key(x, y - 1),
    ];

    for (const n of neighbors) {
      if (tiles.has(n) && !visited.has(n)) {
        queue.push(n);
      }
    }
  }

  return visited.size === tiles.size;
}

function carveGaps(tiles: Set<string>, width: number, height: number) {
  const totalTiles = width * height;
  const targetRemovals = Math.floor(totalTiles * 0.25);

  const tileArray = shuffle(Array.from(tiles));
  //shuffle(tileArray);

  let removed = 0;

  for (const tile of tileArray) {
    if (removed >= targetRemovals) break;

    // Don't remove if it would leave too few tiles
    if (tiles.size <= 1) break;

    tiles.delete(tile);

    if (!isConnected(tiles)) {
      // restore
      tiles.add(tile);
    } else {
      removed++;
    }
  }

  return tiles;
}

//5
function computeDistancesFrom(
  start: Coordinate,
  tiles: Set<string>
): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: { x: number; y: number; d: number }[] = [];

  const startKey = key(start.x, start.y);
  queue.push({ x: start.x, y: start.y, d: 0 });
  distances.set(startKey, 0);

  while (queue.length) {
    const { x, y, d } = queue.shift()!;

    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const n of neighbors) {
      const k = key(n.x, n.y);

      if (!tiles.has(k)) continue;           // must exist
      if (distances.has(k)) continue;        // already visited

      distances.set(k, d + 1);
      queue.push({ x: n.x, y: n.y, d: d + 1 });
    }
  }

  return distances;
}

function findShortestPath(
  start: Coordinate,
  goal: Coordinate,
  tiles: Set<string>
): Coordinate[] {
  const queue: { x: number; y: number; path: Coordinate[] }[] = [];
  const visited = new Set<string>();

  const startKey = key(start.x, start.y);
  queue.push({ x: start.x, y: start.y, path: [start] });
  visited.add(startKey);

  const goalKey = key(goal.x, goal.y);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { x, y, path } = current;
    const currentKey = key(x, y);

    if (currentKey === goalKey) {
      return path;
    }

    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const n of neighbors) {
      const k = key(n.x, n.y);

      if (!tiles.has(k)) continue;
      if (visited.has(k)) continue;

      visited.add(k);
      queue.push({ x: n.x, y: n.y, path: [...path, n] });
    }
  }

  return [];
}

function growEnemy(
  head: Coordinate,
  targetSize: number,
  availableTiles: Set<string>
): Coordinate[] {
  const result: Coordinate[] = [];
  
  // 1. Validate and lock the head
  const headKey = key(head.x, head.y);
  if (!availableTiles.has(headKey)) return result;

  result.push(head);
  availableTiles.delete(headKey);

  // 2. Track the "tip" of the chain
  let currentTip = head;

  while (result.length < targetSize) {
    const neighbors = [
      { x: currentTip.x + 1, y: currentTip.y },
      { x: currentTip.x - 1, y: currentTip.y },
      { x: currentTip.x, y: currentTip.y + 1 },
      { x: currentTip.x, y: currentTip.y - 1 },
    ];

    // Shuffle to ensure the "random walk" feel
    const shuffledNeighbors = shuffle(neighbors);
    
    let moved = false;

    for (const n of shuffledNeighbors) {
      const k = key(n.x, n.y);

      if (availableTiles.has(k)) {
        // Add to result
        result.push(n);
        availableTiles.delete(k);
        
        // Move the tip to the new tile and mark that we successfully grew
        currentTip = n;
        moved = true;
        
        // Break the FOR loop immediately to ensure we only add ONE tile per step
        break; 
      }
    }

    // 3. Termination Condition: If no neighbors were available, the chain is stuck
    if (!moved) {
      break; 
    }
  }

  return result;
}

export function generateNode(difficulty: number): Level {
    const enemyCount = randInt(difficulty, difficulty + 3);

    const minSize = 6;
    const maxSize = Math.max(6, enemyCount + 2);

    const widthIsMax = Math.random() < 0.5;

    const width = widthIsMax
    ? maxSize
    : randInt(Math.max(enemyCount, minSize), maxSize);

    const height = widthIsMax
    ? randInt(Math.max(enemyCount, minSize), maxSize)
    : maxSize;

    //3
    const gridTiles = generateFullGrid(width, height);
    //remove random -
    //use isconnected each time, restore if false;
    //stop when targetRemovals is reached
    const carvedTiles = carveGaps(gridTiles, width, height);
    const tiles: Coordinate[] = Array.from(carvedTiles).map(parseCoord);

    //4
    console.log('tiles:', tiles);
    const playerTile = tiles[randInt(0, tiles.length-1)];

    //5
    console.log('player start:', playerTile);
    const distances = computeDistancesFrom(playerTile, carvedTiles);//function to find invalid tiles

    const validEnemyTiles: Coordinate[] = tiles.filter(tile => {
        const d = distances.get(key(tile.x, tile.y));
        return d !== undefined && d >= 6;
    });
    
    const shuffled: Coordinate[] = shuffle([...validEnemyTiles]);
    const headPositions = shuffled.slice(0, enemyCount);
    //something here to randomly assign enemy headpostions from the valid tiles

    let enemySpawns: any[] = [];
    for (let index = 0; index < enemyCount; index++) {
        const enemy = {"id": crypto.randomUUID(),
            "name": "Spawn",
            "team": "enemy",
            "headPosition": headPositions[index],
            "tiles": [],
            "rarity": randInt(Math.max(1, difficulty-1), difficulty)
        }
        enemySpawns.push(enemy);
    }

    //6
    const sizes: number[] = [];

    // one large
    sizes.push(randInt(4, 6));

    // difficulty medium
    for (let i = 0; i < difficulty; i++) {
        sizes.push(randInt(2, 4));
    }

    // fill remaining
    while (sizes.length < enemyCount) {
        sizes.push(1);
    }

    const availableTiles = new Set(carvedTiles);
    availableTiles.delete(key(playerTile.x, playerTile.y));//remove player spawn from set

    enemySpawns.forEach(enemy => {//from these, find paths to the player if possible, exclude these paths from growenemy (remove from availabletiles)
      if(enemy.headPosition){
        availableTiles.delete(key(enemy.headPosition.x,enemy.headPosition.y));//remove from avialable to grow into, //stops growth entirely for some reason???
        
        // Find a path to the player and reserve it so we don't block the spawn
        const pathToPlayer = findShortestPath(enemy.headPosition, playerTile, carvedTiles);
        pathToPlayer.forEach(p => {
          availableTiles.delete(key(p.x, p.y));
        });
      }
    });

    
    //grow spawns up to their assigned size or up to their limit
    for (let i = 0; i < enemySpawns.length; i++) {
      const spawn = enemySpawns[i];
      const targetSize = sizes[i] ?? 1;

      // 2. TEMPORARILY add this enemy's head back so the function can "see" it
      const headKey = key(spawn.headPosition.x, spawn.headPosition.y);
      availableTiles.add(headKey);

      const grownTiles = growEnemy(
        spawn.headPosition,
        targetSize,
        availableTiles
      );
        
      spawn.tiles = grownTiles;
    }
      /*grownTiles.forEach(tile => {
        availableTiles.delete(key(tile.x, tile.y));//remove from available for next enemy
      });*/

    return {
        name: `Generated-${difficulty}-${crypto.randomUUID()}`,
        tiles: [...tiles],//.map(parseCoord),
        pieces: [
            {
            "id": crypto.randomUUID(),
            "name": "Spawn",
            "team": "player",
            "headPosition": playerTile,
            "tiles": [],
            "rarity": 1
            },
            ...enemySpawns
        ]
    };
}

