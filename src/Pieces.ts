import type { Coordinate } from "./types"

export abstract class Piece {
  removeCallback?: (piece: Piece) => void;

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
  static unicode = "U+1F532";//"U+2BD0";
  static color = "#242424ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string) {
    super(Spawn.name, Spawn.description, Spawn.unicode, 1, 0, 0, 0, 0, Spawn.color, headPosition, [headPosition], team, 1, removeCallback, id);
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
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Dagger.name, Dagger.description, Dagger.unicode, 3, 2, 1, 3, 0, Dagger.color, headPosition, [headPosition], team, Dagger.rarity, removeCallback, id)
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
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Arms.name, Arms.description, Arms.unicode, 3, 2, 1, 4, 0, Arms.color, headPosition, [headPosition], team, Arms.rarity, removeCallback, id)
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
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shield.name, Shield.description, Shield.unicode, 3, 2, 0, 0, 1, Shield.color, headPosition, [headPosition], team, Shield.rarity, removeCallback, id)
  }
}

class Aegis extends Piece {
  static name = "Aegis";
  static description = "An advanced defensive piece";
  static unicode = "U+26FB";
  static color = "#06789bff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Aegis.name, Aegis.description, Aegis.unicode, 3, 2, 0, 0, 2, Aegis.color, headPosition, [headPosition], team, Aegis.rarity, removeCallback, id)
  }

  //parry next incoming attack (damage the attacker)
}

class Sling extends Piece {
  static name = "Sling";
  static description = "A basic ranged piece";
  static unicode = "U+1F94F";
  static color = "#019700";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sling.name, Sling.description, Sling.unicode, 3, 2, 2, 1, 0, Sling.color, headPosition, [headPosition], team, Sling.rarity, removeCallback, id) //disk
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

class SAM extends Piece {
  static name = "SAM";
  static description = "A slow moving but long ranged program with high damage";
  static unicode = "U+1F680";//"U+1F94D";
  static color = "#970000ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(SAM.name, SAM.description, SAM.unicode, 3, 1, 4, 3, 0, SAM.color, headPosition, [headPosition], team, SAM.rarity, removeCallback, id) //lacrosse
  }
}

class Gate extends Piece {
  static name = "Gate";
  static description = "A defensive program friendly programs can pass through";
  static unicode = "U+13208";//"U+26E9";
  static color = "#ff9900ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gate.name, Gate.description, Gate.unicode, 1, 1, 0, 0, 2, Gate.color, headPosition, [headPosition], team, Gate.rarity, removeCallback, id)
  }
}

class Fence extends Piece {
  static name = "Fence";
  static description = "A large program for consuming spaces";
  static unicode = "U+1F6A7";
  static color = "#ffd000ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
    super(Fence.name, Fence.description, Fence.unicode, 8, 1, 0, 0, 0, Fence.color, headPosition, [headPosition], team, Fence.rarity, removeCallback, id)
  }
}

class Stonewall extends Piece {
  static name = "Stonewall";
  static description = "A large defensive piece";
  static unicode = "U+1F9F1";
  static color = "#ff5100ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Stonewall.name, Stonewall.description, Stonewall.unicode, 10, 2, 0, 0, 1, Stonewall.color, headPosition, [headPosition], team, Stonewall.rarity, removeCallback, id)
  }
}

class Firewall extends Piece {
  static name = "Firewall";
  static description = "A large program with a short range attack";
  static unicode = "U+1F525";
  static color = "#ff0000";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Firewall.name, Firewall.description, Firewall.unicode, 12, 2, 1, 2, 0, Firewall.color, headPosition, [headPosition], team, Firewall.rarity, removeCallback, id)
  }
}

class Trench extends Piece {
  static name = "Trench";
  static description = "A program that boosts the defence of programs inside it";
  static unicode = "U+1F573";
  static color = "#5d3900";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trench.name, Trench.description, Trench.unicode, 6, 1, 0, 0, 0, Trench.color, headPosition, [headPosition], team, Trench.rarity, removeCallback, id)
  }
  //passable

  //special method to give +1 def to programs with headposition inside it
}

class Mole extends Piece {
  static name = "Mole";
  static description = "Can burrow under other programs";
  static unicode = "U+1F9A1";
  static color = "#441d0eff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mole.name, Mole.description, Mole.unicode, 1, 2, 0, 0, 0, Mole.color, headPosition, [headPosition], team, Mole.rarity, removeCallback, id) //	U+1F400 rat
  }

  //burrow -> passable + cloaked
}

