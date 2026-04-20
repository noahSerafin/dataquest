import type { Piece } from "./Pieces";
import type { Coordinate } from "./types";
import { findAnyPiecesInRange } from "./helperFunctions";
import type { Player } from "./Player";
import { Random } from "./Random";

type EnemyIntent =
  | { type: 'attack'; target: Piece }
  | { type: 'special'; target: Piece | Coordinate | Piece[] | {piece: Piece, target: Coordinate} | {piece: Piece, player: Player} | {line: Coordinate[], activePieces: Piece[]} | {target: Coordinate, activePieces: Piece[], player?: Player} | null }
  | { type: 'move'; path: Coordinate[] }
  | { type: 'wander'; space: Coordinate }
  | { type: 'wait' };

function decideEnemyIntent(
  enemy: Piece,
  activePieces: Piece[],
  playerPieces: Piece[],
  enemyPieces: Piece[],
  tileSet: Set<string>,
  specialAttempts: number,
  player: Player
): EnemyIntent {
  //first look for a player to attack or use special on
  const target = findWeakestPlayerInRange(enemy, playerPieces);//returning null even when there is a piece??!!!
  console.log('finding ', enemy.name, ' intent...')
  console.log('target: ', target)
  if (target && enemy.actions > 0 ){//target found
    console.log('target found');
    if ((enemy.targetType === 'pieceAndPlace' || enemy.targetType === 'placeAndPieces') && !enemy.hasFriendlySpecial) {
      if (target.place.x === target.piece.headPosition.x && target.place.y === target.piece.headPosition.y) {
        for (const tile of target.piece.tiles) {
          if (tile.x !== target.piece.headPosition.x || tile.y !== target.piece.headPosition.y) {
            const dist = Math.abs(enemy.headPosition.x - tile.x) + Math.abs(enemy.headPosition.y - tile.y);
            if (dist <= enemy.getStat('range')) {
              target.place = tile;
              break;
            }
          }
        }
      }
    }
    if(enemy.canAttack && enemy.getStat('attack') > 0 && target.piece.defenceRemaining + target.piece.tiles.length <= enemy.getStat('attack')){//can we kill a player piece?
      return {type: 'attack', target: target.piece}
    }
    if(enemy.specialName && !enemy.hasFriendlySpecial && enemy.targetType !== 'trapPiece'){
      //if not, can we use an attacking special?
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
              const lineTiles = getTilesInLine(enemy, tile);
              const hitsFriendly = enemyPieces.some(p => 
                p.id !== enemy.id && 
                p.tiles.some(pt => lineTiles.some(lt => lt.x === pt.x && lt.y === pt.y))
              );
              if (!hitsFriendly) {
                newTarget = { piece: player, place: tile };
                break;
              }
            }
          }
          if (newTarget) break;
        }
        if (newTarget)  return { type: 'special', target: {line: getTilesInLine(enemy, newTarget.place), activePieces: activePieces} }
      }
      //if(enemy.targetType == 'pieceAndPlace'){ see if we can target a non head tile first
      if(enemy.targetType == 'pieceAndPlace' && (target.piece.headPosition.x !== target.place.x || target.piece.headPosition.y !== target.place.y) && specialAttempts < 1){//rectify attempts later
        const willDamageMoreThanOne = enemy.getStat('attack') > target.piece.defenceRemaining + 1;
        const allAlreadyHaveStatus = enemy.appliesStatuses.length > 0 && enemy.appliesStatuses.every(s => target.piece.statuses[s] || target.piece.immunities[s]);
        if((willDamageMoreThanOne || allAlreadyHaveStatus) && enemy.canAttack && enemy.getStat('attack') > 0){
          return { type: 'attack', target: target.piece };
        }
        return { type: 'special', target: {piece: target.piece, target: target.place}}//enemy still attacking- but should use this
      }
      if(enemy.targetType == 'placeAndPieces' && (target.piece.headPosition.x !== target.place.x || target.piece.headPosition.y !== target.place.y) && specialAttempts < 1){//rectify attempts later
        return { type: 'special', target: {target: target.place, activePieces: activePieces}}
      }
      if((enemy.targetType === 'piece' || enemy.targetType === 'pieceAndPlayer') && specialAttempts < 1){ ///can execute a special
        const allStatusesApplied = enemy.appliesStatuses.length > 0 && enemy.appliesStatuses.every(s => target.piece.statuses[s] || target.piece.immunities[s]);
        if(allStatusesApplied && enemy.canAttack && enemy.getStat('attack') > 0){
          return { type: 'attack', target: target.piece };
        }
        if(enemy.attack > 2 && (enemy.specialName === 'Imitate' || enemy.specialName === 'Absorb')){
          return { type: 'attack', target: target.piece };
        } else {
          if (enemy.targetType === 'pieceAndPlayer') {
            return { type: 'special', target: { piece: target.piece, player: player } };
          }
          return { type: 'special', target: target.piece };
        }
      }
      if(enemy.targetType === 'group'){//bomb type pieces
        const inRange = findAnyPiecesInRange(enemy, activePieces);
        if(enemy.appliesStatuses.length > 0 && inRange){
          const playerTargets = inRange.filter(p => p.team === 'player' && !p.statuses.hidden);
          const allAlreadyHaveStatus = playerTargets.length > 0 && playerTargets.every(p => 
            enemy.appliesStatuses.every(s => p.statuses[s] || p.immunities[s])
          );
          if(allAlreadyHaveStatus && enemy.canAttack && enemy.getStat('attack') > 0 && target){
            return { type: 'attack', target: target.piece };
          }
        }
        return { type: 'special', target: inRange ? inRange : []}
      }
      console.log('no special moves');
      //if target is not attackable, is there one that is?
    }
    if(enemy.canAttack && enemy.getStat('attack') > 0){//no special to use, can we attack? //&&target.piece.getStat('defence') < enemy.getStat('attack')
      console.log('attacking target');
      return {type: 'attack', target: target.piece}
    }
  }

  //no immediate attackable target, expose if possible
  if(enemy.actions > 0 && enemy.hasExposingSpecial && enemy.targetType === 'group'){//and group
    const inRange = findAnyPiecesInRange(enemy, activePieces);
    return {type: 'special', target: inRange ? inRange : []}
  }

  //can we help another enemy?
  const friendlyTarget = findWeakestPlayerInRange(enemy, enemyPieces);
  if(friendlyTarget && (enemy.hasFriendlySpecial || enemy.hasNeutralSpecial) && enemy.actions > 0){
    if(enemy.targetType === 'group'){
      return {type: 'special', target: (findAnyPiecesInRange(enemy, activePieces))}
    } else if(enemy.targetType == 'placeAndPieces' && specialAttempts < 1){//rectify attempts later
      return { type: 'special', target: {target: friendlyTarget.place, activePieces: activePieces}}
    } else if(enemy.targetType === 'piece' || enemy.targetType === 'pieceAndPlayer'){//piece
      if (enemy.targetType === 'pieceAndPlayer') {
        return { type: 'special', target: { piece: friendlyTarget.piece, player: player } };
      }
      return {type: 'special', target: friendlyTarget.piece}
    }
  }

  //is there a frond (friendly trap) to hide in?
  const friendlyTrap = enemyPieces.find(p => 
    p.name === 'Frond'// && p.hasFriendlySpecial && p.targetType === 'trapPiece';
  )
  if(friendlyTrap && enemy.movesRemaining > 0){
    const pathToFrond = findShortestPath(enemy, enemy.headPosition, friendlyTrap.headPosition, tileSet, activePieces, true); 
    if(pathToFrond){
      return { type: 'move', path: pathToFrond };
    }
  }

  //otherwise we look for another target
  let nearest = (enemy.specialName && !enemy.hasFriendlySpecial && enemy.targetType !== 'trapPiece') ? findNearestPieceCoordinate(enemy, playerPieces) : findNearestAttackableCoordinate(enemy, playerPieces);

  if ((!target || enemy.targetType === 'trapPiece') && nearest && enemy.movesRemaining > 0 && !enemy.statuses.frozen) {
    const path = findShortestPath(enemy, enemy.headPosition, nearest, tileSet, activePieces, enemy.targetType === 'trapPiece');
    if (path && path.length > 1) {
      console.log('found a path to the player')
      return { type: 'move', path: path };//move toward a target
    }
  }

  if(enemy.actions > 0  && specialAttempts < 1){//still have an action? 
    if (enemy.specialName === 'Charge' || enemy.specialName === 'Pounce' || enemy.specialName === 'Dash') {
      const targetCoord = nearest || target?.piece.headPosition;
      if (targetCoord) {
        const directions = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];
        let bestScore = Math.abs(enemy.headPosition.x - targetCoord.x) + Math.abs(enemy.headPosition.y - targetCoord.y);
        let bestLine: Coordinate[] | null = null;
        for (const { dx, dy } of directions) {
          let currentLine: Coordinate[] = [];
          let validEnd: Coordinate | null = null;
          let blockedByFriendly = false;
          for (let step = 1; step <= enemy.getStat('range'); step++) {
            const tx = enemy.headPosition.x + dx * step;
            const ty = enemy.headPosition.y + dy * step;
            const key = `${tx},${ty}`;
            if (!tileSet.has(key)) break;
            currentLine.push({ x: tx, y: ty });
            const occupier = activePieces.find(p => p.tiles.some(t => t.x === tx && t.y === ty));
            if (occupier) {
              if (occupier.team === enemy.team && occupier.id !== enemy.id) {
                blockedByFriendly = true;
              }
              break;
            }
            validEnd = { x: tx, y: ty };
          }
          if (blockedByFriendly || !validEnd) continue;
          const dist = Math.abs(validEnd.x - targetCoord.x) + Math.abs(validEnd.y - targetCoord.y);
          if (dist < bestScore) {
            bestScore = dist;
            bestLine = [...currentLine];
          }
        }
        if (bestLine && bestLine.length > 0) {
          return { type: 'special', target: { line: bestLine, activePieces: activePieces } };
        }
      }
    }
    if(enemy.targetType === 'self'){
      const randTile = Random.pick(enemy.tiles);
      return {type: 'special', target: randTile}
    }
    if(enemy.targetType === 'space'){
      const space = getAnySpaceInRange(enemy, activePieces, tileSet)
      if(space) return {type: 'special', target: {target: space, activePieces: activePieces, player: player}}
    }
    if(enemy.hasFriendlySpecial){
      if(enemy.targetType === 'placeAndPieces'){//pawn
        const strongest = findStrongestInRange(enemy, activePieces)
        console.log('strongest: ', strongest)
        if (strongest) return {type: 'special', target: {target: strongest.place, activePieces: activePieces}}
      }
      if(enemy.targetType === 'group'){
        return {type: 'special', target: (findAnyPiecesInRange(enemy, enemyPieces))}
      }
      if(enemy.targetType === 'piece' || enemy.targetType === 'pieceAndPlayer'){
        const ally = findWeakestPlayerInRange(enemy, enemyPieces)?.piece
        if(ally){
          if (enemy.targetType === 'pieceAndPlayer') {
            return { type: 'special', target: { piece: ally, player: player } };
          }
          return {type: 'special', target: ally};
        } //else find and path to an ally and move there
      }
      if(enemy.targetType === 'trapPiece' && enemy.movesRemaining > 0){//frond
        const allyPos = findWeakestPlayerInRange(enemy, enemyPieces)?.place
        if(allyPos){
          const path = findShortestPath(enemy, enemy.headPosition, allyPos, tileSet, activePieces, true)
          if(path){
            return {type: 'move', path: path}
          }
        }
      }
    }
  }
  
  //no targets, or no actions left
  if(enemy.tiles.length < enemy.maxSize && enemy.movesRemaining > 0 && !enemy.statuses.frozen){
    //move somewhere free to reach max size
    const spaces = getAdjacentEmptySpaces(enemy.headPosition, activePieces, tileSet)
    if(spaces) return { type: 'wander', space: Random.pick(spaces) };
  }
  //is already max size, or no moves left, or no space to move into
  return {type: 'wait'};
}

