import type { Coordinate, PieceBlueprint, PieceVariant, StatKey } from "./types";
import { allPieces, type Piece } from "./Pieces";
import type { Player } from "./Player";
import { STAT_MIN, PIECE_VARIANTS } from "./constants";
import { upgradeItems } from "./Items";

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

//for group targets. Check if any piece tile that is in range, return a list of pieces
export function findAnyPiecesInRange(piece: Piece, pieces: Piece[]): Piece[] | null {
  const ex = piece.headPosition.x;
  const ey = piece.headPosition.y;

  const piecesInRange = new Set<Piece>();

  for (const p of pieces) {
    for (const tile of p.tiles) {
      const dx = Math.abs(ex - tile.x);
      const dy = Math.abs(ey - tile.y);

      if (dx + dy <= piece.range) {
        piecesInRange.add(p);
        break; // important: stop checking this piece once found
      }
    }
  }

  return piecesInRange.size > 0 ? [...piecesInRange] : null;
}

export function makeBlueprint(PieceClass: any, variant?: PieceVariant): PieceBlueprint {
    const temp = new PieceClass({ x: -1, y: -1 }, "player");
    if (variant) {
      applyVariant(temp, variant);
    }

    return {
      id: crypto.randomUUID(),
      name: PieceClass.name,
      description: PieceClass.description,
      unicode: PieceClass.unicode,
      maxSize: temp.maxSize,//get stat?
      moves: temp.moves,
      range: temp.range,
      attack: temp.attack,
      defence: temp.defence,
      rarity: temp.rarity,
      color: PieceClass.color,
      isPlaced: false,
      cost: temp.rarity*2-1,
      variantName: temp.variantName
    };
}

const BASE_VARIANT_CHANCE = 0.5; // 15% chance a piece gets a variant
export function rollVariant(chance: number, difficulty: number): PieceVariant | null{
  if (Math.random() > chance) return null;

  const pool: PieceVariant[] = [];
  for (const v of PIECE_VARIANTS) {
    const w = Math.max(1, Math.floor((v.weight ?? 1) * 10));
    for (let i = 0; i < w; i++) {
      if(v.minDifficulty <= difficulty) pool.push(v);  
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function applyVariant(piece: Piece, variant: PieceVariant) {
  for (const [stat, delta] of Object.entries(variant.mods) as [StatKey, number][]) {
    const min = STAT_MIN[stat];
    const next = piece[stat] + delta;

    piece[stat] = Math.max(min, next);
  }

  piece.variantName = variant.name;
}

export function pickWeightedRandom(PieceClasses: any[], player: Player) {//clover edit
    const weighted: any[] = [];

    //stacking
    const cloverCount = player.admins.filter(a => a.name === 'Clover').length;
    const cloverMultiplier = 1 + cloverCount * 0.3; // each clover +30%

    for (const PieceClass of PieceClasses) {
      const temp = new PieceClass({ x: -1, y: -1 }, "player"); 
      let weight = 7 - temp.rarity;
      weight = Math.max(1, Math.floor(weight * cloverMultiplier));

      for (let i = 0; i < weight; i++) {
        weighted.push(PieceClass);
      }
    }

    const idx = Math.floor(Math.random() * weighted.length);
    const variant = rollVariant(BASE_VARIANT_CHANCE, 6);
    return {
      class: weighted[idx],
      variant: variant
    }
}

export function pickWeightedRandomItem(itemClasses: any[], player: Player) {//move to items.ts?
    const weighted: any[] = [];

    //non stacking
    //const hasClover = playerHasAdmin('Lucky Clover');
    //const cloverMultiplier = hasClover ? 1.5 : 1;

    //stacking
    const cloverCount = player.admins.filter(a => a.name === 'Clover').length;
    const cloverMultiplier = 1 + cloverCount * 0.3; // each clover +30%

    for (const itemClass of itemClasses) {
      const rarity = itemClass.rarity ?? 1;   // fallback default
      let weight = 7 - rarity;
      weight = Math.max(1, Math.floor(weight * cloverMultiplier));

      for (let i = 0; i < weight; i++) {
        weighted.push(itemClass);
      }
    }

    const idx = Math.floor(Math.random() * weighted.length);
    //console.log('idx: ', weighted[idx])
    const PickedClass = weighted[idx];

    return new PickedClass();  // RETURN INSTANCE
  }

export function addProgramsUntilFull(//not working, "PieceClass is not a constructor"
  player: Player,
  maxAttempts = 3
) {
  let attempts = 0;
  let freeMemory = player.memory - player.usedMemory

  while ((freeMemory >=1 || player.hasToolbox && freeMemory >= 0.5) && attempts < maxAttempts) {
    const bp = makeBlueprint(pickWeightedRandom(allPieces, player))

    // If addProgram returns false when full, even better
    const added = player.addProgram(bp);
    if (!added) break;

    attempts++;
  }
}

export function addItemsUntilFull(
  player: Player,
  maxAttempts = 3
) {
  let attempts = 0;
  let freeMemory = player.freeMemory
  
  while ((freeMemory >= 1 || player.hasTrolley && freeMemory >= 0.5)&& attempts < maxAttempts) {
    const item = pickWeightedRandomItem(upgradeItems, player);

    // If addProgram returns false when full, even better
    const added = player.addItem(item);
    if (!added) break;

    attempts++;
  }
}