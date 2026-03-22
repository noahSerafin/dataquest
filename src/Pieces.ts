import type { Coordinate, Immunities, StatModifier } from "./types"
import { createDefaultStatuses } from "./types";
import { Player } from "./Player";
import damageSoundUrl from '../sfx/damage.ogg';
import { playSoundFx } from "./helperFunctions";

export abstract class Piece {
  removeCallback?: (piece: Piece) => void;

  //protected ??
  tempStatModifiers: StatModifier = {};
  statModifiers: StatModifier = {};//why is this breaking activePieces/enemypieces
  statuses: Record<string, boolean> = {
    diseased: false,
    slowed: false,
    blinded: false,
    burning: false,
    poisoned: false,
    frozen: false,
    charmed: false,
    confused: false,
    exposed: false,
    hidden: false,
    negative: false,
  };
  immunities: Immunities = createDefaultStatuses();
  canAttack: boolean = true;
  willRetaliate: boolean = false;
  isTakingDamage: boolean = false;
  hasFriendlySpecial: boolean = false;//use in enemyAI
  hasNeutralSpecial: boolean = false;//use in enemyAI
  hasExposingSpecial: boolean = false;//use in enemyAI
  redacted: boolean = false;//for boss
  isBusy: boolean = false;//for AI

  specialName?: string;
  extraUnicode?: string;
  variantName?: string;
  hybridName?: string
  targetType: 'piece' | 'pieceAndPlayer' | 'space' | 'pieceAndPlace' | 'group' | 'line' | 'self' | 'all' | 'graveyard' | 'trapPiece' | 'spaceAndPieces' | 'placeAndPieces' = 'piece';

  id: string
  static name : string
  static description : string
  static unicode : string
  static color : string
  static rarity: number
  name: string
  description : string
  unicode: string
  maxSize: number
  moves: number
  range: number
  color: string
  attack: number
  defence: number
  headPosition: Coordinate
  tiles: Coordinate[] // an array of (x, y) positions
  movesRemaining: number
  defenceRemaining: number
  actions: number
  team: string //'player' or 'enemy'
  rarity: number
  damageMult: number = 1;

  constructor(
    name: string, 
    description: string,
    unicode: string,
    maxSize: number, 
    moves: number,
    range: number,
    attack: number, 
    defence: number, 
    color: string,
    headPosition: Coordinate | null = null, 
    tiles: Coordinate[] = [],
    team: string,
    rarity: number,
    removeCallback?: (piece: Piece) => void,
    //receiveDamageCallback?: (piece: Piece) => void,
    id?: string,
  ) {
    this.name = name
    this.description = description
    this.unicode = unicode
    this.maxSize = maxSize
    this.moves = moves
    this.range = range
    this.attack = attack
    this.defence = defence
    this.color = color
    this.headPosition = headPosition ?? { x: -1, y: -1 };
    this.tiles = tiles.length ? tiles : headPosition ? [headPosition] : []; //default to head
    this.movesRemaining = this.getStat('moves') // default to full moves at start of turn
    this.defenceRemaining = this.getStat('defence') // default to full moves at start of turn
    this.actions = 1
    this.team = team
    this.rarity = rarity
    this.removeCallback = removeCallback
    this.id = id ?? crypto.randomUUID()
  }

  // --- Methods to handle modifiers ---
  addModifier(mod: StatModifier) {
    Object.entries(mod).forEach(([key, val]) => {
      this.statModifiers[key as keyof StatModifier] =
        (this.statModifiers[key as keyof StatModifier] ?? 0) + val;
    });
  }

  removeModifier(mod: StatModifier) {
    Object.entries(mod).forEach(([key, val]) => {
      if (!this.statModifiers[key as keyof StatModifier]) return;
      this.statModifiers[key as keyof StatModifier]! -= val;
      if (this.statModifiers[key as keyof StatModifier]! <= 0) {
        delete this.statModifiers[key as keyof StatModifier];
      }
    });
  }

  addTempModifier(mod: StatModifier) {
    Object.entries(mod).forEach(([key, val]) => {
      this.tempStatModifiers[key as keyof StatModifier] =
        (this.tempStatModifiers[key as keyof StatModifier] ?? 0) + val;
    });
  }

  resetTempModifiers() {
    this.tempStatModifiers = {};
  }

  // --- Accessors for base / modifiers / total ---
  getBaseStat(stat: keyof StatModifier) {
    return this[stat] as number; // base value from constructor
  }

  getModifier(stat: keyof StatModifier) {
    return this.statModifiers[stat] ?? 0;
  }

  getTempModifier(stat: keyof StatModifier) {
    return this.tempStatModifiers[stat] ?? 0;
  }

  getStat(stat: keyof StatModifier) {
    if(stat === 'maxSize'){
      return Math.max(1, this.getBaseStat(stat) + this.getModifier(stat) + this.getTempModifier(stat));
    } else {
      return Math.max(0, this.getBaseStat(stat) + this.getModifier(stat) + this.getTempModifier(stat));
    }
  }
  //----------------

  // Example method: add a new tile position
  addTile(x: number, y: number): void {
    this.tiles.push({ x, y })
  }

  resetMoves() {
    if(!this.statuses.frozen){
      this.movesRemaining = this.getStat('moves');
    }
  }
  resetDefence() {
    this.defenceRemaining = this.getStat('defence');
  }

  useMove() {
    if (this.movesRemaining > 0) {
      this.movesRemaining--
    }
  }

  highlightMove(){//handled in Board.vue
    this.moves
    //this.headPosition
  }

  move(newPosition: Coordinate): void {
    this.headPosition = newPosition;
    // Remove existing occurrence if moving onto own tile
    this.tiles = this.tiles.filter(
      t => !(t.x === newPosition.x && t.y === newPosition.y)
    );
    
    this.tiles.unshift(newPosition)//move below the pop for disease to shrink on move?
    // If exceeding maxSize, remove the oldest tile
    // 4. Shrink the tail until the piece matches the current maxSize
    // Using 'while' handles cases where maxSize dropped by more than 1
    const currentMax = this.getStat('maxSize');
    while (this.tiles.length > currentMax) {
      this.tiles.pop();
    }
  }

  moveTo(newPosition: Coordinate): void {//make a free version
    this.move(newPosition)
    this.useMove();
  }

  async takeDamage(damage: number) {
    if (damage <= 0) return;
    const defenceBefore = this.defenceRemaining;
    // 1. Apply damage to defence
    this.defenceRemaining = Math.max(0, this.defenceRemaining - damage);
    
    playSoundFx(damageSoundUrl, this.name);

    // 2. Calculate overflow damage
    const overflow = Math.max(0, damage - defenceBefore);
    // 3. No overflow → no tile damage
    if (overflow === 0) return;
    // 4. Apply tile damage
    const removeCount = Math.min(overflow, this.tiles.length);
    if(removeCount){
      this.isTakingDamage = true
      //alert cactus admin
      await new Promise(resolve => setTimeout(resolve, 250));
      this.isTakingDamage = false
    }
    this.tiles.splice(this.tiles.length - removeCount, removeCount);
    if (this.tiles.length === 0 && this.removeCallback) {
      this.removeCallback(this);
    }
  }

  hasActions(){
    return this.actions > 0;
  }
  async special(_target: any):Promise<void>{
    
  }

  //cloaked
  //checkStatuses
  //burning take 1 damage regardless of def
  //posion defence -1
  //disease - maxsize -1
  //drugged - moves - 1
  //oil range -1

  async applyStatusEffects(mult: number) {
    if (this.statuses.diseased) {
      this.addModifier({maxSize: -(1 * Math.abs(mult))});
    }
    if (this.statuses.slowed) {
      this.addModifier({moves: -(1 * Math.abs(mult))});
    }
    if(this.statuses.blinded){
      this.addModifier({range: -(1 * Math.abs(mult))});
    }
    if (this.statuses.poisoned) {
      this.addModifier({defence: -(1 * Math.abs(mult))});
    }
    if (this.statuses.frozen) {
      //this.moves = 0;
      this.movesRemaining = 0;
    }
    if (this.statuses.burning) {
      for (let i = 0; i < mult; i++) {
        this.tiles.pop();
      }
      if(this.tiles.length <= 0){
        this.removeCallback?.(this);
      }
    }
  }

  clone(): Piece {
    const Cls = this.constructor as new (
      head: Coordinate,
      team: string,
      removeCallback?: (p: Piece) => void,
      id?: string
    ) => Piece;

    const copy = new Cls(
      { ...this.headPosition },
      this.team,
      this.removeCallback,
      crypto.randomUUID()
    );

    // ---- copy tiles (deep copy)
    copy.tiles = this.tiles.map(t => ({ ...t }));

    // ---- copy stats
    copy.maxSize = this.maxSize;
    copy.moves = this.moves;
    copy.range = this.range;
    copy.attack = this.attack;
    copy.defence = this.defence;

    // ---- copy runtime state
    copy.actions = this.actions;
    copy.movesRemaining = this.movesRemaining;

    return copy;
  }
}

export class Spawn extends Piece {
  static name = "Spawn";
  static description = "A load point for programs";
  static unicode = "U+1F532";//"U+2BD0";
  static color = "#242424ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string) {
    super(Spawn.name, Spawn.description, Spawn.unicode, 50, 0, 0, 0, 0, Spawn.color, headPosition, [headPosition], team, 1, removeCallback, id);
  }
}

class Knife extends Piece {
  static name = "Knife";
  static description = "A basic attack piece";
  static unicode = "U+1F52A";// kitchen knife 
  static color = "#2fc5ebff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Knife.name, Knife.description, Knife.unicode, 3, 2, 1, 2, 0, Knife.color, headPosition, [headPosition], team, Knife.rarity, removeCallback, id)
  }
}

class Dagger extends Piece {
  static name = "Dagger";
  static description = "A basic attack piece, has a special attack that ignores the defences of enemies";
  static unicode = "U+1F5E1";
  static color = "#37b6e9ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Dagger.name, Dagger.description, Dagger.unicode, 3, 2, 1, 3, 0, Dagger.color, headPosition, [headPosition], team, Dagger.rarity, removeCallback, id)
  this.targetType = 'piece'
    this.specialName = 'Assasinate'
  }
  async special(target: Piece): Promise<void> {
    await target.takeDamage(this.getStat('attack') + target.getStat('defence'));//change if we change defence later
    this.actions --
  }
}

class Paladin extends Piece {
  static name = "Paladin";
  static description = "A defensive piece that can share it's defence with another for a turn";
  static unicode = "U+1F540";
  static color = "rgb(84, 160, 190)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Paladin.name, Paladin.description, Paladin.unicode, 3, 2, 2, 2, 3, Paladin.color, headPosition, [headPosition], team, Paladin.rarity, removeCallback, id)
    this.targetType = 'piece';// 'group'
    this.specialName = 'Bless';
    this.hasFriendlySpecial = true;
  }
  //async special(targets: Piece[]):Promise<void>{
    //for (const targetPiece of targets) {
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.team === this.team && targetPiece.id !== this.id){ 
      targetPiece.addTempModifier({defence: (this.getStat('defence'))})
    //}
    }
    this.actions--
  }
}

class Arms extends Piece {
  static name = "Arms";
  static description = "A stronger attacking piece that can attack all enemies in range";
  static unicode = "U+2694";
  static color = "#1b84caff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Arms.name, Arms.description, Arms.unicode, 3, 2, 1, 4, 0, Arms.color, headPosition, [headPosition], team, Arms.rarity, removeCallback, id)
    this.specialName = 'Assault';
    this.targetType = 'group'
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team != this.team){
        await t.takeDamage(this.getStat('attack')); // damages enemy pieces directly in App.vue
      }
    }
    this.actions--
  }
}

class Shield extends Piece {
  static name = "Shield";
  static description = "A basic defensive piece";
  static unicode = "U+1F6E1";
  static color = "#2fa7ca";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shield.name, Shield.description, Shield.unicode, 3, 1, 0, 0, 1, Shield.color, headPosition, [headPosition], team, Shield.rarity, removeCallback, id)
  }
}

class Aegis extends Piece {
  static name = "Aegis";
  static description = "An advanced defensive piece that can use it's special to retaliate against attacks";//damaging special? buckler for parry?
  static unicode = "U+26FB";
  static color = "#06789bff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Aegis.name, Aegis.description, Aegis.unicode, 3, 2, 0, 1, 2, Aegis.color, headPosition, [headPosition], team, Aegis.rarity, removeCallback, id)
    this.specialName = 'Parry';
    this.targetType = 'self'
    this.hasFriendlySpecial = true;
  }
  async special(_target: Coordinate):Promise<void>{
    this.willRetaliate = true;
    this.actions--
  }
}

class Sling extends Piece {
  static name = "Sling";
  static description = "A basic ranged piece";
  static unicode = "U+1F94F";
  static color = "#019700";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sling.name, Sling.description, Sling.unicode, 2, 2, 2, 1, 0, Sling.color, headPosition, [headPosition], team, Sling.rarity, removeCallback, id) //disk
  }
}

class Bow extends Piece {
  static name = "Bow";
  static description = "A longer ranged piece";
  static unicode = "U+1F3F9";
  static color = "#019700";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bow.name, Bow.description, Bow.unicode, 3, 2, 3, 2, 0, Bow.color, headPosition, [headPosition], team, Bow.rarity, removeCallback, id)
  }
}

class Acorn extends Piece {
  static name = "Acorn";
  static description = "A program that turns into an Oak tree";
  static unicode = "U+1F330";
  static color = "rgb(124, 92, 32)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Acorn.name, Acorn.description, Acorn.unicode, 1, 0, 1, 0, 0, Acorn.color, headPosition, [headPosition], team, Acorn.rarity, removeCallback, id)
   this.specialName = 'Grow';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newTree = new Tree(target, this.team, this.removeCallback, crypto.randomUUID())
    newTree.tiles.push(this.headPosition);
    activePieces.push(newTree);
    this.removeCallback?.(this);
    this.actions --
  }
}

class Tree extends Piece {
  static name = "Oak";
  static description = "A program that can spawn Acorns upon reaching it's max size";
  static unicode = "U+1F333";
  static color = "rgb(45, 162, 34)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tree.name, Tree.description, Tree.unicode, 5, 1, 1, 0, 1, Tree.color, headPosition, [headPosition], team, Tree.rarity, removeCallback, id)
   this.specialName = 'Seed';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    if(this.tiles.length >= this.maxSize){
      const newAcorn = new Acorn(target, this.team, this.removeCallback, crypto.randomUUID())
      newAcorn.actions = 0;
      newAcorn.movesRemaining = 0;
      activePieces.push(newAcorn)
    }
    this.actions --
  }
}

//COCONUT, U+1F965
class Coconut extends Piece {
  static name = "Coconut";
  static description = "A program that turns into an Palm tree";
  static unicode = "U+1F965";
  static color = "rgb(224, 207, 108)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Coconut.name, Coconut.description, Coconut.unicode, 1, 2, 1, 1, 1, Coconut.color, headPosition, [headPosition], team, Coconut.rarity, removeCallback, id)
   this.specialName = 'Grow';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newTree = new Palm(target, this.team, this.removeCallback, crypto.randomUUID())
    newTree.tiles.push(this.headPosition);
    activePieces.push(newTree);
    this.removeCallback?.(this);
    this.actions --
  }
}

