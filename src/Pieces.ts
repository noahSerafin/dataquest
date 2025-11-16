import type { Coordinate } from "./types"

export abstract class Piece {
  removeCallback?: (piece: Piece) => void;

  id: string
  static name : string
  static description : string
  static unicode : string
  static color : string
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
  actions: number
  team: string //'player' or 'enemy'
  rarity: number

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
    this.movesRemaining = moves // default to full moves at start of turn
    this.actions = 1
    this.team = team
    this.rarity = rarity
    this.removeCallback = removeCallback
    this.id = id ?? crypto.randomUUID()
  }

//name desc unicode || maxsize moves range atk def
  getStats(): string {
    return `${this.name} | Size: ${this.maxSize}, Moves: ${this.moves}, Range: ${this.range}, Attack: ${this.attack}, Defence: ${this.defence}`
  }

  // Example method: add a new tile position
  addTile(x: number, y: number): void {
    this.tiles.push({ x, y })
  }

  resetMoves() {
    this.movesRemaining = this.moves
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

  moveTo(newPosition: Coordinate): void {
    //console.log('attempting move')
    this.headPosition = newPosition
    this.tiles.unshift(newPosition)
    // If exceeding maxSize, remove the oldest tile
    if (this.tiles.length > this.maxSize) {
      this.tiles.pop() // removes first element
    }
    this.useMove();
  }

  takeDamage(damage: number) {
    //console.log('recieving: ', damage)
    const received = Math.max(0, damage - this.defence);
    const removeCount = Math.min(received, this.tiles.length); // safety
    //console.log('recieving total: ', removeCount)
    //console.log('splice: ', this.tiles.length-removeCount, removeCount)
    this.tiles.splice(this.tiles.length - removeCount, removeCount);
    if (this.tiles.length === 0 && this.removeCallback) {
      console.log('Piecets: removing')
      this.removeCallback(this);
    }
  }

  //cloaked
  //checkStatuses
  //burning take 1 damage regardless of def
  //posion defence -1
  //disease - maxsize -1
  //drugged - moves - 1
  //oil range -1

  // Example method
  introduce(): string {
    return `${this.name}: ${this.description}`
  }
}


export class Spawn extends Piece {
  static name = "Spawn";
  static description = "A load point for programs";
  static unicode = "U+2BD0";
  static color = "#242424ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string) {
    super(Spawn.name, Spawn.description, Spawn.unicode, 1, 0, 0, 0, 0, Spawn.color, headPosition, [headPosition], team, 1, removeCallback, id);
  }
}

class Knife extends Piece {
  static name = "Knife";
  static description = "A basic attack piece";
  static unicode = "U+1F52A";// kitchen knife 
  static color = "#2fc5ebff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Knife.name, Knife.description, Knife.unicode, 3, 2, 1, 2, 0, Knife.color, headPosition, [headPosition], team, 1, removeCallback, id)
    //name desc utf || maxsize moves range atk def
  }
  // specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

//name desc unicode || maxsize moves range atk def
class Dagger extends Piece {
  static name = "Sword";
  static description = "A basic attack piece";
  static unicode = "U+1F5E1";
  static color = "#37b6e9ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Dagger.name, Dagger.description, Dagger.unicode, 3, 2, 1, 3, 0, Dagger.color, headPosition, [headPosition], team, 2, removeCallback, id)
    //name desc utf || maxsize moves range atk def
  }
  // specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

class Arms extends Piece {
  static name = "Arms";
  static description = "A stronger attacking piece";
  static unicode = "U+2694";
  static color = "#1b84caff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Arms.name, Arms.description, Arms.unicode, 3, 2, 1, 4, 0, Arms.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  // specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

class Shield extends Piece {
  static name = "Shield";
  static description = "A basic defensive piece";
  static unicode = "U+1F6E1";
  static color = "#2fa7ca";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shield.name, Shield.description, Shield.unicode, 3, 2, 0, 0, 1, Shield.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }
}