class Lance extends Piece {
  static name = "Lance";
  static description = "Can charge, attacking multiple targets in one move";
  static unicode = "U+1F3A0";
  static color = "#f9f9f9";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
  super(Lance.name, Lance.description, Lance.unicode, 3, 3, 3, 2, 0, Lance.color, headPosition, [headPosition], team, Lance.rarity, removeCallback, id)//horse carousel atm //cane: "U+1F9AF"
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
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trojan.name, Trojan.description, Trojan.unicode, 1, 1, 1, 1, 0, Trojan.color, headPosition, [headPosition], team, Trojan.rarity, removeCallback, id)//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

//Trojan horse,
//high defence, slow movement, can sacrifice to spawn a trojan

class Cannon extends Piece {
  static name = "Cannon";
  static description = "a slow ranged program that can damage multiple targets in a straight line";
  static unicode = "U+1FA65";//TODO change this
  static color = "#bb3030ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cannon.name, Cannon.description, Cannon.unicode, 1, 1, 6, 3, 0, Cannon.color, headPosition, [headPosition], team, Cannon.rarity, removeCallback, id) //water pistol
  }

  //target multiple
}

class Nerf extends Piece {
  static name = "Nerf Gun";
  static description = "a ranged program that can lower the stats of other programs";
  static unicode = "U+1F52B";
  static color = "#e7ff13ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nerf.name, Nerf.description, Nerf.unicode, 3, 1, 3, 0, 0, Nerf.color, headPosition, [headPosition], team, Nerf.rarity, removeCallback, id) //water pistol
  }

  //nerf
}

class Tank extends Piece {
  static name = "Tank";
  static description = "A mobile ranged program with high defence that can damage multiple targets in a straight line";
  static unicode = "U+1F94C";
  static color = "#00470a";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Tank.name, Tank.description, Tank.unicode, 1, 2, 6, 3, 2, Tank.color, headPosition, [headPosition], team, Tank.rarity, removeCallback, id)//curling stone //cog "U+2699 U+FE0F",
  }
}

class Dynamite extends Piece {
  static name = "Dynamite";
  static description = "Can be sacrificed to inflict high damage";
  static unicode = "U+1F9E8";
  static color = "#be3737ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dynamite.name, Dynamite.description, Dynamite.unicode, 1, 3, 1, 6, 0, Dynamite.color, headPosition, [headPosition], team, Dynamite.rarity, removeCallback, id)
  }

  //regular attack disabled
  //destory self
}

class Bomb extends Piece {
  static name = "Bomb";
  static description = "Can be sacrificed to inflict high damage over a wide area";
  static unicode = "U+1F4A3";
  static color = "#2c2c2cff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bomb.name, Bomb.description, Bomb.unicode, 1, 2, 0, 10, 0, Bomb.color, headPosition, [headPosition], team, Bomb.rarity, removeCallback, id)
  }

  //regular attack disabled
  //destory self
}

class Dataworm extends Piece {
  static name = "Dataworm";
  static description = "A large program that can tunnel through other programs, removing a piece of memory (head excluded)";
  static unicode = "U+1FAB1";//"U+1F41B";
  static color = "#ee74eeff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dataworm.name, Dataworm.description, Dataworm.unicode, 6, 3, 1, 2, 0, Dataworm.color, headPosition, [headPosition], team, Dataworm.rarity, removeCallback, id)
  }

  //tunnel
}

class Copycat extends Piece {
  static name = "Copycat";
  static description = "Can take on the traits of any program in range";
  static unicode = "U+1F63C";//"U+1F431";
  static color = "#fff643";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Copycat.name, Copycat.description, Copycat.unicode, 1, 0, 1, 0, 0, Copycat.color, headPosition, [headPosition], team, Copycat.rarity, removeCallback, id)
  }

  //check for programs in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

class Trap extends Piece {
  static name = "Trap";
  static description = "A program invisble to the enemy that immobilises programs moving over it and applies posion to them";
  static unicode = "U+1FAA4";
  static color = "#686026";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Trap.name, Trap.description, Trap.unicode, 1, 1, 0, 0, 0, Trap.color, headPosition, [headPosition], team, Trap.rarity, removeCallback, id)
  }
}
  //check for programs on top, make their movement 0

class Mine extends Piece {
  static name = "Mine";
  static description = "A program invisble to the enemy that damages programs moving over it";
  static unicode = "U+1F4A5";
  static color = "#ff9d00";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mine.name, Mine.description, Mine.unicode, 1, 1, 0, 3, 0, Mine.color, headPosition, [headPosition], team, Mine.rarity, removeCallback, id)
  }

  //check for programs on top, damage them
}