class Palm extends Piece {
  static name = "Palm";
  static description = "A program that can spawn Coconuts upon reaching it's max size";
  static unicode = "U+1F334";
  static color = "rgb(21, 252, 233)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Palm.name, Palm.description, Palm.unicode, 3, 1, 1, 0, 2, Palm.color, headPosition, [headPosition], team, Palm.rarity, removeCallback, id)
   this.specialName = 'Seed';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    if(this.tiles.length >= this.maxSize){
      const newCoconut = new Coconut(target, this.team, this.removeCallback, crypto.randomUUID());
      newCoconut.actions = 0;
      newCoconut.movesRemaining = 0;
      activePieces.push(newCoconut)
    }
    this.actions --
  }
}

class Rooster extends Piece {
  static name = "Rooster";
  static description = "A slightly tougher chicken with no egg laying capabilities";
  static unicode = "U+1F413";
  static color = "rgb(253, 214, 141)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Rooster.name, Rooster.description, Rooster.unicode, 3, 2, 1, 2, 1, Rooster.color, headPosition, [headPosition], team, Rooster.rarity, removeCallback, id)
  }
}

class Chicken extends Piece {
  static name = "Chicken";
  static description = "What came first? Spawns eggs";
  static unicode = "U+1F414";
  static color = "rgb(253, 214, 141)";
  static rarity = 2;;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Chicken.name, Chicken.description, Chicken.unicode, 3, 2, 1, 1, 0, Chicken.color, headPosition, [headPosition], team, Chicken.rarity, removeCallback, id)
    this.specialName = 'Lay Egg';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newEgg = new Egg(target, this.team, this.removeCallback, crypto.randomUUID());
    newEgg.actions = 0;
    newEgg.movesRemaining = 0;
    activePieces.push(newEgg);
    this.actions --
  }
}

class Chick extends Piece {
  static name = "Chick";
  static description = "Turns into a Chicken or a Rooster on reaching it's max size";
  static unicode = "U+1F423";
  static color = "rgb(243, 242, 155)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Chick.name, Chick.description, Chick.unicode, 2, 1, 1, 0, 0, Chick.color, headPosition, [headPosition], team, Chick.rarity, removeCallback, id)
    this.specialName = 'Mature';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    if(this.tiles.length >= this.maxSize){
      const newPoultry = (Math.random() < 0.5) ? new Chicken(target, this.team, this.removeCallback, crypto.randomUUID()) : new Rooster(target, this.team, this.removeCallback, crypto.randomUUID());
      newPoultry.tiles.push(this.headPosition);
      newPoultry.actions = 0;
      newPoultry.movesRemaining = 0;
      activePieces.push(newPoultry);
      this.removeCallback?.(this);
    }
    this.actions --
  }
}

class Egg extends Piece {
  static name = "Egg";
  static description = "What came first? Spawns a Chick";
  static unicode = "U+1F95A";
  static color = "rgb(240, 232, 216)";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Egg.name, Egg.description, Egg.unicode, 1, 0, 1, 0, 1, Egg.color, headPosition, [headPosition], team, Egg.rarity, removeCallback, id)
    this.specialName = 'Hatch';
    this.targetType = 'space';
  }
  async special({target: _target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newChick = new Chick(this.headPosition, this.team, this.removeCallback, crypto.randomUUID())//removecallback might be wrong here
    newChick.actions = 0;
    newChick.movesRemaining = 0;
    activePieces.push(newChick);
    this.removeCallback?.(this);
    this.actions --
  }
}

class SAM extends Piece {
  static name = "SAM";
  static description = "A slow moving but long ranged program with high damage";
  static unicode = "U+1F680";//"U+1F94D";
  static color = "#970000ff";
  static rarity = 3;//4?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(SAM.name, SAM.description, SAM.unicode, 3, 1, 4, 3, 1, SAM.color, headPosition, [headPosition], team, SAM.rarity, removeCallback, id) //lacrosse
  }
  //special: splash damage
}

class Gate extends Piece {
  static name = "Gate";
  static description = "A defensive program that can target an empty space and move opposite & adjacent program's heads to that space";
  static unicode = "U+13208";//"U+26E9";
  static color = "#ff9900ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gate.name, Gate.description, Gate.unicode, 1, 1, 1, 0, 3, Gate.color, headPosition, [headPosition], team, Gate.rarity, removeCallback, id)
   this.targetType = 'space';//line?? how does this work with larger ranges than 1?
   this.specialName = 'Chaperone'
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const gx = this.headPosition.x;
    const gy = this.headPosition.y;
    const tx = target.x;
    const ty = target.y;
    // 1. Target must be orthogonally adjacent to the Gate
    const dx = tx - gx;
    const dy = ty - gy;
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      // Not adjacent → invalid
      this.actions--;
      return;
    }
    // 2. Opposite tile = mirror across the Gate
    const ox = gx - dx;
    const oy = gy - dy;
    // 3. Find a piece whose *head* is exactly on the opposite tile
    const pieceToMove = activePieces.find(p =>
      p.headPosition.x === ox && p.headPosition.y === oy
    );
    if (!pieceToMove) {
      this.actions--;
      return; // nothing to move
    }
    // 4. Ensure the target tile is free (should already be true)
    const isOccupied = activePieces.some(p =>
      p.tiles.some(t => t.x === tx && t.y === ty)
    );
    if (isOccupied) {
      return;
    }
    pieceToMove.move({ x: tx, y: ty });
    this.actions--
  }
}

class Fence extends Piece {
  static name = "Fence";
  static description = "A large defensive program";
  static unicode = "U+1F6A7";
  static color = "#ffd000ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Fence.name, Fence.description, Fence.unicode, 8, 1, 0, 0, 2, Fence.color, headPosition, [headPosition], team, Fence.rarity, removeCallback, id)
  }
}

class Stonewall extends Piece {
  static name = "Stonewall";
  static description = "A large defensive piece";
  static unicode = "U+1F9F1";
  static color = "#ff5100ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Stonewall.name, Stonewall.description, Stonewall.unicode, 10, 2, 0, 0, 2, Stonewall.color, headPosition, [headPosition], team, Stonewall.rarity, removeCallback, id)
  }
}

class Firewall extends Piece {
  static name = "Firewall";
  static description = "A large program with a short range that can burn";
  static unicode = "U+1F525";
  static color = "#ff0000";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Firewall.name, Firewall.description, Firewall.unicode, 12, 2, 1, 2, 2, Firewall.color, headPosition, [headPosition], team, Firewall.rarity, removeCallback, id)
    this.targetType = 'piece'
    this.specialName = 'Burn'
  }
  async special(target: Piece): Promise<void> {
    //await target.takeDamage(this.getStat('attack'));
    if(target.statuses.burning){
      target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    } else if(!target.immunities.burning){
      target.statuses.burning = true;
    }
    this.actions --
  }
}

class Pitfall extends Piece {
  static name = "Pitfall";
  static description = "A trap program that loads hidden and freezes programs that pass over it";
  static unicode = "U+1F573";
  static color = "#5d3900";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Pitfall.name, Pitfall.description, Pitfall.unicode, 6, 1, 0, 0, 0, Pitfall.color, headPosition, [headPosition], team, Pitfall.rarity, removeCallback, id)
    this.targetType = 'trapPiece';
    this.statuses.negative = true;
    this.statuses.hidden = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.frozen){
      target.statuses.frozen = true;
    }
    this.actions--
    this.statuses.hidden = false;
    this.removeCallback?.(this)
  }
}

class Shovel extends Piece {
  static name = "Shovel";
  static description = "A program that can spawn hidden Pitfalls";
  static unicode = "U+1FA8F";
  static color = "rgb(94, 35, 1)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shovel.name, Shovel.description, Shovel.unicode, 3, 1, 1, 3, 2, Shovel.color, headPosition, [headPosition], team, Shovel.rarity, removeCallback, id)
   this.specialName = 'Seed';
    this.targetType = 'space';
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    if(this.tiles.length===this.maxSize){
      const newAcorn = new Pitfall(target, this.team, this.removeCallback, crypto.randomUUID())//removecallback might be wrong here
      activePieces.push(newAcorn)
    }
    this.actions --
  }
}

/*
class Mole extends Piece {//unfinished - test negative
  static name = "Mole";
  static description = "Can burrow through adjacent programs (does not increase with range)";
  static unicode = "U+1F9A1";
  static color = "#441d0eff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Mole.name, Mole.description, Mole.unicode, 1, 2, 0, 0, 0, Mole.color, headPosition, [headPosition], team, Mole.rarity, removeCallback, id) //	U+1F400 rat
    this.specialName = 'Burrow';
    this.targetType = 'pieceAndPlace'
  }
  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    this.statuses.negative = true;//negative means other pieces can occupy the same space
    // --- 1. Check adjacency ---
    const isAdjacent =
      Math.abs(piece.headPosition.x - target.x) +
      Math.abs(piece.headPosition.y - target.y) === 1;
    if (!isAdjacent) return;
    // --- 2. Identify if target tile belongs to that piece ---
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1) return;  // No tile there
    // Do NOT remove head tile
    if (tileIndex === 0) return;
    // --- 4. Move Mole into that tile ---
    this.moveTo(target);
    this.actions --
  }
}
  */

class Lance extends Piece {
  static name = "Lance";
  static description = "An attacking piece that can charge, damaging targets in a staight line and moving forward until stopped";
  static unicode = "U+1F3A0";
  static color = "#f9f9f9";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Lance.name, Lance.description, Lance.unicode, 3, 2, 3, 2, 0, Lance.color, headPosition, [headPosition], team, Lance.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Trojan extends Piece {//test more
  static name = "Trojan";
  static description = "Can create clones of itself";
  static unicode = "U+1F434";
  static color = "#c51b1bff";
  static rarity = 3;//4? appears often in shop
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trojan.name, Trojan.description, Trojan.unicode, 1, 1, 1, 1, 0, Trojan.color, headPosition, [headPosition], team, Trojan.rarity, removeCallback, id)//horse head atm //military helmet "U+1FA96"
    this.specialName = 'Copy';
    this.targetType = 'space'
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newTrojan = new Trojan(target, this.team, this.removeCallback, crypto.randomUUID())
    //should we allow copying of stats also?
    newTrojan.maxSize = this.maxSize
    newTrojan.moves = this.moves
    newTrojan.range = this.range
    newTrojan.attack = this.attack
    newTrojan.defence = this.defence
    newTrojan.defenceRemaining = this.defence
    newTrojan.statModifiers = this.statModifiers
    newTrojan.movesRemaining = 0;
    newTrojan.actions = 0;
    newTrojan.hybridName = this.hybridName;
    newTrojan.extraUnicode = this.extraUnicode;
    activePieces.push(newTrojan);
    this.actions --
  }
}

//Trojan horse,
//high defence, slow movement, can sacrifice to spawn a trojan

class Cannon extends Piece {
  static name = "Cannon";
  static description = "a slow ranged program that can damage multiple targets in a straight line";
  static unicode = "U+1F3B1";//TODO change this
  static color = "#bb3030ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cannon.name, Cannon.description, Cannon.unicode, 2, 1, 5, 3, 1, Cannon.color, headPosition, [headPosition], team, Cannon.rarity, removeCallback, id) //water pistol
    this.specialName = 'Fire';
    this.targetType = 'line'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      await occupier?.takeDamage(this.getStat('attack'));
    }
    this.actions--
  }
}

class Nerf extends Piece {
  static name = "Nerf Gun";
  static description = "a ranged program that can lower all the stats of other programs by -1";
  static unicode = "U+1F52B";
  static color = "#e7ff13ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nerf.name, Nerf.description, Nerf.unicode, 3, 1, 3, 0, 0, Nerf.color, headPosition, [headPosition], team, Nerf.rarity, removeCallback, id) //water pistol
   this.targetType = 'piece'
   this.specialName = 'Nerf'
  }
  //nerf
  async special(target: Piece): Promise<void> {
    target.addModifier({maxSize: -1})
    target.addModifier({moves: -1})
    target.addModifier({range: -1})
    target.addModifier({attack: -1})
    target.addModifier({defence: -1})
  }
}

class Tank extends Piece {
  static name = "Tank";
  static description = "A mobile ranged program with high defence that can damage multiple targets in a straight line";
  static unicode = "U+1F94C";
  static color = "#00470a";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tank.name, Tank.description, Tank.unicode, 4, 2, 5, 3, 3, Tank.color, headPosition, [headPosition], team, Tank.rarity, removeCallback, id)//curling stone //cog "U+2699 U+FE0F",
    this.specialName = 'Fire';
    this.targetType = 'line'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      await occupier?.takeDamage(this.getStat('attack'));
    }
    this.actions--
  }
}

class Dynamite extends Piece {
  static name = "Dynamite";
  static description = "Can be sacrificed to inflict high damage to a group of enemies";
  static unicode = "U+1F9E8";
  static color = "rgb(43, 26, 26)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Dynamite.name, Dynamite.description, Dynamite.unicode, 1, 2, 2, 6, 0, Dynamite.color, headPosition, [headPosition], team, Dynamite.rarity, removeCallback, id)
    this.specialName = 'Boom';
    this.targetType = 'group'
    this.canAttack = false;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      await t.takeDamage(this.getStat('attack')); // damages enemy pieces directly in App.vue
    }
    this.actions--
    this.removeCallback?.(this); // kill itself
  }

  //regular attack disabled
  //destory self
}

class Bomb extends Piece {
  static name = "Bomb";
  static description = "Can be sacrificed to inflict high damage over a wide area";
  static unicode = "U+1F4A3";
  static color = "#2c2c2cff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Bomb.name, Bomb.description, Bomb.unicode, 1, 2, 3, 10, 0, Bomb.color, headPosition, [headPosition], team, Bomb.rarity, removeCallback, id)
    this.specialName = 'Boom';
    this.targetType = 'group'
    this.canAttack = false;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      await t.takeDamage(this.getStat('attack')); // damages enemy pieces directly in App.vue
    }
    this.actions--
    this.removeCallback?.(this); // kill itself
  }

  //regular attack disabled
  //destory self
}

class Dataworm extends Piece {//test
  static name = "Dataworm";
  static description = "A large program that can tunnel through adjacent programs, removing a piece of memory regardless of defence (head excluded), increasing it's own size, decreasing the target's by 1, and applying disease";
  static unicode = "U+1FAB1";//"U+1F41B";
  static color = "#ee74eeff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Dataworm.name, Dataworm.description, Dataworm.unicode, 6, 3, 1, 4, 2, Dataworm.color, headPosition, [headPosition], team, Dataworm.rarity, removeCallback, id)
    this.specialName = 'Tunnel';
    this.targetType = 'pieceAndPlace'
  }

  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    // --- 1. Check adjacency --- use 4 way check maybe. Or leave black and let it tunnel anywhere in range
    /*const isAdjacent =
      Math.abs(piece.headPosition.x - target.x) +
      Math.abs(piece.headPosition.y - target.y) === 1;
    if (!isAdjacent) return;
    */

    // --- 2. Identify if target tile belongs to that piece ---
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1 ){
      console.log("no tile to remove!")
      return;  // No tile there
    }
    // Do NOT remove head tile
    if (tileIndex === 0){
      console.log("can't remove headPosition!")
      return;
    } 
    // --- 3. Remove that tile from the piece ---
    piece.tiles.splice(tileIndex, 1);
    // --- 4. Move Dataworm into that tile ---
    this.addModifier({maxSize: 1});
    piece.addModifier({maxSize: -1});
    if(!piece.immunities.diseased){
      piece.statuses.diseased = true;
    }
    this.move(target);
    this.actions --
  }
}