class Aegis extends Piece {
  static name = "Aegis";
  static description = "An advanced defensive piece";
  static unicode = "U+26FB";
  static color = "#06789bff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Aegis.name, Aegis.description, Aegis.unicode, 3, 2, 0, 0, 2, Aegis.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }

  //parry next incoming attack (damage the attacker)
}

class Sling extends Piece {
  static name = "Sling";
  static description = "A basic ranged piece";
  static unicode = "U+1F94F";
  static color = "#019700";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sling.name, Sling.description, Sling.unicode, 3, 2, 2, 1, 0, Sling.color, headPosition, [headPosition], team, 1, removeCallback, id) //disk
  }
}

class Bow extends Piece {
  static name = "Bow";
  static description = "A longer ranged piece";
  static unicode = "U+1F3F9";
  static color = "#019700";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bow.name, Bow.description, Bow.unicode, 3, 2, 3, 2, 0, Bow.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}

class SAM extends Piece {
  static name = "SAM";
  static description = "A slow moving but long ranged program with high damage";
  static unicode = "U+1F680";//"U+1F94D";
  static color = "#970000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(SAM.name, SAM.description, SAM.unicode, 3, 1, 4, 3, 0, SAM.color, headPosition, [headPosition], team, 3, removeCallback, id) //lacrosse
  }
}

class Gate extends Piece {
  static name = "Gate";
  static description = "A defensive program friendly programs can pass through";
  static unicode = "U+13208";//"U+26E9";
  static color = "#ff9900ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gate.name, Gate.description, Gate.unicode, 1, 1, 0, 0, 2, Gate.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Fence extends Piece {
  static name = "Fence";
  static description = "A large program for cosuming spaces";
  static unicode = "U+1F6A7";
  static color = "#ffd000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Fence.name, Fence.description, Fence.unicode, 10, 2, 0, 0, 0, Fence.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}

class Stonewall extends Piece {
  static name = "Stonewall";
  static description = "A large defensive piece";
  static unicode = "U+1F9F1";
  static color = "#ff5100ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Stonewall.name, Stonewall.description, Stonewall.unicode, 12, 2, 0, 0, 1, Stonewall.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Firewall extends Piece {
  static name = "Firewall";
  static description = "A large program with a short range attack";
  static unicode = "U+1F525";
  static color = "#ff0000";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Firewall.name, Firewall.description, Firewall.unicode, 12, 2, 1, 2, 0, Firewall.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }
}

class Trench extends Piece {
  static name = "Trench";
  static description = "A program that boosts the defence of programs inside it";
  static unicode = "U+1F573";
  static color = "#5d3900";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trench.name, Trench.description, Trench.unicode, 6, 1, 0, 0, 0, Trench.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  //passable

  //special method to give +1 def to programs with headposition inside it
}

class Mole extends Piece {
  static name = "Mole";
  static description = "Can burrow under other programs";
  static unicode = "U+1F9A1";
  static color = "#727272";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mole.name, Mole.description, Mole.unicode, 1, 2, 0, 0, 0, Mole.color, headPosition, [headPosition], team, 3, removeCallback, id) //	U+1F400 rat
  }

  //burrow -> passable + cloaked
}

class Lance extends Piece {
  static name = "Lance";
  static description = "Can charge, attacking multiple targets in one move";
  static unicode = "U+1F3A0";
  static color = "#f9f9f9";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Lance.name, Lance.description, Lance.unicode, 3, 3, 3, 2, 0, Lance.color, headPosition, [headPosition], team, 2, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
    //name desc unicode || maxsize moves range atk def
  }

  // Lance-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

