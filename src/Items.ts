import type { Coordinate, PieceBlueprint } from "./types"
import { allPieces, type Piece } from "./Pieces"
import type { Player } from "./Player"
import { getRandomUnoccupiedTile, makeBlueprint, pickWeightedRandom } from "./helperFunctions"

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
  targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame' | 'piecesAndBoard' | 'all'
  //variantName: string
  constructor(
    name : string, 
    description : string,
    unicode : string,
    color : string,
    cost: number,
    rarity: number,
    targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame' | 'piecesAndBoard' | 'all',
    //variantName: string
  ) {
    this.id = crypto.randomUUID()
    this.name = name
    this.description = description
    this.unicode = unicode
    this.color = color
    this.cost = cost
    this.rarity = rarity
    this.targetType = targetType
    //this.variantName = variantName
    }

  getItemInfo(): string {
    return `${this.name} | Size: ${this.cost}`
  }

  //method to alter a program's stats, possibly in subclasses
  //or players stats
  abstract apply(target: TTarget, itemMult: number): void;
    /*
    abstract apply(
    target: Piece | Player | Item | PieceBlueprint | GameState
    ): void;
    */
}

export class Mushroom extends Item<PieceBlueprint> {
    static name = "Mushroom";
    static description = "Increases a program's attack by 1";
    static unicode = "U+1F344";
    static color = "#ff2222ff";
    static rarity = 1;
    constructor(){
        super(Mushroom.name, Mushroom.description, Mushroom.unicode, Mushroom.color, 3, Mushroom.rarity, 'blueprint')
    }
    //Increases a program's atk by 
    apply(target: PieceBlueprint, itemMult: number) {
        target.attack += (1* itemMult);
    }
}

export class Meat extends Item<PieceBlueprint> {
    static name = "Meat";
    static description = "Increases a program's attack by 2";
    static unicode = "U+1F356";//Meat "U+1F3CB"; //U+1F356 Large meat
    static color = "#ff5656ff";
    static rarity = 4;
    constructor(){
        super(Meat.name, Meat.description, Meat.unicode, Meat.color, 5, Meat.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.attack += (2* itemMult);
    }
}

export class Iron extends Item<PieceBlueprint> {
    static name = "Iron";
    static description = "Increases a program's defence by 1";
    static unicode = "U+1F96C"
    static color = "#54a4ffff"
    static rarity = 1;
    constructor(){
        super(Iron.name, Iron.description, Iron.unicode, Iron.color, 3, Iron.rarity, 'blueprint')      
    }
    //Increases a program's def by 1
    apply(target: PieceBlueprint, itemMult: number) {
        target.defence += (1* itemMult);
    }
}

export class Garlic extends Item<PieceBlueprint> {
    static name = "Garlic";
    static description = "Increases a placed program's defence by 2";
    static unicode = "U+1F9C4";
    static color = "#26d0faff";
    static rarity = 4;
    constructor(){
        super(Garlic.name, Garlic.description, Garlic.unicode, Garlic.color, 5, Garlic.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.defence += (2* itemMult);
    }
}

export class Ginger extends Item<PieceBlueprint> {
    static name = "Ginger";
    static description = "Increases a program's defence by 3";
    static unicode = "U+1FADA"
    static color = "#54a4ffff"
    static rarity = 6;
    constructor(){
        super(Ginger.name, Ginger.description, Ginger.unicode, Ginger.color, 7, Ginger.rarity, 'blueprint')      
    }
    //Increases a program's def by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.defence += (3* itemMult);
    }
}

//"U+1F356" //meat
 //??"U+26E8";

export class Blueberry extends Item<PieceBlueprint> {
    static name = "Blueberry";
    static description = "Increases a program's max size by 1";
    static unicode = "U+1FAD0";
    static color = "#1cffe1ff";
    static rarity = 1;
    constructor(){
        super(Blueberry.name, Blueberry.description, Blueberry.unicode, Blueberry.color, 3, Blueberry.rarity, 'blueprint')      
    }
    //Increases a program's maxSize by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.maxSize += (1* itemMult);
    }
}