class Snake extends Piece {//test
  static name = "Snake";
  static description = "A large program that can move into others' tiles (head excluded), removing a piece of memory regardless of defence and adding to its own max size";
  static unicode = "U+1F40D";
  static color = "#034d22ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Snake.name, Snake.description, Snake.unicode, 3, 1, 1, 1, 0, Snake.color, headPosition, [headPosition], team, Snake.rarity, removeCallback, id)
    this.specialName = 'Swallow';
    this.targetType = 'pieceAndPlace'
  }

  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    // --- 1. Check adjacency --- adjaceny check is off, use 4 way check instead. But maybe we should allow any use in range?
    /*const isAdjacent =
      Math.abs(piece.headPosition.x - target.x) +
      Math.abs(piece.headPosition.y - target.y) === 1;
    if (!isAdjacent) return;*/

    // --- 2. Identify if target tile belongs to that piece ---
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1){
      return;  // No tile there
    }
    // Do NOT remove head tile
    if (tileIndex === 0){
      return;
    } 
    // --- 3. Remove that tile from the piece ---
    piece.tiles.splice(tileIndex, 1);
    this.maxSize += 1;
    // --- 4. Move Snake into that tile ---
    this.move(target);
    this.actions --
  }
}

class Copycat extends Piece {
  static name = "Copycat";
  static description = "Can take on the stats of any program in range";
  static unicode = "U+1F63C";//"U+1F431";
  static color = "#fff643";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Copycat.name, Copycat.description, Copycat.unicode, 1, 2, 2, 0, 0, Copycat.color, headPosition, [headPosition], team, Copycat.rarity, removeCallback, id)
    this.targetType = 'piece'
    this.specialName = 'Imitate'
    //neutral special
    //private count for enemy usage?
  }
  //nerf
  async special(target: Piece): Promise<void> {
    //copy base stats or enhanced stats?
    this.maxSize = target.getStat('maxSize');
    this.moves = target.getStat('moves');
    this.range = target.getStat('range');
    this.attack = target.getStat('attack');
    this.defence = target.getStat('defence');
    this.actions --
    //this.statModifiers = target.statModifiers;
  }

  //check for programs in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

class Banana extends Piece {
  static name = "Banana Peel";
  static description = "A program invisble to the enemy that immobilises programs moving over it for 1 turn";
  static unicode = "U+1F34C";
  static color = "#2f724b";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Banana.name, Banana.description, Banana.unicode, 1, 1, 0, 0, 0, Banana.color, headPosition, [headPosition], team, Banana.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.hidden = true
   this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    target.movesRemaining = 0;
    this.removeCallback?.(this);
  }
}

class Trap extends Piece {
  static name = "Trap";
  static description = "A program invisble to the enemy that immobilises programs moving over it and applies posion to them, removing itself";
  static unicode = "U+1FAA4";
  static color = "#686026";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trap.name, Trap.description, Trap.unicode, 1, 1, 0, 0, 0, Trap.color, headPosition, [headPosition], team, Trap.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.hidden = true
   this.statuses.negative = true;
  }
  //no active special, but a walkOver function we need to setup await handler in App.vue inside movePiece or even Piece moveTo
  async special(target: Piece): Promise<void> {
    if(!target.immunities.frozen){
      target.movesRemaining = 0;
      target.statuses.frozen = true;
    }
    if(!target.immunities.poisoned){
      target.statuses.poisoned = true
    }
    await target.takeDamage(this.getStat('attack'))
    this.actions--
    this.statuses.hidden = false;
    //remove until selection of negative is sorted
    this.removeCallback?.(this);
  }
  //check for programs on top, make their movement 0
}

class Lovebomb extends Piece {
  static name = "Love Bomb";
  static description = "A program invisble to the enemy that applies charmed to programs moving over it, removing itself";
  static unicode = "U+1F498";
  static color = "#682646";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Lovebomb.name, Lovebomb.description, Lovebomb.unicode, 1, 1, 0, 0, 0, Lovebomb.color, headPosition, [headPosition], team, Lovebomb.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.hidden = true
   this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.charmed){
      target.statuses.charmed = true
    } else if(target.statuses.charmed){
      await target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    }
    this.actions--
    this.statuses.hidden = false;
    //remove until selection of negative is sorted
    this.removeCallback?.(this);//not removing on move?
  }
  //check for programs on top, make their movement 0
}

class Tar extends Piece {
  static name = "Tar";
  static description = "A program invisble to the enemy that applies slow to programs moving over it, removing itself";
  static unicode = "U+2668";
  static color = "#686026";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tar.name, Tar.description, Tar.unicode, 4, 1, 0, 0, 0, Tar.color, headPosition, [headPosition], team, Tar.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.hidden = true
   this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.slowed){
      target.statuses.slowed = true
    } else if(target.statuses.slowed){
      await target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    }
    this.actions--
    this.statuses.hidden = false;
    //remove until selection of negative is sorted
    this.removeCallback?.(this);
  }
  //check for programs on top, make their movement 0
}

class Mine extends Piece {
  static name = "Mine";
  static description = "A program invisble to the enemy that damages programs moving over it, removing itself";
  static unicode = "U+1F4A5";
  static color = "#ff9d00";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Mine.name, Mine.description, Mine.unicode, 1, 1, 0, 5, 0, Mine.color, headPosition, [headPosition], team, Mine.rarity, removeCallback, id)
    this.targetType = 'trapPiece';
    this.statuses.hidden = true
    this.statuses.negative = true;
  }
  //no active special, but a walkOver function we need to setup await handler in App.vue inside movePiece or even Piece moveTo
  async special(target: Piece): Promise<void> {
    await target.takeDamage(this.getStat('attack'))
    this.actions--
    this.statuses.hidden = false;
    this.removeCallback?.(this);
    //remove self?
  }

  //check for programs on top, damage them
}

class Oil extends Piece {
  static name = "Oil";
  static description = "A program invisble to the enemy that confuses programs moving over it, removing itself";
  static unicode = "U+1F6E2";
  static color = "#3a3a3a";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Oil.name, Oil.description, Oil.unicode, 3, 2, 0, 0, 0, Oil.color, headPosition, [headPosition], team, Oil.rarity, removeCallback, id)
    this.targetType = 'trapPiece';
    this.statuses.hidden = true
    this.statuses.negative = true;
  }
  //no active special, but a walkOver function we need to setup await handler in App.vue inside movePiece or even Piece moveTo
  async special(target: Piece): Promise<void> {
    if(!target.immunities.confused){
      target.statuses.confused = true;
      //damage as well?
    }
    this.actions--
    this.statuses.hidden = false;
    this.removeCallback?.(this);
    //remove self?
  }

  //check for programs on top, damage them
}

class Web extends Piece {
  static name = "Web";
  static description = "A program that loads hidden and freezes enemies moving over it, removing itself";
  static unicode = "U+1F578";
  static color = "rgb(96, 96, 96)";
  static rarity = 2; //maybe it should be a low level trap piece?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Web.name, Web.description, Web.unicode, 1, 0, 0, 0, 0, Web.color, headPosition, [headPosition], team, Web.rarity, removeCallback, id)
    this.targetType = 'trapPiece';
    this.statuses.hidden = true
    this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.frozen){
      target.movesRemaining = 0;
      target.statuses.frozen = true;//maybe
    }
    this.actions --
    this.statuses.hidden = false;
    //sleep for 200ms to show player
    //remove until selection of negative is sorted
    this.removeCallback?.(this);
    
    //remove self?
  }
  //set movesRemaining of passing pieces to 0
}

class Spider extends Piece {
  static name = "Spider";
  static description = "A fast program with that can spawn hidden webs in unnoccupied spaces that freeze other programs in them";
  static unicode = "U+1F577";
  static color = "#a8743f";
  //U+1F577 U+FE0F spider trail is trap
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Spider.name, Spider.description, Spider.unicode, 2, 3, 1, 3, 0, Spider.color, headPosition, [headPosition], team, Spider.rarity, removeCallback, id)
    this.specialName = 'Weave';
    this.targetType = 'space'
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newWeb = new Web(target, this.team, this.removeCallback, crypto.randomUUID())//removecallback might be wrong here
    activePieces.push(newWeb)
    this.actions --
  }
}

//	U+1F9A0 microbe
class Germ extends Piece {//up to here //TODO
  static name = "Germ";
  static description = "A program that infects other programs, draining their max size over time";
  static unicode = "U+1F9A0";
  static color = "#27ff00";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Germ.name, Germ.description, Germ.unicode, 1, 4, 1, 0, 0, Germ.color, headPosition, [headPosition], team, Germ.rarity, removeCallback, id)
    this.targetType = 'piece'
    this.specialName = 'Infect'
    this.immunities.diseased = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.diseased){
      target.statuses.diseased = true
      this.actions --
    } else if(target.statuses.diseased){
      await target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    }
    this.actions --
  }

  //infect a piece, drain it's max size every turn

}

//	U+1F5DC U+FE0F vice hold others in place
class Vice extends Piece {
  static name = "Vice";
  static description = "A program that can freeze others, reducing their moves to 0";
  static unicode = "U+1F5DC";
  static color = "#f5d58d";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vice.name, Vice.description, Vice.unicode, 2, 2, 1, 2, 1, Vice.color, headPosition, [headPosition], team, Vice.rarity, removeCallback, id)
    this.targetType = 'piece'
    this.specialName = 'Freeze'
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.frozen){
      target.statuses.frozen = true
      target.movesRemaining = 0
    } else if(target.statuses.frozen){
      await target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    }
    this.actions--
  }
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
class Watchman extends Piece {
  static name = "Watchman";
  static description = "A program that spots other programs, making them unable to hide, also reduces their defence by 1 or damages if defence is already 0";
  static unicode = "U+1F441";
  static color = "#6730cf";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Watchman.name, Watchman.description, Watchman.unicode, 2, 2, 3, 1, 0, Watchman.color, headPosition, [headPosition], team, Watchman.rarity, removeCallback, id)
    this.targetType = 'group'
    this.specialName = 'Spot'
    this.hasExposingSpecial = true;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const target of targets) {
      if(target.team !== this.team){
        if(!target.immunities.exposed){
          target.statuses.hidden = false;
          target.statuses.exposed = true;
        }
        if(target.getStat('defence') > 0){
          target.defence -= 1
        } else {
          await target.takeDamage(this.getStat('attack'))
        }
      }
    }
    this.actions--
  }
}

class Magnet extends Piece {
  static name = "Magnet";
  static description = "A program that moves other programs toward itself";
  static unicode = "U+1F9F2";
  static color = "#6fa9ffff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Magnet.name, Magnet.description, Magnet.unicode, 2, 2, 3, 2, 1, Magnet.color, headPosition, [headPosition], team, Magnet.rarity, removeCallback, id)
   this.targetType = 'line'
   this.specialName = 'Pull'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (let i = 0; i < line.length; i++) {
      if (i + 1 >= line.length) break;
      const here = line[i];
      const next = line[i + 1];

      const occupierHere = activePieces.find(p =>
        p.tiles.some(t => t.x === here.x && t.y === here.y)
      );
      if (occupierHere) continue;  
      // Tile is *not* empty → cannot pull anything into it
      const occupierNext = activePieces.find(p =>
        p.tiles.some(t => t.x === next.x && t.y === next.y)
      );
      if (!occupierNext) continue;
      // Pull occupier 1 step closer
      occupierNext.moveTo(here);
    }
    this.actions--
  }
}

//	U+1F422 turtle
class Turtle extends Piece {
  static name = "Snapping Turtle";
  static description = "A slow program with high defence";
  static unicode = "U+1F422";
  static color = "#84cd48";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Turtle.name, Turtle.description, Turtle.unicode, 1, 1, 1, 3, 4, Turtle.color, headPosition, [headPosition], team, Turtle.rarity, removeCallback, id)
  }
  // slow, high defence, snap low range atk
}

//	U+1F997 hopper
class Hopper extends Piece {
  static name = "Hopper";
  static description = "A program that can jump to spaces in range";
  static unicode = "U+1F997";
  static color = "#9aff46";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hopper.name, Hopper.description, Hopper.unicode, 1, 3, 2, 2, 1, Hopper.color, headPosition, [headPosition], team, Hopper.rarity, removeCallback, id)
    this.targetType = 'space'
    this.specialName = 'Hop'
  }
  async special({target, activePieces: _activePieces}:{target: Coordinate, activePieces: Piece[]}): Promise<void> {
    /*
    //if there all spaces between the hopper and the target contain and piece tiles
    // 1. Target must be within Hopper's range.
    const dx = target.x - this.headPosition.x;
    const dy = target.y - this.headPosition.y;

    // Not in straight line OR diagonal → illegal hop
    const isStraight = dx === 0 || dy === 0;
    const isDiagonal = Math.abs(dx) === Math.abs(dy);
    if (!isStraight && !isDiagonal) return;

    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    if (distance > this.getStat('range')) return;

    // 2. End tile must be empty
    const isOccupied = activePieces.some(p =>
      p.tiles.some(t => t.x === target.x && t.y === target.y)
    );
    if (isOccupied) return;

    // 3. Collect all tiles between Hopper and target
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);

    const tilesBetween: Coordinate[] = [];
    let cx = this.headPosition.x + stepX;
    let cy = this.headPosition.y + stepY;

    while (cx !== target.x || cy !== target.y) {
      tilesBetween.push({ x: cx, y: cy });
      cx += stepX;
      cy += stepY;
    }
    // 4. Every tile between must contain *some piece tile*
    const allBetweenAreOccupied = tilesBetween.every(tile =>
      activePieces.some(piece =>
        piece.tiles.some(t => t.x === tile.x && t.y === tile.y)
      )
    );
    if (!allBetweenAreOccupied) return;
    // 5. Conditions satisfied → perform hop
    */
    this.move(target);
    this.actions --
  }
}

//	U+1F9FD sponge
class Sponge extends Piece {
  static name = "Sponge";
  static description = "A program that can absorb stats of nearby programs";
  static unicode = "U+1F9FD";
  static color = "#ffd446";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sponge.name, Sponge.description, Sponge.unicode, 1, 2, 1, 0, 0, Sponge.color, headPosition, [headPosition], team, Sponge.rarity, removeCallback, id)
   this.targetType = 'piece'
    this.specialName = 'Absorb'
  }
  //nerf
  async special(target: Piece): Promise<void> {
    //copy base stats or enhanced stats?
    this.maxSize += target.getStat('maxSize');
    this.moves += target.getStat('moves');
    this.range += target.getStat('range');
    this.attack += target.getStat('attack');
    this.defence += target.getStat('defence');
    this.actions --
    //remove these stats from target???
    target.maxSize = 1
    target.moves = 0
    target.range = 0
    target.attack = 0
    target.defence = 0
    target.statModifiers = {}
  }
}

class Puffer extends Piece {
  static name = "Puffer";
  static description = "A program that damages programs that attack it, poisoning them";
  static unicode = "U+1F421";
  static color = "#0d8affff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Puffer.name, Puffer.description, Puffer.unicode, 4, 2, 1, 2, 2, Puffer.color, headPosition, [headPosition], team, Puffer.rarity, removeCallback, id)
   this.specialName = 'Puffup';
   this.targetType = 'self';
   this.hasFriendlySpecial = true;
   this.immunities.poisoned = true;
  }
  async special(_target: Coordinate):Promise<void>{
    this.willRetaliate = true;
    this.actions--
  }
  //return getStat(attack') on takedamage
}

class Nuke extends Piece {
  static name = "Nuke";
  static description = "A slow and fragile program that destroys itself and damages all in range";
  static unicode = "U+2622";
  static color = "#ff0000ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nuke.name, Nuke.description, Nuke.unicode, 1, 1, 4, 25, 0, Nuke.color, headPosition, [headPosition], team, Nuke.rarity, removeCallback, id)
   this.specialName = 'Boom';
   this.targetType = 'group'
   this.canAttack = false;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      await t.takeDamage(this.getStat('attack')); // damages enemy pieces directly in App.vue
    }
    this.actions--
    this.removeCallback?.(this); // kill itself
  }
  //destroy self on attack
}