class Web extends Piece {
  static name = "Web";
  static description = "A program that freezes enemies moving over it";
  static unicode = "U+1F578";
  static color = "#cfcfcfff";
  static rarity = 8; //should not appear on its own
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Web.name, Web.description, Web.unicode, 1, 0, 0, 0, 0, Web.color, headPosition, [headPosition], team, Web.rarity, removeCallback, id)
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
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Spider.name, Spider.description, Spider.unicode, 6, 3, 1, 3, 0, Spider.color, headPosition, [headPosition], team, Spider.rarity, removeCallback, id)
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
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Germ.name, Germ.description, Germ.unicode, 1, 4, 1, 0, 0, Germ.color, headPosition, [headPosition], team, Germ.rarity, removeCallback, id)
  }

  //infect a piece, drain it's max size every turn
}

//	U+1F5DC U+FE0F vice hold others in place
class Vice extends Piece {
  static name = "Vice";
  static description = "A program that can reduce other programs moves to 0";
  static unicode = "U+1F5DC";
  static color = "#f5d58d";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vice.name, Vice.description, Vice.unicode, 1, 2, 1, 0, 1, Vice.color, headPosition, [headPosition], team, Vice.rarity, removeCallback, id)
  }

  //set another piece's moves to 0 when in range
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
class Watchman extends Piece {
  static name = "Watchman";
  static description = "A program that spots other programs, reducing their defence";
  static unicode = "U+1F441";
  static color = "#6730cf";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Watchman.name, Watchman.description, Watchman.unicode, 2, 2, 3, 1, 0, Watchman.color, headPosition, [headPosition], team, Watchman.rarity, removeCallback, id)
  }

  //spot, reduce a programs defence by 1 if not already spotted
}

//	U+1F9F2 magnet
class Magnet extends Piece {
  static name = "Magnet";
  static description = "A program that moves other programs";
  static unicode = "U+1F9F2";
  static color = "#6fa9ffff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Magnet.name, Magnet.description, Magnet.unicode, 2, 2, 3, 0, 0, Magnet.color, headPosition, [headPosition], team, Magnet.rarity, removeCallback, id)
  }

  // pull programs toward it
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
  static description = "A program that can jump over programs next to it";
  static unicode = "U+1F997";
  static color = "#9aff46";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hopper.name, Hopper.description, Hopper.unicode, 1, 3, 1, 2, 2, Hopper.color, headPosition, [headPosition], team, Hopper.rarity, removeCallback, id)
  }
  //jump over other programs next to it
}

//	U+1F9FD sponge
class Sponge extends Piece {
  static name = "Sponge";
  static description = "A program that can permanently copy stats of nearby programs";
  static unicode = "U+1F9FD";
  static color = "#ffd446";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sponge.name, Sponge.description, Sponge.unicode, 4, 0, 1, 0, 0, Sponge.color, headPosition, [headPosition], team, Sponge.rarity, removeCallback, id)
  }
  //choose a stat to absorb from a nearby piece
}

class Puffer extends Piece {
  static name = "Puffer";
  static description = "A program that damages programs that attack it";
  static unicode = "U+1F421";
  static color = "#ffb20dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Puffer.name, Puffer.description, Puffer.unicode, 4, 0, 1, 0, 0, Puffer.color, headPosition, [headPosition], team, Puffer.rarity, removeCallback, id)
  }
  //return damage on takedamage
}

class Nuke extends Piece {
  static name = "Nuke";
  static description = "A fragile program that destroys itself and damages all pieces in range";
  static unicode = "U+2622";
  static color = "#ff0000ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Nuke.name, Nuke.description, Nuke.unicode, 1, 1, 4, 25, 0, Nuke.color, headPosition, [headPosition], team, Nuke.rarity, removeCallback, id)
  }
  //destroy self on attack
}

class Highwayman extends Piece {
  static name = "Highwayman";
  static description = "A program the generates money on destroying a piece";
  static unicode = "U+1F9B9";
  static color = "#494646ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Highwayman.name, Highwayman.description, Highwayman.unicode, 3, 0, 1, 1, 0, Highwayman.color, headPosition, [headPosition], team, Highwayman.rarity, removeCallback, id)
  }

  //if attacking detroys a piece, gain 1 money
}

class Elephant extends Piece {
  static name = "Elephant";
  static description = "A large program with strong stats";
  static unicode = "U+1F418";
  static color = "#77736bff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Elephant.name, Elephant.description, Elephant.unicode, 5, 2, 1, 2, 2, Elephant.color, headPosition, [headPosition], team, Elephant.rarity, removeCallback, id)
  }
}

