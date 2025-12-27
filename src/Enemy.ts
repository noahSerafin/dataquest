import type { Piece } from "./Pieces";
import type { Coordinate } from "./types";
type EnemyIntent =
  | { type: 'attack'; target: Piece }
  | { type: 'special'; target: Piece | Coordinate | Piece[] | {piece: Piece, target: Coordinate} | {line: Coordinate[], activePieces: Piece[]} | { target: Coordinate, activePieces: Piece[] } | null }
  | { type: 'move'; path: Coordinate[] }
  | { type: 'wander'; space: Coordinate }
  | { type: 'wait' };

function decideEnemyIntent(
  enemy: Piece,
  activePieces: Piece[],
  playerPieces: Piece[],
  tileSet: Set<string>
): EnemyIntent {
  //first look for a player to attack or use special on
  const target = findWeakestPlayerInRange(enemy, playerPieces);//returning null even when there is a piece??!!!
  console.log('finding ', enemy.name, ' intent...')
  console.log('target: ', target)
  if (target && enemy.actions > 0 ){//target found
    console.log('target found');
    if(enemy.specialName && !enemy.hasFriendlySpecial && enemy.targetType !== 'trapPiece'){//can we use an attacking special?
      //line and pieceAndplace types also need the target location
      if(enemy.targetType === 'line'){//line type pieces
        const options = getAllTilesInStraightLines(enemy.headPosition, enemy.getStat('range'), tileSet);//all line tiles in range
        const optionSet = new Set(options.map(t => `${t.x},${t.y}`));
        let newTarget: { piece: Piece; place: Coordinate } | null = null;
        for (const player of playerPieces) {
          if (player.statuses.hidden) continue;
          for (const tile of player.tiles) {
             const key = `${tile.x},${tile.y}`;
            if (optionSet.has(key)) {
              newTarget = { piece: player, place: tile };
              break;
            }
          }
        }
        if (newTarget)  return { type: 'special', target: {line: getTilesInLine(enemy, newTarget.place), activePieces: activePieces} }
      }
      if(enemy.targetType == 'pieceAndPlace' && target.piece.headPosition !== target.place){
        return { type: 'special', target: {piece: target.piece, target: target.place}}
      }
      if(enemy.targetType === 'piece'){ ///can execute a special
        return { type: 'special', target: target.piece };
      }
      if(enemy.targetType === 'group'){//bomb type pieces
        return { type: 'special', target: findAnyPiecesInRange(enemy, activePieces)}
      }
    }
    console.log('no special moves');
    //if target is not attackable, is there one that is?
    if(target.piece.getStat('defence') < enemy.getStat('attack') && enemy.canAttack){//no special to use, can we attack?
      console.log('attacking target');
      return {type: 'attack', target: target.piece}
    }
  }
  //no immediate attackable target, expose if possible
  if(enemy.actions > 0 && enemy.hasExposingSpecial){
    return {type: 'special', target: (findAnyPiecesInRange(enemy, activePieces))}
  }
  //otherwise we look for a target
  let nearest = (enemy.specialName && !enemy.hasFriendlySpecial && enemy.targetType !== 'trapPiece') ? findNearestPieceCoordinate(enemy, playerPieces) : findNearestAttackableCoordinate(enemy, playerPieces);

  if (!target && nearest && enemy.movesRemaining > 0) {//
    console.log('found player to move towards at: ', nearest);
    console.log('path: ', findShortestPath(enemy.headPosition, nearest, tileSet, activePieces))
    const path = findShortestPath(enemy.headPosition, nearest, tileSet, activePieces);//don't put this inside a loop
    if (path && path.length > 1) {//should really never get to path.length = 1, why is there no target if we are next to the goal of path?
      console.log('found a path to the player')
      return { type: 'move', path };//move toward a target
    }
  }
  
  if(enemy.actions > 0){//still have an action?
    if(enemy.targetType === 'self'){
      return {type: 'special', target: enemy}
    }
    if(enemy.targetType === 'space'){
      const space = getAnySpaceInRange(enemy, activePieces, tileSet)
      if(space) return {type: 'special', target: {target: space, activePieces: activePieces}}
    }
  }
  
  //no targets, or no actions left
  if(enemy.tiles.length < enemy.maxSize && enemy.movesRemaining > 0){
    //move somewhere free to reach max size
    const space = getAdjacentEmptySpace(enemy.headPosition, activePieces, tileSet)
    if(space) return { type: 'wander', space: space };
  }
  //is already max size, or no moves left, or no space to move into
  return {type: 'wait'};
}