class Highwayman extends Piece {//not working
  static name = "Highwayman";
  static description = "A program that can generate money once from an enemy piece based on it's rarity, or steal money from the player";
  static unicode = "U+1F9B9";
  static color = "#494646ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Highwayman.name, Highwayman.description, Highwayman.unicode, 2, 2, 1, 3, 0, Highwayman.color, headPosition, [headPosition], team, Highwayman.rarity, removeCallback, id)
   this.specialName = 'Steal';
   this.targetType = 'pieceAndPlayer'
   //this.canAttack = false;
  }
  private ids: string[] = []//track already stolen pieces?
  async special({piece, player} : {piece: Piece, player: Player}):Promise<void>{
    if(!this.ids.includes(piece.id)){
      //await piece.takeDamage(this.getStat('attack'))
      if(piece.team === 'enemy'){
        player.money += piece.rarity;
      } else if(piece.team === 'player'){
        player.money -= piece.rarity;
      }
      this.ids.push(piece.id)
      this.actions--
    } else {
      await piece.takeDamage(this.getStat('attack'));
    }
  }
}

class Tengu extends Piece {//not working
  static name = "Tengu";
  static description = "A program that can slow an enemy and steal money once based on it's rarity, or steal money from the player";
  static unicode = "U+1F47A";
  static color = "rgb(90, 0, 60)";
  static rarity = 3;//buff?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tengu.name, Tengu.description, Tengu.unicode, 2, 2, 2, 2, 0, Tengu.color, headPosition, [headPosition], team, Tengu.rarity, removeCallback, id)
   this.specialName = 'Curse';
   this.targetType = 'pieceAndPlayer'
   //this.canAttack = false;
  }
  private ids: string[] = []//track already stolen pieces?
  async special({piece, player} : {piece: Piece, player: Player}):Promise<void>{
    if(!this.ids.includes(piece.id)){
      if(!piece.immunities.slowed){//confused?
        piece.statuses.slowed = true; //confused = true;
      }
      //await piece.takeDamage(this.getStat('attack'))
      if(piece.team === 'enemy'){
        player.money += piece.rarity;
      } else if(piece.team === 'player'){
        player.money -= piece.rarity;
      }
      this.ids.push(piece.id)
      this.actions--
    } else {
      await piece.takeDamage(this.getStat('attack'));
    }
  }
}

class Elephant extends Piece {
  static name = "Elephant";
  static description = "A large program with strong stats";
  static unicode = "U+1F418";
  static color = "rgb(228, 217, 195)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Elephant.name, Elephant.description, Elephant.unicode, 5, 2, 1, 2, 2, Elephant.color, headPosition, [headPosition], team, Elephant.rarity, removeCallback, id)
  }
  //special - trample
}

class Mammoth extends Piece {
  static name = "Mammoth";
  static description = "A larger Elephant";
  static unicode = "U+1F9A3"
  static color = "rgb(206, 228, 236)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mammoth.name, Mammoth.description, Mammoth.unicode, 6, 2, 1, 3, 3, Mammoth.color, headPosition, [headPosition], team, Mammoth.rarity, removeCallback, id)
  }
}

class Snowman extends Piece {
  static name = "Snowman";
  static description = "A program that can snowball, increasing it's max size and moves";
  static unicode = "U+26C4";
  static color = "#4e4e4eff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Snowman.name, Snowman.description, Snowman.unicode, 2, 1, 1, 3, 0, Snowman.color, headPosition, [headPosition], team, Snowman.rarity, removeCallback, id)
    this.specialName = 'Snowball';
    this.targetType = 'space'
    //this.canMove = false;
  }
  async special({target, activePieces: _activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    this.maxSize+=1;
    this.addModifier({moves: 1})
    this.move(target);
    this.actions --
  }
  //maxSize = size
}

class Soldier extends Piece {
  static name = "Soldier";
  static description = "An all rounder program";
  static unicode = "U+1FA96";
  static color = "#1a5200ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Soldier.name, Soldier.description, Soldier.unicode, 3, 2, 3, 3, 3, Soldier.color, headPosition, [headPosition], team, Soldier.rarity, removeCallback, id)
  }
}

class Fencer extends Piece {
  static name = "Fencer";
  static description = "A close range program that can retaliate incoming attacks";
  static unicode = "U+1F93A";
  static color = "#3b79c9ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Fencer.name, Fencer.description, Fencer.unicode, 3, 2, 1, 2, 1, Fencer.color, headPosition, [headPosition], team, Fencer.rarity, removeCallback, id)
   this.specialName = 'En garde';
   this.targetType = 'self'
  }
  async special(_target: Coordinate):Promise<void>{
    //damageed???
    this.willRetaliate = true; 
    this.actions--
  }
  //parry action deflects next attack
}

export class Pawn extends Piece {
  static name = "Pawn";
  static description = "A slow program that can be promoted into another piece in range";
  static unicode = "U+265F";//♟️
  static color = "#131313ff";
  static rarity = 3;//4?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Pawn.name, Pawn.description, Pawn.unicode, 1, 1, 1, 1, 0, Pawn.color, headPosition, [headPosition], team, Pawn.rarity, removeCallback, id)
   this.specialName = 'Promote';
   this.targetType = 'placeAndPieces'
   this.hasFriendlySpecial = true;
  }
  async special({ target, activePieces }: { target: Coordinate; activePieces: Piece[] }): Promise<void> {
    
    const targetPiece = activePieces.find(p => 
      p.tiles.some(t => t.x === target.x && t.y === target.y)
    )
    if (!targetPiece) return;
    
    const newPieceConstructor = allPieces.find(c => c.name === targetPiece.name);
    if (!newPieceConstructor){
      //find using name with hybrid removed
      return;
    }
    
    const head = this.headPosition;
    const promoted = new newPieceConstructor(
      head,
      this.team,
      this.removeCallback,
      this.id + 'prom1'
    );
    promoted.maxSize = targetPiece.maxSize;
    promoted.moves = targetPiece.moves;
    promoted.range = targetPiece.range;
    promoted.attack = targetPiece.attack;
    promoted.defence = targetPiece.defence;
    promoted.statModifiers = this.statModifiers
    if(targetPiece.hybridName){
      promoted.hybridName = targetPiece.hybridName;
      promoted.description = targetPiece.description;
      promoted.extraUnicode = targetPiece.extraUnicode;
    }
    
    activePieces.push(promoted);
    this.actions--
    this.removeCallback?.(this);
    // Add to activePieces
    promoted.actions--
    promoted.movesRemaining = 0
  }
}

class Larva extends Piece {
  static name = "Larva";
  static description = "A program that can consume other's body tiles and turn into a wasp on reaching it's max size";
  static unicode = "U+1F41B";
  static color = "#f5f4e2ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Larva.name, Larva.description, Larva.unicode, 3, 1, 1, 1, 0, Larva.color, headPosition, [headPosition], team, Larva.rarity, removeCallback, id)
   this.specialName = 'Feed';
   this.targetType = 'placeAndPieces';
   this.hasFriendlySpecial = false;
  }
  async special({ target, activePieces }: { target: Coordinate; activePieces: Piece[] }): Promise<void> {
    //Find the piece that owns the target tile
    const targetPiece = activePieces.find(p =>
      p.tiles.some(t => t.x === target.x && t.y === target.y)
    );
    if (!targetPiece) return;
    const tileIndex = targetPiece.tiles.findIndex(
      t => t.x === target.x && t.y === target.y
    );
    // Reject invalid targets
    if (tileIndex === -1) return;
    if (tileIndex === 0) return; // cannot infect head
    // --- 3. Remove that tile from the piece ---
    targetPiece.tiles.splice(tileIndex, 1);
    this.tiles.push(target);
    if(this.tiles.length >= this.getStat('maxSize')){
      //replace this with a new wasp
      const wasp = new Wasp(this.headPosition, this.team, this.removeCallback, crypto.randomUUID());
      wasp.tiles = this.tiles;
      wasp.actions = 0;
      wasp.movesRemaining = 0;
      activePieces.push(wasp);
      this.actions--
      this.removeCallback?.(this)
    }
  }
}

class Wasp extends Piece {
  static name = "Parasitic Wasp";
  static description = "A program that can replace an enemy body piece with a larva";
  static unicode = "U+131A4";
  static color = "#802f00ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Wasp.name, Wasp.description, Wasp.unicode, 3, 2, 1, 3, 1, Wasp.color, headPosition, [headPosition], team, Wasp.rarity, removeCallback, id)
   this.specialName = 'Inject';
   this.targetType = 'placeAndPieces';
   this.hasFriendlySpecial = false;
  }
  async special({target, activePieces, }: { target: Coordinate; activePieces: Piece[]; }): Promise<void> {
    
    //Find the piece that owns the target tile
    const targetPiece = activePieces.find(p =>
      p.tiles.some(t => t.x === target.x && t.y === target.y)
    );
    if (!targetPiece) return;

    const tileIndex = targetPiece.tiles.findIndex(
      t => t.x === target.x && t.y === target.y
    );
    // Reject invalid targets
    if (tileIndex === -1) return;
    if (tileIndex === 0) return; // cannot infect head
    //if (targetPiece.team === this.team) return;
    // Remove the body tile
    targetPiece.tiles.splice(tileIndex, 1);

    //Spawn larva at that position
    const larva = new Larva(target, this.team, this.removeCallback, crypto.randomUUID());
    larva.actions = 0;
    larva.movesRemaining = 0;
    activePieces.push(larva);

    this.actions--;
  }
}

class Rat extends Piece {
  static name = "Rat";
  static description = "A small but fast program"
  static unicode = "U+1F400";
  static color = "#6e6e6eff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Rat.name, Rat.description, Rat.unicode, 1, 3, 1, 1, 0, Rat.color, headPosition, [headPosition], team, Rat.rarity, removeCallback, id)
  }
}

class Flute extends Piece {//not working
  static name = "Piper";
  static description = "A program that can summon rats";
  static unicode = "U+1FA88";
  static color = "rgb(96, 197, 157)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Flute.name, Flute.description, Flute.unicode, 1, 1, 1, 0, 0, Flute.color, headPosition, [headPosition], team, Flute.rarity, removeCallback, id)
   this.specialName='Summon'
   this.targetType='space'
   this.canAttack=false;
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newRat = new Rat(target, this.team, this.removeCallback, crypto.randomUUID());
    newRat.actions = 0;
    newRat.movesRemaining = 0;
    activePieces.push(newRat);
    this.actions--
  }

  //create rat instances
}


//RABBIT, U+1F407 high movement 1 atk 1 maxsize, special make more rabbits
class Rabbit extends Piece {//not working
  static name = "Rabbit";
  static description = "A fast program that can create more rabbits when at it's max size";
  static unicode = "U+1F407";
  static color = "rgb(47, 179, 106)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Rabbit.name, Rabbit.description, Rabbit.unicode, 2, 4, 1, 1, 0, Rabbit.color, headPosition, [headPosition], team, Rabbit.rarity, removeCallback, id)
   this.specialName='Breed'
   this.targetType='space'
   this.canAttack=false;
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    if(this.tiles.length >= this.getStat('maxSize')){
      const newRabbit = new Rabbit(target, this.team, this.removeCallback, crypto.randomUUID());
      newRabbit.actions = 0;
      newRabbit.movesRemaining = 0;
      activePieces.push(newRabbit);
    }
    this.actions--
  }
}

// TOP HAT, U+1F3A9 spawns a rabbit
/*class Hat extends Piece {//not working
  static name = "Top Hat";
  static description = "A program that can turn into a rabbit";
  static unicode = "U+1F3A9";
  static color = "#6ea1caff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hat.name, Hat.description, Hat.unicode, 1, 1, 1, 1, 0, Hat.color, headPosition, [headPosition], team, Hat.rarity, removeCallback, id)
   this.specialName='Breed'
   this.targetType='space'
   this.canAttack=false;
  }
  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newRabbit = new Rabbit(target, this.team, this.removeCallback, crypto.randomUUID());
    newRabbit.actions = 0;
    newRabbit.movesRemaining = 0;
    activePieces.push(newRabbit);
    this.actions--
  }
}*/



class LabRat extends Piece {
  static name = "Lab Rat";
  static description = "A small but fast program that can spread disease, reducing max size"
  static unicode = "U+1F401";
  static color = "rgb(174, 255, 171)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(LabRat.name, LabRat.description, LabRat.unicode, 1, 3, 1, 2, 0, LabRat.color, headPosition, [headPosition], team, LabRat.rarity, removeCallback, id)
    this.specialName = 'Fleas'
    this.targetType = 'piece'
  }

  async special(target: Piece): Promise<void> {
    if(target.statuses.diseased){
      target.takeDamage(this.getStat('attack'));
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    } else if(!target.immunities.diseased){
      target.statuses.diseased = true
      this.actions --
    }
    this.actions --
  }
}

class Bat extends Piece {
  static name = "Vampire Bat";
  static description = "A program immune to disease. Can steal body memory spaces from other programs spread disease to them, and increasing it's max size";//remove tile, +1 temp defence? spread statuess?
  static unicode = "U+1F987";
  static color = "#ff290dff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bat.name, Bat.description, Bat.unicode, 3, 3, 1, 3, 1, Bat.color, headPosition, [headPosition], team, Bat.rarity, removeCallback, id)
   this.specialName = 'Bite';
   this.targetType = 'pieceAndPlace'
  }
  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1) return;  // No tile there
    // Do NOT remove head tile
    if (tileIndex === 0) return;
    // --- 3. Remove that tile from the piece ---
    piece.tiles.splice(tileIndex, 1);
    if(!piece.immunities.diseased){
      piece.statuses.diseased = true;
    }
    this.actions--
    this.tiles.push(target);
    this.maxSize += 1;
  }
  //raise defence +1 if total dmg > 0
}

class Dragon extends Piece {//line?
  static name = "Dragon";
  static description = "A large program with high stats that can apply burning to all programs in range";//multpie targets?
  static unicode = "U+1F409";
  static color = "#5feb76ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dragon.name, Dragon.description, Dragon.unicode, 6, 2, 2, 4, 2, Dragon.color, headPosition, [headPosition], team, Dragon.rarity, removeCallback, id)
   this.specialName = 'Fire Breath';
   this.targetType = 'group'
   this.immunities.burning = true;
  }

  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.statuses.burning && t.team !== this.team){
        await t.takeDamage(this.getStat('attack'))
      } else if(!t.immunities.burning){
        //damage as well???
        t.statuses.burning = true
      }
    }
    this.actions--
  }
  //burn in a line instead???
}

class Ink extends Piece {
  static name = "Ink";
  static description = "An ink decoy that lasts for one turn";
  static unicode = "U+1F322";//"U+26AB";
  static color = "#303030ff";
  static rarity = 8;//should never appear on its own
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ink.name, Ink.description, Ink.unicode, 1, 0, 0, 0, 0, Ink.color, headPosition, [headPosition], team, Ink.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.blinded){
      target.statuses.blinded = true;
    }
    this.actions--
    this.statuses.hidden = false;
    //sleep 300?
    this.removeCallback?.(this);
  }
}