class Mammoth extends Piece {
  static name = "Mammoth";
  static description = "A larger Elephant";
  static unicode = "U+1F9A3"
  static color = "#77736bff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mammoth.name, Mammoth.description, Mammoth.unicode, 6, 2, 1, 3, 2, Mammoth.color, headPosition, [headPosition], team, Mammoth.rarity, removeCallback, id)
  }
}

class Snowman extends Piece {
  static name = "Snowman";
  static description = "A program that increases its size with each move";
  static unicode = "U+2603";
  static color = "#4e4e4eff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Snowman.name, Snowman.description, Snowman.unicode, 1, 1, 0, 0, 0, Snowman.color, headPosition, [headPosition], team, Snowman.rarity, removeCallback, id)
  }

  //maxSize = size
}

class Soldier extends Piece {
  static name = "Soldier";
  static description = "An all rounder program";
  static unicode = "U+1FA96";
  static color = "#1a5200ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Soldier.name, Soldier.description, Soldier.unicode, 3, 2, 2, 2, 1, Soldier.color, headPosition, [headPosition], team, Soldier.rarity, removeCallback, id)
  }
}

class Fencer extends Piece {
  static name = "Fencer";
  static description = "A close range program that can deflect incoming attacks";
  static unicode = "U+1F93A";
  static color = "#3b79c9ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Fencer.name, Fencer.description, Fencer.unicode, 3, 0, 1, 2, 0, Fencer.color, headPosition, [headPosition], team, Fencer.rarity, removeCallback, id)
  }
  //parry action deflects next attack
}

class Pawn extends Piece {
  static name = "Pawn";
  static description = "A slow program that can be promoted into an enemy piece";
  static unicode = "U+265F";
  static color = "#ffe9b8e1";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Pawn.name, Pawn.description, Pawn.unicode, 1, 1, 1, 1, 0, Pawn.color, headPosition, [headPosition], team, Pawn.rarity, removeCallback, id)
  }

  //promotion, destroy this instance, make one of target in place
}

class Rat extends Piece {
  static name = "Rat";
  static description = "A small but fast program ";
  static unicode = "U+1F400";
  static color = "#6e6e6eff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Rat.name, Rat.description, Rat.unicode, 1, 3, 1, 1, 0, Rat.color, headPosition, [headPosition], team, Rat.rarity, removeCallback, id)
  }
}

class Flute extends Piece {
  static name = "Flute";
  static description = "A program that can summon rats";
  static unicode = "U+1FA88";
  static color = "#6ea1caff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Flute.name, Flute.description, Flute.unicode, 1, 0, 0, 0, 0, Flute.color, headPosition, [headPosition], team, Flute.rarity, removeCallback, id)
  }

  //create rat instances
}

class Bat extends Piece {
  static name = "Vampire Bat";
  static description = "A program that can steal memory spaces from other programs";
  static unicode = "U+1F987";
  static color = "#ff290dff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bat.name, Bat.description, Bat.unicode, 2, 3, 1, 1, 0, Bat.color, headPosition, [headPosition], team, Bat.rarity, removeCallback, id)
  }

  //raise defence +1 if total dmg > 0
}

class Dragon extends Piece {
  static name = "Dragon";
  static description = "A large program with high stats that can apply burning";
  static unicode = "U+1F409";
  static color = "#00b61eff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dragon.name, Dragon.description, Dragon.unicode, 6, 2, 1, 3, 2, Dragon.color, headPosition, [headPosition], team, Dragon.rarity, removeCallback, id)
  }
  //burn in a cone/line
}

class Squid extends Piece {
  static name = "Squid";
  static description = "A program that can creat ink decoy tiles that last for one turn";
  static unicode = "U+1F991";
  static color = "#08004dff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Squid.name, Squid.description, Squid.unicode, 4, 1, 1, 2, 0, Squid.color, headPosition, [headPosition], team, Squid.rarity, removeCallback, id)
  }
  //create a self destroying decoy on a free tile
}

class Ink extends Piece {
  static name = "Ink";
  static description = "An ink decoy that lasts for one turn";
  static unicode = "U+1F322";//"U+26AB";
  static color = "#303030ff";
  static rarity = 8;//should never appear on its own
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ink.name, Ink.description, Ink.unicode, 1, 0, 0, 0, 0, Ink.color, headPosition, [headPosition], team, Ink.rarity, removeCallback, id)
  }
  //create a self destroying decoy on a free tile
}