async function executeEnemyIntent(
  enemy: Piece,
  intent: EnemyIntent,
  helpers: {  
    highlightMoves: (piece: Piece) => void,
    highlightTargets: (piece: Piece) => void,
    clearHighlights: () => void, 
    onReceiveDamage: (id: string) => void,
    delay: number 
  }
) {
  console.log('enemyPiece: ', enemy.name, ' executing: ', intent.type)
  switch (intent.type) {
    case 'special':
      if(!enemy.statuses.hidden){
        helpers.highlightTargets(enemy);
      }
      await sleep(helpers.delay);
      await enemy.special(intent.target);
      //helpers.onReceiveDamage(intent.target.id);
      helpers.clearHighlights();
      break;

    case 'attack':
      helpers.highlightTargets(enemy);
      await sleep(helpers.delay);
      await attackPiece(enemy, intent.target);
      helpers.onReceiveDamage(intent.target.id);
      helpers.clearHighlights();
      break;

    case 'move':
      for (const step of intent.path.slice(1)) {//make sure a path is found once, and then stick to it
        if (!enemy.movesRemaining) break;
        if(!enemy.statuses.hidden){
          helpers.highlightMoves(enemy);
        }
        await sleep(helpers.delay);
        enemy.moveTo(step);//cant move here if its occupied
        helpers.clearHighlights();
      }
      break;

    case 'wander':
      while (enemy.movesRemaining > 0) {
        if(!enemy.statuses.hidden){
          helpers.highlightMoves(enemy);
        }
        enemy.moveTo(intent.space)
        helpers.clearHighlights();
        break;
      }
  }
}

export async function runEnemyStateMachine(
  activePieces: Piece[],
  //removePieceCallback: (piece: Piece) => void,
  highlightMoves: (piece: Piece) => void,
  highlightTargets: (piece: Piece) => void,
  clearHighlights: () => void,
  tileSet: Set<string>,
  onReceiveDamage: (id: string) => void,
  delay = 200 // ms between moves for visibility
){
  const enemyPieces = activePieces.filter(p => (p.team === 'enemy' && !p.statuses.charmed));//not refs so won't update?
  const playerPieces = activePieces.filter(p => p.team === 'player' && !p.statuses.charmed);

  const helpers = {  
    highlightMoves,
    highlightTargets,
    clearHighlights,
    onReceiveDamage,
    delay
  }
  for (const enemy of enemyPieces) {
    while (enemy.movesRemaining > 0 || enemy.actions > 0) {
      const intent = decideEnemyIntent(enemy, activePieces, playerPieces, tileSet);
      await executeEnemyIntent(enemy, intent, helpers);
      await sleep(helpers.delay);
      if (intent.type === 'wait') break;
    } 
  }
}

// --- HELPER FUNCTIONS ---

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attackPiece(attacker: Piece, defender: Piece) {
  if(attacker.actions > 0 && attacker.canAttack){//!canAttack should do special
    const damage = attacker.attack;
    await defender.takeDamage(damage);
    if(defender.willRetaliate){
      await attacker.takeDamage(defender.getStat('attack'));
      if(defender.name === 'Puffer' && !attacker.immunities.poisoned){
        attacker.statuses.poisoned = true;
      }
    }
    attacker.actions--;
    // callback to App.vue
  }
}