class Trojan extends Piece {
  static name = "Trojan";
  static description = "Can create clones of itself";
  static unicode = "U+1F434";
  static color = "#c51b1bff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trojan.name, Trojan.description, Trojan.unicode, 1, 1, 1, 1, 0, Trojan.color, headPosition, [headPosition], team, 3, removeCallback, id)//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

//Trojan horse,
//high defence, slow movement, can sacrifice to spawn a trojan

class Cannon extends Piece {
  static name = "Cannon";
  static description = "a slow ranged program that can damage multiple targets in a straight line";
  static unicode = "U+1F52B";
  static color = "#bb3030ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cannon.name, Cannon.description, Cannon.unicode, 1, 1, 6, 3, 0, Cannon.color, headPosition, [headPosition], team, 4, removeCallback, id) //water pistol
  }

  //target multiple
}

class Nerf extends Piece {
  static name = "Nerf Gun";
  static description = "a ranged program that can lower the stats of other programs";
  static unicode = "U+1F52B";
  static color = "#e7ff13ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nerf.name, Nerf.description, Nerf.unicode, 3, 1, 3, 0, 0, Nerf.color, headPosition, [headPosition], team, 4, removeCallback, id) //water pistol
  }

  //nerf
}

class Tank extends Piece {
  static name = "Tank";
  static description = "A mobile ranged program with high defence that can damage multiple targets in a straight line";
  static unicode = "U+1F94C";
  static color = "#00470a";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tank.name, Tank.description, Tank.unicode, 1, 2, 6, 3, 2, Tank.color, headPosition, [headPosition], team, 5, removeCallback, id)//curling stone //cog "U+2699 U+FE0F",
  }
}

class Bomb extends Piece {
  static name = "Bomb";
  static description = "Can be sacrificed to inflict high damage over a wide area";
  static unicode = "U+1F4A3";
  static color = "#000000";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bomb.name, Bomb.description, Bomb.unicode, 1, 3, 1, 10, 0, Bomb.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //destory self
}

class Dataworm extends Piece {
  static name = "Dataworm";
  static description = "A large program that can tunnel through other programs";
  static unicode = "U+1FAB1";//"U+1F41B";
  static color = "#c031c3";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dataworm.name, Dataworm.description, Dataworm.unicode, 6, 3, 1, 2, 0, Dataworm.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }

  //tunnel
}

class Copycat extends Piece {
  static name = "Copycat";
  static description = "Can take on the traits of any program in range";
  static unicode = "U+1F63C";//"U+1F431";
  static color = "#fff643";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Copycat.name, Copycat.description, Copycat.unicode, 1, 0, 1, 0, 0, Copycat.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }

  //check for programs in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

class Trap extends Piece {
  static name = "Trap";
  static description = "A program invisble to the enemy that immobilises programs moving over it";
  static unicode = "U+1FAA4";
  static color = "#686026";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trap.name, Trap.description, Trap.unicode, 1, 1, 0, 0, 0, Trap.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}
  //check for programs on top, make their movement 0

class Mine extends Piece {
  static name = "Mine";
  static description = "A program invisble to the enemy that damages programs moving over it";
  static unicode = "U+1F4A5";
  static color = "#ff9d00";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mine.name, Mine.description, Mine.unicode, 1, 1, 0, 3, 0, Mine.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }

  //check for programs on top, damage them
}

class Web extends Piece {
  static name = "Web";
  static description = "A program that freezes enemies moving over it";
  static unicode = "U+1F578";
  static color = "#cfcfcfff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Web.name, Web.description, Web.unicode, 1, 0, 0, 0, 0, Web.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  // default cloaked and passable

  //set movesRemaining of passing pieces to 0
}

class Spider extends Piece {
  static name = "Spider";
  static description = "A fast program with that freezes programs in its trail";
  static unicode = "U+1F577";
  static color = "#a8743f";
  //U+1F577 U+FE0F spider trail is trap
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Spider.name, Spider.description, Spider.unicode, 6, 3, 1, 3, 0, Spider.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //spawn a web default cloaked and passable
}

//scorpian
//posion, damage and reduce movement and  of enemy by 1

