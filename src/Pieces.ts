import type { Coordinate } from "./types"

export abstract class Piece {
  static name: string
  static description : string
  static unicode: string
  name: string
  description : string
  unicode: string
  maxSize: number
  moves: number
  range: number
  attack: number
  defence: number
  headPosition: Coordinate
  tiles: Coordinate[] // an array of (x, y) positions

  constructor(
    name: string, 
    description: string,
    unicode: string,
    maxSize: number, 
    moves: number,
    range: number,
    attack: number, 
    defence: number, 
    headPosition: Coordinate, 
    tiles: Coordinate[]
  ) {
    this.name = name
    this.description = description
    this.unicode = unicode
    this.maxSize = maxSize
    this.moves = moves
    this.range = range
    this.attack = attack
    this.defence = defence
    this.headPosition = headPosition
    tiles: [headPosition] // default to head
  }

//name desc unicode || maxsize moves range atk def
  getStats(): string {
    return `${this.name} | Size: ${this.maxSize}, Moves: ${this.moves}, Range: ${this.range}, Attack: ${this.attack}, Defence: ${this.defence}`
  }

  // Example method: add a new tile position
  addTile(x: number, y: number): void {
    this.tiles.push({ x, y })
  }

  highlightMoves(){
    //this.range
    //this.headPosition
  }

  moveTo(newPosition: Coordinate): void {
    this.headPosition = newPosition
    this.tiles.push(newPosition)
    // If exceeding maxSize, remove the oldest tile
    if (this.tiles.length > this.maxSize) {
      this.tiles.shift() // removes first element
    }
  }

  takeDamage(damage: number){
    const received = damage - this.defence;
    for (let index = 0; index < received; index++) {
      this.tiles.shift();
    }
  }

  // Example method
  introduce(): string {
    return `${this.name}: ${this.description}`
  }
}

//name desc unicode || maxsize moves range atk def
export class Sword extends Piece {
  static name: "Sword";
  static description: "A basic attack piece";
  static unicode: "U+1F5E1";
  constructor(headPosition: Coordinate){
    super("Sword", "A basic attack piece", "U+1F5E1", 3, 2, 1, 2, 0, headPosition, [headPosition])
    //name desc utf || maxsize moves range atk def
  }

  // Sword-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

export class Sword2 extends Piece {
  static name: "Sword2";
  static description: "A basic attack piece";
  static unicode: "U+FE0F";
  constructor(headPosition: Coordinate){
    super("Sword2", "A basic attack piece", "U+FE0F", 3, 2, 1, 2, 0, headPosition, [headPosition])
  }

