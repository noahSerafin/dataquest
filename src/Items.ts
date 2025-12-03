import type { PieceBlueprint } from "./types"
import type { Piece } from "./Pieces"
import type { Player } from "./Player"

export abstract class Item<TTarget = any> {
  id: string
  static name : string
  static description : string
  static unicode : string
  static color : string
  name : string
  description : string
  unicode : string
  color : string
  cost: number
  rarity: number
  targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame' // ← new

  constructor(
    name : string, 
    description : string,
    unicode : string,
    color : string,
    cost: number,
    rarity: number,
    targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame'
  ) {
    this.id = crypto.randomUUID()
    this.name = name
    this.description = description
    this.unicode = unicode
    this.color = color
    this.cost = cost
    this.rarity = rarity
    this.targetType = targetType
    }

  getItemInfo(): string {
    return `${this.name} | Size: ${this.cost}`
  }

  //method to alter a Pieces stats, possibly in subclasses
  //or players stats
  abstract apply(target: TTarget): void;
    /*
    abstract apply(
    target: Piece | Player | Item | PieceBlueprint | GameState
    ): void;
    */
}

export class Whetstone extends Item<PieceBlueprint> {
    static name = "Whetstone";
    static description = "increases a pieces attack by 1";
    static unicode = "U+1FAA8";
    static color = "#ff2222ff";
    constructor(){
        super(Whetstone.name, Whetstone.description, Whetstone.unicode, Whetstone.color, 3, 1, 'blueprint')
    }
    //increases a pieces atk by 
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.attack += 1;
    }
}

export class Training extends Item<PieceBlueprint> {
    static name: "Training";
    static description: "increases a pieces attack by 2";
    static unicode: "U+1F3CB";
    static color = "#ff5656ff";
    constructor(){
        super(Training.name, Training.description, Training.unicode, Training.color, 5, 4, 'blueprint')
    }
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.attack += 1;
    }
}

export class Iron extends Item<PieceBlueprint> {
    static name = "Iron";
    static description = "increases a pieces defence by 1";
    static unicode = "U+1F96C"
    static color = "#54a4ffff"
    constructor(){
        super(Iron.name, Iron.description, Iron.unicode, Iron.color, 3, 1, 'blueprint')      
    }
    //increases a pieces def by 1
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.defence += 1;
    }
}
//"U+1F356" //meat
 //??"U+26E8";

export class Blueberry extends Item<PieceBlueprint> {
    static name = "Blueberry";
    static description = "increases a pieces max size by 1";
    static unicode = "U+1FAD0";
    static color = "#1cff42ff";
    constructor(){
        super(Blueberry.name, Blueberry.description, Blueberry.unicode, Blueberry.color, 3, 1, 'blueprint')      
    }
    //increases a pieces maxSize by 1
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.maxSize += 1;
    }
}

export class Carrot extends Item<PieceBlueprint> {
    static name = "Carrot";
    static description = "increases a pieces range by 1";
    static unicode = "U+1F955"//scope "U+1F52D";
    static color = "#fff12bff";
    constructor(){
        super(Carrot.name, Carrot.description, Carrot.unicode, Carrot.color, 3, 1, 'blueprint')
    }
    //increases a pieces range by 1
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.range += 1;
    }
}

export class Lightning extends Item<PieceBlueprint> {
    static name = "Lightning";
    static description = "increases a pieces moves by 1";
    static unicode = "U+26A1";
    static color = "#dc00e4ff";
    constructor(){
        super(Lightning.name, Lightning.description, Lightning.unicode, Lightning.color, 3, 1, 'blueprint')
    }
    //increases a pieces moves by 1
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.moves += 1;
    }
}

export class Blessing extends Item<PieceBlueprint> {
    static name = "Blessing";
    static description = "increases all a program's stats by 1";
    static unicode = "U+1F389";
    static color = "#a9ffffff";
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, Blessing.color, 9, 5, 'blueprint')
    }
    apply(target: PieceBlueprint) {
        console.log('target: ', target)
        target.maxSize += 1;
        target.moves += 1;
        target.range += 1;
        target.attack += 1;
        target.defence += 1;
    }
}

export class Supplement extends Item<Piece> {
    static name = "Supplement";
    static description = "increases all a program's stats by 1 for one round";
    static unicode = "U+1F48A";
    static color = "#6e0c8bff";
    constructor(){
        super(Supplement.name, Supplement.description, Supplement.unicode, Supplement.color, 5, 5, 'piece')
    }
    apply(target: Piece) {
        target.maxSize += 1;
        target.moves += 1;
        target.movesRemaining += 1;
        target.range += 1;
        target.attack += 1;
        target.defence += 1;
    }
}