//	U+1F9A0 microbe
class Germ extends Piece {
  static name = "Germ";
  static description = "A program that infects other programs, draining their max size over time";
  static unicode = "U+1F9A0";
  static color = "#27ff00";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Germ.name, Germ.description, Germ.unicode, 1, 4, 1, 0, 0, Germ.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }

  //infect a piece, drain it's max size every turn
}

//	U+1F5DC U+FE0F vice hold others in place
class Vice extends Piece {
  static name = "Vice";
  static description = "A program that can reduce other programs moves to 0";
  static unicode = "U+1F5DC";
  static color = "#f5d58d";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vice.name, Vice.description, Vice.unicode, 1, 2, 1, 0, 1, Vice.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //set another piece's moves to 0 when in range
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
class Watchman extends Piece {
  static name = "Watchman";
  static description = "A program that spots other programs, reducing their defence";
  static unicode = "U+1F441";
  static color = "#6730cf";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Watchman.name, Watchman.description, Watchman.unicode, 2, 2, 3, 0, 0, Watchman.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }

  //spot, reduce a programs defence by 1 if not already spotted
}

//	U+1F9F2 magnet
class Magnet extends Piece {
  static name = "Magnet";
  static description = "A program that moves other programs";
  static unicode = "U+1F9F2";
  static color = "#f12020";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Magnet.name, Magnet.description, Magnet.unicode, 2, 2, 3, 0, 0, Magnet.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  // pull programs toward it
}

//	U+1F422 turtle
class Turtle extends Piece {
  static name = "Turtle";
  static description = "A slow program with high defence";
  static unicode = "U+1F422";
  static color = "#84cd48";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Turtle.name, Turtle.description, Turtle.unicode, 1, 1, 1, 3, 4, Turtle.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  // slow, high defence, snap low range atk
}

//	U+1F997 hopper
class Hopper extends Piece {
  static name = "Hopper";
  static description = "A program that can jump over programs next to it";
  static unicode = "U+1F997";
  static color = "#9aff46";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hopper.name, Hopper.description, Hopper.unicode, 1, 3, 1, 2, 2, Hopper.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  //jump over other programs next to it
}

//	U+1F9FD sponge
class Sponge extends Piece {
  static name = "Sponge";
  static description = "A program that can permanently copy stats of nearby programs";
  static unicode = "U+1F9FD";
  static color = "#ffd446";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sponge.name, Sponge.description, Sponge.unicode, 4, 0, 1, 0, 0, Sponge.color, headPosition, [headPosition], team, 6, removeCallback, id)
  }
  //choose a stat to absorb from a nearby piece
}

class Puffer extends Piece {
  static name = "Puffer";
  static description = "A program that damages programs that attack it";
  static unicode = "U+1F421";
  static color = "#ffb20dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Puffer.name, Puffer.description, Puffer.unicode, 4, 0, 1, 0, 0, Puffer.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  //return damage on takedamage
}

class Nuke extends Piece {
  static name = "Nuke";
  static description = "A fragile program that destroys itself and damages all pieces in range";
  static unicode = "U+2622";
  static color = "#ff0000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nuke.name, Nuke.description, Nuke.unicode, 1, 1, 4, 4, 0, Nuke.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  //destroy self on attack
}

class Highwayman extends Piece {
  static name = "Highway man";
  static description = "A program the generates money on destroying a piece";
  static unicode = "U+1F9B9";
  static color = "#181818ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Highwayman.name, Highwayman.description, Highwayman.unicode, 3, 0, 1, 1, 0, Highwayman.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //if attacking detroys a piece, gain 1 money
}

class Elephant extends Piece {
  static name = "Elephant";
  static description = "A large program with strong stats";
  static unicode = "U+1F418";
  static color = "#77736bff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Elephant.name, Elephant.description, Elephant.unicode, 5, 2, 1, 2, 2, Elephant.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Snowman extends Piece {
  static name = "Snowman";
  static description = "A program that increases its size with each move";
  static unicode = "U+2603";
  static color = "#ffffffff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Snowman.name, Snowman.description, Snowman.unicode, 1, 1, 0, 0, 0, Snowman.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }

