import type { Coordinate } from "./types"

export class Piece {
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

  getStats(): string {
    return `${this.name} | Size: ${this.maxSize}, Moves: ${this.moves}, Range: ${this.range}, Attack: ${this.attack}, Defence: ${this.defence}`
  }

  // Example method: add a new tile position
  addTile(x: number, y: number): void {
    this.tiles.push({ x, y })
  }

  moveTo(newPosition: Coordinate): void {
    this.headPosition = newPosition
    this.tiles.push(newPosition)
    // If exceeding maxSize, remove the oldest tile
    if (this.tiles.length > this.maxSize) {
      this.tiles.shift() // removes first element
    }
  }

  // Example method
  introduce(): string {
    return `Hi, I am ${this.name}`
  }
}

//name desc unicode || maxsize moves range atk def
export class Sword extends Piece {
  constructor(headPosition: Coordinate){
    super("Sword", "A basic attack piece", "U+1F5E1 U+FE0F", 3, 2, 1, 2, 0, headPosition, [headPosition])
  }

  // Sword-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

//name desc || maxsize moves range atk def
export class Shield extends Piece {
  constructor(headPosition: Coordinate){
     super("Shield", "A basic defence piece", "U+1F6E1 U+FE0F", 3, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Sling extends Piece {
  constructor(headPosition: Coordinate){
     super("Sling", "A basic ranged piece", "	U+1F94F", 3, 2, 2, 1, 0, headPosition, [headPosition]) //disk
  }
}

export class Bow extends Piece {
  constructor(headPosition: Coordinate){
     super("Bow", "An longer ranged piece", "U+1F3F9", 3, 2, 2, 1, 0, headPosition, [headPosition])
  }
}

export class Treb extends Piece {
  constructor(headPosition: Coordinate){
     super("Treb", "A slow but long ranged piece", "U+1F94D", 3, 1, 4, 2, 0, headPosition, [headPosition]) //lacrosse
  }
}

export class Gate extends Piece {
  constructor(headPosition: Coordinate){
     super("Gate", "A defensive piece friendly units can pass through", "U+26E9 U+FE0F", 1, 1, 0, 0, 2, headPosition, [headPosition])
  }
}

export class Stonewall extends Piece {
  constructor(headPosition: Coordinate){
     super("Stonewall", "A very large defensive piece", "	U+1F9F1", 12, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Firewall extends Piece {
  constructor(headPosition: Coordinate){
     super("Firewall", "A very large piece with a short attack", "U+1F525", 12, 2, 1, 2, 0, headPosition, [headPosition])
  }
}

export class Trench extends Piece {
  constructor(headPosition: Coordinate){
     super("Trench", "A large piece that buffs the defense of units inside it", "U+1F573 U+FE0F", 6, 1, 0, 0, 0, headPosition, [headPosition])
  }

  //special method to give +1 def to pieces with headposition inside it
}

export class Mole extends Piece {
  constructor(headPosition: Coordinate){
     super("Mole", "A piece that can tunnel under other units", "U+1F9A1", 1, 2, 0, 0, 0, headPosition, [headPosition]) //	U+1F400 rat
  }

  //burrow
}

export class Lance extends Piece {
  constructor(headPosition: Coordinate){
     super("Lance", "A piece with a strong attack in straight lines", "	U+1F3A0", 3, 3, 3, 2, 0, headPosition, [headPosition])//horse carousel atm //cane: "U+1F9AF"
  }

  //canmoveNormally bool???
  //charge: stright lines only + move
}

export class Trojan extends Piece {
  constructor(headPosition: Coordinate){
     super("Trojan", "A that can pass through enemy gates and create copies of itself", "U+1F434", 2, 1, 1, 1, 0, headPosition, [headPosition])//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

export class Cannon extends Piece {
  constructor(headPosition: Coordinate){
     super("Cannon", "A slow ranged piece that can hit multiple targets", "U+1F52B", 1, 1, 6, 3, 0, headPosition, [headPosition]) //water pistol
  }
}

export class Tank extends Piece {
  constructor(headPosition: Coordinate){
     super("Tank", "A more mobile cannon with some defense", "U+1F94C", 2, 2, 6, 3, 2, headPosition, [headPosition])//curling stone //cog "U+2699 U+FE0F",
  }
}

export class Bomb extends Piece {
  constructor(headPosition: Coordinate){
     super("Bomb", "Self destructs to hit multiple targets in a circle", "U+1F4A3", 1, 3, 1, 10, 0, headPosition, [headPosition])
  }
}

export class Dataworm extends Piece {
  constructor(headPosition: Coordinate){
     super("Dataworm", "A large piece that can move through other pieces", "U+1F41B", 6, 3, 1, 2, 0, headPosition, [headPosition])
  }

  //tunnel
}

export class Copycat extends Piece {
  constructor(headPosition: Coordinate){
     super("Copycat", "Can take on the traits of any piece in range", "U+1F431", 1, 0, 1, 0, 0, headPosition, [headPosition])
  }

  //check for pieces in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

export class Trap extends Piece {
  constructor(headPosition: Coordinate){
     super("Trap", "A piece invisble to the enemy that immobilises pieces moving over it", "U+1FAA4", 1, 1, 0, 0, 0, headPosition, [headPosition])
  }
}
  //check for pieces on top, make their movement 0

export class Mine extends Piece {
  constructor(headPosition: Coordinate){
     super("Mine", "A piece invisble to the enemy that damages pieces moving over it", "U+1F4A5", 1, 1, 0, 3, 0, headPosition, [headPosition])
  }

  //check for pieces on top, damage them
}

//	U+1F422 turtle

//	U+1F997 hopper

//U+1F577 U+FE0F spider trail is trap

//	U+1F9A0 microbe

//	U+1F5DC U+FE0F vice hold others in place

//	U+1F9FD sponge

//	U+1F9F2 magnet


//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye

//name desc || maxsize moves range atk def
//all +1 variants get +1 added to non 0 number stats