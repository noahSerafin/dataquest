import { ref } from "vue";
import type { Coordinate, PieceBlueprint, PieceVariant, StatKey } from "./types";
import { allPieces, type Piece } from "./Pieces";
import type { Player } from "./Player";
import { STAT_MIN, PIECE_VARIANTS } from "./constants";
import { upgradeItems } from "./Items";
import { StorageManager } from "./StorageManager";
import { Random } from "./Random";

export const isSoundEnabled = ref(false);

let audioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(e => console.warn("AudioContext resume failed:", e));
  }
}

export async function preloadSound(url: string) {
  if (audioBufferCache.has(url)) return;
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(url, audioBuffer);
  } catch (err) {
    console.error("Failed to preload sound:", url, err);
  }
}

function playBuffer(ctx: AudioContext, buffer: AudioBuffer, rate: number) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.connect(ctx.destination);
  source.start(0);
}

export function playSoundFx(url: string, rate: number = 1.0) {
  if (!isSoundEnabled.value) return;
  
  const ctx = getAudioContext();
  resumeAudioContext();
  
  const buffer = audioBufferCache.get(url);
  if (!buffer) {
    // Fallback: preload and play once ready
    preloadSound(url).then(() => {
      const fallbackBuffer = audioBufferCache.get(url);
      if (fallbackBuffer && isSoundEnabled.value) {
        playBuffer(ctx, fallbackBuffer, rate);
      }
    });
    return;
  }
  
  playBuffer(ctx, buffer, rate);
}

export function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

export function getOccupiedTileSet(activePieces: Piece[]): Set<string> {
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

  return Random.pick(freeTiles);
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

      if (dx + dy <= piece.getStat('range')) {
        piecesInRange.add(p);
        break; // important: stop checking this piece once found
      }
    }
  }

  return piecesInRange.size > 0 ? [...piecesInRange] : null;
}

export function makeBlueprint(PieceClass: any, variant?: PieceVariant, costReduction?: number): PieceBlueprint {
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
      cost: Math.max(0, (temp.rarity*2-1) - (costReduction ? costReduction : 0)),
      variantName: temp.variantName,
      immunities: temp.immunities,
      damageMult: temp.damageMult
    };
}

const BASE_VARIANT_CHANCE = 0.15; // 15% chance a piece gets a variant
export function rollVariant(chance: number, difficulty: number): PieceVariant | null{
  if (Random.next() > chance) return null;

  const pool: PieceVariant[] = [];
  for (const v of PIECE_VARIANTS) {
    const w = Math.max(1, Math.floor((v.weight ?? 1) * 10));
    for (let i = 0; i < w; i++) {
      if(v.minDifficulty <= difficulty) pool.push(v);  
    }
  }

  return Random.pick(pool);
}

export function applyVariant(piece: Piece, variant: PieceVariant) {
  for (const [stat, delta] of Object.entries(variant.mods) as [StatKey, number][]) {
    const min = STAT_MIN[stat];
    const next = piece[stat] + delta;
    piece[stat] = Math.max(min, next);
  }
  piece.variantName = variant.name;
  if(variant.name === 'Deadly'){
    piece.damageMult += 1;
  }
  if(variant.name === 'Holographic'){
    piece.damageMult += 0.5;
  }
}

function rollRarity(clovers:number) {

  const base = [40,30,14,9,5,2];
  //36,27,18,10,6,3 balatro-esque
  //40,30,16,8,4,2 doubling

  // clover boosts higher rarities
  const luck = 1 + clovers * 0.25;

  const adjusted = base.map((chance, i) => {
    const rarity = i + 1;
    return chance * Math.pow(luck, rarity - 1);
  });

  const total = adjusted.reduce((a,b)=>a+b,0);

  const roll = Random.next() * total;

  let sum = 0;

  for (let i=0;i<adjusted.length;i++) {
    sum += adjusted[i];
    if (roll < sum) return i+1;
  }
}