  //maxSize = size
}

class Soldier extends Piece {
  static name = "Soldier";
  static description = "An all rounder program";
  static unicode = "U+1FA96";
  static color = "#1a5200ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Soldier.name, Soldier.description, Soldier.unicode, 3, 2, 2, 2, 1, Soldier.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Fencer extends Piece {
  static name = "Fencer";
  static description = "A close range program that can deflect incoming attacks";
  static unicode = "U+1F93A";
  static color = "#ada89dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Fencer.name, Fencer.description, Fencer.unicode, 3, 0, 1, 2, 0, Fencer.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
  //parry action deflects next attack
}

class Pawn extends Piece {
  static name = "Pawn";
  static description = "A slow program that can be promoted into an enemy piece";
  static unicode = "";
  static color = "#ffe9b8e1";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Pawn.name, Pawn.description, Pawn.unicode, 1, 1, 1, 1, 0, Pawn.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //promotion, destroy this instance, make one of target in place
}

class Rat extends Piece {
  static name = "Rat";
  static description = "A small but fast program ";
  static unicode = "U+1F400";
  static color = "#6e6e6eff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Rat.name, Rat.description, Rat.unicode, 1, 3, 1, 1, 0, Rat.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }
}

class Flute extends Piece {
  static name = "Flute";
  static description = "A program that can summon rats";
  static unicode = "U+1FA88";
  static color = "#6ea1caff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Flute.name, Flute.description, Flute.unicode, 1, 0, 0, 0, 0, Flute.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }

  //create rat instances
}

class Bat extends Piece {
  static name = "Vampire Bat";
  static description = "A program that can increase its defence by damaging enemies";
  static unicode = "U+1F987";
  static color = "#ff290dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bat.name, Bat.description, Bat.unicode, 1, 3, 1, 1, 0, Bat.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }

  //raise defence +1 if total dmg > 0
}

class Dragon extends Piece {
  static name = "Dragon";
  static description = "A large program with high stats";
  static unicode = "U+1F409";
  static color = "#00b61eff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dragon.name, Dragon.description, Dragon.unicode, 6, 2, 1, 3, 2, Dragon.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }
  //burn in a cone/line
}

class Squid extends Piece {
  static name = "Squid";
  static description = "A program that can creat ink decoy tiles that last for one turn";
  static unicode = "U+1F991";
  static color = "#ff0d72ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Squid.name, Squid.description, Squid.unicode, 4, 1, 1, 2, 0, Squid.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
  //create a self destroying decoy on a free tile
}

class Snail extends Piece {
  static name = "Snail";
  static description = "A slow program that can retract itself for temporary high defence";
  static unicode = "U+1F40C";
  static color = "#4d3502ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Snail.name, Snail.description, Snail.unicode, 3, 1, 1, 1, 0, Snail.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }

  //retract tiles to just headposition, 
  // if tiles.length = 1, def = 5 
}

class Shark extends Piece {
  static name = "Shark";
  static description = "A fast program with high attack";
  static unicode = "U+1F988";
  static color = "#0061bdff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shark.name, Shark.description, Shark.unicode, 4, 4, 1, 3, 0, Shark.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }
}