function findNearestAttackableCoordinate(
  enemy: Piece,
  playerPieces: Piece[]
): Coordinate | null {
  // Filter out pieces that the enemy can't damage
  const attackable = playerPieces.filter(p => enemy.attack > p.defence && !p.statuses.hidden);
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
      if(player.statuses.hidden) continue;
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

// Check if a player piece is in range
function findWeakestPlayerInRange(
  enemy: Piece,
  playerPieces: Piece[]
): { piece: Piece; place: Coordinate } | null {
  const ex = enemy.headPosition.x;
  const ey = enemy.headPosition.y;

  const candidates: { piece: Piece; place: Coordinate }[] = [];

  for (const player of playerPieces) {
    if (player.statuses.hidden) continue;

    for (const tile of player.tiles) {
      const dist =
        Math.abs(ex - tile.x) + Math.abs(ey - tile.y);

      if (dist <= enemy.range) {
        candidates.push({ piece: player, place: tile });
        break; // one tile in range is enough per piece
      }
    }
  }

  if (candidates.length === 0) return null;

  // Pick the player with the lowest defence
  candidates.sort(
    (a, b) => a.piece.getStat('defence') - b.piece.getStat('defence')
  );

  return candidates[0];
}

//for group targets. Check if any piece tile that is in range, return a list of pieces
function findAnyPiecesInRange(enemy: Piece, pieces: Piece[]): Piece[] | null {
  const ex = enemy.headPosition.x;
  const ey = enemy.headPosition.y;
  const piecesInRange: Piece[] = [];
  for (const p of pieces) {
    for (const tile of p.tiles) {
      const dx = Math.abs(ex - tile.x);
      const dy = Math.abs(ey - tile.y);

      if (dx + dy <= enemy.range){// && !player.statuses.hidden) { //we use this for targetType group pieces so we also need hidden players
        piecesInRange.push(p);//{ player, tile };
      }
    }
  }
  return piecesInRange.length > 0 ? piecesInRange : null;
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
    if(!p.statuses.negative || p.statuses.negative && p.team === 'enemy'){//add negative enemy pieces, these are traps so cannot be walked over by the enemy
      for (const t of p.tiles) {
        occupiedTiles.add(`${t.x},${t.y}`);
      }
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { pos, path } = current;
    //console.log('current: ', current)
    // Reached goal
    if (pos.x === goal.x && pos.y === goal.y && path.length > 1){//shortest path that can reach goal will be origin+goal, so 2 spaces
      //infinite loop caused by trying to move into goal
      path.pop();//remove goal
      return path;
    }
      

    for (const dir of directions) {
      const next = { x: pos.x + dir.x, y: pos.y + dir.y };
      const key = `${next.x},${next.y}`;

      // Skip if tile is invalid or occupied
      if (!levelTiles.has(key)) continue;
      if (visited.has(key)) continue;
      //if (occupiedTiles.has(key)) continue;
      if (
        occupiedTiles.has(key) &&
        !(next.x === goal.x && next.y === goal.y)
      ) continue;

      visited.add(key);
      queue.push({ pos: next, path: [...path, next] });
    }
  }

  return null; // No path found
}
/*
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
    if(!p.statuses.negative){
      for (const t of p.tiles) {
        occupiedTiles.add(`${t.x},${t.y}`);
      }
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
*/
function getAdjacentEmptySpace(
  coord: Coordinate,
  activePieces: Piece[],
  tileSet: Set<string>
): Coordinate | null {

  const directions = [
    { x: coord.x + 1, y: coord.y },
    { x: coord.x - 1, y: coord.y },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x, y: coord.y - 1 },
  ];

  // Build a fast lookup of occupied tiles
  const occupied = new Set<string>();
  for (const piece of activePieces) {
    for (const t of piece.tiles) {
      occupied.add(`${t.x},${t.y}`);
    }
  }

  const validSpaces = directions.filter(pos => {
    const key = `${pos.x},${pos.y}`;
    return tileSet.has(key) && !occupied.has(key);
  });

  if (validSpaces.length === 0) return null;

  return validSpaces[Math.floor(Math.random() * validSpaces.length)];
}

function getAnySpaceInRange(
  piece: Piece,
  activePieces: Piece[],
  tileSet: Set<string>
): Coordinate | null {
  const occupied = new Set<string>();
  for (const p of activePieces) {
    for (const t of p.tiles) {
      occupied.add(`${t.x},${t.y}`);
    }
  }

  const { x: ox, y: oy } = piece.headPosition;
  const range = piece.range;

  const candidates: Coordinate[] = [];

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue;

      const x = ox + dx;
      const y = oy + dy;
      const key = `${x},${y}`;

      if (!tileSet.has(key)) continue;
      if (occupied.has(key)) continue;

      candidates.push({ x, y });
    }
  }

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getAllTilesInStraightLines(
  center: Coordinate,
  range: number,
  tileSet: Set<string>
): Coordinate[] {
  const tiles: Coordinate[] = [];
  const { x, y } = center;

  // Four cardinal directions
  const directions = [
    { dx: 1, dy: 0 },   // right
    { dx: -1, dy: 0 },  // left
    { dx: 0, dy: 1 },   // down
    { dx: 0, dy: -1 },  // up
  ];

  for (const { dx, dy } of directions) {
    for (let step = 1; step <= range; step++) {
      const tx = x + dx * step;
      const ty = y + dy * step;
      const key = `${tx},${ty}`;

      // Stop if tile isn’t on the board
      if (!tileSet.has(key)) break;

      tiles.push({ x: tx, y: ty });
    }
  }

  return tiles;
}

function getTilesInLine(piece: Piece, target: Coordinate) {
  const actor = piece;
  const ax = actor.headPosition.x;
  const ay = actor.headPosition.y;
  const tx = target.x;
  const ty = target.y;

  const dx = Math.sign(tx - ax);
  const dy = Math.sign(ty - ay);
  const tilesInLine: Coordinate[] = [];
  // Step along the line *from actor towards target*
  let x = ax + dx;
  let y = ay + dy;
  while (x !== tx || y !== ty) {
    tilesInLine.push({x, y})    
    x += dx;
    y += dy;
  }
  tilesInLine.push(target);
  return tilesInLine;
}