class Melon extends Item<PieceBlueprint> {
    static name = "Melon";
    static description = "+2 max size";
    static unicode = "U+1F349";
    static color = "rgb(17, 110, 71)";
    static rarity = 3;
    constructor(){
        super(Melon.name, Melon.description, Melon.unicode, Melon.color, 5, Melon.rarity, 'blueprint')      
    }
    //Increases a program's maxSize by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.maxSize += (2* itemMult);
    }
}

class Pie extends Item<PieceBlueprint> {
    static name = "Pie";
    static description = "+3 max size";
    static unicode = "U+1F967";
    static color = "rgb(11, 122, 20)";
    static rarity = 4;
    constructor(){
        super(Pie.name, Pie.description, Pie.unicode, Pie.color, 6, Pie.rarity, 'blueprint')      
    }
    //Increases a program's maxSize by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.maxSize += (3* itemMult);
    }
}

class Pepper extends Item<PieceBlueprint> {
    static name = "Pepper";
    static description = "Increases a program's range by 1";
    static unicode = "U+1FAD1" //Radish U+1FADC
    static color = "rgb(255, 188, 43)";
    static rarity = 1;
    constructor(){
        super(Pepper.name, Pepper.description, Pepper.unicode, Pepper.color, 3, Pepper.rarity, 'blueprint')
    }
    //Increases a program's range by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.range += (1* itemMult);
    }
}

export class Carrot extends Item<PieceBlueprint> {
    static name = "Carrot";
    static description = "Increases a program's range by 2";
    static unicode = "U+1F955"//scope "U+1F52D";
    static color = "#fff12bff";
    static rarity = 4;
    constructor(){
        super(Carrot.name, Carrot.description, Carrot.unicode, Carrot.color, 5, Carrot.rarity, 'blueprint')
    }
    //Increases a program's range by 1
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.range += (2* itemMult);
    }
}

export class Juice extends Item<PieceBlueprint> {
    static name = "Juiced";
    static description = "Increases a program's moves by 1";
    static unicode = "U+1F9C3";
    static color = "rgb(255, 227, 71)";
    static rarity = 1;
    constructor(){
        super(Juice.name, Juice.description, Juice.unicode, Juice.color, 1, Juice.rarity, 'blueprint')  
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.moves += (1* itemMult);
    }
}

class Teapot extends Item<PieceBlueprint> {
    static name = "Teapot";//defence?
    static description = "Increases a program's moves by 2";
    static unicode = "U+1FAD6";//BEANS, U+1FAD8
    static color = "#dc00e4ff";
    static rarity = 2;
    constructor(){
        super(Teapot.name, Teapot.description, Teapot.unicode, Teapot.color, 3, Teapot.rarity, 'blueprint')
    }
    //Increases a program's moves by 1
    apply(target: PieceBlueprint, itemMult: number) {
        target.moves += (2* itemMult);
    }
}