class Snail extends Piece {
  static name = "Snail";
  static description = "A slow program that can retract itself for temporary high defence";
  static unicode = "U+1F40C";
  static color = "#4d3502ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Snail.name, Snail.description, Snail.unicode, 3, 1, 1, 1, 0, Snail.color, headPosition, [headPosition], team, Snail.rarity, removeCallback, id)
  }

  //retract tiles to just headposition, 
  // if tiles.length = 1, def = 5 
}

class Shark extends Piece {
  static name = "Shark";
  static description = "A fast program with high attack";
  static unicode = "U+1F988";
  static color = "#0061bdff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Shark.name, Shark.description, Shark.unicode, 4, 4, 1, 3, 0, Shark.color, headPosition, [headPosition], team, Shark.rarity, removeCallback, id)
  }
}

class Greatshield extends Piece {
  static name = "Greatshield";
  static description = "A slow but highly defensive program ";
  static unicode = "U+26C9";
  static color = "rgba(0, 82, 85, 1)";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Greatshield.name, Greatshield.description, Greatshield.unicode, 5, 1, 1, 0, 4, Greatshield.color, headPosition, [headPosition], team, Greatshield.rarity, removeCallback, id)
  }
}

class Wizard extends Piece {
  static name = "Wizard";
  static description = "A program that can telport to unnoccupied spaces";
  static unicode = "U+1F9D9";
  static color = "#7600c5ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Wizard.name, Wizard.description, Wizard.unicode, 3, 2, 3, 2, 0, Wizard.color, headPosition, [headPosition], team, Wizard.rarity, removeCallback, id)
  }

  //teleport
}

class Ninja extends Piece {
  static name = "Ninja";
  static description = "A small program with high attack that can hide itself from enemy pieces for one turn";
  static unicode = "U+1F977";
  static color = "#000000ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ninja.name, Ninja.description, Ninja.unicode, 1, 3, 2, 3, 0, Ninja.color, headPosition, [headPosition], team, Ninja.rarity, removeCallback, id)
  }

  //cloak //turn opacity 50%
}

class Fairy extends Piece {
  static name = "Fairy";
  static description = "A program that can ressurect destroyed programs";
  static unicode = "U+1F9DA";
  static color = "#cc5effff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Fairy.name, Fairy.description, Fairy.unicode, 2, 3, 1, 0, 0, Fairy.color, headPosition, [headPosition], team, Fairy.rarity, removeCallback, id)
  }
}

class Cupid extends Piece {
  static name = "Cupid";
  static description = "Can charm an enemy on the board, putting it under your control for the round";
  static unicode = "U+1F47C";
  static color = "#ffb20dff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cupid.name, Cupid.description, Cupid.unicode, 1, 1, 3, 0, 0, Cupid.color, headPosition, [headPosition], team, Cupid.rarity, removeCallback, id)
  }
  //charm
}

class Oni extends Piece {
  static name = "Oni";
  static description = "A strong but slow program";
  static unicode = "U+1F479";
  static color = "#9e0303ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Oni.name, Oni.description, Oni.unicode, 6, 1, 1, 4, 2, Oni.color, headPosition, [headPosition], team, Oni.rarity, removeCallback, id)
  }
}

class Bug extends Piece {
  static name = "Bug";
  static description = "A fast but small program";
  static unicode = "U+1F47E";
  static color = "#04ca0eff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bug.name, Bug.description, Bug.unicode, 1, 5, 1, 1, 0, Bug.color, headPosition, [headPosition], team, Bug.rarity, removeCallback, id)
  }
}

class Cockroach extends Piece {
  static name = "Cockroach";
  static description = "A faster, tougher bug";
  static unicode = "U+1FAB3";
  static color = "#e09f79ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Cockroach.name, Cockroach.description, Cockroach.unicode, 1, 5, 1, 2, 1, Cockroach.color, headPosition, [headPosition], team, Cockroach.rarity, removeCallback, id)
  }
}

class Mosquito extends Piece {
  static name = "Mosquito";
  static description = "Can heal itself by damaging enemies";
  static unicode = "U+1F99F";
  static color = "#271f0dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Mosquito.name, Mosquito.description, Mosquito.unicode, 3, 3, 1, 2, 0, Mosquito.color, headPosition, [headPosition], team, Mosquito.rarity, removeCallback, id)
  }

  //heal on succesful attack
}