  // Sword-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}


export class Shield extends Piece {
  static name: "Shield";
  static description: "A basic defence piece";
  static unicode: "U+1F6E1";
  constructor(headPosition: Coordinate){
     super("Shield", "A basic defence piece", "U+1F6E1", 3, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Shield2 extends Piece {
  static name: "Shield2";
  static description: "A basic defence piece";
  static unicode: "U+FE0F";
  constructor(headPosition: Coordinate){
     super("Shield2", "A basic defence piece", "U+FE0F", 3, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Sling extends Piece {
  static name: "Sling";
  static description: "";
  static unicode: "U+1F94F";
  constructor(headPosition: Coordinate){
     super("Sling", "A basic ranged piece", "U+1F94F", 3, 2, 2, 1, 0, headPosition, [headPosition]) //disk
  }
}

export class Bow extends Piece {
  static name: "Bow";
  static description: "";
  static unicode: "U+1F3F9";
  constructor(headPosition: Coordinate){
     super("Bow", "An longer ranged piece", "U+1F3F9", 3, 2, 2, 1, 0, headPosition, [headPosition])
  }
}

export class Treb extends Piece {
  static name: "Treb";
  static description: "";
  static unicode: "U+1F94D";
  constructor(headPosition: Coordinate){
     super("Treb", "A slow but long ranged piece", "U+1F94D", 3, 1, 4, 2, 0, headPosition, [headPosition]) //lacrosse
  }
}

export class Gate extends Piece {
  static name: "Gate";
  static description: "";
  static unicode: "U+26E9";
  constructor(headPosition: Coordinate){
     super("Gate", "A defensive piece friendly units can pass through", "U+26E9 U+FE0F", 1, 1, 0, 0, 2, headPosition, [headPosition])
  }
}

export class Stonewall extends Piece {
  static name: "Stonewall";
  static description: "";
  static unicode: "U+1F9F1";
  constructor(headPosition: Coordinate){
     super("Stonewall", "A very large defensive piece", "	U+1F9F1", 12, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Firewall extends Piece {
  static name: "Firewall";
  static description: "";
  static unicode: "U+1F525";
  constructor(headPosition: Coordinate){
     super("Firewall", "A very large piece with a short attack", "U+1F525", 12, 2, 1, 2, 0, headPosition, [headPosition])
  }
}

export class Trench extends Piece {
  static name: "Trench";
  static description: "";
  static unicode: "U+1F573";
  constructor(headPosition: Coordinate){
     super("Trench", "A large piece that buffs the defense of units inside it", "U+1F573 U+FE0F", 6, 1, 0, 0, 0, headPosition, [headPosition])
  }

  //special method to give +1 def to pieces with headposition inside it
}

export class Mole extends Piece {
  static name: "Mole";
  static description: "";
  static unicode: "U+1F9A1";
  constructor(headPosition: Coordinate){
     super("Mole", "A piece that can tunnel under other units", "U+1F9A1", 1, 2, 0, 0, 0, headPosition, [headPosition]) //	U+1F400 rat
  }

  //burrow
}

export class Lance extends Piece {
  static name: "Lance";
  static description: "";
  static unicode: "U+1F3A0";
  constructor(headPosition: Coordinate){
    super("Lance", "A piece with a strong attack in straight lines", "	U+1F3A0", 3, 3, 3, 2, 0, headPosition, [headPosition])//horse carousel atm //cane: "U+1F9AF"
    //name desc unicode || maxsize moves range atk def
  }

  // Lance-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

export class Trojan extends Piece {
  static name: "Trojan";
  static description: "";
  static unicode: "U+1F434";
  constructor(headPosition: Coordinate){
     super("Trojan", "A that can pass through enemy gates and create copies of itself", "U+1F434", 2, 1, 1, 1, 0, headPosition, [headPosition])//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

export class Cannon extends Piece {
  static name: "Cannon";
  static description: "";
  static unicode: "U+1F52B";
  constructor(headPosition: Coordinate){
     super("Cannon", "A slow ranged piece that can hit multiple targets", "U+1F52B", 1, 1, 6, 3, 0, headPosition, [headPosition]) //water pistol
  }
}

export class Tank extends Piece {
  static name: "Tank";
  static description: "";
  static unicode: "U+1F94C";
  constructor(headPosition: Coordinate){
     super("Tank", "A more mobile cannon with some defense", "U+1F94C", 2, 2, 6, 3, 2, headPosition, [headPosition])//curling stone //cog "U+2699 U+FE0F",
  }
}

export class Bomb extends Piece {
  static name: "Bomb";
  static description: "";
  static unicode: "U+1F4A3";
  constructor(headPosition: Coordinate){
     super("Bomb", "Self destructs to hit multiple targets in a circle", "U+1F4A3", 1, 3, 1, 10, 0, headPosition, [headPosition])
  }
}

export class Dataworm extends Piece {
  static name: "";
  static description: "";
  static unicode: "";
  constructor(headPosition: Coordinate){
     super("Dataworm", "A large piece that can move through other pieces", "U+1F41B", 6, 3, 1, 2, 0, headPosition, [headPosition])
  }

  //tunnel
}

export class Copycat extends Piece {
  static name: "Copycat";
  static description: "";
  static unicode: "U+1F431";
  constructor(headPosition: Coordinate){
     super("Copycat", "Can take on the traits of any piece in range", "U+1F431", 1, 0, 1, 0, 0, headPosition, [headPosition])
  }

  //check for pieces in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

export class Trap extends Piece {
  static name: "Trap";
  static description: "";
  static unicode: "U+1FAA4";
  constructor(headPosition: Coordinate){
     super("Trap", "A piece invisble to the enemy that immobilises pieces moving over it", "U+1FAA4", 1, 1, 0, 0, 0, headPosition, [headPosition])
  }
}
  //check for pieces on top, make their movement 0

export class Mine extends Piece {
  static name: "Mine";
  static description: "";
  static unicode: "U+1F4A5";
  constructor(headPosition: Coordinate){
     super("Mine", "A piece invisble to the enemy that damages pieces moving over it", "U+1F4A5", 1, 1, 0, 3, 0, headPosition, [headPosition])
  }

  //check for pieces on top, damage them
}

export class Spider extends Piece {
  static name: "Spider";
  static description: "";
  static unicode: "U+FE0F";
  //U+1F577 U+FE0F spider trail is trap
  constructor(headPosition: Coordinate){
     super("Spider", "A piece with that freezes pieces in its trail", "U+FE0F", 6, 3, 1, 3, 0, headPosition, [headPosition])
  }

  //check for pieces in path, set their moves to 0
}

//	U+1F9A0 microbe
export class Germ extends Piece {
  static name: "Germ";
  static description: "";
  static unicode: "U+1F9A0";
  constructor(headPosition: Coordinate){
     super("Germ", "A piece that infects other pieces, draining their max size", "U+1F9A0", 1, 4, 1, 0, 0, headPosition, [headPosition])
  }

  //infect a piece, drain it's max size every turn
}

//	U+1F5DC U+FE0F vice hold others in place
export class Vice extends Piece {
  static name: "Vice";
  static description: "";
  static unicode: "U+1F9A0";
  constructor(headPosition: Coordinate){
     super("Vice", "A piece that can reduce other pieces moves to 0", "U+1F9A0", 1, 2, 1, 0, 1, headPosition, [headPosition])
  }

  //set another piece's moves to 0 when in range
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
export class Watchman extends Piece {
  static name: "Watchman";
  static description: "";
  static unicode: "U+1F441";
  constructor(headPosition: Coordinate){
     super("Watchman", "A piece that spots other pieces, reducing their defence", "U+1F441", 2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  //spot, reduce a pieces defence by 1 if not already spotted
}

//	U+1F9F2 magnet
export class Magnet extends Piece {
  static name: "Magnet";
  static description: "";
  static unicode: "U+1F9F2";
  constructor(headPosition: Coordinate){
     super("Magnet", "A piece that moves other pieces", "U+1F9F2", 2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  // pull pieces toward it
}

//	U+1F422 turtle
export class Turtle extends Piece {
  static name: "Turtle";
  static description: "";
  static unicode: "U+1F422";
  constructor(headPosition: Coordinate){
     super("Turtle", "A slow piece with high defence", "U+1F422", 1, 1, 1, 3, 4, headPosition, [headPosition])
  }
  // slow, high defence, snap low range atk
}

//	U+1F997 hopper
export class Hopper extends Piece {
  static name: "Hopper";
  static description: "";
  static unicode: "U+1F997";
  constructor(headPosition: Coordinate){
     super("Hopper", "A piece that can jump over pieces next to it", "U+1F997", 1, 3, 1, 2, 2, headPosition, [headPosition])
  }
  //jump over other pieces next to it
}

//	U+1F9FD sponge
export class Sponge extends Piece {
  static name: "Sponge";
  static description: "";
  static unicode: "U+1F9FD";
  constructor(headPosition: Coordinate){
     super("Sponge", "A piece that can permanently copy stats of nearby pieces", "U+1F9FD", 4, 0, 1, 0, 0, headPosition, [headPosition])
  }
  //choose a stat to absorb from a nearby piece
}

//Angel
//ressurect

//Daemon

//Miner
//collect money



//name desc || maxsize moves range atk def

//all +1 variants get +1 added to non 0 number stats