export class Coffee extends Item<PieceBlueprint> {
    static name = "Coffee";
    static description = "Increases a program's moves by 3";
    static unicode = "U+2615";
    static color = "#e346f1ff";
    static rarity = 5;
    constructor(){
        super(Coffee.name, Coffee.description, Coffee.unicode, Coffee.color, 5, Coffee.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.moves += (3* itemMult);
    }
}

export class Roids extends Item<PieceBlueprint> {
    static name = "Roids";
    static description = "Increase a program's attack by 1, and moves by 1";//make a program?
    static unicode = "U+1F489";
    static color = "#00e4b3ff";
    static rarity = 3;
    constructor(){
        super(Roids.name, Roids.description, Roids.unicode, Roids.color, 4, Roids.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.attack += (1* itemMult);
        target.moves += (1* itemMult);
    }
}

export class Formula extends Item<PieceBlueprint> {
    static name = "Formula";
    static description = "Increases a program's max size by 1 and defence by 1";
    static unicode = "U+1F37C";
    static color = "#27f743ff";
    static rarity = 2;
    constructor(){
        super(Formula.name, Formula.description, Formula.unicode, Formula.color, 4, Formula.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.maxSize += (1* itemMult);
        target.defence += (1* itemMult);
    }
}

// OLIVE, U+1FAD2

export class Blessing extends Item<PieceBlueprint> {
    static name = "Blessing";
    static description = "Increases all a program's stats by 1";
    static unicode = "U+1F389";
    static color = "#a9ffffff";
    static rarity = 6;
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, Blessing.color, 9, Blessing.rarity, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        console.log('target: ', target)
        target.maxSize += (1* itemMult);
        target.moves += (1* itemMult);
        target.range += (1* itemMult);
        target.attack += (1* itemMult);
        target.defence += (1* itemMult);
    }
}

export class Supplement extends Item<Piece> {
    static name = "Supplement";
    static description = "Increases all a placed program's stats by 1 for one round";
    static unicode = "U+1F48A";
    static color = "#6e0c8bff";
    static rarity = 4;
    constructor(){
        super(Supplement.name, Supplement.description, Supplement.unicode, Supplement.color, 5, Supplement.rarity, 'piece')
    }
    apply(target: Piece, itemMult: number) {
        target.maxSize += (1* itemMult);
        target.moves += (1* itemMult);
        target.movesRemaining += (1* itemMult);
        target.range += (1* itemMult);
        target.attack += (1* itemMult);
        target.defence += (1* itemMult);
    }
}

export class Bandage extends Item<Piece> {
    static name = "Bandage";
    static description = "Removes 1 harmful status effect from a program";
    static unicode = "U+1FA79";
    static color = "#5659ebff";
    static rarity = 2;
    constructor(){
        super(Bandage.name, Bandage.description, Bandage.unicode, Bandage.color, 1, Bandage.rarity, 'piece')
    }
    static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen', 'charmed', 'confused', 'exposed']
    