class Scorpion extends Piece {
  static name = "Scorpion";
  static description = "Can sting enemies inflicting a poison that lowers their defence by 1 each turn";
  static unicode = "U+1F982";
  static color = "#681f08ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Scorpion.name, Scorpion.description, Scorpion.unicode, 3, 1, 1, 2, 0, Scorpion.color, headPosition, [headPosition], team, Scorpion.rarity, removeCallback, id)
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
   super(Firebrand.name, Firebrand.description, Firebrand.unicode, 4, 3, 1, 3, 2, Firebrand.color, headPosition, [headPosition], team, Firebrand.rarity, removeCallback, id)
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
   super(Golem.name, Golem.description, Golem.unicode, 5, 1, 1, 3, 2, Golem.color, headPosition, [headPosition], team, Golem.rarity, removeCallback, id)
  }
}

class Gman extends Piece {
  static name = "G-man";
  static description = "A boss level program";
  static unicode = "U+1F574";
  static color = "#000000ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Gman.name, Gman.description, Gman.unicode, 8, 4, 3, 4, 0, Gman.color, headPosition, [headPosition], team, Gman.rarity, removeCallback, id)
  }
}

class Guard extends Piece {
  static name = "Guard";
  static description = "A basic all round program";
  static unicode = "U+1F482";
  static color = "#ff6e0dff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Guard.name, Guard.description, Guard.unicode, 2, 1, 1, 1, 0, Guard.color, headPosition, [headPosition], team, Guard.rarity, removeCallback, id)
  }
}

class Officer extends Piece {
  static name = "Officer";
  static description = "A mid level all round piece ";
  static unicode = "U+1F46E";
  static color = "#ff310dff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Officer.name, Officer.description, Officer.unicode, 4, 2, 1, 2, 1, Officer.color, headPosition, [headPosition], team, Officer.rarity, removeCallback, id)
  }
}

class Troll extends Piece {
  static name = "Troll";
  static description = "A large and strong program ";
  static unicode = "U+1F9CC";
  static color = "#740000ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Troll.name, Troll.description, Troll.unicode, 4, 1, 1, 3, 2, Troll.color, headPosition, [headPosition], team, Troll.rarity, removeCallback, id)
  }
}

class Potato extends Piece {
  static name = "Potato";
  static description = "A low-level all round program";
  static unicode = "U+1F954";
  static color = "#ad8226ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Potato.name, Potato.description, Potato.unicode, 3, 1, 1, 1, 1, Potato.color, headPosition, [headPosition], team, Potato.rarity, removeCallback, id)
  }
}

class Ghost extends Piece {
  static name = "Ghost";
  static description = "A program that can pass through other programs";
  static unicode = "U+1F47B";
  static color = "#a1a1a1ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Ghost.name, Ghost.description, Ghost.unicode, 3, 2, 1, 1, 0, Ghost.color, headPosition, [headPosition], team, Ghost.rarity, removeCallback, id)
  }

  //pase through pieces
}

class Beetle extends Piece {
  static name = "Beetle";
  static description = "A mid-level all round program";
  static unicode = "U+1FAB2";
  static color = "#059411ff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Beetle.name, Beetle.description, Beetle.unicode, 4, 2, 1, 1, 1, Beetle.color, headPosition, [headPosition], team, Beetle.rarity, removeCallback, id)
  }
}

class LadyBeetle extends Piece {
  static name = "Lady Beetle";
  static description = "A tougher beetle";
  static unicode = "U+1F41E";
  static color = "#059411ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(LadyBeetle.name, LadyBeetle.description, LadyBeetle.unicode, 4, 3, 1, 2, 2, LadyBeetle.color, headPosition, [headPosition], team, LadyBeetle.rarity, removeCallback, id)
  }
}
//name desc unicode || maxsize moves range atk def

class Yarn extends Piece {
  static name = "Yarn";
  static description = "A large program that can reduce its size at will";
  static unicode = "U+1F9F6";
  static color = "#560dffff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Yarn.name, Yarn.description, Yarn.unicode, 6, 1, 1, 1, 0, Yarn.color, headPosition, [headPosition], team, Yarn.rarity, removeCallback, id)
  }

  //wind back in
}

class Bee extends Piece {
  static name = "Bee";
  static description = "A small program with a high attack";
  static unicode = "U+1F41D";
  static color = "#eeff00ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Bee.name, Bee.description, Bee.unicode, 1, 2, 1, 3, 0, Bee.color, headPosition, [headPosition], team, Bee.rarity, removeCallback, id)
  }
}