/*export function pickWeightedRandom(PieceClasses: any[], player: Player) {//clover edit
    const weighted: any[] = [];

    //stacking
    const cloverCount = player.admins.filter(a => a.name === 'Clover').length;
    const cloverMultiplier = 1 + cloverCount * 0.3; // each clover +30%
    const varCount = player.admins.filter(a => a.name === 'Variety Box').length;
    const variantMultiplier = BASE_VARIANT_CHANCE + varCount * 0.25; // each box +25%

    for (const PieceClass of PieceClasses) {
      const temp = new PieceClass({ x: -1, y: -1 }, "player"); 
      let weight = 7 - temp.rarity;
      weight = Math.max(1, Math.floor((7 - temp.rarity) / cloverMultiplier))

      for (let i = 0; i < weight; i++) {
        weighted.push(PieceClass);
      }
    }

    const idx = Math.floor(Math.random() * weighted.length);
    const variant = rollVariant(variantMultiplier, 6);
    return {
      class: weighted[idx],
      variant: variant
    }
}*/
export function pickWeightedRandom(PieceClasses: any[], player: Player) {

  const cloverCount = player.admins.filter(a => a.name === 'Clover').length;

  const rarity = rollRarity(cloverCount);

  const piecesOfRarity = PieceClasses.filter(PieceClass => {
    const temp = new PieceClass({x:-1,y:-1}, "player");
    return temp.rarity === rarity;
  });

  const selectedClass = Random.pick(piecesOfRarity);

  const varCount = player.admins.filter(a => a.name === 'Variety Box').length;
  const variantMultiplier = BASE_VARIANT_CHANCE + varCount * 0.25; // each box +25%    const variant = rollVariant(variantMultiplier, 6);
  const variant = rollVariant(variantMultiplier, 6);

  return {
    class: selectedClass,
    variant: variant
  }
}

export function pickWeightedRandomItem(itemClasses: any[], player: Player, costReduction?: number) {//move to items.ts?

    const cloverCount = player.admins.filter(a => a.name === 'Clover').length;
    const rarity = rollRarity(cloverCount);

    const itemsOfRarity = itemClasses.filter(ItemClass => {//can be empty, needs a guard
      const temp = new ItemClass({x:-1,y:-1}, "player");
      return temp.rarity === rarity;//add a gaurd for no result for lists with missing rarities
    });

    const SelectedClass = Random.pick(itemsOfRarity);
    if(costReduction){
      SelectedClass.cost = Math.max(0, (SelectedClass.cost - costReduction));
    }

    return new SelectedClass(); // RETURN INSTANCE
  /*
    const weighted: any[] = [];
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
    PickedClass.cost -= costReduction ? costReduction : 0;

    return new PickedClass();  // RETURN INSTANCE*/
  }

export function addProgramsUntilFull(//not working, "PieceClass is not a constructor"
  player: Player,
  maxAttempts = 3
) {
  let attempts = 0;
  let freeMemory = player.memory - player.usedMemory

  while ((freeMemory >=1 || player.hasAdmin('Toolbox') && freeMemory >= 0.5) && attempts < maxAttempts) {
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
  
  while ((freeMemory >= 1 || player.hasAdmin('Schoolbag') && freeMemory >= 0.5)&& attempts < maxAttempts) {
    const item = pickWeightedRandomItem(upgradeItems, player);
    StorageManager.unlockItem(item);
    // If addProgram returns false when full, even better
    const added = player.addItem(item);
    if (!added) break;

    attempts++;
  }
}

export function getTilesInRange(
  center: Coordinate,
  range: number,
  tileSet: Set<string>,       // valid board tiles like "x,y"
): Coordinate[] {
  const tiles: Coordinate[] = [];
  const { x, y } = center;
  const r = range;

  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      const dist = Math.abs(dx) + Math.abs(dy);

      // Only include tiles within Manhattan range
      if (dist > 0 && dist <= r) {
        const tx = x + dx;
        const ty = y + dy;
        const key = `${tx},${ty}`;

        // Only add if tile exists on board
        if (tileSet.has(key)) {
          tiles.push({ x: tx, y: ty });
        }
      }
    }
  }

  return tiles;
}