    apply(target: Piece, _itemMult: number) {
        const activeHarmful = Bandage.harmfulStatuses.filter(
            (statusName) => target.statuses[statusName]
        );

        if (activeHarmful.length === 0) {
            // No harmful statuses to remove
            return;
        }

        // Pick a random harmful status to remove
        const randomIndex = Math.floor(Math.random() * activeHarmful.length);
        const statusToRemove = activeHarmful[randomIndex];

        // Remove it
        target.statuses[statusToRemove] = false;
    }
}

export class Cake extends Item<Piece> {
    static name = "Cake";
    static description = "Hide a non-exposed program";
    static unicode = "U+1F382";
    static color = "rgb(175, 145, 179)";
    static rarity = 4;
    constructor(){
        super(Cake.name, Cake.description, Cake.unicode, Cake.color, 2, Cake.rarity, 'piece')
    }
    apply(target: Piece, _itemMult: number) {
        if(!target.statuses.exposed){
            target.statuses.hidden = true;
        }
    }
}

class Soap extends Item<Piece> {
    static name = "Soap";
    static description = "Removes all harmful status effects from a program";
    static unicode = "U+1F9FC";
    static color = "#821391ff";
    static rarity = 2;
    constructor(){
        super(Soap.name, Soap.description, Soap.unicode, Soap.color, 3, Soap.rarity, 'piece')
    }
    static harmfulStatuses = ['diseased', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen', 'charmed', 'confused', 'exposed']
    apply(target: Piece, _itemMult: number) {
        for (const key of Soap.harmfulStatuses) {
            target.statuses[key] = false;
        }
    }
}

export class Voucher extends Item<Item> {
    static name = "Voucher";
    static description = "Makes one item in the shop free";
    static unicode = "U+1F9FE";
    static color = "#ffd000ff";
    static rarity = 1;
    constructor(){
        super(Voucher.name, Voucher.description, Voucher.unicode, Voucher.color, 3, Voucher.rarity, 'shopItem')
    }
    apply(target: Item | PieceBlueprint ) {
        target.cost = 0
    }
}

export class Rations extends Item<Piece> {
    static name = "Rations";
    static description = "Replenish a programs moves";
    static unicode = "U+1F96B";
    static color = "#f7eb45ff";
    static rarity = 3;
    constructor(){
        super(Rations.name, Rations.description, Rations.unicode, Rations.color, 2, Rations.rarity, 'piece')
    }
    apply(target: Piece, _itemMult: number) {
        target.movesRemaining = target.moves;
    }
}

export class Beans extends Item<Piece> {
    static name = "Beans";
    static description = "Replenish a programs actions";
    static unicode = "U+1FAD8";
    static color = "#f03030ff";
    static rarity = 3;
    constructor(){
        super(Beans.name, Beans.description, Beans.unicode, Beans.color, 2, Beans.rarity, 'piece')
    }
    apply(target: Piece, _itemMult: number) {
        target.actions = 1;
    }
}

export class ShootingStar extends Item<Piece> {
    static name = "Shooting Star";
    static description = "Make a placed program immune to all harmful statuses";
    static unicode = "U+1F320";
    static color = "#1e023dff";
    static rarity = 3;
    constructor(){
        super(ShootingStar.name, ShootingStar.description, ShootingStar.unicode, ShootingStar.color, 2, ShootingStar.rarity, 'piece')
    }
    apply(target: Piece, _itemMult: number) {
        target.immunities = {
            diseased: true,
            slowed: true,
            blinded: true,
            burning: true,
            poisoned: true,
            frozen: true,
            charmed: true,
            confused: true,
            exposed: true,
            hidden: false,
            negative: false
        }
    }
}

//POT OF FOOD, U+1F372

// BENTO BOX, U+1F371 random upgrade item
//// AMPHORA, U+1F3FA Pandora
export class Pandora extends Item<Player> {
    static name = "Pandora";
    static description = "Grants 3 random upgrade items (must have room)";
    static unicode = "U+1F3FA";
    static color = "#e0b24fff";
    static rarity = 6;
    constructor(){
        super(Pandora.name, Pandora.description, Pandora.unicode, Pandora.color, 6, Pandora.rarity, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
    //apply(player: Player, itemMult: number) {
      //  player.addProgram(makeBlueprint(pickWeightedRandom(allPieces, player)));
    //}
}

//move randomgen functions to helper file, import asnd use them them here
export class Gift extends Item<Player> {
    static name = "Gift Box";
    static description = "Grants a random program (must have room)";
    static unicode = "U+1F381";
    static color = "#e9ab27ff";
    static rarity = 2;
    constructor(){
        super(Gift.name, Gift.description, Gift.unicode, Gift.color, 3, Gift.rarity, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
    //apply(player: Player, itemMult: number) {
      //  player.addProgram(makeBlueprint(pickWeightedRandom(allPieces, player)));
    //}
}

export class Genie extends Item<Player> {
  static name = "Genie";
  static description = "Gifts 3 random programs (must have room)";
  static unicode = "U+1F9DE";
  static color = "rgb(108, 126, 230)";
  static rarity = 5;
  constructor() {
   super(Genie.name, Genie.description, Genie.unicode, Genie.color, 5, Genie.rarity, 'player')
  }
  //apply(_player: Player, _itemMult: number) {
  //}
    apply(player: Player, _itemMult: number) {
        player.addProgram(makeBlueprint(pickWeightedRandom(allPieces, player)));
        player.addProgram(makeBlueprint(pickWeightedRandom(allPieces, player)));
        player.addProgram(makeBlueprint(pickWeightedRandom(allPieces, player)));
    }
}

export class Box extends Item<Player> {
    static name = "Mystery Box";
    static description = "Grants a random consumable item";
    static unicode = "U+1F4E6";
    static color = "#926439ff";
    static rarity = 1;
    constructor(){
        super(Box.name, Box.description, Box.unicode, Box.color, 3, Box.rarity, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
}

export class Pinata extends Item<Player> {//untested
    static name = "Pinata";
    static description = "Grants a random admin program (must have room)";
    static unicode = "U+1FA85";
    static color = "#e30dffff";
    static rarity = 3;
    constructor() {
        super(Pinata.name, Pinata.description, Pinata.unicode, Pinata.color, 3, Pinata.rarity, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
}

export class Spanner extends Item<Piece> {
    static name = "Spanner";
    static description = "Prevent a program from moving or taking action for one turn";
    static unicode = "U+1F527";
    static color = "#5a0505ff";
    static rarity = 3;
    constructor(){
        super(Spanner.name, Spanner.description, Spanner.unicode, Spanner.color, 2, Spanner.rarity, 'piece')
        //name desc utf || maxsize moves range atk def
    }
    apply(target: Piece, _itemMult: number) {
        target.movesRemaining = 0;
        target.actions = 0;
    }
}

class Makeover extends Item<Piece> {//admin?
    static name = "Makeover";
    static description = "Remove exposed from a program";
    static unicode = "U+1F485";
    static color = "#f18fedff";
    static rarity = 3;
    constructor(){
        super(Makeover.name, Makeover.description, Makeover.unicode, Makeover.color, 2, Makeover.rarity, 'piece')
        //name desc utf || maxsize moves range atk def
    }
    apply(target: Piece, _itemMult: number) {
        target.statuses.exposed = false;
    }
}

//gameState
export class Wand extends Item<Piece[]> {//TODO test
  static name = "Magic Wand";
  static description = "Undo a turn";
  static unicode = "U+1FA84";
  static color = "#440975ff";
  static rarity = 4;
  constructor() {
    super(Wand.name, Wand.description, Wand.unicode, Wand.color, 7, Wand.rarity, 'gameState')
  }
    apply(_target: Piece[]) {
        //should know previous state of activeprogram's
    }
}

export class Hourglass extends Item<Piece[]> {//TODO test
  static name = "Hourglass";
  static description = "Retry a node without losing a life";
  static unicode = "U+231B";
  static color = "#000000ff";
  static rarity = 5;
  constructor() {
   super(Hourglass.name, Hourglass.description, Hourglass.unicode, Hourglass.color, 10, Hourglass.rarity, 'gameState')
  }
    apply(_target: Piece[]) {//game state from app??
        //receive game state, and map
        //reload level
    }
}

class Extinguisher extends Item<Piece[]> {
  static name = "Extinguisher";
  static description = "Removes burning from all your programs";
  static unicode = "U+1F9EF";
  static color = "#e7aa92ff";
  static rarity = 2;
  constructor() {
   super(Extinguisher.name, Extinguisher.description, Extinguisher.unicode, Extinguisher.color, 2, Extinguisher.rarity, 'gameState')
  }
    apply(activePieces: Piece[], _itemMult: number) {//game state from app??
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.statuses.burning = false;
            }
        });
    }
}

class Plunger extends Item<Piece[]> {//item remove??
  static name = "Plunger";
  static description = "Removes slowed from all your programs";
  static unicode = "U+1FAA0";
  static color = "#82e2ffff";
  static rarity = 2;
  constructor(){
   super(Plunger.name, Plunger.description, Plunger.unicode, Plunger.color, 2, Plunger.rarity, 'gameState')
  }
    apply(activePieces: Piece[], _itemMult: number) {//game state from app??
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.statuses.slowed = false;
            }
        });
    }
}


class Keygen extends Item<Piece[]> {//TODO test
    static name = "Keygen";
    static description = "Lower the defence of all enemy programs in a node by 1";
    static unicode = "U+1F511";
    static color = "#89315aff";
    static rarity = 3;
    constructor() {
    super(Keygen.name, Keygen.description, Keygen.unicode, Keygen.color, 3, Keygen.rarity, 'gameState')
    }
    apply(activePieces: Piece[], itemMult: number) {//game state from app??
        activePieces.forEach(piece => {
            if(piece.team === 'enemy' && piece.getStat('defence') > 0){
                piece.addModifier({defence: 1*(-itemMult)})//test
                piece.defenceRemaining -= (1*(-itemMult))//test
            }
        })
        //receive game state, and map
        //reload level
    }
}

class Bugle extends Item<Piece[]> {
    static name = "Bugle";
    static description = "All placed player programs gain +1 attack";
    static unicode = "U+1F4EF";
    static color = "#ff450dff";
    static rarity = 3;
    constructor(){
        super(Bugle.name, Bugle.description, Bugle.unicode, Bugle.color, 3, Bugle.rarity, 'gameState');
        //name desc utf || maxsize moves range atk def
    }
    apply(activePieces: Piece[], itemMult: number) {
         activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.addModifier({attack: 1 * itemMult})//test
            }
        })
    }
}

class Djembe extends Item<Piece[]> {
    static name = "Drums of War";
    static description = "All placed player programs gain +1 attack and +1 moves";
    static unicode = "U+1FA98";//djembe LONG DRUM,
    static color = "rgb(111, 32, 8)";
    static rarity = 4;
    constructor(){
        super(Djembe.name, Djembe.description, Djembe.unicode, Djembe.color, 3, Djembe.rarity, 'gameState');
        //name desc utf || maxsize moves range atk def
    }
    apply(activePieces: Piece[], itemMult: number) {
         activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.addModifier({attack: 1 * itemMult})//test
                piece.addModifier({moves: 1 * itemMult})//test
            }
        })
    }
}