export class Juice extends Item<Piece> {
    static name = "Juice";
    static description = "increases a program's moves by 1 for one round";
    static unicode = "U+1F9C3";
    static color = "#fcff47ff";
    constructor(){
        super(Juice.name, Juice.description, Juice.unicode, Juice.color, 1, 2, 'piece')  
    }
    apply(target: Piece) {
        target.moves += 1;
        target.movesRemaining += 1;
    }
}

export class Roids extends Item<Piece> {
    static name = "Roids";
    static description = "increases all a program's attack by 1 for one round";
    static unicode = "U+1F489";
    static color = "#00e4b3ff";
    constructor(){
        super(Roids.name, Roids.description, Roids.unicode, Roids.color, 1, 2, 'piece')
    }
    apply(target: Piece) {
        target.attack += 1;
    }
}

export class Formula extends Item<Piece> {
    static name = "Formula";
    static description = "increases a program's max size by 1 for one round";
    static unicode = "U+1F37C";
    static color = "#27f743ff";
    constructor(){
        super(Formula.name, Formula.description, Formula.unicode, Formula.color, 1, 2, 'piece')
    }
    apply(target: Piece) {
        target.maxSize += 1;
    }
}

export class Garlic extends Item<Piece> {
    static name = "Garlic";
    static description = "increases a program's defence by 1 for one round";
    static unicode = "U+1F9C4";
    static color = "#26d0faff";
    constructor(){
        super(Garlic.name, Garlic.description, Garlic.unicode, Garlic.color, 1, 2, 'piece')
    }
    apply(target: Piece) {
        target.defence += 1;
    }
}

export class RedMeat extends Item<Piece> {
    static name = "Red Meat";
    static description = "increases a program's attack by 1 for one round";
    static unicode = "U+1F356";
    static color = "#ff3737ff";
    constructor(){
        super(RedMeat.name, RedMeat.description, RedMeat.unicode, RedMeat.color, 1, 2, 'piece')
    }
    apply(target: Piece) {
        target.attack += 1;
    }
}

export class Coffee extends Item<Piece> {
    static name = "Coffee";
    static description = "give a program 3 extra moves once";
    static unicode = "U+2615";
    static color = "#e346f1ff";
    constructor(){
        super(Coffee.name, Coffee.description, Coffee.unicode, Coffee.color, 1, 1, 'piece')
    }
    apply(target: Piece) {
        target.movesRemaining += 1;
    }
}


export class Bandage extends Item<Piece> {
    static name = "Bandage";
    static description = "Removes 1 harmful status effect from a program";
    static unicode = "U+1FA79";
    static color = "#5659ebff";
    constructor(){
        super(Bandage.name, Bandage.description, Bandage.unicode, Bandage.color, 1, 2, 'piece')
    }
    apply(target: Piece) {
        //target.statuses = []
    }
}

export class Soap extends Item<Piece> {
    static name = "Soap";
    static description = "Removes all harmful status effects from a program";
    static unicode = "U+1F9FC";
    static color = "#821391ff";
    constructor(){
        super(Soap.name, Soap.description, Soap.unicode, Soap.color, 3, 4, 'piece')
    }
    apply(target: Piece) {
        //target.statuses = []
    }
}

export class Voucher extends Item<Item> {
    static name = "Voucher";
    static description = "Makes one item in the shop free";
    static unicode = "U+1F9FE";
    static color = "#ffd000ff";
    constructor(){
        super(Voucher.name, Voucher.description, Voucher.unicode, Voucher.color, 3, 1, 'shopItem')
    }
    apply(target: Item | PieceBlueprint ) {
        target.cost = 0
    }
}

export class Mushroom extends Item<Piece> {
    static name = "Beserker Mushroom";
    static description = "Replenish a programs moves and actions";
    static unicode = "U+1F344";
    static color = "#5c0000ff";
    constructor(){
        super(Mushroom.name, Mushroom.description, Mushroom.unicode, Mushroom.color, 3, 4, 'piece')
    }
    apply(target: Piece) {
        target.movesRemaining = target.moves;
        target.actions = 1;
    }
}

export class Rations extends Item<Piece> {
    static name = "Rations";
    static description = "Replenish a programs moves";
    static unicode = "U+1F96B";
    static color = "#f7eb45ff";
    constructor(){
        super(Rations.name, Rations.description, Rations.unicode, Rations.color, 2, 3, 'piece')
    }
    apply(target: Piece) {
        target.movesRemaining = target.moves;
    }
}