class Squid extends Piece {
  static name = "Squid";
  static description = "A program that can creat ink decoy tiles that blind enemies, immune to being blinded itself";
  static unicode = "U+1F991";
  static color = "#08004dff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Squid.name, Squid.description, Squid.unicode, 5, 2, 1, 2, 1, Squid.color, headPosition, [headPosition], team, Squid.rarity, removeCallback, id)
    this.immunities.blinded = true;
    this.specialName = 'Ink';
    this.targetType = 'line';
  }

 async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
     for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        const newInk = new Ink(tile, this.team, this.removeCallback, crypto.randomUUID());
        activePieces.push(newInk);
        continue;
      }else{
        if(occupier.statuses.blinded){
          await occupier.takeDamage(this.getStat('attack'));
        }
        if(!occupier.immunities.blinded){
          occupier.statuses.blinded = true;
        }
        break;
      }  
    }
    this.actions--
  }
}

class Snail extends Piece {
  static name = "Snail";
  static description = "A slow program that can retract itself to double it's defence temporarily until the next turn";
  static unicode = "U+1F40C";
  static color = "#4d3502ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Snail.name, Snail.description, Snail.unicode, 2, 1, 1, 1, 1, Snail.color, headPosition, [headPosition], team, Snail.rarity, removeCallback, id)
    this.targetType = 'self'
    this.specialName = 'Retract'
  }
  async special(_target: Coordinate):Promise<void>{
    if(this.tiles.length > 1){
      this.tiles = [this.headPosition]//use array modifier
      this.addTempModifier({defence: this.getStat('defence')});//double it's defense/ or +1?
      this.movesRemaining = 0;
    }
    this.actions--
  }
}

class Shark extends Piece {
  static name = "Shark";
  static description = "A fast program with high attack";//exposes pieces that take damage?
  static unicode = "U+1F988";
  static color = "#0061bdff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shark.name, Shark.description, Shark.unicode, 4, 4, 1, 4, 1, Shark.color, headPosition, [headPosition], team, Shark.rarity, removeCallback, id)
  }
}

class Greatshield extends Piece {//testt
  static name = "Greatshield";
  static description = "A slow but highly defensive program, can share its defence temporarily with all friendlies in range";
  static unicode = "U+26C9";
  static color = "rgba(0, 82, 85, 1)";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Greatshield.name, Greatshield.description, Greatshield.unicode, 5, 2, 1, 2, 5, Greatshield.color, headPosition, [headPosition], team, Greatshield.rarity, removeCallback, id)
    this.specialName = 'Testudo';
    this.hasFriendlySpecial = true;
    this.targetType = 'group';
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team === this.team && t.id !== this.id){//don't apply to self
        t.addTempModifier({defence: (this.getStat('defence'))})
      }
    }
    this.actions--
  }

}

class Wizard extends Piece {
  static name = "Wizard";
  static description = "A program that can summon random programs from the player's inventory, or programs equal to or -1 relative to the player's security level if no inventory pieces are available.";
  static unicode = "U+1F9D9";
  static color = "#7600c5ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Wizard.name, Wizard.description, Wizard.unicode, 3, 2, 3, 2, 2, Wizard.color, headPosition, [headPosition], team, Wizard.rarity, removeCallback, id)
    this.specialName='Summon'
    this.targetType='space'
  }
  async special({target, activePieces, player} : {target: Coordinate, activePieces: Piece[], player?: Player}):Promise<void>{
    const difficulty = player ? player.difficulty : 1;
    const targetRarity1 = difficulty;
    const targetRarity2 = Math.max(1, difficulty - 1);
    const validPieces = allPieces.filter(PieceClass => {
    if(this.team === 'enemy' && PieceClass.name === 'Nuke') return false;//don't let enemies summon nukes
      const temp = new PieceClass({x:-1,y:-1}, 'enemy', undefined);
      return temp.rarity === targetRarity1 || temp.rarity === targetRarity2;
    });
    if(this.team === 'player' && player && player.programs.length > 0) {
      const availableBlueprints = player.programs.filter(bp => !bp.isPlaced);
      const randBlueprint = availableBlueprints[Math.floor(Math.random() * availableBlueprints.length)];
      const PieceClass = randBlueprint ? allPieces.find(p => p.name === randBlueprint.name) : validPieces[Math.floor(Math.random() * validPieces.length)];
      if (PieceClass) {
        const summonedPiece = new PieceClass(target, 'player', this.removeCallback, crypto.randomUUID());
        summonedPiece.actions = 0;
        summonedPiece.movesRemaining = 0;
        activePieces.push(summonedPiece);
        randBlueprint.isPlaced = true;
      }
    } else if (this.team === 'enemy') {
      if (validPieces.length > 0) {
        const EnemyClass = validPieces[Math.floor(Math.random() * validPieces.length)];
        const summonedPiece = new EnemyClass(target, 'enemy', this.removeCallback, crypto.randomUUID());
        summonedPiece.actions = 0;
        summonedPiece.movesRemaining = 0;
        activePieces.push(summonedPiece);
      }
    }
    this.actions--
  }
}

class Ninja extends Piece {
  static name = "Ninja";
  static description = "A small program with high attack that can hide itself from enemies until attacking";
  static unicode = "U+1F977";
  static color = "#000000ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Ninja.name, Ninja.description, Ninja.unicode, 1, 3, 2, 3, 0, Ninja.color, headPosition, [headPosition], team, Ninja.rarity, removeCallback, id)
    this.specialName = 'Hide'
    this.targetType = 'self'
  }
  async special(_target: Coordinate):Promise<void>{
    if(!this.statuses.exposed){
      this.statuses.hidden = true;
    }
    this.actions--
  }
}

class Fairy extends Piece {//TODO test unfinished
  static name = "Fairy";//ANGEL?? fairy consumable item for used blueprint???
  static description = "Immune to all statuses. Can bless a friendly program to remove harmful statuses, give it +1 max size, and give bonus temporary defence equal to the fairy's attack";
  static unicode = "U+1F9DA";
  static color = "rgb(123, 176, 245)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Fairy.name, Fairy.description, Fairy.unicode, 2, 3, 3, 3, 0, Fairy.color, headPosition, [headPosition], team, Fairy.rarity, removeCallback, id)
    this.specialName='Bless'
    this.targetType='piece'
    this.hasFriendlySpecial = true;
    this.immunities.blinded = true;
    this.immunities.burning = true;
    this.immunities.charmed = true;
    this.immunities.confused = true;
    this.immunities.frozen = true;
    this.immunities.poisoned = true;
    this.immunities.slowed = true;
    this.immunities.exposed = true;
  }
  static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen','charmed', 'confused', 'exposed']
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.team === this.team){ 
      for (const key of Fairy.harmfulStatuses) {
        targetPiece.statuses[key] = false;
      }
      targetPiece.addModifier({maxSize: 1})
      targetPiece.addTempModifier({defence: (this.getStat('attack'))})
    } else {
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Doctor extends Piece {
  static name = "Doctor";
  static description = "Can remove harmful statuses (except exposed) from friendlies and increase their max size by 1";
  static unicode = "U+1FA7A";
  static color = "rgb(13, 255, 223)";
  static rarity = 2;//3?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Doctor.name, Doctor.description, Doctor.unicode, 2, 2, 2, 1, 0, Doctor.color, headPosition, [headPosition], team, Doctor.rarity, removeCallback, id)
    this.specialName='Treat';
    this.targetType='piece';
    this.hasFriendlySpecial=true;
  }
  static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen', 'charmed', 'confused']
  async special(targetPiece: Piece):Promise<void>{    
    if(targetPiece.team === this.team){ 
      for (const key of Doctor.harmfulStatuses) {
        targetPiece.statuses[key] = false;
      }
      targetPiece.addModifier({maxSize: 1})
    } else {
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Medic extends Piece {
  static name = "Field Medic";
  static description = "Can remove harmful statuses (except exposed) from friendlies.";
  static unicode = "U+26D1";
  static color = "rgb(111, 247, 228)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Medic.name, Medic.description, Medic.unicode, 3, 2, 2, 2, 2, Medic.color, headPosition, [headPosition], team, Medic.rarity, removeCallback, id)
    this.specialName='Bandage';
    this.targetType='piece';
    this.hasFriendlySpecial=true;
  }
  static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen', 'charmed', 'confused']
  async special(targetPiece: Piece):Promise<void>{    
    if(targetPiece.team === this.team){ 
      for (const key of Doctor.harmfulStatuses) {
        targetPiece.statuses[key] = false;
      }
      targetPiece.addModifier({maxSize: 1})
    } else {
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Paragon extends Piece {
  static name = "Paragon";
  static description = "A strong defensive piece that can remove any harmful statuses from a group of friendlies and give them a temporary +1 defence"//, and give them a temporary defence equal to its own.";//a group of friendlies"
  static unicode = "U+26E8";
  static color = "rgb(14, 202, 177)";
  static rarity = 5;//3?
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Paragon.name, Paragon.description, Paragon.unicode, 3, 3, 1, 2, 4, Paragon.color, headPosition, [headPosition], team, Paragon.rarity, removeCallback, id)
    this.specialName='Rally';
    this.targetType='group';
    this.hasFriendlySpecial=true;
  }
  static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen','charmed', 'confused', 'exposed']
  async special(targets: Piece[]):Promise<void>{
    for(const targetPiece of targets){ 
      if(targetPiece.team === this.team){ 
        for (const key of Paragon.harmfulStatuses) {
          targetPiece.statuses[key] = false;
        }
        targetPiece.addTempModifier({defence: 1});
      } else {
        targetPiece.takeDamage(this.getStat('attack'))
        if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
      }
      this.actions--
    }
  }
}

class Cupid extends Piece {
  static name = "Cupid";
  static description = "Can charm an enemy on the board, putting it under your control for the round";
  static unicode = "U+1F47C";
  static color = "#ffb20dff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Cupid.name, Cupid.description, Cupid.unicode, 1, 1, 3, 3, 0, Cupid.color, headPosition, [headPosition], team, Cupid.rarity, removeCallback, id)
    this.specialName='Charm'
    this.targetType='piece'
  }

  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.charmed){
      targetPiece.statuses.charmed = true;
    } else if(targetPiece.statuses.charmed){
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Oni extends Piece {
  static name = "Oni";
  static description = "A strong but slow program that can inflict the slow status on a group of enemies";
  static unicode = "U+1F479";
  static color = "#9e0303ff";
  static rarity = 6;//6 target group
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Oni.name, Oni.description, Oni.unicode, 6, 1, 2, 5, 3, Oni.color, headPosition, [headPosition], team, Oni.rarity, removeCallback, id)
    this.specialName = 'Haunt';//Haunt
    this.targetType = 'group';
    this.immunities.slowed = true;
  }
  //async special(targetPiece: Piece):Promise<void>{
  async special(targets: Piece[]):Promise<void>{
    for(const targetPiece of targets){
      if(!targetPiece.immunities.slowed){
        targetPiece.statuses.slowed = true
      } else if(targetPiece.statuses.slowed){
        targetPiece.takeDamage(this.getStat('attack'));
        if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
        }
      }
    this.actions--
  }
}

class Ant extends Piece {//ant - bug can be higher and cause slow
  static name = "Ant";
  static description = "A fast but small program";
  static unicode = "U+1F41C"; //high movement - lvl 2 bug
  static color = "rgb(4, 156, 202)";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ant.name, Ant.description, Ant.unicode, 1, 5, 1, 1, 0, Ant.color, headPosition, [headPosition], team, Ant.rarity, removeCallback, id)
  }
}

class Bug extends Piece {//ant - bug can be higher and cause slow
  static name = "Bug";
  static description = "A fast small program that can slow others";
  static unicode = "U+1F47E";
  static color = "rgb(4, 202, 129)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Bug.name, Bug.description, Bug.unicode, 1, 5, 1, 1, 1, Bug.color, headPosition, [headPosition], team, Bug.rarity, removeCallback, id)
    this.specialName = 'Glitch'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.slowed){
      targetPiece.statuses.slowed = true
    } else if(targetPiece.statuses.slowed){
      targetPiece.takeDamage(this.getStat('attack'));
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Cockroach extends Piece {
  static name = "Cockroach";
  static description = "A faster, tougher bug, immune to disease";
  static unicode = "U+1FAB3";
  static color = "#e09f79ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cockroach.name, Cockroach.description, Cockroach.unicode, 2, 6, 1, 3, 2, Cockroach.color, headPosition, [headPosition], team, Cockroach.rarity, removeCallback, id)
    this.immunities.diseased = true;
  }
}

class Mosquito extends Piece {
  static name = "Mosquito";
  static description = "Can steal enemy body tiles and spread disease to them";//spread statuses?
  static unicode = "U+1F99F";
  static color = "#271f0dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mosquito.name, Mosquito.description, Mosquito.unicode, 2, 2, 1, 2, 0, Mosquito.color, headPosition, [headPosition], team, Mosquito.rarity, removeCallback, id)
    this.specialName = 'Bite';
    this.targetType = 'pieceAndPlace'
  }
  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1) return;  // No tile there
    // Do NOT remove head tile
    if (tileIndex === 0) return;
    // --- 3. Remove that tile from the piece ---
    piece.tiles.splice(tileIndex, 1);
    if(this.tiles.length >= this.getStat('maxSize')){
      this.tiles.pop  
    }
    if(!piece.immunities.diseased){
      piece.statuses.diseased = true;
    }
    this.actions--
    this.tiles.push(target);
  }
}

class Scorpion extends Piece {
  static name = "Scorpion";
  static description = "Can sting enemies inflicting poison, lowering their defence by 1 each turn";
  static unicode = "U+1F982";
  static color = "#681f08ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Scorpion.name, Scorpion.description, Scorpion.unicode, 2, 2, 1, 2, 1, Scorpion.color, headPosition, [headPosition], team, Scorpion.rarity, removeCallback, id)
    this.specialName='Sting'
    this.targetType='piece'
    this.immunities.poisoned = true;
  }

  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.poisoned){
      targetPiece.statuses.poisoned = true;
    } else if(targetPiece.statuses.poisioned){
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
  //apply poison status
}

class Firebrand extends Piece {
  static name = "Firebrand";
  static description = "A high level program which can apply burning";
  static unicode = "U+1F4DB";
  static color = "#ff0d0dff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Firebrand.name, Firebrand.description, Firebrand.unicode, 4, 3, 1, 3, 3, Firebrand.color, headPosition, [headPosition], team, Firebrand.rarity, removeCallback, id)
    this.specialName='Brand'
    this.targetType='piece'
  }

  async special(targetPiece: Piece):Promise<void>{
    //await targetPiece.takeDamage(this.getStat('attack'));
    if(targetPiece.statuses.burning){
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    } else if(!targetPiece.immunities.burning){
      targetPiece.statuses.burning = true;
    }
    this.actions--
  }
  //burn a piece
}

class Golem extends Piece {
  static name = "Golem";
  static description = "A large but slow program with high defence";
  static unicode = "U+1F5FF";
  static color = "#777777ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Golem.name, Golem.description, Golem.unicode, 5, 1, 1, 5, 4, Golem.color, headPosition, [headPosition], team, Golem.rarity, removeCallback, id)
  }
}

class Gman extends Piece {
  static name = "G-man";
  static description = "A boss level program that can freeze enemies and reduce their actions to 0";
  static unicode = "U+1F574";
  static color = "#000000ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gman.name, Gman.description, Gman.unicode, 6, 4, 3, 4, 1, Gman.color, headPosition, [headPosition], team, Gman.rarity, removeCallback, id)
   this.targetType = 'piece'
   this.specialName = 'Stun'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.frozen){
      targetPiece.statuses.frozen = true;
      targetPiece.movesRemaining = 0;
    }
    targetPiece.actions = 0;
    this.actions--
  }
}

class Guard extends Piece {
  static name = "Guard";
  static description = "A basic all round program";
  static unicode = "U+1F482";
  static color = "#ff6e0dff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Guard.name, Guard.description, Guard.unicode, 2, 1, 1, 1, 1, Guard.color, headPosition, [headPosition], team, Guard.rarity, removeCallback, id)
  }
}