class Megaphone extends Item<Piece[]> {
    static name = "Pep Talk";
    static description = "All placed player programs gain +1 moves";
    static unicode = "U+1F4E3";
    static color = "#0d86ffff";
    static rarity = 3;
    constructor(){
        super(Megaphone.name, Megaphone.description, Megaphone.unicode, Megaphone.color, 3, Megaphone.rarity, 'gameState');
        //name desc utf || maxsize moves range atk def
    }
    apply(activePieces: Piece[], itemMult: number) {
         activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.addModifier({attack: 1 * itemMult})//test
            }
        })
    }
}

class Battery extends Item<Piece[]> {
    static name = "Fresh Batteries";
    static description = "All placed player programs replenish their moves remaining";
    static unicode = " U+1F50B";
    static color = "#0dff35ff";
    static rarity = 1;
    constructor(){
        super(Battery.name, Battery.description, Battery.unicode, Battery.color, 1, Battery.rarity, 'gameState');
        //name desc utf || maxsize moves range atk def
    }
    apply(activePieces: Piece[], _itemMult: number) {
         activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.resetMoves();
            }
        })
    }
}

//SANDWICH, U+1F96A, all rounder? random stat?
export class Sandwich extends Item<Piece> {
    static name = "Sandwich";
    static description = "Increases all a placed program's stats by 2 for one round";
    static unicode = "U+1F96A";
    static color = "rgb(202, 186, 15)";
    static rarity = 5;
    constructor(){
        super(Sandwich.name, Sandwich.description, Sandwich.unicode, Sandwich.color, 5, Sandwich.rarity, 'piece')
    }
    apply(target: Piece, itemMult: number) {
        target.maxSize += (2* itemMult);
        target.moves += (2* itemMult);
        target.movesRemaining += (2* itemMult);
        target.range += (2* itemMult);
        target.attack += (2* itemMult);
        target.defence += (2* itemMult);
    }
}