class Decoy extends Piece {
  static name = "Decoy";
  static description = "A defensive program that can swap places with other pieces";
  static unicode = "U+1FAB5";
  static color = "#96ff0dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Decoy.name, Decoy.description, Decoy.unicode, 4, 3, 3, 0, 2, Decoy.color, headPosition, [headPosition], team, Decoy.rarity, removeCallback, id)
  }
}

class Extinguisher extends Piece {
  static name = "Extinguisher";
  static description = "A program that can remove burning";
  static unicode = "U+1F9EF";
  static color = "#e7aa92ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Extinguisher.name, Extinguisher.description, Extinguisher.unicode, 4, 2, 1, 1, 0, Extinguisher.color, headPosition, [headPosition], team, Extinguisher.rarity, removeCallback, id)
  }

  //remove burning
}

class Donkey extends Piece {
  static name = "Donkey";
  static description = "A slow program with a powerful kick";
  static unicode = "U+1FACF";
  static color = "#76c928ff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Donkey.name, Donkey.description, Donkey.unicode, 4, 1, 1, 5, 0, Donkey.color, headPosition, [headPosition], team, Donkey.rarity, removeCallback, id)
  }
}

class Jellyfish extends Piece {
  static name = "Jellyfish";
  static description = "A slow program that can apply shock";
  static unicode = "U+1FABC";
  static color = "#0d8affff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Jellyfish.name, Jellyfish.description, Jellyfish.unicode, 2, 1, 1, 4, 0, Jellyfish.color, headPosition, [headPosition], team, Jellyfish.rarity, removeCallback, id)
  }
  //sting
}

class Screwdriver extends Piece {
  static name = "Screwdriver";
  static description = "A program that can adjust other programs stats by 1";
  static unicode = "U+1FA9B";
  static color = "#ffb20dff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Screwdriver.name, Screwdriver.description, Screwdriver.unicode, 1, 1, 1, 0, 0, Screwdriver.color, headPosition, [headPosition], team, Screwdriver.rarity, removeCallback, id)
  }
  //tinker
}

class Axe extends Piece {
  static name = "Axe";
  static description = "A short ranged program with a high attack";
  static unicode = "U+1FA93";
  static color = "#ff0d0dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Axe.name, Axe.description, Axe.unicode, 4, 2, 2, 4, 0, Axe.color, headPosition, [headPosition], team, Axe.rarity, removeCallback, id)
  }
}

class Boomerang extends Piece {
  static name = "Boomerang";
  static description = "A mobile program that can move after attacking";
  static unicode = "U+1FA83";
  static color = "#ffcf4bff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Boomerang.name, Boomerang.description, Boomerang.unicode, 3, 3, 1, 2, 0, Boomerang.color, headPosition, [headPosition], team, Boomerang.rarity, removeCallback, id)
  }
  //attack resets moves once
}

class Plunger extends Piece {
  static name = "Plunger";
  static description = "A program that can remove the slow status effect";
  static unicode = "U+1FAA0";
  static color = "#82e2ffff";
  static rarity = 2;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Plunger.name, Plunger.description, Plunger.unicode, 4, 2, 1, 1, 0, Plunger.color, headPosition, [headPosition], team, Plunger.rarity, removeCallback, id)
  }
  //remove slow?
  //clear a space?
}

export class Angel extends Piece {//not passive
  static name = "Angel";
  static description = "Can ressurect a destroyed program";
  static unicode = "U+1FABD";
  static color = "#a8a8a8ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Angel.name, Angel.description, Angel.unicode, 4, 0, 1, 0, 0, Angel.color, headPosition, [headPosition], team, Angel.rarity, removeCallback, id)
  }
  //acces graveyard
}

export class Stopwatch extends Piece {//not passive
  static name = "Stopwatch";
  static description = "Replenish a program's moves and actions";
  static unicode = "U+23F1";
  static color = "#ff5555";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Stopwatch.name, Stopwatch.description, Stopwatch.unicode, 4, 0, 1, 0, 0, Stopwatch.color, headPosition, [headPosition], team, Stopwatch.rarity, removeCallback, id)
  }
  //
}

export class Sol extends Piece {//not passive
  static name = "Sol";
  static description = "extreme range and damage";
  static unicode = "U+1F6F0";
  static color = "#000000ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Sol.name, Sol.description, Sol.unicode, 1, 1, 7, 7, 0, Sol.color, headPosition, [headPosition], team, Sol.rarity, removeCallback, id)
  }
  //
}

