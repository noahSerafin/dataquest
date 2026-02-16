import type { PieceBlueprint } from "./types"
import { allPieces, type Piece } from "./Pieces"
import type { Player } from "./Player"
import { makeBlueprint, pickWeightedRandom } from "./helperFunctions"

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
    constructor(){
        super(Mushroom.name, Mushroom.description, Mushroom.unicode, Mushroom.color, 3, 1, 'blueprint')
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
    constructor(){
        super(Meat.name, Meat.description, Meat.unicode, Meat.color, 5, 4, 'blueprint')
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
    constructor(){
        super(Iron.name, Iron.description, Iron.unicode, Iron.color, 3, 1, 'blueprint')      
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
    constructor(){
        super(Garlic.name, Garlic.description, Garlic.unicode, Garlic.color, 5, 4, 'blueprint')
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
    constructor(){
        super(Ginger.name, Ginger.description, Ginger.unicode, Ginger.color, 7, 6, 'blueprint')      
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
    constructor(){
        super(Blueberry.name, Blueberry.description, Blueberry.unicode, Blueberry.color, 3, 1, 'blueprint')      
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
    constructor(){
        super(Melon.name, Melon.description, Melon.unicode, Melon.color, 5, 3, 'blueprint')      
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
    constructor(){
        super(Pie.name, Pie.description, Pie.unicode, Pie.color, 6, 4, 'blueprint')      
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
    constructor(){
        super(Pepper.name, Pepper.description, Pepper.unicode, Pepper.color, 3, 1, 'blueprint')
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
    constructor(){
        super(Carrot.name, Carrot.description, Carrot.unicode, Carrot.color, 5, 4, 'blueprint')
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
    constructor(){
        super(Juice.name, Juice.description, Juice.unicode, Juice.color, 1, 1, 'blueprint')  
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
    constructor(){
        super(Teapot.name, Teapot.description, Teapot.unicode, Teapot.color, 3, 2, 'blueprint')
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
    constructor(){
        super(Coffee.name, Coffee.description, Coffee.unicode, Coffee.color, 5, 4, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.moves += (3* itemMult);
    }
}

export class Roids extends Item<PieceBlueprint> {
    static name = "Roids";
    static description = "Increase a program's attack by 1, and moves by 1";
    static unicode = "U+1F489";
    static color = "#00e4b3ff";
    constructor(){
        super(Roids.name, Roids.description, Roids.unicode, Roids.color, 4, 2, 'blueprint')
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
    constructor(){
        super(Formula.name, Formula.description, Formula.unicode, Formula.color, 4, 2, 'blueprint')
    }
    apply(target: PieceBlueprint, itemMult: number) {
        target.maxSize += (1* itemMult);
        target.defence += (1* itemMult);
    }
}

export class Blessing extends Item<PieceBlueprint> {
    static name = "Blessing";
    static description = "Increases all a program's stats by 1";
    static unicode = "U+1F389";
    static color = "#a9ffffff";
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, Blessing.color, 9, 6, 'blueprint')
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

/*class Reinforcement extends Item<PieceBlueprint> {
    static name = "Reinforcement";
    static description = "Increases a program's defence by 2";
    static unicode = "U+1F529"//GARLIC, U+1F9C4 // GINGER ROOT, U+1FADA
    static color = "#54a4ffff"
    constructor(){
        super(Reinforcement.name, Reinforcement.description, Reinforcement.unicode, Reinforcement.color, 5, 4, 'blueprint')      
    }
    //Increases a program's def by 1
    apply(target: PieceBlueprint, itemMult: number) {
        target.defence += (2* itemMult);
    }
}*/

export class Supplement extends Item<Piece> {
    static name = "Supplement";
    static description = "Increases all a placed program's stats by 1 for one round";
    static unicode = "U+1F48A";
    static color = "#6e0c8bff";
    constructor(){
        super(Supplement.name, Supplement.description, Supplement.unicode, Supplement.color, 5, 5, 'piece')
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
/*

export class RedMeat extends Item<Piece> {
    static name = "Red Meat";
    static description = "Increases a placed program's attack by 1 for one round";
    static unicode = "U+1F356";
    static color = "#ff3737ff";
    constructor(){
        super(RedMeat.name, RedMeat.description, RedMeat.unicode, RedMeat.color, 1, 2, 'piece')
    }
    apply(target: Piece, itemMult: number) {
        target.attack += (1* itemMult);
    }
}
*/


export class Bandage extends Item<Piece> {
    static name = "Bandage";
    static description = "Removes 1 harmful status effect from a program";
    static unicode = "U+1FA79";
    static color = "#5659ebff";
    constructor(){
        super(Bandage.name, Bandage.description, Bandage.unicode, Bandage.color, 1, 2, 'piece')
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

export class Soap extends Item<Piece> {
    static name = "Soap";
    static description = "Removes all harmful status effects from a program";
    static unicode = "U+1F9FC";
    static color = "#821391ff";
    constructor(){
        super(Soap.name, Soap.description, Soap.unicode, Soap.color, 3, 4, 'piece')
    }
    static harmfulStatuses = ['diseasd', 'slowed', 'blinded', 'burning', 'poisoned', 'frozen','charmed', 'confused', 'exposed']
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
    constructor(){
        super(Voucher.name, Voucher.description, Voucher.unicode, Voucher.color, 3, 1, 'shopItem')
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
    constructor(){
        super(Rations.name, Rations.description, Rations.unicode, Rations.color, 2, 3, 'piece')
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
    constructor(){
        super(Beans.name, Beans.description, Beans.unicode, Beans.color, 2, 3, 'piece')
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
    constructor(){
        super(ShootingStar.name, ShootingStar.description, ShootingStar.unicode, ShootingStar.color, 2, 3, 'piece')
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
    constructor(){
        super(Pandora.name, Pandora.description, Pandora.unicode, Pandora.color, 5, 3, 'player')
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
    constructor(){
        super(Gift.name, Gift.description, Gift.unicode, Gift.color, 3, 3, 'player')
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
  static color = "#0dbaffff";
  constructor() {
   super(Genie.name, Genie.description, Genie.unicode, Genie.color, 5, 3, 'player')
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
    constructor(){
        super(Box.name, Box.description, Box.unicode, Box.color, 3, 3, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
}

export class Pinata extends Item<Player> {//untested
    static name = "Pinata";
    static description = "Grants a random admin program (must have room)";
    static unicode = "U+1FA85";
    static color = "#e30dffff";
    constructor() {
        super(Pinata.name, Pinata.description, Pinata.unicode, Pinata.color, 3, 3, 'player')
    }
    apply(_player: Player, _itemMult: number) {
    }
}

export class Spanner extends Item<Piece> {
    static name = "Spanner";
    static description = "Prevent a program from moving or taking action for one turn";
    static unicode = "U+1F527";
    static color = "#5a0505ff";
    constructor(){
        super(Spanner.name, Spanner.description, Spanner.unicode, Spanner.color, 2, 3, 'piece')
        //name desc utf || maxsize moves range atk def
    }
    apply(target: Piece, _itemMult: number) {
        target.movesRemaining = 0;
        target.actions = 0;
    }
}

class Makeover extends Item<Piece> {
    static name = "Makeover";
    static description = "Remove exposed from a program";
    static unicode = "U+1F485";
    static color = "#f18fedff";
    constructor(){
        super(Makeover.name, Makeover.description, Makeover.unicode, Makeover.color, 2, 3, 'piece')
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
  constructor() {
    super(Wand.name, Wand.description, Wand.unicode, Wand.color, 7, 4, 'gameState')
  }
    apply(_target: Piece[]) {
        //should know previous state of activeprogram's
    }
}

class Hourglass extends Item<Piece[]> {//TODO test
  static name = "Hourglass";
  static description = "Retry a node without losing a life";
  static unicode = "U+231B";
  static color = "#000000ff";
  constructor() {
   super(Hourglass.name, Hourglass.description, Hourglass.unicode, Hourglass.color, 10, 5, 'gameState')
  }
    apply(_target: Piece[]) {//game state from app??
        //receive game state, and map
        //reload level
    }
}

//affect all programs
////KEY, U+1F511 keygen item

class Extinguisher extends Item<Piece[]> {
  static name = "Extinguisher";
  static description = "Removes burning from all your programs";
  static unicode = "U+1F9EF";
  static color = "#e7aa92ff";
  constructor() {
   super(Extinguisher.name, Extinguisher.description, Extinguisher.unicode, Extinguisher.color, 2, 2, 'gameState')
  }
    apply(activePieces: Piece[], _itemMult: number) {//game state from app??
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.statuses.burning = false;
            }
        });
    }
}

class Keygen extends Item<Piece[]> {//TODO test, unfinished
  static name = "Keygen";
  static description = "Lower the defence of all enemy programs in a node (not working)";
  static unicode = "U+1F511";
  static color = "#89315aff";
  constructor() {
   super(Keygen.name, Keygen.description, Keygen.unicode, Keygen.color, 3, 2, 'gameState')
  }
    apply(activePieces: Piece[], itemMult: number) {//game state from app??
        activePieces.forEach(piece => {
            if(piece.team === 'enemy' && piece.getStat('defence') > 0){
                piece.addModifier({defence: 1*(-itemMult)})//test
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
    constructor(){
        super(Bugle.name, Bugle.description, Bugle.unicode, Bugle.color, 3, 3, 'gameState');
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

class Megaphone extends Item<Piece[]> {
    static name = "Pep Talk";
    static description = "All placed player programs gain +1 moves";
    static unicode = "U+1F4E3";
    static color = "#0d86ffff";
    constructor(){
        super(Megaphone.name, Megaphone.description, Megaphone.unicode, Megaphone.color, 3, 3, 'gameState');
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
    constructor(){
        super(Battery.name, Battery.description, Battery.unicode, Battery.color, 1, 1, 'gameState');
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
//HAMMER, U+1F528

/*
class Hotline extends Item {
    static name = "Hotline";
    static description = "load a random friendly program into a node at a random position";
    static unicode = "U+1F4DE";
    static color = "#ffb20dff";
    constructor(){
        super(Hotline.name, Hotline.description, Hotline.unicode, Hotline.color, 2, 1, 'piecesAndBoard')
        //name desc utf || maxsize moves range atk def
    }
    apply({activePieces, board }: {activePieces: Piece[], board: Coordinate[] }) {
        const space = getRandomUnoccupiedTile(board, activePieces);
        if(space){
            const PieceClass = allPieces[Math.floor(Math.random() * allPieces.length)]//true random without player
            const instance = new PieceClass(space, 'piece', activePieces[0].removeCallback, crypto.randomUUID());
            instance.movesRemaining = 0;
            instance.actions = 0;
            activePieces.push(instance);
        }
    }
}
*/

//RING BUOY, U+1F6DF restore the last destroyed program to hand /target a space? or give piece a wontDie bool?

//target all Activeprogram's
//megaphone U+1F4E3
//Bugle, U+1F4EF, "+1 attack for all placed programs"

///////////////////////////////////////////////////////////////////////////////////

//target player
export class Floppy extends Item {
    static name = "Update";
    static description = "+1 memory";
    static unicode = "U+1F4BE";
    static color = "#437feeff";
    constructor(){
        super(Floppy.name, Floppy.description, Floppy.unicode, Floppy.color, 3, 1, 'player')
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
    constructor(){
        super(Update2.name, Update2.description, Update2.unicode, Update2.color, 4, 3, 'player')
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
    constructor(){
        super(Update3.name, Update3.description, Update3.unicode, Update3.color, 6, 9, 'player')
        //name desc utf || maxsize moves range atk def
    }
    apply(player: Player) {
        player.adminSlots += 1;
    }
}

//PIG, U+1F416 random money?
//update x3, hotline buoy bugle batteries pig 9
export const allItems = [Mushroom, Meat, Iron, Garlic, Ginger, Blueberry, Melon, Pie, Pepper, Carrot, Juice, Teapot, Coffee, Blessing, Supplement, Juice, Roids, Formula, Garlic, Coffee, Bandage, Soap, Voucher, Mushroom, Rations, Beans, Pandora, Box, Genie, Gift, Pinata, Extinguisher, Wand, Hourglass, Spanner, Makeover, ShootingStar, Keygen, Bugle, Megaphone, Battery, Floppy, Update2, Update3]
export const upgradeItems = [Mushroom, Meat, Iron, Garlic, Ginger, Blueberry, Melon, Pie, Pepper, Carrot, Juice, Teapot, Coffee, Blessing, Roids, Formula]
//export const activeItems = [Rations, Beans]

export type ItemConstructor = new (...args: any[]) => Item<any>;

console.log('all items: ', allItems.length);

//RING BUOY, U+1F6DF revive a dead program
// /SCROLL, U+1F4DC

//PAGE WITH CURL, U+1F4C3
// POT OF FOOD, U+1F372

// / HOT PEPPER, U+1F336

 //GINGER ROOT, U+1FADA

 // U+1F47A

// / RING, U+1F48D

//BOXING GLOVE, U+1F94A

//RECEIPT, U+1F9FE

//POSTAL HORN, U+1F4EF

//djembe LONG DRUM, U+1FA98

//BLACK HEART SUIT, U+2665

//lifeboat ROWBOAT, U+1F6A3