class Officer extends Piece {
  static name = "Officer";
  static description = "A mid level all round program";
  static unicode = "U+1F46E";
  static color = "#ff310dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Officer.name, Officer.description, Officer.unicode, 4, 2, 2, 2, 2, Officer.color, headPosition, [headPosition], team, Officer.rarity, removeCallback, id)
  }
}

class Troll extends Piece {
  static name = "Troll";
  static description = "A large and strong program";
  static unicode = "U+1F9CC";
  static color = "#740000ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Troll.name, Troll.description, Troll.unicode, 4, 1, 1, 3, 3, Troll.color, headPosition, [headPosition], team, Troll.rarity, removeCallback, id)
  }
}

class Potato extends Piece {
  static name = "Potato";
  static description = "A low-level all round program";
  static unicode = "U+1F954";
  static color = "#ad8226ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Potato.name, Potato.description, Potato.unicode, 3, 1, 1, 1, 0, Potato.color, headPosition, [headPosition], team, Potato.rarity, removeCallback, id)
  }
}

class Ghost extends Piece {//unfinished negative
  static name = "Ghost";
  static description = "A program that loads hidden, and can hide itself";
  static unicode = "U+1F47B";
  static color = "#a1a1a1ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Ghost.name, Ghost.description, Ghost.unicode, 3, 2, 1, 2, 0, Ghost.color, headPosition, [headPosition], team, Ghost.rarity, removeCallback, id)
    //this.statuses.negative = true;
    this.specialName='Disappear';
    this.targetType = 'self';
    this.statuses.hidden = true;
  }
  async special(_target: Coordinate):Promise<void>{
    if(!this.statuses.exposed){
      this.statuses.hidden = true;
    }
    //steal hopper function???
    this.actions--
  }
}


class Beetle extends Piece {
  static name = "Beetle";
  static description = "A mid-level all round program";
  static unicode = "U+1FAB2";
  static color = "#059411ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Beetle.name, Beetle.description, Beetle.unicode, 3, 2, 1, 1, 2, Beetle.color, headPosition, [headPosition], team, Beetle.rarity, removeCallback, id)
  }
}

class LadyBeetle extends Piece {
  static name = "Ladybird";
  static description = "A tougher beetle";
  static unicode = "U+1F41E";
  static color = "#059411ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(LadyBeetle.name, LadyBeetle.description, LadyBeetle.unicode, 4, 3, 1, 2, 3, LadyBeetle.color, headPosition, [headPosition], team, LadyBeetle.rarity, removeCallback, id)
  }
}
//name desc unicode || maxsize moves range atk def

class Yarn extends Piece {
  static name = "Yarn";
  static description = "A very fast and large program";
  static unicode = "U+1F9F6";
  static color = "#560dffff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Yarn.name, Yarn.description, Yarn.unicode, 6, 5, 1, 1, 0, Yarn.color, headPosition, [headPosition], team, Yarn.rarity, removeCallback, id)
   //this.targetType = 'self'
   //this.specialName = 'Reel in'
  }
  /*async special(target: Piece):Promise<void>{
    this.tiles = [this.headPosition]
    this.actions--
  }*/
}

class Bee extends Piece {
  static name = "Bee";
  static description = "A small program which can sting, sacrificing itself for a high damage attack";//can sacrifice itself with sting for higher damage???
  static unicode = "U+1F41D";
  static color = "#eeff00ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Bee.name, Bee.description, Bee.unicode, 1, 2, 1, 3, 0, Bee.color, headPosition, [headPosition], team, Bee.rarity, removeCallback, id)
    this.specialName='Sting'
    this.canAttack = false;
    this.targetType='piece'
  }

  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'));
    this.actions--
    this.removeCallback?.(this);
  }
}

class Honeypot extends Piece {
  static name = "Honeypot";
  static description = "A program that can summon Bees";
  static unicode = "U+1F36F";
  static color = "#ffb20dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Honeypot.name, Honeypot.description, Honeypot.unicode, 1, 0, 1, 0, 0, Honeypot.color, headPosition, [headPosition], team, Honeypot.rarity, removeCallback, id)
    this.specialName='Summon Bee'
    this.canAttack = false;
    this.targetType='space'
  }

  async special({target, activePieces} : {target: Coordinate, activePieces: Piece[]}):Promise<void>{
    const newBee = new Bee(target, this.team, this.removeCallback, crypto.randomUUID());
    newBee.actions = 0;
    newBee.movesRemaining = 0;
    activePieces.push(newBee);
    this.actions--
  }
}

class Decoy extends Piece {
  static name = "Decoy";
  static description = "A defensive program that can swap head positions with other programs";
  static unicode = "U+1FAB5";
  static color = "#96ff0dff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Decoy.name, Decoy.description, Decoy.unicode, 1, 3, 3, 0, 2, Decoy.color, headPosition, [headPosition], team, Decoy.rarity, removeCallback, id)
    this.specialName='Substitute'
    this.targetType='piece'
  }

  async special(targetPiece: Piece):Promise<void>{
    const target = targetPiece.headPosition;
    targetPiece.headPosition = this.headPosition;
    targetPiece.tiles[0] = this.headPosition;
    this.headPosition = target;
    this.tiles[0] = target;
    this.actions--
  }
  
}
/*
class Extinguisher extends Piece {//item for all activeitems? admin instead of fire truck?
  static name = "Extinguisher";
  static description = "A short ranged program that can remove burning";
  static unicode = "U+1F9EF";
  static color = "#e7aa92ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Extinguisher.name, Extinguisher.description, Extinguisher.unicode, 2, 2, 2, 2, 1, Extinguisher.color, headPosition, [headPosition], team, Extinguisher.rarity, removeCallback, id)
    this.specialName='Extinguish';
    this.targetType='piece';
    this.hasFriendlySpecial = true;
  }

  async special(targetPiece: Piece):Promise<void>{
    targetPiece.statuses.burning = false;
    this.actions--
  }

  //remove burning
}
*/
class Donkey extends Piece {
  static name = "Donkey";
  static description = "A slow program with a powerful kick";
  static unicode = "U+1FACF";
  static color = "#76c928ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Donkey.name, Donkey.description, Donkey.unicode, 4, 1, 1, 5, 1, Donkey.color, headPosition, [headPosition], team, Donkey.rarity, removeCallback, id)
  }
}

class Jellyfish extends Piece {
  static name = "Jelly";
  static description = "A slow program that can shock, damaging and applying the slow status";
  static unicode = "U+1FABC";
  static color = "#0d8affff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Jellyfish.name, Jellyfish.description, Jellyfish.unicode, 3, 1, 1, 4, 0, Jellyfish.color, headPosition, [headPosition], team, Jellyfish.rarity, removeCallback, id)
    this.specialName='Shock';
    this.targetType='piece';
  }

  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'));
    if(!targetPiece.immunities.slowed){
      targetPiece.statuses.slowed = true
    }
    this.actions--
  }
  //sting
}

class Screwdriver extends Piece {
  static name = "Screwdriver";
  static description = "A program that can tinker with another, giving +1 to a friendly's stat, or -1 to an enemy's";
  static unicode = "U+1FA9B";
  static color = "#ff1d0dff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Screwdriver.name, Screwdriver.description, Screwdriver.unicode, 1, 1, 1, 0, 0, Screwdriver.color, headPosition, [headPosition], team, Screwdriver.rarity, removeCallback, id)
    this.specialName='Tinker';
    this.targetType='piece';
    this.hasFriendlySpecial = true;
  }

  async special(targetPiece: Piece):Promise<void>{
   
    const possibleStats: (keyof StatModifier)[] = [
      "maxSize",
      "moves",
      "range",
      "attack",
      "defence"
    ];

    // Pick one at random
    const randomStat =
      possibleStats[Math.floor(Math.random() * possibleStats.length)];

    // Apply +1 to that stat using your modifier system
    const mod: StatModifier = { [randomStat]: (targetPiece.team === this.team) ? 1 : -1};

    targetPiece.addModifier(mod);
    this.actions--
  }
}

class Axe extends Piece {
  static name = "Axe";
  static description = "A short ranged program with a high attack that can chop off a non-head piece of memory and it's neighbours";//and adjacent tiles?
  static unicode = "U+1FA93";
  static color = "#ff0d0dff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Axe.name, Axe.description, Axe.unicode, 4, 2, 2, 4, 2, Axe.color, headPosition, [headPosition], team, Axe.rarity, removeCallback, id)
    this.specialName='Chop';
    this.targetType='pieceAndPlace';
  }

  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    const targetIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (targetIndex <= 0 || !targetIndex) return;  // No tile, or head tile
    
    const indexesToRemove: number[] = [targetIndex];
    
    // find adjacent tiles 0 1 2
    if(targetIndex-1 >= 1){
      indexesToRemove.push(targetIndex -1);
    }
    if(targetIndex+1 <= piece.tiles.length-1){
      indexesToRemove.push(targetIndex +1);
    }
    
    // remove from highest index to lowest
    indexesToRemove
      .sort((a, b) => b - a)
      .forEach(i => piece.tiles.splice(i, 1));

    this.actions --
  }
}

class Boomerang extends Piece {
  static name = "Boomerang";
  static description = "A mobile program that can attack a target and reset it's own moves remaining";
  static unicode = "U+1FA83";
  static color = "#ffcf4bff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Boomerang.name, Boomerang.description, Boomerang.unicode, 3, 3, 1, 2, 0, Boomerang.color, headPosition, [headPosition], team, Boomerang.rarity, removeCallback, id)
   this.targetType = 'piece';
   this.specialName = 'Throw';
   this.canAttack = false;
  }
  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'));
    this.movesRemaining = this.getStat('moves');
    this.actions--
  }
}

/*
class Angel extends Piece {//not passive, same as fairy, remove?? unfinished
  static name = "Angel";
  static description = "Can ressurect a destroyed program";
  static unicode = "U+1FABD";
  static color = "#a8a8a8ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Angel.name, Angel.description, Angel.unicode, 4, 0, 1, 0, 0, Angel.color, headPosition, [headPosition], team, Angel.rarity, removeCallback, id)
  }
  //access graveyard
}*/

// WATCH, U+231A
class Stopwatch extends Piece {//not passive
  static name = "Stopwatch";
  static description = "Can replenish another program's moves and actions remaining, or take away an enemy's moves and actions";
  static unicode = "U+231A";//U+23F1";
  static color = "#ff5555";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Stopwatch.name, Stopwatch.description, Stopwatch.unicode, 4, 2, 1, 0, 0, Stopwatch.color, headPosition, [headPosition], team, Stopwatch.rarity, removeCallback, id)
    this.targetType = 'piece';
    this.specialName = 'Time Out';
    this.hasNeutralSpecial = true;
  }
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.team === this.team && targetPiece.id !== this.id){
      targetPiece.movesRemaining = targetPiece.getStat('moves');
      targetPiece.actions = 1;
    } else {
      targetPiece.movesRemaining = 0;
      targetPiece.actions = 0;
    }
    this.actions --
  }
}

class Sol extends Piece {//not passive
  static name = "Sol";
  static description = "Extreme range and damage, can laser targets in a straight line";
  static unicode = "U+1F6F0";//🛰️
  static color = "#000000ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Sol.name, Sol.description, Sol.unicode, 2, 1, 7, 7, 1, Sol.color, headPosition, [headPosition], team, Sol.rarity, removeCallback, id)
    //special similar to cannon?
    this.specialName = 'Laser';
    this.targetType = 'line'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      await occupier?.takeDamage(this.getStat('attack'));
    }
    this.actions--
  }
}

class Vampire extends Piece {
  static name = "Dracula";
  static description = "Removes tiles of other programs, increasing its own max size, attack, moves remaining, and providing defence equal to the target's for 1 turn";
  static unicode = "U+1F9DB";
  static color = "#000000ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vampire.name, Vampire.description, Vampire.unicode, 4, 3, 1, 3, 1, Vampire.color, headPosition, [headPosition], team, Vampire.rarity, removeCallback, id)
   this.targetType = 'pieceAndPlace'
   this.specialName = 'Siphon'
  }

  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1) return;  // No tile there
    // Do NOT remove head tile
    if (tileIndex === 0) return;
    // --- 3. Remove that tile from the piece ---
    if(piece.id === this.id) return;
    piece.tiles.splice(tileIndex, 1);
    this.addModifier({maxSize: 1});
    this.addModifier({attack: 1});
    this.addTempModifier({defence: piece.getStat('defence')})
    this.movesRemaining += 1;
    //this.tiles.push(target);
    this.actions --
  }
}

class Centipede extends Piece {
  static name = "Centipede";
  static description = "A large piece with a high attack that can bite inflicitng poision and damage";
  static unicode = "U+131A8";
  static color = "#3b2108ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Centipede.name, Centipede.description, Centipede.unicode, 7, 2, 1, 4, 2, Centipede.color, headPosition, [headPosition], team, Centipede.rarity, removeCallback, id)
    this.targetType = 'piece'
    this.specialName = 'Bite'
  }
  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'))
    if(!targetPiece.immunities.poisoned){
      targetPiece.statuses.poisoned = true;
    }
    if(targetPiece.statuses.poisioned){
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions --
  }
}

class Helicopter extends Piece {//unfinished, handle in app
  static name = "Helicopter";
  static description = "A program that can move 2 empty spaces in one move";
  static unicode = "U+1F681";
  static color = "#0d9effff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Helicopter.name, Helicopter.description, Helicopter.unicode, 2, 3, 4, 5, 2, Helicopter.color, headPosition, [headPosition], team, Helicopter.rarity, removeCallback, id)
  }
}

export class Dolls extends Piece {//finished? test, will have to be handled in app for sure, and a custom flag for hybrids
  static name = "Nesting Dolls";
  static description = "Replaced by a copy with -1 max size if destroyed"
  static unicode = " U+1FA86";
  static color = "#ff5a0dff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dolls.name, Dolls.description, Dolls.unicode, 3, 0, 1, 3, 0, Dolls.color, headPosition, [headPosition], team, Dolls.rarity, removeCallback, id)
  }
}


class UFO extends Piece {
  static name = "UFO";
  static description = "A strong ranged program that can damage and confuse enemies";// that can move enemies away from itself";//without increasing size?? And traverse gaps?
  static unicode = "U+1F6F8";
  static color = "#000d47ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(UFO.name, UFO.description, UFO.unicode, 4, 3, 3, 3, 2, UFO.color, headPosition, [headPosition], team, UFO.rarity, removeCallback, id)
    this.specialName = 'abduct'
    this.targetType = 'piece'
  }
  async special(targetPiece: Piece):Promise<void>{  
    if(targetPiece.statuses.confused === true){
      targetPiece.takeDamage(this.getStat('attack'));
    } else if(!targetPiece.immunities.confused){
      targetPiece.statuses.confused = true;
    }
    this.actions--
  }
}

class TP extends Piece {
  static name = "TP";
  static description = "A large program with high movement";
  static unicode = "U+1F9FB";
  static color = "#0d92ffff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(TP.name, TP.description, TP.unicode, 6, 3, 0, 0, 0, TP.color, headPosition, [headPosition], team, TP.rarity, removeCallback, id)
  }
}

class Saw extends Piece {
  static name = "Saw";
  static description = "A program that can remove a body tile from an enemy, regardless of its defence";
  static unicode = "U+1FA9A";
  static color = "#ffb20dff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Saw.name, Saw.description, Saw.unicode, 3, 2, 1, 1, 1, Saw.color, headPosition, [headPosition], team, Saw.rarity, removeCallback, id)
   this.specialName='Hack'
   this.targetType='pieceAndPlace'
  }

  async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
    const tileIndex = piece.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (tileIndex === -1) return;  // No tile there
    // Do NOT remove head tile
    if (tileIndex === 0) return;
    // --- 3. Remove that tile from the piece ---
    piece.tiles.splice(tileIndex, 1);
    this.actions --
  }
  
}