class Greatshield extends Piece {
  static name = "Greatshield";
  static description = "A slow but highly defensive program ";
  static unicode = "U+26C9";
  static color = "rgba(0, 82, 85, 1)";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Greatshield.name, Greatshield.description, Greatshield.unicode, 5, 1, 1, 0, 4, Greatshield.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Wizard extends Piece {
  static name = "Wizard";
  static description = "A program that can telport to unnoccupied spaces";
  static unicode = "U+1F9D9";
  static color = "#7600c5ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Wizard.name, Wizard.description, Wizard.unicode, 3, 2, 3, 2, 0, Wizard.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }

  //teleport
}

class Ninja extends Piece {
  static name = "Ninja";
  static description = "A small program with high attack that can hide itself from enemy pieces for one turn";
  static unicode = "U+1F977";
  static color = "#000000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ninja.name, Ninja.description, Ninja.unicode, 1, 3, 2, 3, 0, Ninja.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //cloak //turn opacity 50%
}

class Fairy extends Piece {
  static name = "Fairy";
  static description = "A program that can ressurect destroyed programs";
  static unicode = "U+1F9DA";
  static color = "#cc5effff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Fairy.name, Fairy.description, Fairy.unicode, 2, 3, 1, 0, 0, Fairy.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Genie extends Piece {
  static name = "Genie";
  static description = "Can create any 3 programs once";
  static unicode = "U+1F9DE";
  static color = "#0dbaffff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Genie.name, Genie.description, Genie.unicode, 3, 1, 1, 0, 0, Genie.color, headPosition, [headPosition], team, 6, removeCallback, id)
  }

  //create any program, keep track of uses
  //after 3 destroy genie
}

class Cupid extends Piece {
  static name = "Cupid";
  static description = "Can charm an enemy on the board, putting it under your control for the round";
  static unicode = "U+1F47C";
  static color = "#ffb20dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cupid.name, Cupid.description, Cupid.unicode, 1, 1, 3, 0, 0, Cupid.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }
  //charm
}

class Oni extends Piece {
  static name = "Oni";
  static description = "A strong but slow program";
  static unicode = "U+1F479";
  static color = "#9e0303ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Oni.name, Oni.description, Oni.unicode, 6, 1, 1, 4, 2, Oni.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }
}

class Bug extends Piece {
  static name = "Bug";
  static description = "A fast but small program";
  static unicode = "U+1F47E";
  static color = "#04ca0eff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bug.name, Bug.description, Bug.unicode, 1, 5, 1, 1, 0, Bug.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }
}

class Cockroach extends Piece {
  static name = "Cockroach";
  static description = "A faster, tougher bug";
  static unicode = "U+1FAB3";
  static color = "#913500ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cockroach.name, Cockroach.description, Cockroach.unicode, 1, 5, 1, 1, 1, Cockroach.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}

class Mosquito extends Piece {
  static name = "Mosquito";
  static description = "Can heal itself by damaging enemies";
  static unicode = "U+1F99F";
  static color = "#271f0dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mosquito.name, Mosquito.description, Mosquito.unicode, 3, 3, 1, 2, 0, Mosquito.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //heal on succesful attack
}

class Scorpion extends Piece {
  static name = "Scorpion";
  static description = "Can sting enemies inflicting a poison that lowers their defence by 1 each turn";
  static unicode = "";
  static color = "#681f08ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Scorpion.name, Scorpion.description, Scorpion.unicode, 3, 1, 1, 2, 0, Scorpion.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //apply poison status
}

class Firebrand extends Piece {
  static name = "Firebrand";
  static description = "A high level program which can apply burning";
  static unicode = "U+1F4DB";
  static color = "#ff0d0dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Firebrand.name, Firebrand.description, Firebrand.unicode, 4, 3, 1, 3, 2, Firebrand.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }

  //burn a piece
}

class Golem extends Piece {
  static name = "Golem";
  static description = "A large but slow program with high defence";
  static unicode = "U+1F5FF";
  static color = "#777777ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Golem.name, Golem.description, Golem.unicode, 5, 1, 1, 3, 2, Golem.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }
}

class Gman extends Piece {
  static name = "G-man";
  static description = "A boss level program";
  static unicode = "U+1F574";
  static color = "#000000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gman.name, Gman.description, Gman.unicode, 8, 4, 3, 4, 0, Gman.color, headPosition, [headPosition], team, 5, removeCallback, id)
  }
}

// GUARDSMAN, U+1F482
class Guard extends Piece {
  static name = "Guard";
  static description = "A basic all round program";
  static unicode = "";
  static color = "#ff6e0dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Guard.name, Guard.description, Guard.unicode, 3, 1, 1, 1, 1, Guard.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }
}