//old method, big unreadable loop
/*
export async function takeEnemyTurn(
  activePieces: Piece[],
  removePieceCallback: (piece: Piece) => void,
  highlightMoves: (piece: Piece) => void,
  highlightTargets: (piece: Piece) => void,
  clearHighlights: () => void,
  tileSet: Set<string>,
  onReceiveDamage: (id: string) => void,
  delay = 200 // ms between moves for visibility
) {
  const enemyPieces = activePieces.filter(p => (p.team === 'enemy' && !p.statuses.charmed));//not refs so won't update?
  const playerPieces = activePieces.filter(p => p.team === 'player' && !p.statuses.charmed);

  for (const enemy of enemyPieces) {
    const isMaxSize = enemy.tiles.length === enemy.getStat('maxSize') ? true : false

      // Check for any player piece in attack range
    const target = findPlayerInRange(enemy, playerPieces);
    if (target) {
        highlightTargets(enemy);
        await sleep(delay);
        if(enemy.actions > 0){
          if(enemy.targetType === 'piece' && !enemy.hasFriendlySpecial){
            enemy.special(target)
            onReceiveDamage(enemy.id);//notify player admins, we whould really do this inside piece.takeDamage for non damaging specials and status damages
          } else if(enemy.getStat('attack') > target.piece.getStat('defence')){
            attackPiece(enemy, target.piece);
            onReceiveDamage(enemy.id);//notify player admins, we whould really do this inside piece.takeDamage
          }
          if(enemy.targetType === "space"){
            enemy.special(getAnySpaceInRange(enemy, activePieces, tileSet));
          }
          await sleep(delay);
          clearHighlights()
          
          if(isMaxSize){//at max size so no need to move
            continue;
          }
        } else {
          clearHighlights();//move laterally to the player
        }
    } else {

      //look for a non hidden player
      const nearestAttackable = findNearestAttackableCoordinate(enemy, playerPieces);
      const nearest = findNearestPieceCoordinate(enemy, activePieces);//differentiate between playerPieces/enemyPieces if enemy has a damaging/helpful special
      //also prioritise nearest if special move??
      //or decide randomly?
      
      if (!nearest && !nearestAttackable){
        if(enemy.hasExposingSpecial){
          enemy.special(findAnyPiecesInRange(enemy, playerPieces))
        }
        if(!isMaxSize){
          //move somewhere free to reach max size
          while (enemy.movesRemaining) {
            const space = getAdjacentEmptySpace(enemy.headPosition, activePieces, tileSet)
            if(space){
              enemy.moveTo(space)
            }
          }
        }
        break;//no players found, we move on to next piece
      } 

      // Otherwise, move toward nearest player piece, first we get a path
      let pathToNearest: Coordinate[] = [];
      if(nearestAttackable){//can attack a piece
        pathToNearest = findShortestPath(enemy.headPosition, nearestAttackable, tileSet, activePieces) ?? []
      } else if(nearest){//can't attack but can increase it's size
        pathToNearest = findShortestPath(enemy.headPosition, nearest, tileSet, activePieces) ?? []//move toward another piece
      }
      let pathIdx = 1;
      while (enemy.movesRemaining > 0 && enemy.actions > 0) {//split up 
          let nextStep = null;
          if(pathToNearest.length > 1){//if there is a path
            nextStep = pathToNearest[pathIdx]//next move should be along this path
          } else if(nearestAttackable){
            nextStep = getNextStepTowards(enemy.headPosition, nearestAttackable, tileSet, activePieces);//attempt to get in range
            //for ranged pieces only??
          } else if(nearest){
            nextStep = getNextStepTowards(enemy.headPosition, nearest, tileSet, activePieces);//attempt to get closer to another piece
          }
          if (nextStep) {
            highlightMoves(enemy);
            await sleep(delay);
            enemy.moveTo(nextStep);
            pathIdx ++
            //checkForTrap
            const trap = activePieces.find(p =>
              p.targetType == 'trapPiece' && p.tiles.some(t => t.x === nextStep.x && t.y === nextStep.y)
            );
            if (trap) {
              await trap.special(enemy);
            }
            await sleep(delay);
            clearHighlights();
          } else {
            // Cannot move, skip
            break;
          }

        const newTarget = findPlayerInRange(enemy, playerPieces);
        if (newTarget && enemy.actions > 0) {
          highlightTargets(enemy);
          if(!enemy.hasFriendlySpecial && enemy.targetType == 'piece'){
            await enemy.special(newTarget);
            enemy.actions --
          }
          if(enemy.attack > newTarget.piece.defence){
            await sleep(300);
            attackPiece(enemy, newTarget.piece);
            onReceiveDamage(enemy.id);
            await sleep(delay);
            clearHighlights();
            continue; // still in loop if actions > 0
          }
        } else if (enemy.actions > 0 && enemy.targetType === 'self'){
          //use special on self
          await enemy.special(enemy)
        }
      }
    }
  }
}*/