class Vampire extends Piece {
  static name = "Vampire";
  static description = "Steals tiles of other programs, increasing its max size and stats";
  static unicode = "U+1F9DB";
  static color = "#000000ff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Vampire.name, Vampire.description, Vampire.unicode, 4, 1, 1, 1, 0, Vampire.color, headPosition, [headPosition], team, Vampire.rarity, removeCallback, id)
  }
}

class Centipede extends Piece {
  static name = "Centipede";
  static description = "A large piece with a high attack that can poision";
  static unicode = "U+131A8";
  static color = "#3b2108ff";
  static rarity = 5;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Centipede.name, Centipede.description, Centipede.unicode, 8, 2, 1, 3, 0, Centipede.color, headPosition, [headPosition], team, Centipede.rarity, removeCallback, id)
  }
  //
}

class Helicopter extends Piece {
  static name = "Helicopter";
  static description = "A program that can move over empty spaces";
  static unicode = "U+1F681";
  static color = "#0d9effff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Helicopter.name, Helicopter.description, Helicopter.unicode, 2, 2, 2, 1, 1, Helicopter.color, headPosition, [headPosition], team, Helicopter.rarity, removeCallback, id)
  }
}

class Dolls extends Piece {
  static name = "Nesting Dolls";
  static description = "Replaced by a copy with -1 max size if destroyed"
  static unicode = " U+1FA86";
  static color = "#ff5a0dff";
  static rarity = 6;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Dolls.name, Dolls.description, Dolls.unicode, 3, 0, 1, 0, 0, Dolls.color, headPosition, [headPosition], team, Dolls.rarity, removeCallback, id)
  }
}

class UFO extends Piece {
  static name = "UFO";
  static description = "A program that can move enemies without increasing their size";
  static unicode = "U+1F6F8";
  static color = "#000000ff";
  static rarity = 4;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(UFO.name, UFO.description, UFO.unicode, 4, 0, 1, 0, 0, UFO.color, headPosition, [headPosition], team, UFO.rarity, removeCallback, id)
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
  static description = "A program that can remove a body tile from an enemy, regadless of its defence";
  static unicode = "U+1FA9A";
  static color = "#ffb20dff";
  static rarity = 3;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Saw.name, Saw.description, Saw.unicode, 3, 2, 1, 0, 0, Saw.color, headPosition, [headPosition], team, Saw.rarity, removeCallback, id)
  }
  //
}

export const allPieces = [Knife, Dagger, Arms, Shield, Aegis, Sling, Bow, SAM, Gate, Fence, Stonewall, Firewall, Trench, Lance, Mole, Trojan, Cannon, Nerf, Tank, Dynamite, Bomb, Dataworm, Copycat, Trap, Mine, Web, Spider, Germ, Vice, Watchman, Magnet, Turtle, Hopper, Sponge, Puffer, Nuke, Highwayman, Elephant, Mammoth, Snowman, Soldier, Fencer, Pawn, Rat, Flute, Bat, Dragon, Squid, Ink, Snail, Shark, Greatshield, Wizard, Ninja, Fairy, Cupid, Oni, Bug, Cockroach, Mosquito, Scorpion, Firebrand, Golem, Gman, Guard, Officer, Troll, Potato, Ghost, Beetle, LadyBeetle, Yarn, Bee, Decoy, Extinguisher, Donkey, Jellyfish, Screwdriver, Axe, Boomerang, Plunger, Vampire, Centipede, Helicopter, Dolls, UFO, TP, Saw];

//SNAKE, U+1F40D
// CROCODILE, U+1F40A
//T-REX, U+1F996
//DANCER, U+1F483
// WATER BUFFALO, U+1F403
// AMBULANCE, U+1F691
//U+1F9C3 ice cube decreases size each round?

//FROG FACE, U+1F438

//name desc || maxsize moves range atk def


//JAPANESE GOBLIN, U+1F47A
// JAPANESE OGRE, U+1F479

//all +1 variants get +1 added to non 0 number stats

//EXTRATERRESTRIAL ALIEN, U+1F47D

//Strongarm FLEXED BICEPS, U+1F4AA
/*
class Hamsa extends Piece {
  static name = "Hamsa";
  static description = "A well rounded program that can raise allies defence whilst in play";
  static unicode = "U+1FAAC";
  static color = "#2b0d96ff";
  static rarity = 1;
  constructor(headPosition: Coordinate, team: string, removeCallback?: (piece: Piece) => void, id?:  string){
   super(Hamsa.name, Hamsa.description, Hamsa.unicode, 4, 1, 1, 2, 2, Hamsa.color, headPosition, [headPosition], team, 4, removeCallback, id)
  }
  //increase defence temporarily
}*/