class Hotline extends Item {
    static name = "Hotline";
    static description = "load a random friendly program into a node at a random position";
    static unicode = "U+1F4DE";
    static color = "rgb(199, 13, 255)";
    static rarity = 2;
    constructor(){
        super(Hotline.name, Hotline.description, Hotline.unicode, Hotline.color, 2, Hotline.rarity, 'piecesAndBoard')
        //name desc utf || maxsize moves range atk def
    }
    apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }, _itemMult: number) {
        const space = getRandomUnoccupiedTile(board, activePieces);
        if(space){
            const PieceClass = allPieces[Math.floor(Math.random() * allPieces.length)]//true random without player
            const instance = new PieceClass(space, 'piece', activePieces[0].removeCallback, crypto.randomUUID());
            instance.team = 'player';
            //instance.movesRemaining = 0;
            //instance.actions = 0;
            activePieces.push(instance);
        }
    }
}

//target player
export class Floppy extends Item {
    static name = "Update";
    static description = "+1 memory";
    static unicode = "U+1F4BE";
    static color = "#437feeff";
    static rarity = 1;
    constructor(){
        super(Floppy.name, Floppy.description, Floppy.unicode, Floppy.color, 3, Floppy.rarity, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(player: Player) {
        player.memory += 1;
    }
}

export class Update2 extends Item {
    static name = "Update 2.0";
    static description = "+2 memory";
    static unicode = "U+1F4BF";
    static color = "#797979ff";
    static rarity = 3;
    constructor(){
        super(Update2.name, Update2.description, Update2.unicode, Update2.color, 4, Update2.rarity, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(player: Player) {
        player.memory += 2;
    }
}

export class Update3 extends Item {
    static name = "Hardware Upgrade";
    static description = "+1 admin slot";
    static unicode = " U+1F4BD";//"U+1F4C0"; // MINIDISC, U+1F4BD
    static color = "#000000ff";
    static rarity = 6;
    constructor(){
        super(Update3.name, Update3.description, Update3.unicode, Update3.color, 9, Update3.rarity, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(player: Player) {
        player.adminSlots += 1;
    }
}

export class Life extends Item {
    static name = "1-Up";
    static description = "+1 extra life";
    static unicode = "U+1F493";
    static color = "rgb(164, 255, 103)";
    static rarity = 6;
    constructor(){
        super(Life.name, Life.description, Life.unicode, Life.color, 10, Life.rarity, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(player: Player) {
        player.lives += 1;
    }
}

export class Dupe extends Item {
    static name = "Dupe";
    static description = "Duplicate a random Admin, destroy all other admins";
    static unicode = "U+1F942";
    static color = "rgb(153, 4, 91)";
    static rarity = 5;
    constructor(){
        super(Dupe.name, Dupe.description, Dupe.unicode, Dupe.color, 7, Dupe.rarity, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply() {
    /*apply(player: Player) {
      //player.admins
        const randAdmin = player.admins[Math.floor(Math.random()*player.admins.length)]
        const adminClass = allAdmins.find(a => a.name === randAdmin.name);
        if(!adminClass) return;
        player.admins = [randAdmin, new adminClass] //make a new 
        */
    }
}

//JAR, U+1FAD9 - piece? capture an enemy of size 1, turn into blueprint
export class Jar extends Item {//Pokeball?
    static name = "Jar";
    static description = "Use on an enemy with a size of 1 and defence of 0 to add it to your inventory";
    static unicode = "U+1FAD9";
    static color = "rgb(255, 37, 84)";
    static rarity = 3;
    constructor(){
        super(Jar.name, Jar.description, Jar.unicode, Jar.color, 5, Jar.rarity, 'playerAndGame')
        //name desc utf || maxsize moves range atk def
    }
    async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }, _itemMult: number) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(activePieces[idx].team === 'enemy' && activePieces[idx].defenceRemaining <= 0 && activePieces[idx].tiles.length <= 1){
            const bpClass = allPieces.find(p =>
                p.name === activePieces[idx].name
            )
            console.log(bpClass)
            const bp = makeBlueprint(bpClass);
            console.log(bp)
            bp.maxSize = activePieces[idx].getStat('maxSize');
            bp.moves = activePieces[idx].getStat('moves');
            bp.range = activePieces[idx].getStat('range');
            bp.attack = activePieces[idx].getStat('attack');
            bp.defence = activePieces[idx].getStat('defence');
            bp.variantName = activePieces[idx].variantName;
            bp.extraUnicode = activePieces[idx].extraUnicode;
            //check for space?
            player.addProgram(bp)
            activePieces[idx].takeDamage(1);
        }
    }
}

class Chili extends Item<Piece[]> {//HOT PEPPER, U+1F336 - moves +1 range +1
    static name = "Zing";
    static description = "Increases all your placed programs' moves and range by 1 for one round";
    static unicode = "U+1F372";
    static color = "rgb(202, 74, 15)";
    static rarity = 3;
    constructor(){
        super(Chili.name, Chili.description, Chili.unicode, Chili.color, 5, Chili.rarity, 'gameState')
    }
    apply(activePieces: Piece[], itemMult: number) {
        for(const target of activePieces){
            if(target.team === 'player'){
                target.moves += (1* itemMult);
                target.movesRemaining += (1* itemMult);
                target.range += (1* itemMult);
            }
        }
    }
}

class Feast extends Item<Piece[]> {
    static name = "Feast";
    static description = "Increases all your placed programs' stats by 3 for one round";
    static unicode = "U+1F372";
    static color = "rgb(202, 186, 15)";
    static rarity = 6;
    constructor(){
        super(Feast.name, Feast.description, Feast.unicode, Feast.color, 5, Feast.rarity, 'gameState')
    }
    apply(activePieces: Piece[], itemMult: number) {
        for(const target of activePieces){
            if(target.team === 'player'){
                target.maxSize += (3* itemMult);
                target.moves += (3* itemMult);
                target.movesRemaining += (3* itemMult);
                target.range += (3* itemMult);
                target.attack += (3* itemMult);
                target.defence += (3* itemMult);
            }
        }
    }
}

class Lightning extends Item<Piece[]> {//lighting remove 1 tile from all enemy pieces U+26A1
  static name = "Lightning";
  static description = "Removes all defences and 1 tile from all enemies";
  static unicode = "U+26A1";
  static color = "rgb(61, 87, 233)";
  static rarity = 4;
  constructor() {
   super(Lightning.name, Lightning.description, Lightning.unicode, Lightning.color, 2, Lightning.rarity, 'gameState')
  }
    apply(activePieces: Piece[], _itemMult: number) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
                piece.takeDamage(piece.defenceRemaining + 1);
            }
        });
    }
}

//toothbrush - single use broom?
class Toothbrush extends Item<Piece[]> {//lighting remove 1 tile from all enemy pieces U+26A1
  static name = "Toothbrush";
  static description = "Removes all enemies with a size of 1 and 0 defence remaining";
  static unicode = "U+1FAA5";
  static color = "rgb(233, 73, 61)";
  static rarity = 2;
  constructor() {
   super(Toothbrush.name, Toothbrush.description, Toothbrush.unicode, Toothbrush.color, 2, Toothbrush.rarity, 'gameState')
  }
    apply(activePieces: Piece[], _itemMult: number) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
                piece.takeDamage(1);
            }
        });
    }
}