class Officer extends Piece {
  static name = "Officer";
  static description = "A mid level all round piece ";
  static unicode = "";
  static color = "#ff310dff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Officer.name, Officer.description, Officer.unicode, 4, 2, 1, 2, 2, Officer.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}

class Troll extends Piece {
  static name = "Troll";
  static description = "A large and strong program ";
  static unicode = "U+1F9CC";
  static color = "#740000ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Troll.name, Troll.description, Troll.unicode, 4, 1, 1, 3, 2, Troll.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

class Tater extends Piece {
  static name = "Tater";
  static description = "An unassuming program";
  static unicode = "U+1F954";
  static color = "#ad8226ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tater.name, Tater.description, Tater.unicode, 3, 1, 1, 1, 1, Tater.color, headPosition, [headPosition], team, 1, removeCallback, id)
  }
}

class Ghost extends Piece {
  static name = "Ghost";
  static description = "A program that can pass through other programs";
  static unicode = "U+1F47B";
  static color = "#a1a1a1ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ghost.name, Ghost.description, Ghost.unicode, 3, 2, 1, 1, 0, Ghost.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //pase through pieces
}

class Beetle extends Piece {
  static name = "Beetle";
  static description = "A mid-level all round program";
  static unicode = "U+1FAB2";
  static color = "#059411ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Beetle.name, Beetle.description, Beetle.unicode, 4, 2, 1, 1, 1, Beetle.color, headPosition, [headPosition], team, 2, removeCallback, id)
  }
}

class LadyBeetle extends Piece {
  static name = "Lady Beetle";
  static description = "A tougher beetle";
  static unicode = "U+1FAB2";
  static color = "#059411ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(LadyBeetle.name, LadyBeetle.description, LadyBeetle.unicode, 4, 3, 1, 2, 2, LadyBeetle.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}
//name desc unicode || maxsize moves range atk def

class Yarn extends Piece {
  static name = "Yarn";
  static description = "A large program that can reduce its size at will";
  static unicode = "U+1F9F6";
  static color = "#560dffff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Yarn.name, Yarn.description, Yarn.unicode, 6, 1, 1, 1, 0, Yarn.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }

  //wind back in
}

class Bee extends Piece {
  static name = "Bee";
  static description = "A small program with a high attack";
  static unicode = "U+1F41D";
  static color = "#eeff00ff";
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bee.name, Bee.description, Bee.unicode, 1, 2, 1, 3, 0, Bee.color, headPosition, [headPosition], team, 3, removeCallback, id)
  }
}

export const allPieces = [Knife, Dagger, Arms, Shield, Aegis, Sling, Bow, SAM, Gate, Fence, Stonewall, Firewall, Trench, Lance, Mole, Trojan, Cannon, Nerf, Tank, Bomb, Dataworm, Copycat, Trap, Mine, Web, Spider, Germ, Vice, Watchman, Magnet, Turtle, Hopper, Sponge, Puffer, Nuke, Highwayman, Elephant, Snowman, Soldier, Fencer, Pawn, Rat, Flute, Bat, Dragon, Squid, Snail, Shark, Greatshield, Wizard, Ninja, Fairy, Genie, Cupid, Oni, Bug, Cockroach, Mosquito, Scorpion, Firebrand, Golem, Gman, Guard, Officer, Troll, Tater, Ghost, Beetle, LadyBeetle, Yarn, Bee];

//SPIDER WEB, U+1F578
//BALL OF YARN, U+1F9F6

//snowball moving increases max size,// and movement speed?

//name desc || maxsize moves range atk def


//all +1 variants get +1 added to non 0 number stats

//JAPANESE GOBLIN, U+1F47A
//EXTRATERRESTRIAL ALIEN, U+1F47D
//MONEY-MOUTH FACE, U+1F911

//Strongarm FLEXED BICEPS, U+1F4AA
