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
    super(Sword.name, Sword.description, Sword.unicode, 3, 2, 1, 2, 0, headPosition, [headPosition])
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
  static description: "Sword, but two";
  static unicode: "U+FE0F";
  constructor(headPosition: Coordinate){
    super(Sword2.name, Sword2.description, Sword2.unicode, 3, 2, 1, 4, 0, headPosition, [headPosition])
  }

  // Sword-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}


export class Shield extends Piece {
  static name: "Shield";
  static description: "A basic defensive piece";
  static unicode: "U+1F6E1";
  constructor(headPosition: Coordinate){
     super(Shield.name, Shield.description, Shield.unicode, 3, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Aegis extends Piece {
  static name: "Aegis";
  static description: "An advanced defensive piece";
  static unicode: "U+FE0F";
  constructor(headPosition: Coordinate){
     super(Aegis.name, Aegis.description, Aegis.unicode, 3, 2, 0, 0, 1, headPosition, [headPosition])
  }

  //parry next incoming attack (damage the attacker)
}

export class Sling extends Piece {
  static name: "Sling";
  static description: "A basic ranged piece";
  static unicode: "U+1F94F";
  constructor(headPosition: Coordinate){
     super(Sling.name, Sling.description, Sling.unicode, 3, 2, 2, 1, 0, headPosition, [headPosition]) //disk
  }
}

export class Bow extends Piece {
  static name: "Bow";
  static description: "A longer ranged piece";
  static unicode: "U+1F3F9";
  constructor(headPosition: Coordinate){
     super(Bow.name, Bow.description, Bow.unicode, 3, 2, 3, 2, 0, headPosition, [headPosition])
  }
}

export class Treb extends Piece {
  static name: "Treb";
  static description: "A slow moving but long ranged piece with high damage";
  static unicode: "U+1F94D";
  constructor(headPosition: Coordinate){
     super(Treb.name, Treb.description, Treb.unicode, 3, 1, 4, 2, 0, headPosition, [headPosition]) //lacrosse
  }
}

export class Gate extends Piece {
  static name: "Gate";
  static description: "A defensive piece friendly pieces can pass through";
  static unicode: "U+26E9";
  constructor(headPosition: Coordinate){
     super(Gate.name, Gate.description, Gate.unicode, 1, 1, 0, 0, 2, headPosition, [headPosition])
  }
}

export class Stonewall extends Piece {
  static name: "Stonewall";
  static description: "A large defensive piece";
  static unicode: "U+1F9F1";
  constructor(headPosition: Coordinate){
     super(Stonewall.name, Stonewall.description, Stonewall.unicode, 12, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

export class Firewall extends Piece {
  static name: "Firewall";
  static description: "A large defensive piece with a short range attack";
  static unicode: "U+1F525";
  constructor(headPosition: Coordinate){
     super(Firewall.name, Firewall.description, Firewall.unicode, 12, 2, 1, 2, 0, headPosition, [headPosition])
  }
}

export class Trench extends Piece {
  static name: "Trench";
  static description: "A piece that boosts the defence of pieces inside it";
  static unicode: "U+1F573";
  constructor(headPosition: Coordinate){
     super(Trench.name, Trench.description, Trench.unicode, 6, 1, 0, 0, 0, headPosition, [headPosition])
  }

  //special method to give +1 def to pieces with headposition inside it
}

export class Mole extends Piece {
  static name: "Mole";
  static description: "Can burrow under other pieces";
  static unicode: "U+1F9A1";
  constructor(headPosition: Coordinate){
     super(Mole.name, Mole.description, Mole.unicode, 1, 2, 0, 0, 0, headPosition, [headPosition]) //	U+1F400 rat
  }

  //burrow
}

export class Lance extends Piece {
  static name: "Lance";
  static description: "Can charge, attacking multiple targets in one move";
  static unicode: "U+1F3A0";
  constructor(headPosition: Coordinate){
    super(Lance.name, Lance.description, Lance.unicode, 3, 3, 3, 2, 0, headPosition, [headPosition])//horse carousel atm //cane: "U+1F9AF"
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
  static description: "Can create clones of itself";
  static unicode: "U+1F434";
  constructor(headPosition: Coordinate){
     super(Trojan.name, Trojan.description, Trojan.unicode, 1, 1, 1, 1, 0, headPosition, [headPosition])//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

//Trojan horse,
//high defence, slow movement, can sacrifice to spawn a trojan

export class Cannon extends Piece {
  static name: "Cannon";
  static description: "Ranged program that can damage multiple targets in a straight line";
  static unicode: "U+1F52B";
  constructor(headPosition: Coordinate){
     super(Cannon.name, Cannon.description, Cannon.unicode, 1, 1, 6, 3, 0, headPosition, [headPosition]) //water pistol
  }
}

export class Tank extends Piece {
  static name: "Tank";
  static description: "A mobile ranged program with high defence that can damage multiple targets in a straight line";
  static unicode: "U+1F94C";
  constructor(headPosition: Coordinate){
     super(Tank.name, Tank.description, Tank.unicode, 1, 2, 6, 3, 2, headPosition, [headPosition])//curling stone //cog "U+2699 U+FE0F",
  }
}

export class Bomb extends Piece {
  static name: "Bomb";
  static description: "Can be sacrificed to inflict high damage over a wide area";
  static unicode: "U+1F4A3";
  constructor(headPosition: Coordinate){
     super(Bomb.name, Bomb.description, Bomb.unicode, 1, 3, 1, 10, 0, headPosition, [headPosition])
  }
}

export class Dataworm extends Piece {
  static name: "Dataworm";
  static description: "A large program that can tunnel through other pieces";
  static unicode: "U+1F41B";
  constructor(headPosition: Coordinate){
     super(Dataworm.name, Dataworm.description, Dataworm.unicode, 6, 3, 1, 2, 0, headPosition, [headPosition])
  }

  //tunnel
}

export class Copycat extends Piece {
  static name: "Copycat";
  static description: "Can take on the traits of any piece in range";
  static unicode: "U+1F431";
  constructor(headPosition: Coordinate){
     super(Copycat.name, Copycat.description, Copycat.unicode, 1, 0, 1, 0, 0, headPosition, [headPosition])
  }

  //check for pieces in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

export class Trap extends Piece {
  static name: "Trap";
  static description: "A piece invisble to the enemy that immobilises pieces moving over it";
  static unicode: "U+1FAA4";
  constructor(headPosition: Coordinate){
     super(Trap.name, Trap.description, Trap.unicode, 1, 1, 0, 0, 0, headPosition, [headPosition])
  }
}
  //check for pieces on top, make their movement 0

export class Mine extends Piece {
  static name: "Mine";
  static description: "A piece invisble to the enemy that damages pieces moving over it";
  static unicode: "U+1F4A5";
  constructor(headPosition: Coordinate){
     super(Mine.name, Mine.description, Mine.unicode, 1, 1, 0, 3, 0, headPosition, [headPosition])
  }

  //check for pieces on top, damage them
}

export class Spider extends Piece {
  static name: "Spider";
  static description: "A piece with that freezes pieces in its trail";
  static unicode: "U+FE0F";
  //U+1F577 U+FE0F spider trail is trap
  constructor(headPosition: Coordinate){
     super(Spider.name, Spider.description, Spider.unicode, 6, 3, 1, 3, 0, headPosition, [headPosition])
  }

  //check for pieces in path, set their moves to 0
}

//	U+1F9A0 microbe
export class Germ extends Piece {
  static name: "Germ";
  static description: "A piece that infects other pieces, draining their max size over time";
  static unicode: "U+1F9A0";
  constructor(headPosition: Coordinate){
     super(Germ.name, Germ.description, Germ.unicode, 1, 4, 1, 0, 0, headPosition, [headPosition])
  }

  //infect a piece, drain it's max size every turn
}

//	U+1F5DC U+FE0F vice hold others in place
export class Vice extends Piece {
  static name: "Vice";
  static description: "A piece that can reduce other pieces moves to 0";
  static unicode: "U+1F9A0";
  constructor(headPosition: Coordinate){
     super(Vice.name, Vice.description, Vice.unicode, 1, 2, 1, 0, 1, headPosition, [headPosition])
  }

  //set another piece's moves to 0 when in range
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
export class Watchman extends Piece {
  static name: "Watchman";
  static description: "A piece that spots other pieces, reducing their defence";
  static unicode: "U+1F441";
  constructor(headPosition: Coordinate){
     super(Watchman.name, Watchman.description, Watchman.unicode, 2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  //spot, reduce a pieces defence by 1 if not already spotted
}

//	U+1F9F2 magnet
export class Magnet extends Piece {
  static name: "Magnet";
  static description: "A piece that moves other pieces";
  static unicode: "U+1F9F2";
  constructor(headPosition: Coordinate){
     super(Magnet.name, Magnet.description, Magnet.unicode, 2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  // pull pieces toward it
}

//	U+1F422 turtle
export class Turtle extends Piece {
  static name: "Turtle";
  static description: "A slow piece with high defence";
  static unicode: "U+1F422";
  constructor(headPosition: Coordinate){
     super(Turtle.name, Turtle.description, Turtle.unicode, 1, 1, 1, 3, 4, headPosition, [headPosition])
  }
  // slow, high defence, snap low range atk
}

//	U+1F997 hopper
export class Hopper extends Piece {
  static name: "Hopper";
  static description: "A piece that can jump over pieces next to it";
  static unicode: "U+1F997";
  constructor(headPosition: Coordinate){
     super(Hopper.name, Hopper.description, Hopper.unicode, 1, 3, 1, 2, 2, headPosition, [headPosition])
  }
  //jump over other pieces next to it
}

//	U+1F9FD sponge
export class Sponge extends Piece {
  static name: "Sponge";
  static description: "A piece that can permanently copy stats of nearby pieces";
  static unicode: "U+1F9FD";
  constructor(headPosition: Coordinate){
     super(Sponge.name, Sponge.description, Sponge.unicode, 4, 0, 1, 0, 0, headPosition, [headPosition])
  }
  //choose a stat to absorb from a nearby piece
}

//Angel
//ressurect

//Daemon

//passive programs

//Miner
//collect money
//probe
//see level ahead
//Onion
//extra life


//name desc || maxsize moves range atk def

//all +1 variants get +1 added to non 0 number stats