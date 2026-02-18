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
    return Math.random() * (max - min) + min;
}

function key(x: number, y: number) {
  return `${x},${y}`;
}

function parseCoord(k: string): Coordinate {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
}

function shuffle(array: Array<any>) {
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
/*shorthand
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
*/

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

  const tileArray = Array.from(tiles);
  shuffle(tileArray);

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
    const playerTile = tiles[randInt(0, tiles.length-1)];

    //5 -TBC
    const distances = computeDistancesFrom(playerTile, tiles);//function to find invalid tiles

    const validEnemyTiles = [...tiles].filter(tile =>
        distances.get(key(tile)) >= 5
    );

    //randomly assign enemy headpostions from the valid tiles
    let headPositions: Coordinate[] = [];

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

    function growSpawn(//ask about this
        head: Coordinate,
        size: number,
        availableTiles: Set<string>
    ): Coordinate[] {
        const result = [head];
        const used = new Set([key(head)]);

        while (result.length < size) {
            const candidates = result.flatMap(t =>
                neighbors(t.x, t.y)
            ).filter(n =>
                availableTiles.has(key(n)) &&
                !used.has(key(n))
            );

            if (!candidates.length) break;

            const next = randomChoice(candidates);
            result.push(next);
            used.add(key(next));
        }

        return result;
    }

    return {
        name: `Generated-${difficulty}-${crypto.randomUUID()}`,
        tiles: [...tiles].map(parseCoord),
        pieces: [
            createSpawn('player', playerTile, 1),
            ...enemySpawns
        ]
    };
}

