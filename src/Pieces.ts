import type { Coordinate } from "./types"

export abstract class Piece {
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

  constructor(
    maxSize: number, 
    moves: number,
    range: number,
    attack: number, 
    defence: number, 
    headPosition: Coordinate, 
    tiles: Coordinate[]
  ) {
    const cls = this.constructor as typeof Piece;
    this.name = cls.name
    this.description = cls.description
    this.unicode = cls.unicode
    this.color = cls.color
    this.maxSize = maxSize
    this.moves = moves
    this.range = range
    this.attack = attack
    this.defence = defence
    this.headPosition = headPosition
    this.tiles = [headPosition] // default to head
  }

//name desc unicode || maxsize moves range atk def
  getStats(): string {
    return `${this.name} | Size: ${this.maxSize}, Moves: ${this.moves}, Range: ${this.range}, Attack: ${this.attack}, Defence: ${this.defence}`
  }

  // Example method: add a new tile position
  addTile(x: number, y: number): void {
    this.tiles.push({ x, y })
  }

  highlightMove(){
    this.moves
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
class Sword extends Piece {
  static name = "Sword";
  static description = "A basic attack piece";
  static unicode = "U+1F5E1";
  static color = "#dddcd7";
  constructor(headPosition: Coordinate){
  super(3, 2, 1, 2, 0, headPosition, [headPosition])
    //name desc utf || maxsize moves range atk def
  }

  // Sword-specific ability example
  charge(target: Piece): void {
    console.log(`${this.name} charges at ${target.name}!`)
    target.tiles.forEach(tile => console.log(`Hits tile at (${tile.x}, ${tile.y})`))
  }
}

class Sword2 extends Piece {
  static name = "Sword2";
  static description = "Sword, but two";
  static unicode = "U+2694";
  static color = "#dddcd7";
  constructor(headPosition: Coordinate){
  super(3, 2, 1, 4, 0, headPosition, [headPosition])
  }

  // Sword-specific ability example
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
  constructor(headPosition: Coordinate){
   super(3, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

class Aegis extends Piece {
  static name = "Aegis";
  static description = "An advanced defensive piece";
  static unicode = "U+26FB";
  static color = "#2fa7ca";
  constructor(headPosition: Coordinate){
   super(3, 2, 0, 0, 1, headPosition, [headPosition])
  }

  //parry next incoming attack (damage the attacker)
}

class Sling extends Piece {
  static name = "Sling";
  static description = "A basic ranged piece";
  static unicode = "U+1F94F";
  static color = "#019700";
  constructor(headPosition: Coordinate){
   super(3, 2, 2, 1, 0, headPosition, [headPosition]) //disk
  }
}

class Bow extends Piece {
  static name = "Bow";
  static description = "A longer ranged piece";
  static unicode = "U+1F3F9";
  static color = "#019700";
  constructor(headPosition: Coordinate){
   super(3, 2, 3, 2, 0, headPosition, [headPosition])
  }
}

class SAM extends Piece {
  static name = "SAM";
  static description = "A slow moving but long ranged piece with high damage";
  static unicode = "U+1F680";//"U+1F94D";
  static color = "#019700";
  constructor(headPosition: Coordinate){
   super(3, 1, 4, 2, 0, headPosition, [headPosition]) //lacrosse
  }
}

class Gate extends Piece {
  static name = "Gate";
  static description = "A defensive piece friendly pieces can pass through";
  static unicode = "U+13208";//"U+26E9";
  static color = "#ffa700";
  constructor(headPosition: Coordinate){
   super(1, 1, 0, 0, 2, headPosition, [headPosition])
  }
}

class Stonewall extends Piece {
  static name = "Stonewall";
  static description = "A large defensive piece";
  static unicode = "U+1F9F1";
  static color = "#ffa700";
  constructor(headPosition: Coordinate){
   super(12, 2, 0, 0, 1, headPosition, [headPosition])
  }
}

class Firewall extends Piece {
  static name = "Firewall";
  static description = "A large defensive piece with a short range attack";
  static unicode = "U+1F525";
  static color = "#ff0000";
  constructor(headPosition: Coordinate){
   super(12, 2, 1, 2, 0, headPosition, [headPosition])
  }
}

class Trench extends Piece {
  static name = "Trench";
  static description = "A piece that boosts the defence of pieces inside it";
  static unicode = "U+1F573";
  static color = "#5d3900";
  constructor(headPosition: Coordinate){
   super(6, 1, 0, 0, 0, headPosition, [headPosition])
  }

  //special method to give +1 def to pieces with headposition inside it
}

class Mole extends Piece {
  static name = "Mole";
  static description = "Can burrow under other pieces";
  static unicode = "U+1F9A1";
  static color = "#727272";
  constructor(headPosition: Coordinate){
   super(1, 2, 0, 0, 0, headPosition, [headPosition]) //	U+1F400 rat
  }

  //burrow
}

class Lance extends Piece {
  static name = "Lance";
  static description = "Can charge, attacking multiple targets in one move";
  static unicode = "U+1F3A0";
  static color = "#f9f9f9";
  constructor(headPosition: Coordinate){
  super(3, 3, 3, 2, 0, headPosition, [headPosition])//horse carousel atm //cane: "U+1F9AF"
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
  static color = "#7c0000";
  constructor(headPosition: Coordinate){
   super(1, 1, 1, 1, 0, headPosition, [headPosition])//horse head atm //military helmet "U+1FA96"
  }
  //canpassThroughbool?

  //copyself
}

//Trojan horse,
//high defence, slow movement, can sacrifice to spawn a trojan

class Cannon extends Piece {
  static name = "Cannon";
  static description = "Ranged program that can damage multiple targets in a straight line";
  static unicode = "U+1F52B";
  static color = "#2e2e2e";
  constructor(headPosition: Coordinate){
   super(1, 1, 6, 3, 0, headPosition, [headPosition]) //water pistol
  }
}

class Tank extends Piece {
  static name = "Tank";
  static description = "A mobile ranged program with high defence that can damage multiple targets in a straight line";
  static unicode = "U+1F94C";
  static color = "#00470a";
  constructor(headPosition: Coordinate){
   super(1, 2, 6, 3, 2, headPosition, [headPosition])//curling stone //cog "U+2699 U+FE0F",
  }
}

class Bomb extends Piece {
  static name = "Bomb";
  static description = "Can be sacrificed to inflict high damage over a wide area";
  static unicode = "U+1F4A3";
  static color = "#000000";
  constructor(headPosition: Coordinate){
   super(1, 3, 1, 10, 0, headPosition, [headPosition])
  }
}

class Dataworm extends Piece {
  static name = "Dataworm";
  static description = "A large program that can tunnel through other pieces";
  static unicode = "U+1FAB1";//"U+1F41B";
  static color = "#c031c3";
  constructor(headPosition: Coordinate){
   super(6, 3, 1, 2, 0, headPosition, [headPosition])
  }

  //tunnel
}

class Copycat extends Piece {
  static name = "Copycat";
  static description = "Can take on the traits of any piece in range";
  static unicode = "U+1F63C";//"U+1F431";
  static color = "#fff643";
  constructor(headPosition: Coordinate){
   super(1, 0, 1, 0, 0, headPosition, [headPosition])
  }

  //check for pieces in range, inheret methods from them
  //take largest maxSize, moves, atk, def too
}

class Trap extends Piece {
  static name = "Trap";
  static description = "A piece invisble to the enemy that immobilises pieces moving over it";
  static unicode = "U+1FAA4";
  static color = "#686026";
  constructor(headPosition: Coordinate){
   super(1, 1, 0, 0, 0, headPosition, [headPosition])
  }
}
  //check for pieces on top, make their movement 0

class Mine extends Piece {
  static name = "Mine";
  static description = "A piece invisble to the enemy that damages pieces moving over it";
  static unicode = "U+1F4A5";
  static color = "#ff9d00";
  constructor(headPosition: Coordinate){
   super(1, 1, 0, 3, 0, headPosition, [headPosition])
  }

  //check for pieces on top, damage them
}

class Spider extends Piece {
  static name = "Spider";
  static description = "A piece with that freezes pieces in its trail";
  static unicode = "U+1F577";
  static color = "#a8743f";
  //U+1F577 U+FE0F spider trail is trap
  constructor(headPosition: Coordinate){
   super(6, 3, 1, 3, 0, headPosition, [headPosition])
  }

  //check for pieces in path, set their moves to 0
}

//scorpian
//posion, damage and reduce movement and  of enemy by 1

//	U+1F9A0 microbe
class Germ extends Piece {
  static name = "Germ";
  static description = "A piece that infects other pieces, draining their max size over time";
  static unicode = "U+1F9A0";
  static color = "#27ff00";
  constructor(headPosition: Coordinate){
   super(1, 4, 1, 0, 0, headPosition, [headPosition])
  }

  //infect a piece, drain it's max size every turn
}

//	U+1F5DC U+FE0F vice hold others in place
class Vice extends Piece {
  static name = "Vice";
  static description = "A piece that can reduce other pieces moves to 0";
  static unicode = "U+1F5DC";
  static color = "#f5d58d";
  constructor(headPosition: Coordinate){
   super(1, 2, 1, 0, 1, headPosition, [headPosition])
  }

  //set another piece's moves to 0 when in range
}

//	U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F eye
class Watchman extends Piece {
  static name = "Watchman";
  static description = "A piece that spots other pieces, reducing their defence";
  static unicode = "U+1F441";
  static color = "#6730cf";
  constructor(headPosition: Coordinate){
   super(2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  //spot, reduce a pieces defence by 1 if not already spotted
}

//	U+1F9F2 magnet
class Magnet extends Piece {
  static name = "Magnet";
  static description = "A piece that moves other pieces";
  static unicode = "U+1F9F2";
  static color = "#f12020";
  constructor(headPosition: Coordinate){
   super(2, 2, 3, 0, 0, headPosition, [headPosition])
  }

  // pull pieces toward it
}

//	U+1F422 turtle
class Turtle extends Piece {
  static name = "Turtle";
  static description = "A slow piece with high defence";
  static unicode = "U+1F422";
  static color = "#84cd48";
  constructor(headPosition: Coordinate){
   super(1, 1, 1, 3, 4, headPosition, [headPosition])
  }
  // slow, high defence, snap low range atk
}

//	U+1F997 hopper
class Hopper extends Piece {
  static name = "Hopper";
  static description = "A piece that can jump over pieces next to it";
  static unicode = "U+1F997";
  static color = "#9aff46";
  constructor(headPosition: Coordinate){
   super(1, 3, 1, 2, 2, headPosition, [headPosition])
  }
  //jump over other pieces next to it
}

//	U+1F9FD sponge
class Sponge extends Piece {
  static name = "Sponge";
  static description = "A piece that can permanently copy stats of nearby pieces";
  static unicode = "U+1F9FD";
  static color = "#ffd446";
  constructor(headPosition: Coordinate){
   super(4, 0, 1, 0, 0, headPosition, [headPosition])
  }
  //choose a stat to absorb from a nearby piece
}


export const Allpieces = [Sword, Sword2, Shield, Aegis, Sling, Bow, SAM, Gate, Stonewall, Firewall, Trench, Lance, Mole, Trojan, Cannon, Tank, Bomb, Dataworm, Copycat, Trap, Mine, Spider, Germ, Vice, Watchman, Magnet, Turtle, Hopper, Sponge ];

//snowball moving increases max size,// and movement speed?

//SUPERVILLAIN, U+1F9B9
//generate money on a piece's destruction


//STOPWATCH, U+23F1 rewind an emenies move

//flute U+1FA88 decoy enemies

//MILITARY HELMET, U+1FA96

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