// CLINKING BEER MUGS, Happy Hour U+1F37B
/*export class Beer extends Item<Player> {
    static name = "Happy Hour";
    static description = "Duplicate a random item.";
    static unicode = "U+1F37B";
    static color = "rgb(237, 209, 49)";
    static rarity = 6;
    constructor(){
        super(Beer.name, Beer.description, Beer.unicode, Beer.color, 7, Beer.rarity, 'player')
    }

    apply(player: Player, _itemMult: number) {
        const randItem = player.admins[Math.floor(Math.random()*player.admins.length)]
        const itemClass = allItems.find(a => a.name === randItem.name);
        if(!itemClass) return;
        player.items.push(new itemClass);
    }
}*/

//U+1FAA8 rock damage selected piece
class Rock extends Item {
    static name = "Rock";
    static description = "Damage a piece by the number of currently held programs";
    static unicode = "U+1FAA8";
    static color = "rgb(109, 147, 159)";
    static rarity = 1;
    constructor(){
        super(Rock.name, Rock.description, Rock.unicode, Rock.color, 5, Rock.rarity, 'playerAndGame')
    }
    async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }, itemMult: number) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].takeDamage(player.programs.length * itemMult);
    }
}

//RING BUOY, U+1F6DF revive a dead program
//RING BUOY, U+1F6DF restore the last destroyed program to hand /target a space? or give piece a wontDie bool?
//lifeboat ROWBOAT, U+1F6A3