async function executeEnemyIntent(
  enemy: Piece,
  activePieces: Piece[],
  tileSet: Set<string>,
  intent: EnemyIntent,
  helpers: {  
    highlightMoves: (piece: Piece) => void,
    highlightTargets: (piece: Piece) => void,
    clearHighlights: () => void, 
    onReceiveDamage: (id: string, receiver: Piece) => void,
    delay: number 
  },
  isAborted: () => boolean = () => false
) {
  if(enemy.isBusy) return;
  enemy.isBusy = true;
  console.log('enemyPiece: ', enemy.name, ' executing: ', intent.type)
  switch (intent.type) {
    case 'special':
      if(!enemy.statuses.hidden){
        helpers.highlightTargets(enemy);
      }
      await sleep(helpers.delay);
      if (isAborted()) return;
      //count specialuses for loops
      await enemy.special(intent.target);
      //helpers.onReceiveDamage(intent.target.id);
      helpers.clearHighlights();
      break;

    case 'attack':
      helpers.highlightTargets(enemy);
      await sleep(helpers.delay);
      if (isAborted()) return;
      await attackPiece(enemy, intent.target);
      helpers.onReceiveDamage(enemy.id, intent.target);
      helpers.clearHighlights();
      if(enemy.statuses.hidden) enemy.statuses.hidden = false;
      break;

    case 'move': //moving over players?
      for (const step of intent.path.slice(1)) {//make sure a path is found once, and then stick to it
        if (isAborted() || !enemy.movesRemaining || enemy.statuses.frozen || !activePieces.includes(enemy)) break;
        if(!enemy.statuses.hidden){
          helpers.highlightMoves(enemy);
        }
        await sleep(helpers.delay);
        if (isAborted()) return;
        if(enemy.statuses.confused){
          const allMoves = getAdjacentEmptySpaces(enemy.headPosition, activePieces, tileSet);
          if(allMoves){
            enemy.moveTo(Random.pick(allMoves));
          } 
        } else {
          enemy.moveTo(step);//cant move here if its occupied
          const trap = activePieces.find(p =>
            p.targetType == 'trapPiece' && p.tiles.some(t => t.x === step.x && t.y === step.y)
          );
          if (trap && trap.id !== enemy.id) {
            await trap.triggerTrap(enemy);
          }
          if(enemy.targetType === 'trapPiece'){//frond logic
            const otherPiece = activePieces.find(p =>
              p.id !== enemy.id && p.tiles.some(t => t.x === step.x && t.y === step.y)
            );
            if(otherPiece){
              await enemy.triggerTrap(otherPiece);//
            }
          }
        }
        helpers.clearHighlights();
      }
      break;

    case 'wander':
      while (enemy.movesRemaining > 0 && !enemy.statuses.frozen && activePieces.includes(enemy)) {
        if(!enemy.statuses.hidden){
          helpers.highlightMoves(enemy);
        }
        const trap = activePieces.find(p =>//might be finding itself
          p.targetType == 'trapPiece' && p.tiles.some(t => t.x === intent.space.x && t.y === intent.space.y)
        );
        enemy.moveTo(intent.space)
        if (trap && trap.id !== enemy.id) {
          await trap.triggerTrap(enemy);
        }
        helpers.clearHighlights();
        break;
      }
  }
  enemy.isBusy = false;
}