class Croc extends Piece {
  static name = "Croc";
  static description = "A slow program with high attack that starts hidden from enemies";
  static unicode = "U+1F40A";
  static color = "#022f0eff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Croc.name, Croc.description, Croc.unicode, 2, 1, 1, 4, 1, Croc.color, headPosition, [headPosition], team, Croc.rarity, removeCallback, id)
    //this.specialName='Submerge'
    //this.targetType='piece'
    this.statuses.hidden = true;
  }
  /*async special(target: Piece): Promise<void> {
    await target.takeDamage(this.getStat('attack'))
    this.statuses.hidden = false;
    this.actions--
  }*/
}

class Lighthouse extends Piece {
  static name = "Lighthouse";
  static description = "A program the can expose and blind targets in a wide area";
  static unicode = "U+1F6A8";
  static color = "#000000ff";
   static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Lighthouse.name, Lighthouse.description, Lighthouse.unicode, 1, 0, 5, 0, 1, Lighthouse.color, headPosition, [headPosition], team, Lighthouse.rarity, removeCallback, id)
    this.specialName = 'Raise Alarm';
    this.targetType = 'group'
    this.canAttack = false;
    this.hasExposingSpecial = true;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team !== this.team){
        if(!t.immunities.blinded){
          t.statuses.blinded = true;
        }
        if(!t.immunities.exposed){
          t.statuses.hidden = false;
          t.statuses.exposed = true;
        }
      }
    }
    this.actions--
  }
}

class Torch extends Piece {//remove from enemies for now
  static name = "Torch";
  static description = "A long range program that can expose a group of targets";
  static unicode = "U+1F526";
  static color = "#000000ff";
   static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Torch.name, Torch.description, Torch.unicode, 2, 2, 4, 0, 0, Torch.color, headPosition, [headPosition], team, Torch.rarity, removeCallback, id)
    this.specialName = 'Shine';
    this.targetType = 'group';//'line'
    this.canAttack = false;
    this.hasExposingSpecial = true;
  }
  //old line version
  /*async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) continue;
      if(!occupier.immunities.exposed){
        occupier.statuses.exposed = true;
      }
    }
    this.actions--
  }*/
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team !== this.team){
        if(!t.immunities.exposed){
          t.statuses.hidden = false;
          t.statuses.exposed = true;
        }
      }
    }
    this.actions--
  }
}

class Camera extends Piece {
  static name = "Camera";
  static description = "A program that can flash and blind others";//store ids of targets for damage?
  static unicode = "U+1F4F8";
  static color = "#69c3f0ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Camera.name, Camera.description, Camera.unicode, 4, 1, 3, 1, 0, Camera.color, headPosition, [headPosition], team, Camera.rarity, removeCallback, id)
   this.specialName = 'Flash';
   this.targetType = 'piece'
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.blinded){
      target.statuses.blinded = true;
    } else if(target.statuses.blinded){
      target.takeDamage(this.getStat('attack'))
      if(target.willRetaliate) await this.takeDamage(target.getStat('attack'))
    }
    this.actions--
  }
}

class Drum extends Piece {
  static name = "Drum";
  static description = "A program that gives +1 moves remaining to all firendlies in range";
  static unicode = "U+1F941";
  static color = "#57b92eff";
   static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Drum.name, Drum.description, Drum.unicode, 1, 1, 4, 0, 0, Drum.color, headPosition, [headPosition], team, Drum.rarity, removeCallback, id)
    this.specialName = 'March';
    this.targetType = 'group';
    this.hasFriendlySpecial = true;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
     if(t.team === this. team){
      t.movesRemaining += 1;
     }
    }
    this.actions--
  }
}

class Shrike extends Piece {
  static name = "Shrike";
  static description = "A fast high level program that can freeze and damage enemies";
  static unicode = "U+1F426";
  static color = "#bebebeff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shrike.name, Shrike.description, Shrike.unicode, 2, 5, 1, 2, 2, Shrike.color, headPosition, [headPosition], team, Shrike.rarity, removeCallback, id)
   this.targetType = 'piece'
   this.specialName = 'Pierce'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.frozen){
      targetPiece.statuses.frozen = true;
      await targetPiece.takeDamage(this.getStat('attack'))
    }
    this.actions--
  }
}

class Eagle extends Piece {
  static name = "Eagle";
  static description = "A fast program with a high attack";
  static unicode = "U+1F985";
  static color = "#0dbaffff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Eagle.name, Eagle.description, Eagle.unicode, 2, 6, 1, 3, 1, Eagle.color, headPosition, [headPosition], team, Eagle.rarity, removeCallback, id)
  }
}

class Recurve extends Piece {
  static name = "Archer";
  static description = "A longer ranged program, can launch a volley of attacks on a group of enemies";
  static unicode = "U+1664";
  static color = "#06640fff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Recurve.name, Recurve.description, Recurve.unicode, 3, 3, 4, 3, 2, Recurve.color, headPosition, [headPosition], team, Recurve.rarity, removeCallback, id)
   this.specialName = 'Volley';
   this.targetType = 'group';
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team != this.team){
        await t.takeDamage(this.getStat('attack'));
      }
    }
    this.actions--
  }
  //damage tiles around target instead???
}

class Daemon extends Piece {
  static name = "Daemon";
  static description = "A program that can apply slow to other programs";
  static unicode = "U+1F47F";//smiling: U+1F608
  static color = "#4e105eff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Daemon.name, Daemon.description, Daemon.unicode, 4, 3, 2, 3, 2, Daemon.color, headPosition, [headPosition], team, Daemon.rarity, removeCallback, id)
   this.specialName = 'Chug'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.slowed){
      targetPiece.statuses.slowed = true
    } else if(targetPiece.statuses.slowed){
      targetPiece.takeDamage(this.getStat('attack'));
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

class Archdaemon extends Piece {
  static name = "Arch Daemon";
  static description = "A stronger Daemon that can apply slow to other programs";
  static unicode = "U+1F608"
  static color = "rgb(78, 10, 6)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Archdaemon.name, Archdaemon.description, Archdaemon.unicode, 4, 3, 3, 4, 3, Archdaemon.color, headPosition, [headPosition], team, Archdaemon.rarity, removeCallback, id)
   this.specialName = 'Chug'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(!targetPiece.immunities.slowed){
      targetPiece.statuses.slowed = true
    } else if(targetPiece.statuses.slowed){
      targetPiece.takeDamage(this.getStat('attack'));
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    }
    this.actions--
  }
}

//VULTURE EGYPTIAN HIEROGLYPH G014, U+13150 special that increases stats if it can kill, - would need change in ai
class Vulture extends Piece {
  static name = "Vulture";
  static description = "A program that increases it's max size if it destroys them";
  static unicode = "U+13150";
  static color = "rgb(94, 28, 16)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vulture.name, Vulture.description, Vulture.unicode, 4, 3, 2, 3, 2, Vulture.color, headPosition, [headPosition], team, Vulture.rarity, removeCallback, id)
   this.specialName = 'Carrion';
   this.canAttack = false;
  }
  async special(targetPiece: Piece):Promise<void>{
    if((targetPiece.defence + targetPiece.tiles.length)< this.getStat('attack')){
      this.addModifier({maxSize: 1});
    }
    targetPiece.takeDamage(this.getStat('attack'));
    this.actions--
  }
}

class Rex extends Piece {
  static name = "T-Rex";
  static description = "A tough, large program with high attack, special attack deals double damage on pieces that have just moved.";
  static unicode = "U+1F996";
  static color = "#1e4419ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Rex.name, Rex.description, Rex.unicode, 6, 3, 2, 5, 3, Rex.color, headPosition, [headPosition], team, Rex.rarity, removeCallback, id)
    this.specialName = 'I see you'
    this.targetType = 'piece';
  }
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.movesRemaining < targetPiece.getStat('moves')){
      await targetPiece.takeDamage(this.getStat('attack') * 2);
    } else {
      await targetPiece.takeDamage(this.getStat('attack'));
    }
    this.actions--
  }
}

class Diplodocus extends Piece {
  static name = "Diplodocus";
  static description = "A very large program with a large range";
  static unicode = "U+1F995";
  static color = "rgb(62, 101, 57)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Diplodocus.name, Diplodocus.description, Diplodocus.unicode, 8, 2, 5, 3, 2, Diplodocus.color, headPosition, [headPosition], team, Diplodocus.rarity, removeCallback, id)
  }
}

class Hedgehog extends Piece {
  static name = "Hedgehog";
  static description = "A program that always retaliates when attacked";
  static unicode = "U+1F994";
  static color = "#504020ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hedgehog.name, Hedgehog.description, Hedgehog.unicode, 3, 2, 1, 1, 1, Hedgehog.color, headPosition, [headPosition], team, Hedgehog.rarity, removeCallback, id)
   this.willRetaliate = true;
  }
}

class Peacock extends Piece {
  static name = "Peacock";
  static description = "A program that can confuse other programs";
  static unicode = "U+1F99A";
  static color = "#70defaff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Peacock.name, Peacock.description, Peacock.unicode, 3, 2, 2, 3, 1, Peacock.color, headPosition, [headPosition], team, Peacock.rarity, removeCallback, id)
   this.targetType = 'piece'
   this.specialName = 'Fan'
  }
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.statuses.confused = true){
      targetPiece.takeDamage(this.getStat('attack'))
      if(targetPiece.willRetaliate) await this.takeDamage(targetPiece.getStat('attack'))
    } else if(!targetPiece.immunities.confused){
      targetPiece.statuses.confused = true;
    }
    this.actions--
  }
}

class Dog extends Piece {
  static name = "Dog";
  static description = "A program that can expose other programs, making them unable to hide";
  static unicode = "U+1F415";
  static color = "#b98003ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Dog.name, Dog.description, Dog.unicode, 2, 3, 1, 2, 0, Dog.color, headPosition, [headPosition], team, Dog.rarity, removeCallback, id)
    this.targetType = 'group'
    this.specialName = 'Sniff'
    this.hasExposingSpecial = true;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const target of targets) {
      if(target.team !== this.team){
        if(target.statuses.exposed){
          await target.takeDamage(this.getStat('attack'))
        } else if(!target.immunities.exposed){
          target.statuses.hidden = false;
          target.statuses.exposed = true;
        }
      }
    }
    this.actions--
  }
}

class Wolf extends Piece {
  static name = "Wolf";
  static description = "A short range program that can expose other programs, making them unable to hide";
  static unicode = "U+1F43A";
  static color = "#313131ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Wolf.name, Wolf.description, Wolf.unicode, 3, 3, 2, 4, 1, Wolf.color, headPosition, [headPosition], team, Wolf.rarity, removeCallback, id)
    this.targetType = 'group'
    this.specialName = 'Sniff'
    this.hasExposingSpecial = true;
  }
  async special(targets: Piece[]):Promise<void>{
    for (const target of targets) {
      if(target.team !== this.team){
        if(target.statuses.exposed){
          await target.takeDamage(this.getStat('attack'))
        } else if(!target.immunities.exposed){
          target.statuses.hidden = false;
          target.statuses.exposed = true;
        }
      }
    }
    this.actions--
  }
}

class Bull extends Piece {
  static name = "Bull";
  static description = "Low movement. But can charge instead of attacking, damaging and moving forward";
  static unicode = "U+1F402";
  static color = "#be4414ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Bull.name, Bull.description, Bull.unicode, 4, 0, 2, 2, 2, Bull.color, headPosition, [headPosition], team, Bull.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line'
    this.canAttack = false;
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Buffalo extends Piece {
  static name = "Buffalo";
  static description = "A sturdy program that can charge instead of attacking, damaging and moving forward";
  static unicode = "U+1F403"
  static color = "rgb(10, 12, 143)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Buffalo.name, Buffalo.description, Buffalo.unicode, 4, 1, 2, 3, 2, Buffalo.color, headPosition, [headPosition], team, Buffalo.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line';
    this.canAttack = false;
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Bison extends Piece {
  static name = "Bison";
  static description = "A Large and strong program that can charge instead of attacking, damaging and moving forward";
  static unicode = "U+1F9AC";
  static color = "rgb(0, 39, 10)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Bison.name, Bison.description, Bison.unicode, 5, 1, 3, 4, 3, Bison.color, headPosition, [headPosition], team, Bison.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line'
    this.canAttack = false;
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Rhino extends Piece {
  static name = "Rhino";
  static description = "High defence. Charges instead of attacking, damaging targets in a staight line and moving forward until stopped";
  static unicode = "U+1F98F";
  static color = "#c7ac53ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Rhino.name, Rhino.description, Rhino.unicode, 5, 2, 3, 4, 4, Rhino.color, headPosition, [headPosition], team, Rhino.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line'
    this.canAttack = false;
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Hippo extends Piece {
  static name = "Hippo";
  static description = "A tough program that can charge, damaging targets in a staight line and moving forward until stopped";
  static unicode = "U+1F99B";
  static color = "rgb(98, 90, 162)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Hippo.name, Hippo.description, Hippo.unicode, 5, 1, 2, 4, 3, Hippo.color, headPosition, [headPosition], team, Hippo.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Charge';
    this.targetType = 'line'
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }
}

class Tail extends Piece {
  static name = "Gecko Tail";
  static description = "An immobile decoy program spawned by a Gecko";
  static unicode = "U+1F98E";
  static color = "rgb(185, 255, 217)";
  static rarity = 99;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Tail.name, Tail.description, Tail.unicode, 2, 1, 0, 0, 0, Tail.color, headPosition, [headPosition], team, Tail.rarity, removeCallback, id)
  }
}
class Gecko extends Piece {
  static name = "Gecko";
  static description = "A program that replaces it's last piece with a decoy tail program";
  static unicode = "U+1F98E";
  static color = "rgb(167, 255, 218)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Gecko.name, Gecko.description, Gecko.unicode, 2, 3, 1, 2, 0, Gecko.color, headPosition, [headPosition], team, Gecko.rarity, removeCallback, id)
    this.specialName='Shed Tail'
    this.targetType='space'
  }

  async special({target, activePieces, }: { target: Coordinate; activePieces: Piece[]; }): Promise<void> {
    if(this.tiles.length <= 1) return;
    const newTail = new Tail(this.tiles[this.tiles.length-1], this.team, this.removeCallback, crypto.randomUUID());
    this.tiles.splice(this.tiles.length-1, 1);
    this.move(target);
    activePieces.push(newTail);
    this.actions--
  }
}
class Yoyo extends Piece {
  static name = "Yo-yo";
  static description = "A mobile program that charges instead of attacking, and retracts into it's own tail position after a succesful hit";
  static unicode = "U+1FA80";
  static color = "rgb(247, 232, 68)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Yoyo.name, Yoyo.description, Yoyo.unicode, 5, 3, 3, 2, 0, Yoyo.color, headPosition, [headPosition], team, Yoyo.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    this.specialName = 'Yo';
    this.targetType = 'line';
    this.canAttack = false;
  }

  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
        continue;
      } else{//space is still occupied, retract
        const tail = this.tiles[this.tiles.length-1];
        this.headPosition = tail;
        this.tiles = [tail];
      }
      break;
    }
    this.actions--
  }
}