export const allItems = [Blueberry, Box, Battery, Iron, Juice, Mushroom, Pepper, Rock, Floppy, Voucher, Bandage, Extinguisher, Formula, Gift, Hotline, Plunger, Roids, Teapot, Toothbrush, Beans, Bugle, Jar, Keygen, Makeover, Melon, Megaphone, Pinata, Rations, ShootingStar, Spanner, Supplement, Update2, Chili, Cake, Carrot, Coffee, Djembe, Garlic, Wand, Lightning, Meat, Pie, Soap, Dupe, Genie, Hourglass, Sandwich, Life, Blessing, Feast, Ginger, Pandora, Update3];
export const upgradeItems = [Mushroom, Meat, Iron, Garlic, Ginger, Blueberry, Melon, Pie, Pepper, Carrot, Juice, Teapot, Coffee, Blessing, Roids, Formula]

/*Items.forEach(i => {
    console.log('item name: ', i.name, 'rarity: ', i.rarity);
})*/

//export const activeItems = [Rations, Beans]

export type ItemConstructor = new (...args: any[]) => Item<any>;

console.log('all items: ', allItems.length);

// /SCROLL, U+1F4DC

//PAGE WITH CURL, U+1F4C3

 // U+1F47A

//BLACK HEART SUIT, U+2665