export class Beans extends Item<Piece> {
    static name = "Beans";
    static description = "Replenish a programs actions";
    static unicode = "U+1FAD8";
    static color = "#f03030ff";
    constructor(){
        super(Beans.name, Beans.description, Beans.unicode, Beans.color, 2, 3, 'piece')
    }
    apply(target: Piece) {
        target.actions = 1;
    }
}

//target all ActivePieces
//megaphone U+1F4E3
//Bugle, U+1F4EF, "+1 attack for all placed programs"
//"Marching Drum" U+1F941 "+1 moves for all placed programs";

//hotline, U+1F4DE
//load a random program into the level

//BATTERY, Fresh Batteries U+1F50B
//renew all placed programs moves

//target player
// OPTICAL DISC, U+1F4BF +1 memory

//FLOPPY DISK, U+1F4BE +1 memory

// golden disc, U+1F4C0 +1 admin slot

export class Box extends Item<Player> {
    static name = "Mystery Box";
    static description = "Grants a random consumable item";
    static unicode = "U+1F4E6";
    static color = "#926439ff";
    constructor(){
        super(Box.name, Box.description, Box.unicode, Box.color, 3, 3, 'player')
    }
    apply(target: Player) {
        //check there is room (- this item)
        //if(target.memory > target.programs.length + (target.items.length-1)){
           // randomItem = //makerandomItem from allItems

           // target.items.push(randomItem)
       // }
    }
}

//WRAPPED PRESENT, U+1F381
//grants a rare item

class Genie extends Item<Player> {
  static name = "Genie";
  static description = "Gifts 3 random programs (must have room)";
  static unicode = "U+1F9DE";
  static color = "#0dbaffff";
  constructor() {
   super(Genie.name, Genie.description, Genie.unicode, Genie.color, 5, 3, 'player')
  }
    apply(target: Player) {
        //bring up list of programs from collection, allow 3 to be selected
        //target.programs.push()
    }
  //create any program, keep track of uses
  //after 3 destroy genie
}

export class Pinata extends Item {//untested
    static name: "Pinata";
    static description: "Grants a random admin program";
    static unicode: "U+1FA85";
    static color = "#e30dffff";
    constructor(){
        super(Pinata.name, Pinata.description, Pinata.unicode, Pinata.color, 3, 3, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(target: Player): void {
        //handled in App for now
    }
}

export class Wand extends Item {//TODO
  static name = "Magic Wand";
  static description = "Undo a turn";
  static unicode = " U+1FA84";
  static color = "#440975ff";
  constructor() {
    super(Wand.name, Wand.description, Wand.unicode, Wand.color, 7, 5, 'gameState')
  }
    apply(target: Piece[]) {
        //should know previous state of activePieces
    }
}

class Hourglass extends Item {//TODO
  static name = "Hourglass";
  static description = "Retry a round";
  static unicode = "U+231B";
  static color = "#000000ff";
  constructor() {
   super(Hourglass.name, Hourglass.description, Hourglass.unicode, Hourglass.color, 10, 4, 'gameState')
  }
  apply(target: Player) {//game state from app??
       //receive game state, and map
    //reload level
    }

}

export const allItems = [Whetstone, Iron, Blueberry, Carrot, Lightning, Blessing, Supplement, Juice, Roids, Formula, Garlic, RedMeat, Coffee, Bandage, Soap, Voucher, Mushroom, Rations, Beans, Box, Genie, Wand, Hourglass]

export type ItemConstructor = new (...args: any[]) => Item<any>;

// /SCROLL, U+1F4DC

//PAGE WITH CURL, U+1F4C3

// IZAKAYA LANTERN, U+1F3EE range

//PIG, U+1F416 money?

// / HOT PEPPER, U+1F336

 //GINGER ROOT, U+1FADA

 // U+1F47A

// / RING, U+1F48D

//BOXING GLOVE, U+1F94A

//RECEIPT, U+1F9FE

//POSTAL HORN, U+1F4EF

//djembe LONG DRUM, U+1FA98

//PACKAGE, U+1F4E6

//BLACK HEART SUIT, U+2665

//lifeboat ROWBOAT, U+1F6A3

//statuses
//status symbols
//negative:
//burning, poisoned/diseased, slowed, charmed
//OVERHEATED FACE, U+1F975 overheating
//NAUSEATED FACE, U+1F922
//FACE WITH OPEN MOUTH VOMITING, U+1F92E
//FACE WITH OPEN MOUTH AND COLD SWEAT, U+1F630
// SNEEZING FACE, U+1F927
// FACE WITH HEAD-BANDAGE, U+1F915
//FREEZING FACE, U+ slowed
//HEART WITH ARROW, U+1F498 charmed
//positive:
//FACE WITH FINGER COVERING CLOSED LIPS, U+1F92B hidden
//negative