//EXTRATERRESTRIAL ALIEN, U+1F47D confuse
class Alien extends Piece {
  static name = "Alien";
  static description = "A program that can confuse all enemies in range";
  static unicode = "U+1F47D";
  static color = "rgb(130, 46, 131)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Alien.name, Alien.description, Alien.unicode, 2, 2, 3, 4, 2, Alien.color, headPosition, [headPosition], team, Alien.rarity, removeCallback, id)
    this.specialName = 'Bluebeam';
    this.targetType = 'group'
  }
  async special(targets: Piece[]):Promise<void>{
    for (const t of targets) {
      if(t.team != this.team){
        if(t.statuses.confused === true){
          t.takeDamage(this.getStat('attack'));
        } else if(!t.immunities.confused){
          t.statuses.confused = true;
        }
      }
    }
    this.actions--
  }
}

class Lightning extends Piece {
  static name = "Charger";
  static description = "A program that can give an extra action to another";
  static unicode = "U+26A1";// ELECTRIC PLUG, U+1F50C
  static color = "rgb(44, 125, 255)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Lightning.name, Lightning.description, Lightning.unicode, 3, 2, 2, 0, 0, Lightning.color, headPosition, [headPosition], team, Lightning.rarity, removeCallback, id)
   this.specialName = 'Stim'
   this.targetType = 'piece';
   this.hasFriendlySpecial = true;
   this.canAttack = false;
  }
  async special(targetPiece: Piece):Promise<void>{
    if(targetPiece.id !== this. id){
      targetPiece.actions ++
    }
    this.actions--
  }
}

class Leopard extends Piece {
  static name = "Leopard";
  static description = "A fast program that can pounce to move to a target, deal damage, and reduce it's moves by 1.";
  static unicode = "U+1F406";
  static color = "rgb(189, 136, 75)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Leopard.name, Leopard.description, Leopard.unicode, 3, 4, 1, 3, 1, Leopard.color, headPosition, [headPosition], team, Leopard.rarity, removeCallback, id)
   this.specialName = 'Pounce';
   //this.targetType = 'piece';
   this.targetType = 'line';
  }
  //change so there must be an occupier at the end of the line
  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      occupier.addModifier({moves: -1})
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
      }
      break;
    }
    this.actions--
  }
}
class Tiger extends Piece {
  static name = "Tiger";
  static description = "A program that can pounce to move to a target, deal damage, and reduce it's moves by 1.";
  static unicode = "U+1F405";
  static color = "rgb(85, 163, 11)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tiger.name, Tiger.description, Tiger.unicode, 4, 3, 2, 4, 2, Tiger.color, headPosition, [headPosition], team, Tiger.rarity, removeCallback, id)
   this.specialName = 'Pounce';
   //this.targetType = 'piece';
   this.targetType = 'line';
  }
  //change so there must be an occupier at the end of the line
  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      occupier.addModifier({moves: -1})
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
      }
      break;
    }
    this.actions--
  }
}

class Lion extends Piece {
  static name = "Lion";
  static description = "A powerful program that can pounce to move to a target, deal damage, and reduce it's moves by 1.";
  static unicode = "U+1F981";
  static color = "rgb(176, 132, 50)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Lion.name, Lion.description, Lion.unicode, 4, 2, 2, 6, 3, Lion.color, headPosition, [headPosition], team, Lion.rarity, removeCallback, id)
   this.specialName = 'Pounce';
   //this.targetType = 'piece';
    this.targetType = 'line';
  }
  //change so there must be an occupier at the end of the line
  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      occupier.addModifier({moves: -1})
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
      }
      break;
    }
    this.actions--
  }
}

class Bear extends Piece {
  static name = "Grizzly";
  static description = "A slow, powerful program that can pounce to move to a target, deal damage, and reduce it's moves by 2.";
  static unicode = "U+1F43B";
  static color = "rgb(1, 101, 8)";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bear.name, Bear.description, Bear.unicode, 5, 1, 2, 7, 3, Bear.color, headPosition, [headPosition], team, Bear.rarity, removeCallback, id)
   this.specialName = 'Pounce';
   //this.targetType = 'piece';
    this.targetType = 'line';
  }  
  //change so there must be an occupier at the end of the line
  async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      occupier.addModifier({moves: -2})
      await occupier.takeDamage(this.getStat('attack'));
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        // The enemy died → can move into the tile
        this.move(tile);
      }
      break;
    }
    this.actions--
  }
}

class Zebra extends Piece {
  static name = "Zebra";
  static description = "A fast program with a powerful kick";
  static unicode = "U+1F993";
  static color = "rgb(212, 190, 61)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Zebra.name, Zebra.description, Zebra.unicode, 4, 4, 1, 5, 1, Zebra.color, headPosition, [headPosition], team, Zebra.rarity, removeCallback, id)
  }
}

class Giraffe extends Piece {
  static name = "Giraffe";
  static description = "A large and fast program with a powerful kick";
  static unicode = "U+1F992";
  static color = "rgb(162, 181, 20)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Giraffe.name, Giraffe.description, Giraffe.unicode, 6, 4, 2, 6, 1, Giraffe.color, headPosition, [headPosition], team, Giraffe.rarity, removeCallback, id)
  }
}

class Kite extends Piece {
  static name = "Kite";
  static description = "A very fast and large program, can move it's head to any space along it's body";
  static unicode = "U+1FA81";
  static color = "rgb(124, 233, 255)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Kite.name, Kite.description, Kite.unicode, 8, 6, 1, 2, 0, Kite.color, headPosition, [headPosition], team, Kite.rarity, removeCallback, id)
   this.targetType = 'self';
   this.specialName = 'Reel';
   this.hasFriendlySpecial = true;
  }
  async special(target: Coordinate):Promise<void>{
    const tileIndex = this.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (!tileIndex || tileIndex === -1) return;  // Not our tile
    // --- 3. Remove the to be duped tile from the piece ---
    this.tiles.splice(tileIndex, 1);
    //move tile to head
    this.tiles.unshift(target);
    this.headPosition=target;
    this.actions --
  }
}

//SCARAB EGYPTIAN HIEROGLYPH I007, U+1318F - frog
class Scarab extends Piece {
  static name = "Scarab";
  static description = "A program that can roll into empty spaces to increase it's max size.";
  static unicode = "U+131A3";
  static color = "rgb(116, 77, 33)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Scarab.name, Scarab.description, Scarab.unicode, 2, 2, 1, 3, 2, Scarab.color, headPosition, [headPosition], team, Scarab.rarity, removeCallback, id)
    this.specialName='Roll'
    this.targetType='space'
  }

  async special({target, activePieces: _activePieces, }: { target: Coordinate; activePieces: Piece[]; }): Promise<void> {
    this.addModifier({maxSize: 1});
    this.move(target);
    this.actions --
  }
}

class Orangutan extends Piece {
  static name = "Orangutan";
  static description = "Can strong program that can damage and then reduce another program's defence remaining to 0";
  static unicode = "U+1F9A7";
  static color = "rgb(118, 177, 0)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Orangutan.name, Orangutan.description, Orangutan.unicode, 3, 2, 1, 4, 2, Orangutan.color, headPosition, [headPosition], team, Orangutan.rarity, removeCallback, id)
   this.specialName = 'Pummel'
   this.targetType = 'piece';
  }
  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'));
    targetPiece.defenceRemaining = 0;
    this.actions--
  }
}

class Gorilla extends Piece {
  static name = "Kong";
  static description = "A fierce program that can damage and then reduce another program's defence remaining to 0";
  static unicode = "U+1F98D";
  static color = "rgb(68, 97, 10)";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gorilla.name, Gorilla.description, Gorilla.unicode, 4, 3, 1, 5, 3, Gorilla.color, headPosition, [headPosition], team, Gorilla.rarity, removeCallback, id)
   this.specialName = 'Pummel'
   this.targetType = 'piece';
  }
  async special(targetPiece: Piece):Promise<void>{
    await targetPiece.takeDamage(this.getStat('attack'));
    targetPiece.defenceRemaining = 0;
    this.actions--
  }
}

//have a piece that can move it's head elsewhere in its body?  CHAINS, U+26D3
//Octopus U+1F419
class Octopus extends Piece {
  static name = "Octopus";
  static description = "A program that can move it's head position to anywhere along it's body";
  static unicode = "U+1F419";
  static color = "rgb(19, 70, 236)";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Octopus.name, Octopus.description, Octopus.unicode, 4, 3, 3, 3, 0, Octopus.color, headPosition, [headPosition], team, Octopus.rarity, removeCallback, id)
    this.specialName = 'Morph'
    this.targetType = 'self'
    this.hasFriendlySpecial = true;
  }
  //async special({piece, target} : {piece: Piece, target: Coordinate}):Promise<void>{
  async special(target: Coordinate):Promise<void>{
    const tileIndex = this.tiles.findIndex(t => t.x === target.x && t.y === target.y);
    if (!tileIndex || tileIndex === -1) return;  // Not our tile
    
    // --- 3. Remove the to be duped tile from the piece ---
    this.tiles.splice(tileIndex, 1);
    //move tile to head
    this.tiles.unshift(target);
    this.headPosition=target;

    this.actions --
  }
}

//needs enemyai handling
export class Frond extends Piece {
  static name = "Frond";
  static description = "A program that will hide another that passes over it, removing itself.";
  static unicode = "U+1FAB4";
  static color = "rgb(241, 223, 202)";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Frond.name, Frond.description, Frond.unicode, 1, 0, 0, 0, 0, Frond.color, headPosition, [headPosition], team, Frond.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.negative = true;
   this.hasFriendlySpecial = true;
  }
  async special(target: Piece): Promise<void> {
    if(!target.immunities.hidden && !target.statuses.exposed){
      target.statuses.hidden = true;
    }
    this.actions--
    this.removeCallback?.(this);
  }
}

class Coat extends Piece {
  static name = "Turncoat";
  static description = "A hidden trap program that will flip the team of whatever passes over it, removing itself.";
  static unicode = "U+1F9E5";
  static color = "rgb(34, 34, 34)";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Coat.name, Coat.description, Coat.unicode, 1, 1, 0, 0, 0, Coat.color, headPosition, [headPosition], team, Coat.rarity, removeCallback, id)
   this.targetType = 'trapPiece';
   this.statuses.hidden = true;
   this.statuses.negative = true;
  }
  async special(target: Piece): Promise<void> {
    if(target.team === 'enemy'){
      target.team = 'player';
    } else if (target.team === 'player'){
      target.team = 'enemy'
    }
    this.actions--
    this.removeCallback?.(this);
  }
}

//
//UNICORN FACE, U+1F984
class Unicorn extends Piece {
  static name = "Unicorn";
  static description = "High attack. Loads hidden, and can hide itself."; //can hide itself from enemies until attacking";
  static unicode = "U+1F984";
  static color = "rgb(250, 200, 255)";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Unicorn.name, Unicorn.description, Unicorn.unicode, 2, 4, 3, 5, 3, Unicorn.color, headPosition, [headPosition], team, Unicorn.rarity, removeCallback, id)
    this.statuses.hidden = true;
    //this.specialName = 'Charge';
    //this.targetType = 'line';
    this.specialName = 'Hide';
    this.targetType = 'self';
  }
  async special(_target: Coordinate):Promise<void>{
    if(!this.statuses.exposed){
      this.statuses.hidden = true;
    }
    this.actions--
  }
  /*async special({line, activePieces} : {line: Coordinate[], activePieces: Piece[]}):Promise<void>{
    for (const tile of line) {
      const occupier = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if(!occupier) {
        this.move(tile);
        continue;
      }
      await occupier.takeDamage(this.getStat('attack'));
      this.statuses.hidden = false;
      const stillOccupied = activePieces.find(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!stillOccupied) {
        this.move(tile);
        continue;
      }
      break;
    }
    this.actions--
  }*/
}

//building castle? creates a wall around it of 8 tiles 
//🏗 crane  U+1F3D7

//99 fairy //web?
export const allPieces = [Ant, Acorn, Banana, Bee, Egg, Knife, Potato, Rat, Shield, Sling, Snail, TP, Aegis, Beetle, Bow, Bull, Chick, Chicken, Dagger, Decoy, Dog, Fence, Frond, Doctor, Gecko, Germ, Guard, Hedgehog, Jellyfish, Larva, Lance, Tree, Flute, Rooster, Saw, Snake, Tar, Vulture, Watchman, Web, Yarn, Yoyo, Boomerang, Bug, Buffalo, Camera, Coconut, Donkey, Drum, Dynamite, Elephant, Fencer, Gate, Ghost, Highwayman, Honeypot, Hopper, LabRat, LadyBeetle, Magnet, Medic, Mosquito, Ninja, Octopus, Officer, Paladin, Wasp, Pawn, Peacock, Pitfall, SAM, Scorpion, Turtle, Spider, Stonewall, Tengu, Torch, Trap, Trojan, Troll, Vice, Alien, Arms, Axe, Cannon, Lightning, Palm, Bison, Cockroach, Croc, Daemon, Diplodocus, Eagle, Firewall, Golem, Kite, Leopard, Lighthouse, Mammoth, Mine, Nerf, Oil, Puffer, Rabbit, Scarab, Shark, Snowman, Soldier, Squid, Stopwatch, Tiger, Bat, Wizard, Wolf, Zebra, Archdaemon, Recurve, Bomb, Centipede, Copycat, Cupid, Dataworm, Dragon, Fairy, Firebrand, Gman, Giraffe, Hippo, Lion, Lovebomb, Oni, Orangutan, Paragon, Rhino, Screwdriver, Shovel, Shrike, Tank, Coat, UFO, Vampire, Bear, Helicopter, Gorilla, Greatshield, Nuke, Sol, Sponge, Rex, Unicorn];//Dolls //100 +2 (web, ink)
console.log('pieces length: ', allPieces.length)

let adminLogs = {
  rarity1: 0,
  rarity2: 0,
  rarity3: 0,
  rarity4: 0,
  rarity5: 0,
  rarity6: 0
}
/*
 | 'onPlacement'
  | 'onTurnEnd'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onDealDamage' //piece id of receiver?
  | 'onReceiveDamage'
  | 'onPieceDestruction'
  | 'other';
*/
allPieces.forEach(piece => {
  if(piece.rarity === 1) adminLogs.rarity1 += 1;
  if(piece.rarity === 2) adminLogs.rarity2 += 1;
  if(piece.rarity === 3) adminLogs.rarity3 += 1;
  if(piece.rarity === 4) adminLogs.rarity4 += 1;
  if(piece.rarity === 5) adminLogs.rarity5 += 1;
  if(piece.rarity === 6) adminLogs.rarity6 += 1;
});
console.log("Pieces of rarity 1: ", adminLogs.rarity1)
console.log("Pieces of rarity 2: ", adminLogs.rarity2)
console.log("Pieces of rarity 3: ", adminLogs.rarity3)
console.log("Pieces of rarity 4: ", adminLogs.rarity4)
console.log("Pieces of rarity 5: ", adminLogs.rarity5)
console.log("Pieces of rarity 6: ", adminLogs.rarity6)

//chequered flag U+1F3C1
//U+1F6A9 Triangular flag - Banner: boost group of friendly's attack

//U+1FAA8 rock boulder pivk up speed not maxsize (worse snowman)
//fix dolls

//Invisible wall - hi defence hidden piece
//FISHING POLE AND FISH, U+1F3A3 long range - move a piece toward it
//PLAYGROUND SLIDE, U+1F6DD like gate but with more range? line target??

//SWAN, U+1F9A2 - break a man's arm /reduce range?

//FROG FACE, U+1F438 //range 3 low atk //poison/hop ability? FROG EGYPTIAN HIEROGLYPH I007, U+1318F
// KANGAROO, U+1F998 hop

//chess knight special move L shape

//DANCER, U+1F483 //high movement no damage
//
//BACTRIAN CAMEL, U+1F42B