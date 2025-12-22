import type { Coordinate, PieceBlueprint } from "./types";
import type { Piece } from "./Pieces";
import type { Player } from "./Player";

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

export function makeBlueprint(PieceClass: any): PieceBlueprint {
    const temp = new PieceClass({ x: -1, y: -1 }, "player");

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
      cost: temp.rarity*2-1                     
    };
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
    return weighted[idx];
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