export async function runEnemyStateMachine(
  activePieces: Piece[],
  //removePieceCallback: (piece: Piece) => void,
  highlightMoves: (piece: Piece) => void,
  highlightTargets: (piece: Piece) => void,
  clearHighlights: () => void,
  tileSet: Set<string>,
  onReceiveDamage: (id: string, receiver: Piece) => void,
  player: Player,
  delay = 200, // ms between moves for visibility
  isAborted: () => boolean = () => false
){
  let passCount = 0;
  let changed = true;

  const helpers = {  
    highlightMoves,
    highlightTargets,
    clearHighlights,
    onReceiveDamage,
    delay
  }

  while (changed && passCount < 3) {
    if (isAborted()) return;
    changed = false;
    passCount++;

    const enemiesToProcess = activePieces.filter(p => (p.team === 'enemy' && !p.statuses.charmed));

    // Sort: hasFriendlySpecial should come first
    enemiesToProcess.sort((a, b) => {
      if ((a.hasFriendlySpecial || a.hasNeutralSpecial) && !b.hasFriendlySpecial) return -1;
      if (!a.hasFriendlySpecial && (b.hasFriendlySpecial || b.hasNeutralSpecial)) return 1;
      return 0;
    });

    for (const enemy of enemiesToProcess) {
      if (isAborted()) return;
      if (!activePieces.includes(enemy)) continue;
      if (enemy.movesRemaining <= 0 && enemy.actions <= 0) continue;
      
      let specialAttempts = 0;
      while (enemy.movesRemaining > 0 || enemy.actions > 0) {
        if (isAborted()) return;
        if (!activePieces.includes(enemy)) break;

        const enemyPieces = activePieces.filter(p => (p.team === 'enemy' && !p.statuses.charmed));
        const playerPieces = activePieces.filter(p => p.team === 'player' && !p.statuses.charmed);

        const intent = decideEnemyIntent(enemy, activePieces, playerPieces, enemyPieces, tileSet, specialAttempts, player);
        if (intent.type === 'wait') break;

        // If we are here, we are doing something other than wait
        changed = true; 

        if(intent.type === 'special'){
          specialAttempts += 1;
        }
        await executeEnemyIntent(enemy, activePieces, tileSet, intent, helpers, isAborted);
        if (isAborted()) return;
        await sleep(helpers.delay);
      } 
    }
  }
}

// --- HELPER FUNCTIONS ---

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attackPiece(attacker: Piece, defender: Piece) {
  if(attacker.actions > 0 && attacker.canAttack){//!canAttack should do special
    const damage = attacker.getStat('attack');
    await defender.takeDamage(damage * attacker.damageMult);
    if(defender.willRetaliate || defender.name === 'Hedgehog'){
      await attacker.takeDamage(defender.getStat('attack') * defender.damageMult);
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
  const attackable = playerPieces.filter(p => !p.statuses.hidden);//&& enemy.attack > p.defence 
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
    if (player.statuses.hidden) continue;//will even ignore friendlies
    if ((enemy.name === 'Pawn' || enemy.name === 'Frond') || player.id === enemy.id) continue;//don't target self

    for (const tile of player.tiles) {
      const dist =
        Math.abs(ex - tile.x) + Math.abs(ey - tile.y);

      if (dist <= enemy.getStat('range')) {
        candidates.push({ piece: player, place: tile });
        break; // one tile in range is enough per piece
      }
    }
  }

  if (candidates.length === 0) return null;

  // Pick the player with the lowest defence, or smallest size?
  candidates.sort(
    (a, b) => a.piece.getStat('defence') - b.piece.getStat('defence')
  );

  return candidates[0];
}

// Move one tile toward the target using simple orthogonal movement
function findShortestPath(
  piece: Piece,
  start: Coordinate,
  goal: Coordinate,
  levelTiles: Set<string>,        // e.g., Set of "x,y" strings for walkable tiles
  activePieces: Piece[],
  keepGoal: boolean = false
): Coordinate[] | null {
  if (start.x === goal.x && start.y === goal.y) return null;

  const queue: { pos: Coordinate; path: Coordinate[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  if (piece.name === 'Helicopter') {
    directions.push(
      { x: 2, y: 0 },
      { x: -2, y: 0 },
      { x: 0, y: 2 },
      { x: 0, y: -2 }
    );
  }

  const occupiedTiles = new Set<string>();
  for (const p of activePieces) {
    if (p.statuses.negative && p.team === 'enemy' && p.hasFriendlySpecial) continue;
    if (p.statuses.negative && p.statuses.hidden && p.team === 'player') continue;
    
    for (const t of p.tiles) {
      occupiedTiles.add(`${t.x},${t.y}`);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { pos, path } = current;
    //console.log('current: ', current)
    // Reached goal
    if (pos.x === goal.x && pos.y === goal.y && path.length > 1){//shortest path that can reach goal will be origin+goal, so 2 spaces
      //infinite loop caused by trying to move into goal
      if (!keepGoal) path.pop();//remove goal
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

function getAdjacentEmptySpaces(
  coord: Coordinate,
  activePieces: Piece[],
  tileSet: Set<string>
): Coordinate[] | null {

  const directions = [
    { x: coord.x + 1, y: coord.y },
    { x: coord.x - 1, y: coord.y },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x, y: coord.y - 1 },
  ];

  // Build a fast lookup of occupied tiles
  const occupied = new Set<string>();
  for (const piece of activePieces) {
    if (piece.statuses.negative && piece.team === 'enemy' && piece.hasFriendlySpecial) continue;

    for (const t of piece.tiles) {
      occupied.add(`${t.x},${t.y}`);
    }
  }

  const validSpaces = directions.filter(pos => {
    const key = `${pos.x},${pos.y}`;
    return tileSet.has(key) && !occupied.has(key);
  });

  if (validSpaces.length === 0) return null;

  return validSpaces;
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
  const range = piece.getStat('range');

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

  return Random.pick(candidates);
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

function findStrongestInRange(//for pawn
  enemy: Piece,
  activePieces: Piece[]
): { piece: Piece; place: Coordinate } | null {
  const ex = enemy.headPosition.x;
  const ey = enemy.headPosition.y;

  const candidates: { piece: Piece; place: Coordinate }[] = [];

  for (const piece of activePieces) {
    if (piece.statuses.hidden && piece.team !== 'enemy' || piece.id === enemy.id || piece.name === enemy.name) continue;

    for (const tile of piece.tiles) {
      const dist =
        Math.abs(ex - tile.x) + Math.abs(ey - tile.y);

      if (dist <= enemy.getStat('range')) {
        candidates.push({ piece: piece, place: tile });
        break; // one tile in range is enough per piece
      }
    }
    
  }

  if (candidates.length === 0) return null;

  // Pick the player with the lowest defence, or smallest size?
  candidates.sort(
    (a, b) => a.piece.getStat('attack') - b.piece.getStat('attack')
  );

  return candidates[candidates.length-1];
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