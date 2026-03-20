import { Item } from "./Items";
import { Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate, PieceBlueprint, StatModifier, StatusKey } from "./types";

export type AdminTrigger =
  | 'onPlacement'
  | 'onEnemyTurnEnd'
  | 'onTurnEnd'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onDealDamage' //piece id of receiver?
  | 'onReceiveDamage'
  | 'onPieceDestruction'
  | 'other';

export abstract class Admin<
  TTarget = any,
  TTrigger extends AdminTrigger = AdminTrigger
> extends Item<TTarget> {
  triggerType: TTrigger;

  constructor(
    name: string,
    description: string,
    unicode: string,
    color: string,
    cost: number,
    rarity: number,
    targetType: "blueprint" | "piece" | "shopItem" | "player" | "gameState"  | 'playerAndGame' | 'piecesAndBoard' | 'all',
    triggerType: TTrigger
  ) {
    super(name, description, unicode, color, cost, rarity, targetType);
    this.triggerType = triggerType;
  }

  async apply(_target: any):Promise<void>{
    //do not destroy the admin
  }
  remove(_target: any):void{

  }
  getModifier(): StatModifier {//remove this???
    return {}
  }

  onRoundEnd?(): void | Promise<void>;
}

class Meteor extends Admin {
  static name = "Meteor";
  static description = "Deals 2 damage to every piece at the start of a round";
  static unicode = "U+2604";//"U+1F71A"
  static color = "#000000ff";
  static rarity = 5;
  constructor() {
    super(Meteor.name, Meteor.description, Meteor.unicode, Meteor.color, 10, Meteor.rarity, 'gameState', 'onRoundStart')
  }

  //onRoundStart
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces) await p.takeDamage(2);
  }
}

class Miner extends Admin {
  static name = "Miner";
  static description = "Collect $2 at the end of every round";
  static unicode = "U+26CF";
  static color = "#ffa600d3";
  static rarity = 1;
  constructor() {
    super(Miner.name, Miner.description, Miner.unicode, Miner.color, 5, Miner.rarity, 'player', 'onRoundEnd')
  }

  //noRoundend
  async apply({ player }: { player: Player }) {
    player.bonusReward += 2
  }
  //
}

export class Bubble extends Admin {
  static name = "Bubble";
  static description = "Gain +$1 bonus interest every round, 10% chance to pop and reset, also reducing money to 0";
  static unicode = "U+1FAE7";
  static color = "#0400daff";
  static rarity = 2;
  constructor() {
    super(Bubble.name, Bubble.description, Bubble.unicode, Bubble.color, 5, Bubble.rarity, 'player', 'onRoundEnd')
  }
  private count = 1;
  //at end of round
  async apply({ player }: { player: Player }) {
    //calc 10% chance for pop
    const pop = Math.random() < 0.1;
    if(pop){
      player.money = 0
      player.bonusInterest = 0
    }else{
      player.bonusInterest += this.count;
      this.count ++
    }

  }

}

export class Crystal extends Admin {//test
  static name = "Crystal Ball";
  static description = "See the next shop in advance";//and show hidden nodes?
  static unicode = "U+1F52E";
  static color = "#4b003bff";
  static rarity = 1;
  constructor() {
    super(Crystal.name, Crystal.description, Crystal.unicode, Crystal.color, 3, Crystal.rarity, 'gameState', 'other')
  }
  //modify app for this one
}

class Clover extends Admin {
  static name = "Lucky Clover";
  static description = "+30% chance of rarer items appearing";
  static unicode = "U+1F340";
  static color = "#00ff0dff";
  static rarity = 2;
  constructor() {
    super(Clover.name, Clover.description, Clover.unicode, Clover.color, 7, Clover.rarity, 'gameState', 'other')//shop state, on round end? on OpenShop?
  }
  //interact with shop, modify shop for this
}

class Onion extends Admin {
  static name = "Onion";
  static description = "Saves you from one lost round but is destroyed in the process";
  static unicode = "U+1F9C5";
  static color = "#00af17ad";
  static rarity = 5;
  constructor() {
    super(Onion.name, Onion.description, Onion.unicode, Onion.color, 10, Onion.rarity, 'gameState', 'other')
  }
  //
  //async apply({ player }: { player: Player }) {
    //player.lives += 1
  //}//add a if for player death to remove this
}
//name desc utf || maxsize moves range atk def
class Blood extends Admin {
  static name = "Blood Tax";
  static description = "Each time your attacks deal damage, earn $1";//overkills only?
  static unicode = "U+1FA78";
  static color = "#790000ff";
  static rarity = 3;
  constructor() {
    super(Blood.name, Blood.description, Blood.unicode, Blood.color, 10, Blood.rarity, 'player', 'onDealDamage')//player?
  }

  //on damage
  async apply({ player }: { player: Player }) {
    player.money += 1 //enemy pieces only?
  }
  
}

class Razor extends Admin {
  static name = "Razor";
  static description = "+1 attack to all your placed programs";
  static unicode = "U+1FA92";
  static color = "#ff4040ff";
  static rarity = 3;
  constructor() {
    super(Razor.name, Razor.description, Razor.unicode, Razor.color, 6, Razor.rarity, 'gameState', 'onPlacement')
  }
  
  //on placement/after hydration
  async apply({ id, activePieces }: {  id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({attack: 1})//enemy pieces only?  
  }
}

class BionicArm extends Admin {
  static name = "Bionic Arms";
  static description = "Raises all your program's attack by 2";
  static unicode = "U+1F9BE";
  static color = "#ff4040ff";
  static rarity = 4;
  constructor() {
    super(BionicArm.name, BionicArm.description, BionicArm.unicode, BionicArm.color, 7, BionicArm.rarity, 'gameState', 'onPlacement')
  }
  
  //on placement/after hydration
  async apply({ id, activePieces }: {  id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({attack: 2})//enemy pieces only?  
  }
}

class BionicLeg extends Admin {
  static name = "Bionic Legs";
  static description = "Raises all your program's moves by 2";
  static unicode = "U+1F9BF";
  static color = "#d240ffff";
  static rarity = 4;
  constructor() {
    super(BionicLeg.name, BionicLeg.description, BionicLeg.unicode, BionicLeg.color, 7, BionicLeg.rarity, 'gameState', 'onPlacement')
  }

  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({moves: 2})
    activePieces[idx].movesRemaining += 2;
  }
}

class Convenience extends Admin {
  static name = "Convenience Store";
  static description = "Open the shop any time (still only reloads for free at shop nodes)";
  static unicode = "U+1F3EA";
  static color = "#55ff71ff";
  static rarity = 2;
  constructor() {
    super(Convenience.name, Convenience.description, Convenience.unicode, Convenience.color, 4, Convenience.rarity, 'gameState', 'other')//shop
  }
  //modify shop/player
}

class Department extends Admin {
  static name = "Department Store";
  static description = "+3 shop slots, 1 Program, 1 Item, and 1 Admin";
  static unicode = "U+1F3EC";
  static color = "#bebebeff";
  static rarity = 3;
  constructor() {
    super(Department.name, Department.description, Department.unicode, Department.color, 5, Department.rarity, 'gameState', 'other')//shop
  }
  //modify shop/player bool for this
}

class Eye extends Admin {
  static name = "Evil Eye";
  static description = "Lower's the defences of all enemy progams by 1 at the start of a round";
  static unicode = "U+1F9FF";
  static color = "#020072ff";
  static rarity = 4;
  constructor() {
    super(Eye.name, Eye.description, Eye.unicode, Eye.color, 8, Eye.rarity, 'gameState', 'onRoundStart')
  }
  
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='enemy'){
        p.addModifier({defence: -1})//enemy pieces only?
      }
    }
  }
}

class Bouquet extends Admin {//duplicates showing up anyway
  static name = "Bouquet";
  static description = "Held admin programs can reappear in the shop";
  static unicode = "U+1F490";
  static color = "#e758e7ff";
  static rarity = 3;
  constructor() {
    super(Bouquet.name, Bouquet.description, Bouquet.unicode, Bouquet.color, 3, Bouquet.rarity, 'gameState', 'other')//shop
  }
  //shop, disable for now
}

class Heartbreaker extends Admin {//make a boss
  static name = "Heartbreaker";
  static description = "Makes your programs immune to being charmed on placement";
  static unicode = "U+1F494";//charmed symbol? "U+1F498";
  static color = "#7e054fff";
  static rarity = 1;
  constructor() {
    super(Heartbreaker.name, Heartbreaker.description, Heartbreaker.unicode, Heartbreaker.color, 5, Heartbreaker.rarity, 'gameState', 'onPlacement')
  }

  //on placement
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.charmed = true;
  }
}

class Hamsa extends Admin {
  static name = "Hamsa";
  static description = "Your program's get +3 defence on placement";
  static unicode = "U+1FAAC";
  static color = "rgb(41, 51, 192)";
  static rarity = 5;
  constructor() {
    super(Hamsa.name, Hamsa.description, Hamsa.unicode, Hamsa.color, 8, Hamsa.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 3})
  }
}

class Relay extends Admin {
  static name = "Relay";
  static description = "All placed programs with a range bigger than 1 on placement gain +1 attack";
  static unicode = "U+1F4E1";
  static color = "rgb(226, 94, 42)";
  static rarity = 2;
  constructor() {
    super(Relay.name, Relay.description, Relay.unicode, Relay.color, 5, Relay.rarity, 'gameState', 'onPlacement')
  }

  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    if(activePieces[idx].team==='player' && activePieces[idx].getStat('range') > 1){
      activePieces[idx].addModifier({attack: 2})
    }
  }
}

class Parachute extends Admin {
  static name = "Parachute";
  static description = "Saves a program from destruction once, then is deleted";
  static unicode = "U+1FA82";//RING BUOY, U+1F6DF
  static color = "#55ffe8ff";
  static rarity = 1;
  constructor() {
    super(Parachute.name, Parachute.description, Parachute.unicode, Parachute.color, 5, Parachute.rarity, 'gameState', 'other')
  }
}

class Notepad extends Admin {
  static name = "Notepad";
  static description = "Increases memory by 1";
  static unicode = "U+1F4DD";//"U+1F4C4";//"U+1F5C7";
  static color = "#4b4b4bff";
  static rarity = 1;
  constructor() {
    super(Notepad.name, Notepad.description, Notepad.unicode, Notepad.color, 3, Notepad.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.memory += 1
  }
  remove({ player }: { player: Player }) {
    player.memory -= 1
  }
}

// GLOBE WITH MERIDIANS, U+1F310
class AdminMap extends Admin {
  static name = "World Map";
  static description = "See incoming node structures in advance";
  static unicode = "U+1F30D";
  static color = "#001cbbff";
  static rarity = 2;
  constructor() {
    super(AdminMap.name, AdminMap.description, AdminMap.unicode, AdminMap.color, 3, AdminMap.rarity, 'gameState', 'other')
  }
  //player bool
}

export class PetriDish extends Admin {// status test unfinished: make enemies spread to fellow enemies
  static name = "Petri Dish";
  static description = "Harmful status effects spread to adjacent enemy programs at the end of your turn";//effect all programs??
  static unicode = "U+1F9EB";
  static color = "#14532dff";
  static rarity = 4;
  constructor() {
    super(PetriDish.name, PetriDish.description, PetriDish.unicode, PetriDish.color, 7, PetriDish.rarity, 'gameState', 'onTurnEnd')
  }
  //on turn end
  async apply({ id: _id, activePieces }: { id: string; activePieces: Piece[] }) {
    const enemies = activePieces.filter(p => p.team === 'enemy');
    const toApply: Array<{ piece: Piece; status: StatusKey }> = [];

    for (const piece of activePieces) {
      for (const enemy of enemies) {
        const isAdjacent = piece.tiles.some(st =>
          enemy.tiles.some(tt =>
          Math.abs(st.x - tt.x) + Math.abs(st.y - tt.y) === 1
        )
      );

        if (!isAdjacent) continue;

        for (const statusKey of Object.keys(piece.statuses) as StatusKey[]) {
          if (piece === enemy) continue;
          if (statusKey === 'negative') continue;
          if (statusKey === 'hidden') continue;
          if (!piece.statuses[statusKey]) continue;
          if (enemy.immunities?.[statusKey]) continue;

          toApply.push({ piece: enemy, status: statusKey });
        }
      }
    }
    for (const { piece, status } of toApply) {
      piece.statuses[status] = true;
    }
  }
}

export class Volatile extends Admin {//handled in app
  static name = "Volatile";
  static description = "Status effects are doubled (+1 status mult)";
  static unicode = "U+1F9EA";
  static color = "#00ff22c7";
  static rarity = 4;
  constructor() {
    super(Volatile.name, Volatile.description, Volatile.unicode, Volatile.color, 6, Volatile.rarity, 'gameState', 'onTurnEnd')
  }
}

class Inheritance extends Admin {
  static name = "Inheritance";
  static description = "Earn double your interest after winning a round, does not stack";
  static unicode = "U+1F911";
  static color = "#ffc955ff";
  static rarity = 5;
  constructor() {
    super(Inheritance.name, Inheritance.description, Inheritance.unicode, Inheritance.color, 10, Inheritance.rarity, 'player', 'onRoundEnd')//onroundend, but we handle outside
  }
  async apply({ player }: { player: Player }) {
    player.bonusReward += ((player.nextInterest + player.bonusInterest) * 2)
  }
}

export class CreditCard extends Admin {
  static name = "Credit Card";
  static description = "Go up to $20 in debt";
  static unicode = "U+1F4B3";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(CreditCard.name, CreditCard.description, CreditCard.unicode, CreditCard.color, 1, CreditCard.rarity, 'gameState', 'other')//shop
  }
  //shop lower limit change
}

class Needle extends Admin {//needs some kind of nerf, increase max size only?
  static name = "Needle";
  static description = "Winning a round with one program placed boosts all it's stats by one permanently";
  static unicode = "U+1FAA1";
  static color = "rgb(209, 89, 193)";
  static rarity = 6;
  constructor() {
    super(Needle.name, Needle.description, Needle.unicode, Needle.color, 10, Needle.rarity, 'playerAndGame', 'onRoundEnd')//6 and player?
  }
  async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    for (const p of activePieces){
      const playerPieces = [];
      if(p.team==='player'){
        playerPieces.push(p)
        //p.addModifier({lives: 1})
      }
      if(playerPieces.length === 1){//we find by activepieces, not by no. of placed bps
       //needs to interact with the blueprint
       const bpID = playerPieces[0].id
       const idx = player.programs.findIndex(p => p.id === bpID);
       player.programs[idx].maxSize += 1;
       player.programs[idx].moves += 1;
       player.programs[idx].attack += 1;
       player.programs[idx].range += 1;
       player.programs[idx].defence += 1;
      }
    }
  }
}

class Rune extends Admin {
  static name = "Rune";//
  static description = "Programs with a range of 1 on attacking get +1 damage multiplyer";
  static unicode = "U+16B1";
  static color = "#640909ff";
  static rarity = 3;
  constructor() {
    super(Rune.name, Rune.description, Rune.unicode, Rune.color, 5, Rune.rarity, 'gameState', 'onDealDamage')
  }
  //onDamage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    if(activePieces[idx].getStat('range') === 1){
      activePieces[idx].damageMult += 1;
    }
  }
}

class Joker extends Admin {
  static name = "Joker";
  static description = "+0.5 damage multiplyer on attacking";
  static unicode = "U+1F0CF";
  static color = "#ff5555";
  static rarity = 2;
  constructor() {
    super(Joker.name, Joker.description, Joker.unicode, Joker.color, 7, Joker.rarity, 'piece', 'onDealDamage')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].damageMult += 0.5;
  }
}

export class Chemistry extends Admin {//test
  static name = "Chemistry"; //bon appetite U+1F37D
  static description = "Items that affect stats effects are doubled (+1 item effect mult)";
  static unicode = "U+232C";//"U+2697";//BENZENE RING, U+232C  
  static color = "#4eb95cff";
  static rarity = 5;
  constructor() {
    super(Chemistry.name, Chemistry.description, Chemistry.unicode, Chemistry.color, 6, Chemistry.rarity, 'gameState', 'other')//on Item use
  }
  //seperate flag for this
}

class Aesculapius extends Admin {
  static name = "Aesculapius";//CADUCEUS, U+2624
  static description = "All placed programs are immune to posion and disease";
  static unicode = "U+2695";
  static color = "#084610ff";
  static rarity = 2;
  constructor() {
    super(Aesculapius.name, Aesculapius.description, Aesculapius.unicode, Aesculapius.color, 4, Aesculapius.rarity, 'gameState', 'onPlacement')//or gamestate?
  }

  //on placement
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.poisoned = true
    activePieces[idx].immunities.diseased = true
  }
}

class Heart extends Admin {//change
  static name = "Heart";
  static description = "+1 max size and +1 moves on placement";
  static unicode = "U+1FAC0";
  static color = "#750731";
  static rarity = 2;
  constructor() {
    super(Heart.name, Heart.description, Heart.unicode, Heart.color, 5, Heart.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: 1})
    activePieces[idx].addModifier({moves: 1})
  }
}

class Bone extends Admin {//change
  static name = "Big Boned";
  static description = "Programs all gain +2 max size on placement";
  static unicode = "U+1F9B4";
  static color = "rgb(61, 17, 0)";
  static rarity = 3;
  constructor() {
    super(Bone.name, Bone.description, Bone.unicode, Bone.color, 5, Bone.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: 2})
  }
}

class RollerBlades extends Admin {
  static name = "Rollers";
  static description = "Programs all gain +3 moves on placement";
  static unicode = "U+1F6FC";
  static color = "#0e409eff";
  static rarity = 5;
  constructor() {
    super(RollerBlades.name, RollerBlades.description, RollerBlades.unicode, RollerBlades.color, 8, RollerBlades.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({moves: 3})
    activePieces[idx].movesRemaining += 3;
  }
}

class Lungs extends Admin {
  static name = "Cardio";
  static description = "Programs all gain a temporary +3 moves after each turn";//+3 temp moves? would negate slowed
  static unicode = "U+1FAC1";
  static color = "rgb(146, 14, 158)";
  static rarity = 5;
  constructor() {
    super(Lungs.name, Lungs.description, Lungs.unicode, Lungs.color, 10, Lungs.rarity, 'gameState', 'onTurnEnd');//'onPlacement');
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for(const piece of activePieces){
      if(piece.team === 'player'){
        piece.addTempModifier({moves: 4})
      }
    }
    //const idx = activePieces.findIndex(p => p.id === id);
    //activePieces[idx].addModifier({moves: 4})
    //activePieces[idx].movesRemaining += 4;
  }
}

class Brain extends Admin {//unfinished, actionsHandler in Piececontroller playing up, or canAttack bool being set false somewhere?
  static name = "Machine Learning";
  static description = "Every space of free memory in your inventory gives +1 attack to your programs on load";
  static unicode = "U+1F9E0";
  static color = "#570606";
  static rarity = 5;
  constructor() {
    super(Brain.name, Brain.description, Brain.unicode, Brain.color, 9, Brain.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({attack: Math.round(player.freeMemory)})
  }
}

class GoldenTicket extends Admin {
  static name = "Golden Ticket";
  static description = "Skip a non boss level for $5 (no reward or interest earned)";
  static unicode = "U+1F3AB";
  static color = "#dfba42ff";
  static rarity = 1;
  constructor() {
    super(GoldenTicket.name, GoldenTicket.description, GoldenTicket.unicode, GoldenTicket.color, 5, GoldenTicket.rarity, 'gameState', 'other');
  }
}

class Dove extends Admin {// PEACE SYMBOL, U+262E // HERB, Olive branch U+1F33F
  static name = "Dove";
  static description = "1 free move after placing at the start of every round";
  static unicode = "U+1F54A";//🕊️ ////CHURCH, sanctuary U+26EA
  static color = "rgb(77, 156, 170)";
  static rarity = 4;
  constructor() {
    super(Dove.name, Dove.description, Dove.unicode, Dove.color, 7, Dove.rarity, 'gameState', 'other')
  }
  //bool
}

class Stonks extends Admin {
  static name = "Stonks";
  static description = "+1 interest for every $5 you have";
  static unicode = "U+1F4C8";
  static color = "#55ff6cff";
  static rarity = 3;
  constructor() {
    super(Stonks.name, Stonks.description, Stonks.unicode, Stonks.color, 5, Stonks.rarity, 'player', 'onRoundEnd')
  }

  //on end of round
  async apply({ player }: { player: Player }) {
    const noOfFives = Math.floor(player.money / 5) //round down
    player.bonusInterest += noOfFives//reset after round
  }

}

class Trolley extends Admin {
  static name = "Schoolbag";//"Trolley";
  static description = "Items only use 0.5 memory each";
  static unicode = "U+1F392";// "U+1F6D2";
  static color = "#55fff1ff";
  static rarity = 1;
  constructor() {
    super(Trolley.name, Trolley.description, Trolley.unicode, Trolley.color, 3, Trolley.rarity, 'player', 'other')//'player')??
  }
  async apply({ player }: { player: Player }) {
   player.hasTrolley = true;
  }
  async remove({ player }: { player: Player }) {
   player.hasTrolley = false;
  }
}

export class Toolbox extends Admin {
  static name = "Toolbox";
  static description = "Programs only use 0.5 memory each";
  static unicode = "U+1F9F0";
  static color = "#ff55c6ff";
  static rarity = 3;
  constructor() {
    super(Toolbox.name, Toolbox.description, Toolbox.unicode, Toolbox.color, 5, Toolbox.rarity, 'player', 'other')//'player')??
  }
  async apply({ player }: { player: Player }) {
   player.hasToolbox = true;
  }
  async remove({ player }: { player: Player }) {
   player.hasToolbox = false;
  }
}

class Backdoor extends Admin {
  static name = "Backdoor";
  static description = "Load Progams anywhere";
  static unicode = "U+1F6AA";
  static color = "#0a0a0aff";
  static rarity = 4;
  constructor() {
    super(Backdoor.name, Backdoor.description, Backdoor.unicode, Backdoor.color, 8, Backdoor.rarity, 'gameState', 'other')
  }
  //bool for placement function
}

class Communism extends Admin {
  static name = "Communism";
  static description = "+1 all stats to all placed programs while money is under 5";
  static unicode = "U+262D";
  static color = "#ff0000ff";
  static rarity = 3;
  constructor() {
    super(Communism.name, Communism.description, Communism.unicode, Communism.color, 5, Communism.rarity, 'playerAndGame', 'onPlacement')
  }

  //on placement
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    if(player.money<=4){
      const idx = activePieces.findIndex(p => p.id === id);
      activePieces[idx].addModifier({
            attack: 1,
            defence: 1,
            maxSize: 1,
            moves: 1,
            range: 1
      });
    }
  }
}

export class Palette extends Admin {
  static name = "Palette";
  static description = "Place twice at the start of a round";
  static unicode = "U+1F3A8";
  static color = "rgb(255, 212, 131)";
  static rarity = 4;
  constructor() {
    super(Palette.name, Palette.description, Palette.unicode, Palette.color, 6, Palette.rarity, 'gameState', 'other')
  }
  //round logic edit
}

class Osiris extends Admin {
  static name = "Osiris";
  static description = "+1 damage to all your placed programs each time a program is destroyed";
  static unicode = "U+13080";//horus: "U+1314A";
  static color = "#33073bff";
  static rarity = 6;
  constructor() {
    super(Osiris.name, Osiris.description, Osiris.unicode, Osiris.color, 8, Osiris.rarity, 'gameState', 'onPieceDestruction')
  }
  //on receive damage //on piece destrcution
  async apply({ id: _id, activePieces }: {id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({attack: 1})
      }
    }
  }
}

class Slots extends Admin {
  static name = "Slots";
  static description = "Rerolls in the next shop cost $2 less";//can fix by moving reroll calculation into player
  static unicode = "U+1F3B0";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(Slots.name, Slots.description, Slots.unicode, Slots.color, 5, Slots.rarity, 'gameState', 'other')//shop
  }
  //shop edit
}

class Newspaper extends Admin {
  static name = "Millwall Brick";
  static description = "+1 damage for programs with a range of 1 on load";
  static unicode = " U+1F5DE";//U+1F4F0";
  static color = "#eb1919ff";
  static rarity = 2;
  constructor() {
    super(Newspaper.name, Newspaper.description, Newspaper.unicode, Newspaper.color, 1, Newspaper.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    if(activePieces[idx].team==='player' && activePieces[idx].getStat('range')===1){
      activePieces[idx].addModifier({attack: 1})
    }
  }
}

class Crown extends Admin {
  static name = "Tithe";
  static description = "Gain $5 every round";// U+1FA8E
  static unicode = " U+1F451";
  static color = "rgb(119, 32, 122)";
  static rarity = 3;
  constructor() {
    super(Crown.name, Crown.description, Crown.unicode, Crown.color, 9, Crown.rarity, 'player', 'onRoundEnd')//maybe player
  }
  //on round end
  async apply({ player }: { player: Player }) {
   player.bonusReward += 5;
  }
}

class Cactus extends Admin {
  static name = "Cactus";
  static description = "Programs retaliate 1 damage when they are attacked";
  static unicode = "U+1F335";
  static color = "#dfb372ff";
  static rarity = 2;
  constructor() {
    super(Cactus.name, Cactus.description, Cactus.unicode, Cactus.color, 4, Cactus.rarity, 'gameState', 'onReceiveDamage')//pieces?
  }
  //on receive damage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    await activePieces[idx].takeDamage(1);
  }
}

export class Compass extends Admin {
  static name = "Compass";
  static description = "Shows nodes that are normally hidden";//make the path red/white? keep the hidden nodes hidden
  static unicode = "U+1F9ED";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(Compass.name, Compass.description, Compass.unicode, Compass.color, 2, Compass.rarity, 'gameState', 'other')
  }
  //map edit
}

class OffRoader extends Admin {
  static name = "Off Roader";
  static description = "Travel to nodes on different paths to your own";
  static unicode = "U+1F699";
  static color = "#00791eff";
  static rarity = 1;
  constructor() {
    super(OffRoader.name, OffRoader.description, OffRoader.unicode, OffRoader.color, 2, OffRoader.rarity, 'gameState', 'other')
  }
  //map edit
}

export class Seed extends Admin {
  static name = "Seed";
  static description = "Raises maximum interest by $5";
  static unicode = "U+1F331";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(Seed.name, Seed.description, Seed.unicode, Seed.color, 10, Seed.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
   player.interestCap += 5;
  }
  remove({ player }: { player: Player }) {
   player.interestCap -= 5;
  }
}

class Puzzle extends Admin {
  static name = "Puzzle Piece";
  static description = "Pieces with an ally adjacent to their head temporarily gain +1 defence until the start of your next turn";
  static unicode = "U+1F9E9";
  static color = "#55b0ff";
  static rarity = 3;
  constructor() {
    super(Puzzle.name, Puzzle.description, Puzzle.unicode, Puzzle.color, 6, Puzzle.rarity, 'gameState', 'onTurnEnd')
  }
  //on turn end
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if (p.team !== 'player') continue;
      const hasAdjacentAlly = activePieces.some(other =>
        other !== p &&
        other.team === 'player' &&
        Math.abs(other.headPosition.x - p.headPosition.x) +
        Math.abs(other.headPosition.y - p.headPosition.y) === 1
      )

      if (hasAdjacentAlly) {
        p.addTempModifier({ defence: 1 })
      }
    }
  }
}

class Chivalry extends Admin {
  static name = "Chivalry";
  static description = "Pieces with an ally adjacent to their head gain +1 attack at the end of your turn";
  static unicode = "U+1F3F0";
  static color = "#33bcfcff";
  static rarity = 5;
  constructor() {
    super(Chivalry.name, Chivalry.description, Chivalry.unicode, Chivalry.color, 7, Chivalry.rarity, 'gameState', 'onTurnEnd')
  }
  //on turn end
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if (p.team !== 'player') continue;

      const hasAdjacentAlly = activePieces.some(other =>
        other !== p &&
        other.team === 'player' &&
        Math.abs(other.headPosition.x - p.headPosition.x) +
        Math.abs(other.headPosition.y - p.headPosition.y) === 1
      )

      if (hasAdjacentAlly) {
        p.addModifier({ attack: 1 })
      }
    }
  }
}

class Roger extends Admin {
  static name = "Jolly Roger";
  static description = "Gain $1 per destroyed program";
  static unicode = "U+2620";
  static color = "#000000ff";
  static rarity = 3;
  constructor() {
    super(Roger.name, Roger.description, Roger.unicode, Roger.color, 6, Roger.rarity, 'player', 'onPieceDestruction')
  }
  //on piece destruction
  async apply({ player }: { player: Player }) {
   player.money += 1;
  }
}

class Bucket extends Admin {
  static name = "Bucket";
  static description = "+2 memory";
  static unicode = "U+1FAA3";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(Bucket.name, Bucket.description, Bucket.unicode, Bucket.color, 4, Bucket.rarity, 'player', 'other')
  }
  //
  async apply({ player }: { player: Player }) {
   player.memory += 2;
  }
  remove({ player }: { player: Player }) {
   player.memory -= 2;
  }
}

class Diamond extends Admin {
  static name = "Diamond";//payroll
  static description = "Every $10 you have increases your program's defence by 1 on load";
  static unicode = "U+1F48E";
  static color = "#ff5555";
  static rarity = 5;
  constructor() {
    super(Diamond.name, Diamond.description, Diamond.unicode, Diamond.color, 8, Diamond.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        const noOfTens = Math.max(0, Math.floor(player.money / 10)); //rounded down
        p.addModifier({defence: noOfTens})
        //else no buff
      }
    }
  }
}
/*
class Drum extends Admin {//try it out
  static name = "Marching Drum";
  static description = "+1 moves for all placed programs on the end of your turn";
  static unicode = "U+1F941";
  static color = "#ff5555";
  constructor() {
    super(Drum.name, Drum.description, Drum.unicode, Drum.color, 3, 1, 'gameState', 'onTurnEnd')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({moves: 1})
        //p.movesRemaining += 1;
      }
    }
  }
}
  */

class Sneakers extends Admin {//item???
  static name = "Trainers";
  static description = "+1 moves for all placed programs";
  static unicode = "U+1F45F";
  static color = "#36c723ff";
  static rarity = 1;
  constructor() {
    super(Sneakers.name, Sneakers.description, Sneakers.unicode, Sneakers.color, 4, Sneakers.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({moves: 1});
    activePieces[idx].movesRemaining += 1;
  }
}

//candle U+1F56F
class Candle extends Admin {
  static name = "Candle";
  static description = "+1 range for all your programs on load";
  static unicode = "U+1F56F";
  static color = "rgb(255, 168, 55)";
  static rarity = 1;
  constructor() {
    super(Candle.name, Candle.description, Candle.unicode, Candle.color, 4, Candle.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({range: 1})
  }
}

class Lightbulb extends Admin {
  static name = "Lightbulb";
  static description = "+2 range for all your programs on load";
  static unicode = "U+1F4A1";
  static color = "#f06b13ff";
  static rarity = 4;
  constructor() {
    super(Lightbulb.name, Lightbulb.description, Lightbulb.unicode, Lightbulb.color, 6, Lightbulb.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({range: 1})
  }
}
////ELECTRIC LIGHT BULB, U+1F4A1 +2 range?

class Feather extends Admin {
  static name = "Feather";
  static description = "+3 moves, -1 maxSize for all placed programs";
  static unicode = "U+1FAB6";
  static color = "#5590ff";
  static rarity = 4;
  constructor() {
    super(Feather.name, Feather.description, Feather.unicode, Feather.color, 8, Feather.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({moves: 1})
    activePieces[idx].movesRemaining += 1;
    if(activePieces[idx].getStat("maxSize") < 1){
      activePieces[idx].addModifier({maxSize: -1})
    }
  }
}

export class Copier extends Admin {
  static name = "Copier";
  static description = "Places a copy of your first placed program 1 space to the right if it is unnocupied";
  static unicode = "U+1F4E0";//"U+1F5A8";
  static color = "#414141";
  static rarity = 5;
  constructor() {
    super(Copier.name, Copier.description, Copier.unicode, Copier.color, 9, Copier.rarity, 'gameState', 'onPlacement')
  }
  //on placement, handle in App
  async apply({ id, activePieces }: { id: string, activePieces: Piece[]}) {
    const idx = activePieces.findIndex(p => p.id === id);
    const playerPieces : Piece[] = [];
    for (const p of activePieces){
      if(p.team==='player'){
        playerPieces.push(p)
      }
    }

    if(playerPieces.length === 1 ){//&& player.isfirstTurn){
      const PieceClass = allPieces.find(p => p.name === playerPieces[0].name)
      if (!PieceClass) return
      const newHead : Coordinate = {x: playerPieces[0].headPosition.x + 1, y: playerPieces[0].headPosition.y}
      const isOccupied = activePieces.some(p =>
        p.tiles.some(t => t.x === newHead.x && t.y === newHead.y)
      );
      if(!isOccupied){
        const copy = new PieceClass(newHead, 'player', activePieces[idx].removeCallback, crypto.randomUUID());
        copy.maxSize = playerPieces[0].getStat('maxSize');
        copy.moves = playerPieces[0].getStat('moves');
        copy.range = playerPieces[0].getStat('range');
        copy.attack = playerPieces[0].getStat('attack');
        copy.defence = playerPieces[0].getStat('defence');
        if(playerPieces[0].hybridName){
          copy.hybridName = playerPieces[0].hybridName;
          copy.description = playerPieces[0].description;
          copy.extraUnicode = playerPieces[0].extraUnicode;
        }
        activePieces.push(copy);
      }
    }
  }
}

class Telescope extends Admin {
  static name = "Telescope";//tower
  static description = "+3 range, -2 moves for all your placed programs";
  static unicode = "U+1F52D";
  static color = "#000000";
  static rarity = 3;
  constructor() {
    super(Telescope.name, Telescope.description, Telescope.unicode, Telescope.color, 5, Telescope.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({range: 3})
    activePieces[idx].addModifier({moves: -2})
  }
}

class Microscope extends Admin {
  static name = "Microbiology";
  static description = "Programs with a size of 1 temporarily get +1 defence at the end of your turn";//+2 temp defence on end of turn? 
  static unicode = "U+1F52C";
  static color = "#c6fcf3";
  static rarity = 2;
  constructor() {
    super(Microscope.name, Microscope.description, Microscope.unicode, Microscope.color, 5, Microscope.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for(const p of activePieces){
      if(p.tiles.length === 1){
        p.addTempModifier({defence: 1})
      }
    }
  }
}

class Lotus extends Admin {//boss? remove money?
  static name = "Lotus";
  static description = "Each rare admin gives + 0.5 damage mult on attacking";
  static unicode = "U+1FAB7";
  static color = "#ff5555";
  static rarity =  5;
  constructor() {
    super(Lotus.name, Lotus.description, Lotus.unicode, Lotus.color, 10, Lotus.rarity, 'playerAndGame', 'onDealDamage')
  }
  //on damage
  async apply({id, activePieces, player}: { id: string, activePieces: Piece[], player: Player}) {
    const idx = activePieces.findIndex(p => p.id === id);
    for (const a of player.admins){
      if(a.rarity === 3){
        activePieces[idx].damageMult += 0.5
      }
    }
  }
}

class Broom extends Admin {
  static name = "Broom";
  static description = "Clears all enemies with 1 size and 0 defence on the end of your turn";
  static unicode = "U+1F9F9";
  static color = "#c7b07eff";
  static rarity = 4;
  constructor() {
    super(Broom.name, Broom.description, Broom.unicode, Broom.color, 8, Broom.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (let index = 0; index < activePieces.length; index++) {
      const p = activePieces[index];
      if(p.team==='enemy' && p.tiles.length === 1 && p.defenceRemaining === 0){
        activePieces.splice(index, 1);
      }    
    }
  }
}

class Pickup extends Admin {
  static name = "Pickup";
  static description = "+3 Memory";
  static unicode = "U+1F6FB";
  static color = "#c9804fff";
  static rarity = 2;
  constructor() {
    super(Pickup.name, Pickup.description, Pickup.unicode, Pickup.color, 7, Pickup.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.memory += 3
  }
  remove({ player }: { player: Player }) {
    player.memory -= 3
  }
}

class Artic extends Admin {
  static name = "Artic";
  static description = "Inreases Memory by 5";
  static unicode = "U+1F69B";
  static color = "#ff5555";
  static rarity = 5;
  constructor() {
    super(Artic.name, Artic.description, Artic.unicode, Artic.color, 10, Artic.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.memory += 5
  }
  remove({ player }: { player: Player }) {
    player.memory -= 5
  }
}

class Sprinkler extends Admin {
  static name = "Sprinkler";
  static description = "Removes burning from all programs at the end of your turn";
  static unicode = "U+1F6BF";
  static color = "#cc1515ff";
  static rarity = 1;
  constructor() {
    super(Sprinkler.name, Sprinkler.description, Sprinkler.unicode, Sprinkler.color, 2, Sprinkler.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      p.statuses.burning = false
    }
  }
}

class FireEngine extends Admin {
  static name = "Fire Engine";
  static description = "Your programs become immune to burning on placement";
  static unicode = "U+1F692";
  static color = "#cc1515ff";
  static rarity = 2;
  constructor() {
    super(FireEngine.name, FireEngine.description, FireEngine.unicode, FireEngine.color, 4, FireEngine.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.burning = true
  }
}

class Prayer extends Admin {
  static name = "Prayer Beads";
  static description = "Programs get +2 defence on load";
  static unicode = "U+1F4FF";
  static color = "#9c7800ff";
  static rarity = 4;
  constructor() {
    super(Prayer.name, Prayer.description, Prayer.unicode, Prayer.color, 7, Prayer.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 2})
  }

}
class Vitamins extends Admin {
  static name = "Vitamin C";
  static description = "Programs get +1 defence on load";
  static unicode = "U+1F34A";
  static color = "#df9d22ff";
  static rarity = 2;
  constructor() {
    super(Vitamins.name, Vitamins.description, Vitamins.unicode, Vitamins.color, 4, Vitamins.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 1})
  }
}

class Protein extends Admin {
  static name = "Protein";
  static description = "Programs get +1 max size on load";
  static unicode = "U+1F357";//steak "U+1F52C";
  static color = "#b0ff55ff";
  static rarity = 1;
  constructor() {
    super(Protein.name, Protein.description, Protein.unicode, Protein.color, 2, Protein.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: 1})
  }
}

class Fountain extends Admin {
  static name = "Fountain of Youth";
  static description = "Programs get +3 max size on load";
  static unicode = "U+26F2";
  static color = "#20baf7ff";
  static rarity = 4;
  constructor() {
    super(Fountain.name, Fountain.description, Fountain.unicode, Fountain.color, 6, Fountain.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: 3})
  }
}

class Spoon extends Admin {
  static name =  "Silver Spoon";
  static description = "Gain $4 at the start of every round";
  static unicode = "U+1F944";
  static color = "#c9a91dff";
  static rarity = 4;
  constructor() {
    super (Spoon.name, Spoon.description, Spoon.unicode, Spoon.color, 10, Spoon.rarity, 'player', 'onRoundStart')
  }
  async apply({ player }: { player: Player }) {
    player.money += 4
  }
}

class Hermes extends Admin {//moves
  static name = "Hermes Wings";
  static description = "All placed programs are immune to being slowed";
  static unicode = "U+269A";//"U+1FABD";//wing, icarus?
  static color = "#083546ff";
  static rarity = 2;
  constructor() {
    super(Hermes.name, Hermes.description, Hermes.unicode, Hermes.color, 4, Hermes.rarity, 'gameState', 'onPlacement')//or gamestate?
  }

  //on placement
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.slowed = true;
  }
}

class Scarf extends Admin {
  static name = "Scarf";
  static description = "All programs are immune to being frozen";
  static unicode = "U+1F9E3";
  static color = "rgb(216, 248, 244)";
  static rarity = 2;
  constructor() {
    super(Scarf.name, Scarf.description, Scarf.unicode, Scarf.color, 4, Scarf.rarity, 'gameState', 'onPlacement')//or gamestate?
  }

  //on placement
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.frozen = true;
  }
}

export class Ambulance extends Admin {//a promoted piece dying should recover the pawn, a 
  static name = "Ambulance";
  static description = "Recovers all your destroyed programs to your inventory, letting you reload them";
  static unicode = "U+1F691";
  static color = "#a2cbc7";
  static rarity = 4;
  constructor() {
    super(Ambulance.name, Ambulance.description, Ambulance.unicode, Ambulance.color, 5, Ambulance.rarity, 'playerAndGame', 'onPieceDestruction')
  }
  async apply({ activePieces, player, piece }: { activePieces: Piece[], player: Player, piece?: Piece }) {
    if (!piece) return;
    const bpIdx = player.programs.findIndex(bp => bp.id === piece.id )
    if(piece.team==='player'){
      if(piece.name === 'Pawn'){
        const promoted = activePieces.findIndex(p => p.id === piece.id + '1');
        if(promoted !== -1) {
          console.log('promoted piece found')
          return;
        }
      }
      if (bpIdx !== -1) player.programs[bpIdx].isPlaced = false;
    }
  }
}

class FakeID extends Admin {
  static name = "Fake I.D.";
  static description = "Your programs are immune to being exposed";
  static unicode = "U+1FAAA";// DISGUISED FACE, U+1F978
  static color = "#5b22dfff";
  static rarity = 3;
  constructor() {
    super(FakeID.name, FakeID.description, FakeID.unicode, FakeID.color, 5, FakeID.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.exposed = true;
  }
}

class Shades extends Admin {
  static name = "Shades";//GOGGLES, U+1F97D
  static description = "Your programs are immune to being blinded";
  static unicode = "U+1F60E";// U+1F576, GOGGLES, U+1F97D
  static color = "rgb(255, 244, 234)";
  static rarity = 3;
  constructor() {
    super(Shades.name, Shades.description, Shades.unicode, Shades.color, 5, Shades.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].immunities.blinded = true;
  }
}

class Barber extends Admin {
  static name = '"A little off the top"';
  static description = "Deals 1 damage to every piece at the start of a round";
  static unicode = "U+1F488";
  static color = "#4a4a4aff";
  static rarity = 3;
  constructor() {
    super(Barber.name, Barber.description, Barber.unicode, Barber.color, 8, Barber.rarity, 'gameState', 'onRoundStart')
  }

  //onRoundStart
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces) await p.takeDamage(1); //enemy pieces only?
  }
}

class Umbrella extends Admin {
  static name = "Umbrella";
  static description = "Disables boss admin effects";
  static unicode = "U+2614";
  static color = "#0e107eff";
  static rarity = 5;
  constructor() {
    super(Umbrella.name, Umbrella.description, Umbrella.unicode, Umbrella.color, 10, Umbrella.rarity, 'gameState', 'other')
  }
  /*async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 1})
  }*/
}

export class Bank extends Admin {
  static name = "Bank";
  static description = "Increases sell value of held items and admins by $2 every round";
  static unicode = "U+1F3E6";
  static color = "#ffa600d3";
  static rarity = 1;
  constructor() {
    super(Bank.name, Bank.description, Bank.unicode, Bank.color, 10, Bank.rarity, 'player', 'onRoundEnd')
  }

  async apply({ player }: { player: Player }) {
    for (const item of player.items) {
      item.cost += 2;
    };
    for (const admin of player.admins) {
      admin.cost += 2;
    };
    //progams too?
  }
}

class Ballet extends Admin {//needs to reset
  static name = "Twinkle Toes";
  static description = "all your programs are hidden for the first 3 turns of a round";
  static unicode = "U+1FA70";
  static color = "#ebc0ffff";
  static rarity = 5;
  constructor() {
    super(Ballet.name, Ballet.description, Ballet.unicode, Ballet.color, 5, Ballet.rarity, 'gameState', 'onTurnEnd')
  }
  private count = 0;
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    this.count += 1;
    for (const piece of activePieces) {
      if(piece.team === 'player'){
        if(this.count <= 2 && !piece.statuses.exposed){
          piece.statuses.hidden = true
        } else {
          piece.statuses.hidden = false;
        }
      }
    };
  }
  onRoundEnd() {
    this.count = 0;
  }
}

class Pants extends Admin {
  static name = "Spare Pair";
  static description = "Your first destroyed program each round is moved back into your inventory";
  static unicode = "U+1FA72";
  static color = "#f8f8f8ff";
  static rarity = 4;
  constructor() {
    super(Pants.name, Pants.description, Pants.unicode, Pants.color, 5, Pants.rarity, 'playerAndGame', 'onPieceDestruction')
  }
  private count = 0;
  async apply({ player, piece }: { activePieces?: Piece[], player: Player, piece?: Piece }) {
    if (!piece) return;
    if(this.count === 0){
      const bpIdx = player.programs.findIndex(bp => bp.id === piece.id )
      if(piece.team==='player'){
        if (bpIdx !== -1) player.programs[bpIdx].isPlaced = false;
      }
      this.count += 1;//must be reset at end of round;
    }
  }
  onRoundEnd() {
    this.count = 0;
  }
}

class Ace extends Admin {
  static name = "Ace in the hole";
  static description = "Your last placed program gets +1 to all stats";
  static unicode = "U+2660";//"U+1F0A1";
  static color = "rgb(255, 255, 255)";
  static rarity = 3;
  constructor() {
    super(Ace.name, Ace.description, Ace.unicode, Ace.color, 7, Ace.rarity, 'playerAndGame', 'onPlacement')
  }

  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    let isLastBp = true;
    for (const bp of player.programs) {
      if(!bp.isPlaced) isLastBp = false;
    };
    if(isLastBp){
      const idx = activePieces.findIndex(p => p.id === id);
      //const bpIdx = player.programs.findIndex(bp => bp.id === activePieces[idx].id )
      if(activePieces[idx].team==='player'){
        activePieces[idx].addModifier({maxSize: 1, moves: 1, range: 1, attack: 1, defence: 1})
        //player.programs[bpIdx].isPlaced = false;
        //activePieces.filter(p => p.id !== activePieces[idx].id);//we could splice, but this might be safer?
      }
    }
      
  }
}

class Pi extends Admin {//test
  static name = "Pi";//
  static description = "Programs get +3.14 damage multiplyer on attacking";
  static unicode = "U+3C0";
  static color = "#640909ff";
  static rarity = 6;
  constructor() {
    super(Pi.name, Pi.description, Pi.unicode, Pi.color, 9, Pi.rarity, 'gameState', 'onDealDamage')
  }
  //onDamage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].damageMult += 3.14;
  }
}

class Pazzaz extends Admin {
  static name = "Pazzaz";
  static description = "Every $10 increases your program's movement by 1 on load";
  static unicode = "U+1F57A";
  static color = "#f943ff";
  static rarity = 4;
  constructor() {
    super(Pazzaz.name, Pazzaz.description, Pazzaz.unicode, Pazzaz.color, 7, Pazzaz.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    const idx = activePieces.findIndex(p => p.id === id);
    const noOfTens = Math.max(0, Math.floor(player.money / 10));
    activePieces[idx].addModifier({moves: noOfTens})
  }
}

class Toilet extends Admin {
  static name = "Circling The Drain";
  static description = "Common admins each provide +1 to all stats on placement";
  static unicode = "U+1F6BD";
  static color = "#557affff";
  static rarity = 5;
  constructor() {
    super(Toilet.name, Toilet.description, Toilet.unicode, Toilet.color, 5, Toilet.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    let noOfCommons = 0;
    for (const admin of player.admins) {
      if(admin.rarity === 1){
        noOfCommons += 1;
      }
    };
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({
            attack: noOfCommons,
            defence: noOfCommons,
            maxSize: noOfCommons,
            moves: noOfCommons,
            range: noOfCommons
    });
  }
}

class Harvest extends Admin {
  static name = "Harvest";
  static description = "Every 4 turns, +1 max size to all your programs";
  static unicode = "U+1F33E";
  static color = "#ff5555";
  static rarity = 1;
  constructor() {
    super(Harvest.name, Harvest.description, Harvest.unicode, Harvest.color, 3, Harvest.rarity, 'gameState', 'onTurnEnd')//playerandgame, we can +1 blueprints as well
  }
  private count = 0;
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    this.count += 1;
    if(this.count === 4){
      for (const p of activePieces) {
        if(p.team==='player'){
          p.addModifier({maxSize: 1})
        }
      };
      this.count = 0;
    }
  }
  onRoundEnd() {
    this.count = 0;
  }
}

class Bipolar extends Admin {
  static name = "Ups and Downs";
  static description = "Gain $1 on destroying an enemy, lose $5 on destruction of your own programs";
  static unicode = "U+1F3AD";
  static color = "rgb(174, 87, 196)";
  static rarity = 4;
  constructor() {
    super(Bipolar.name, Bipolar.description, Bipolar.unicode, Bipolar.color, 5, Bipolar.rarity, 'playerAndGame', 'onPieceDestruction')
  }
  async apply({ player, piece }: { activePieces?: Piece[], player: Player, piece?: Piece }) {
    if (!piece) return;
    if(piece.team === 'enemy'){
      player.money += 1
    }
    if(piece.team === 'player'){
      player.money -= 5
    }
  }
}

class Taoism extends Admin {
  static name = "Taoism";
  static description = "At the end of your turn, when the number of enemy programs equals the number of your programs, +1 to all your placed programs' stats";
  static unicode = "U+262F";
  static color = "rgba(92, 92, 92, 1)ff";
  static rarity = 6;
  constructor() {
    super(Taoism.name, Taoism.description, Taoism.unicode, Taoism.color, 5, Taoism.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    const playerPieces: Piece[] = [];//are these reset every apply?
    const enemyPieces = [];
    for (const p of activePieces) {
      if(p.team==='player'){
        playerPieces.push(p);
      }
      if(p.team==='enemy'){
        enemyPieces.push(p);
      }
    };
    if(enemyPieces.length === playerPieces.length){
      for (const p of activePieces) {
        if(p.team === 'player'){
          p.addModifier({
            attack: 1,
            defence: 1,
            maxSize: 1,
            moves: 1,
            range: 1
          });
        }
      };
    }
  }
}

class Loot extends Admin {
  static name = "Loot";
  static description = "Earn an extra $4 at the end of a round";
  static unicode = "U+1F4B0";
  static color = "#ffe555ff";
  static rarity = 2;
  constructor() {
    super(Loot.name, Loot.description, Loot.unicode, Loot.color, 7, Loot.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player }: { player: Player }) {
    player.bonusReward += 4;
  }
}

/*
class Booty extends Admin {
  static name = "Booty";
  static description = "Earn an extra $7 at the end of a round";
  static unicode = "U+1FA8E";
  static color = "rgb(85, 193, 255)";
  static rarity = 2;
  constructor() {
    super(Booty.name, Booty.description, Booty.unicode, Booty.color, 7, Booty.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player }: { player: Player }) {
    player.bonusReward += 7;
  }
}*/

class HedgeFund extends Admin {
  static name = "Hedge Fund";
  static description = "Raises interest cap by $10";
  static unicode = "U+1F4B8";
  static color = "#ff5555";
  static rarity = 3;
  constructor() {
    super(HedgeFund.name, HedgeFund.description, HedgeFund.unicode, HedgeFund.color, 10, HedgeFund.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.interestCap += 10;
  }
  remove({ player }: { player: Player }) {
    //if player does not have seed
   player.interestCap -= 10;
  }
}

class PeaPod extends Admin {
  static name = "Pea Pod";
  static description = "Inreases Admin slots by 2";
  static unicode = "U+1FADB";
  static color = "#55ff7aff";
  static rarity = 5;
  constructor() {
    super(PeaPod.name, PeaPod.description, PeaPod.unicode, PeaPod.color, 7, PeaPod.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.adminSlots += 2;
  }
  remove({ player }: { player: Player }) {
    player.adminSlots -= 2;
  }
}

class Liberty extends Admin {
  static name = "Liberty";
  static description = "Programs gain +1 range and +1 movement on load"
  static unicode = "U+1F5FD";
  static color = "rgb(103, 145, 194)";
  static rarity = 4;
  constructor() {
    super(Liberty.name, Liberty.description, Liberty.unicode, Liberty.color, 6, Liberty.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({range: 1, moves: 1})
  }
}

class Punching extends Admin {
  static name = "Punching";
  static description = "+1 security level, +5 reward from nodes";
  static unicode = "U+1F94A";
  static color = "#420e0eff";
  static rarity = 1;
  constructor() {
    super(Punching.name, Punching.description, Punching.unicode, Punching.color, 5, Punching.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.difficulty += 1
    player.bonusReward += 5; 
  }
  remove({ player }: { player: Player }) {
    player.difficulty -= 1
    player.bonusReward -= 5;
  }
}

class Teddy extends Admin {//handle in app
  static name = "Playtime";
  static description = "-1 security level";
  static unicode = "U+1F9F8";
  static color = "#7c5a33ff";
  static rarity = 5;
  constructor() {
    super(Teddy.name, Teddy.description, Teddy.unicode, Teddy.color, 7, Teddy.rarity, 'player', 'other')
  }
  async apply({ player }: { player: Player }) {
    player.difficulty -= 1;
  }
  remove({ player }: { player: Player }) {
    player.difficulty += 1;
  }
}

export class Abacus extends Admin {
  static name = "Abacus";
  static description = "gain 6/your current security level in $ at the end of a round (rounded down)";
  static unicode = "U+1F9EE";
  static color = "#a39755ff";
  static rarity = 2;
  constructor() {
    super(Abacus.name, Abacus.description, Abacus.unicode, Abacus.color, 5, Abacus.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player }: { player: Player }) {
    const amount = Math.floor(6/player.difficulty)
    player.bonusReward += amount;
  }
}

/*class DNA extends Admin {
  static name = "Gene Splicing";
  static description = "Open the hybrid compiler at any time"; //??Hybrids take cumulative rather than average stats
  static unicode = "U+1F9EC";
  static color = "#ff55b5ff";
  constructor() {
    super(DNA.name, DNA.description, DNA.unicode, DNA.color, 5, 3, 'gameState', 'other')
  }
}*/

export class Cheese extends Admin {
  static name = "Chedda";
  static description = "+$1 at the end of a round";
  static unicode = "U+1F9C0";
  static color = "#d39e58ff";
  static rarity = 1;
  constructor() {
    super(Cheese.name, Cheese.description, Cheese.unicode, Cheese.color, 3, Cheese.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player }: { player: Player }) {
    player.bonusReward += 1;
  }
}

class AirSupport extends Admin {
  static name = "Air Support";
  static description = "1 damage to all enemy programs on the board every time you place a new program";
  static unicode = "U+1F6E6";
  static color = "#190247ff";
  static rarity = 3;
  constructor() {
    super(AirSupport.name, AirSupport.description, AirSupport.unicode, AirSupport.color, 10, AirSupport.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const piece of activePieces) {
      if(piece.team === 'enemy'){
        await piece.takeDamage(1);
      }
    };
  }
}

class DartBoard extends Admin {//test
  static name = "Bullseye";//
  static description = "Programs get +1 damage multiplyer on attacking";
  static unicode = "U+1F3AF";
  static color = "#d52020ff";
  static rarity = 4;
  constructor() {
    super(DartBoard.name, DartBoard.description, DartBoard.unicode, DartBoard.color, 8, DartBoard.rarity, 'gameState', 'onDealDamage')
  }
  //onDamage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].damageMult += 1;
  }
}

class Dice extends Admin {
  static name = "High Roller";
  static description = "Reroll skip rewards";
  static unicode = "U+1F3B2";
  static color = "#369a1aff";
  static rarity = 3;
  constructor() {
    super(Dice.name, Dice.description, Dice.unicode, Dice.color, 5, Dice.rarity, 'gameState', 'other')
  }
}

class Ladder extends Admin {
  static name = "Leg Up";
  static description = "Skip one non boss node for free each security level";
  static unicode = "U+1FA9C";
  static color = "#cacacaff";
  static rarity = 3;
  constructor() {
    super(Ladder.name, Ladder.description, Ladder.unicode, Ladder.color, 5, Ladder.rarity, 'gameState', 'other')
  }
}
/*
class Ribbon extends Admin {//change
  static name = "Ribbon";
  static description = "Hybrids take cumulative rather than average stats";
  static unicode = "U+1F380";
  static color = "#8f098dff";
  constructor() {
    super(Ribbon.name, Ribbon.description, Ribbon.unicode, Ribbon.color, 8, 6, 'gameState', 'other')
  }
}
*/
export class Ring extends Admin {
  static name = "Ring";
  static description = "Stats changed inside a node persist across rounds";
  static unicode = "U+1F48D";
  static color = "rgb(129, 40, 247)";
  static rarity = 6;
  constructor() {
    super(Ring.name, Ring.description, Ring.unicode, Ring.color, 15, Ring.rarity, 'playerAndGame', 'onRoundEnd')
  }
  async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    for(const piece of activePieces){
      const id = piece.id;
      for(const blueprint of player.programs){
        if (blueprint.id === id) {
          blueprint.maxSize = (piece.getStat('maxSize'));
          blueprint.moves = (piece.getStat('moves'));
          blueprint.range = (piece.getStat('range'));
          blueprint.attack = (piece.getStat('attack'));
          blueprint.defence = (piece.getStat('defence'));
        };
      };
    };
  };
};

class Minerva extends Admin {
  static name = "Minerva";
  static description = "+1 range for all your placed programs each time a program is destroyed";
  static unicode = "U+1F989";//horus: "U+1314A";
  static color = "rgb(211, 169, 31)";
  static rarity = 6;
  constructor() {
    super(Minerva.name, Minerva.description, Minerva.unicode, Minerva.color, 9, Minerva.rarity, 'gameState', 'onPieceDestruction')
  }
  //on receive damage //on piece destrcution
  async apply({ id: _id, activePieces }: {id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({range: 1})
      }
    }
  }
}

class Hermit extends Admin {
  static name = "Hermit Shell";
  static description = "Programs get +2 defence and -1 moves on load";
  static unicode = "U+1F41A";
  static color = "#22b3dfff";
  static rarity = 1;
  constructor() {
    super(Hermit.name, Hermit.description, Hermit.unicode, Hermit.color, 3, Hermit.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 2});
    activePieces[idx].addModifier({moves: -1});
  }
}

class Tracker extends Admin {// PAW PRINTS, U+1F43E Tracker // FOOTPRINTS, U+1F463 Tracker
  static name = "Tracker";
  static description = "Exposes all enemies at the start of a round";
  static unicode = "U+1F43E";
  static color = "#00720fff";
  static rarity = 2;
  constructor() {
    super(Tracker.name, Tracker.description, Tracker.unicode, Tracker.color, 3, Tracker.rarity, 'gameState', 'onRoundStart')
  }
  
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='enemy' && !p.immunities.exposed){
        p.statuses.hidden = false;
        p.statuses.exposed = true;
      }
    }
  }
}

class Pong extends Admin {
  static name = "Pong";
  static description = "Damage received from enemies is returned back to them";
  static unicode = "U+1F3D3";
  static color = "#9ecae4ff";
  static rarity = 5;
  constructor() {
    super(Pong.name, Pong.description, Pong.unicode, Pong.color, 7, Pong.rarity, 'gameState', 'onReceiveDamage')//pieces?
  }
  //on receive damage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    await activePieces[idx].takeDamage(activePieces[idx].getStat('attack'));
  }
}

class Knot extends Admin {//test
  static name = "Knot";
  static description = "Your programs can move through themselves";
  static unicode = "U+1FAA2";
  static color = "#618eeeff";
  static rarity = 1;//2?
  constructor() {
    super(Knot.name, Knot.description, Knot.unicode, Knot.color, 4, Knot.rarity, 'gameState', 'other')
  }
}

class Rainbow extends Admin {
  static name = "Pot of Gold";
  static description = "+$10 After beating a boss";//nerf to 5? 7?
  static unicode = "U+1F308";
  static color = "#77e9f1ff";
  static rarity = 1;
  constructor() {
    super(Rainbow.name, Rainbow.description, Rainbow.unicode, Rainbow.color, 3, Rainbow.rarity, 'player', 'other')
  }
  //handled in RoundSummary
}

class Jammer extends Admin {
  static name = "Jammer";
  static description = "-1 range to all enemy programs with a range > 1";
  static unicode = "U+1F5FC";//no phones "U+1F4F5";
  static color = "rgb(170, 170, 170)";
  static rarity = 3;
  constructor() {
    super(Jammer.name, Jammer.description, Jammer.unicode, Jammer.color, 6, Jammer.rarity, 'gameState', 'onRoundStart')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='enemy' && p.getStat('range') > 1){
        p.addModifier({range: -1});
      }
    }
  }
}

class Balloon extends Admin {
  static name = "Balloon";
  static description = "+1 max size to all your held programs after each round";
  static unicode = "U+1F388";
  static color = "#12b8b8ff";
  static rarity = 2;
  constructor() {
    super(Balloon.name, Balloon.description, Balloon.unicode, Balloon.color, 2, Balloon.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player }: { player: Player }) {
    for (const p of player.programs){
      p.maxSize += 1;
    }
  }
}

class Wheel extends Admin {
  static name = "Roulette Wheel";
  static description = "Spend $5 to reroll Bosses, doubles next reroll's cost";
  static unicode = "U+1F6DE";
  static color = "#277a2bff";
  static rarity = 4;
  constructor() {
    super(Wheel.name, Wheel.description, Wheel.unicode, Wheel.color, 6, Wheel.rarity, 'player', 'other')
  }
  //handle in worldmap/app
}

class Bath extends Admin {
  static name = "Decontamination";
  static description = "Removes all negative statuses from all programs at the end of each turn";
  static unicode = "U+1F6C1";
  static color = "#cc1515ff";
  static rarity = 6;//5,4?
  constructor() {
    super(Bath.name, Bath.description, Bath.unicode, Bath.color, 12, Bath.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces) {
      p.statuses.exposed = false;
      p.statuses.burning = false;
      p.statuses.diseased = false;
      p.statuses.slowed = false;
      p.statuses.frozen = false;
      p.statuses.poisoned = false;
    };
  }
}

class Purse extends Admin {
  static name = "Coinpurse";
  static description = "Save $1 every time youe spend money";
  static unicode = "U+1F45B";
  static color = "rgb(230, 61, 230)";
  static rarity = 2;
  constructor() {
    super(Purse.name, Purse.description, Purse.unicode, Purse.color, 2, Purse.rarity, 'player', 'other')
  }
  //handle in player
}

class Discount extends Admin {
  static name = "Five Finger Discount";
  static description = "Steal once from every shop";
  static unicode = "U+1FAF3";
  static color = "rgb(105, 46, 114)";
  static rarity = 4;
  constructor() {
    super(Discount.name, Discount.description, Discount.unicode, Discount.color, 5, Discount.rarity, 'player', 'other')
    //private count for shop reference?
  }
  //handle in shop
}

class Variety extends Admin {
  static name = "Variety Box";
  static description = "Variants are +25% more likely to appear in the shop";
  static unicode = "U+1F371"; //variety box chocolates  HEART WITH RIBBON, U+1F49D , CHOCOLATE BAR, U+1F36B
  static color = "rgb(114, 89, 46)";
  static rarity = 4;
  constructor() {
    super(Variety.name, Variety.description, Variety.unicode, Variety.color, 5, Variety.rarity, 'player', 'other')
    //private count for shop reference?
  }
  //handle in shop
}

////LEFT-POINTING MAGNIFYING GLASS, U+1F50D reveal secrets
class Appraisal extends Admin {
  static name = "Appraisal";
  static description = "All prices in the next shop are reduced by $2";
  static unicode = "U+1F50D";
  static color = "rgb(239, 222, 112)";
  static rarity = 2;
  constructor() {
    super(Appraisal.name, Appraisal.description, Appraisal.unicode, Appraisal.color, 2, Appraisal.rarity, 'player', 'other')
  }
  //handle in shop
}

export class Camp extends Admin {//needs reviewing
  static name = "Camper";
  static description = "Your non-hidden programs that don't move gain +1 range every 2 turns, ones that do moev revert their range to their base range";// to all stats on the end of your turn";
  static unicode = "U+26FA";//🏕️
  static color = "rgb(26, 2, 65)";
  static rarity = 3;//5 for all stats
  constructor() {
    super(Camp.name, Camp.description,Camp.unicode, Camp.color, 6, Camp.rarity, 'gameState', 'onTurnEnd')
    //private count for shop reference?
  }
  private count = 0;
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    this.count++;
    for (const piece of activePieces) {
      if(piece.team === 'player' && !piece.statuses.hidden){
        if(piece.movesRemaining === piece.getStat('moves')){
          if(this.count === 2){
            piece.addModifier({range: 1});//encourages camping, seemingly only temporary. If so change to attack
            //piece.addTempModifier({defence : 1})
          }
        } else {
          piece.addModifier({range: -(piece.getModifier('range'))});//encourages camping
        }
      }
    };
    if(this.count === 2){
      this.count = 0;
    }
  }
  onRoundEnd() {
    this.count = 0;
  }
}

class Piggy extends Admin {
  static name = "Piggy Bank";
  static description = "Gain $2 after each shop purchase";
  static unicode = "U+1F416"
  static color = "rgb(203, 25, 215)";
  static rarity = 1;
  constructor() {
    super(Piggy.name, Piggy.description, Piggy.unicode, Piggy.color, 2, Piggy.rarity, 'player', 'other')
  }
  //handle in player
}

class Bowling extends Admin {//test
  static name = "Strike";
  static description = "Destroying a program deals 1 damage to each enemy tile adjacent to it's head";
  static unicode = "U+1F3B3"; // damage adjacent tiles
  static color = "rgb(215, 44, 25)";
  static rarity = 2;//3?
  constructor() {
    super(Bowling.name, Bowling.description, Bowling.unicode, Bowling.color, 4, Bowling.rarity, 'gameState', 'onPieceDestruction')
  }
  async apply({ activePieces, piece }: { activePieces: Piece[], piece?: Piece }) {
    if (!piece) return;
    const targetTile = piece.headPosition
    const adjacent : Coordinate[] = [
      {x: targetTile.x+1, y: targetTile.y },
      {x: targetTile.x-1, y: targetTile.y },
      {x: targetTile.x, y: targetTile.y+1 },
      {x: targetTile.x, y: targetTile.y-1 }
    ];
    for (const piece of activePieces) {
      const isAdjacent = piece.tiles.some(t =>
        adjacent.some(c => c.x === t.x && c.y === t.y)
      );
      if (isAdjacent && piece.team === 'enemy') {//only attacks enemies
        await piece.takeDamage(1);
      }
    };
  }
}

class Stiletto extends Admin {
  static name = "Stiletto";
  static description = "Programs all gain +1 attack, -1 moves on placement";
  static unicode = "U+1F460";
  static color = "rgb(182, 21, 126)";
  static rarity = 2;
  constructor() {
    super(Stiletto.name, Stiletto.description, Stiletto.unicode, Stiletto.color, 6, Stiletto.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({attack: 1})
    activePieces[idx].addModifier({moves: -1})
    //activePieces[idx].movesRemaining -= 1;
  }
}

class Disco extends Admin {
  static name = "Disco Ball";
  static description = "Damage received from enemies also applies to enemies adjacent to the attacker's head";
  static unicode = "U+1FAA9";
  static color = "rgb(255, 36, 182)";
  static rarity = 6;
  constructor() {
    super(Disco.name, Disco.description, Disco.unicode, Disco.color, 7, Disco.rarity, 'gameState', 'onReceiveDamage')//pieces?
  }
  //on receive damage
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    //activePieces[idx].takeDamage(activePieces[idx].getStat('attack'));
    const targetTile = activePieces[idx].headPosition
    const adjacent : Coordinate[] = [
      {x: targetTile.x+1, y: targetTile.y },
      {x: targetTile.x-1, y: targetTile.y },
      {x: targetTile.x, y: targetTile.y+1 },
      {x: targetTile.x, y: targetTile.y-1 }
    ];
    for (const piece of activePieces) {
      if(piece.id === id || piece.team === 'player') return;//skip the attacker?, and only reflect damage to enemies
      const isAdjacent = piece.tiles.some(t =>
        adjacent.some(c => c.x === t.x && c.y === t.y)
      );
      if (isAdjacent) {
        await piece.takeDamage(activePieces[idx].getStat('attack'));
      }
    };
  }
}

class Nest extends Admin {
  static name = "Nest Egg";
  static description = "Gains $3 sell value each round";
  static unicode = "U+1FABA"
  static color = "rgb(20, 212, 255)";
  static rarity = 1;
  constructor() {
    super(Nest.name, Nest.description, Nest.unicode, Nest.color, 2, Nest.rarity, 'player', 'onRoundEnd')
  }
  async apply({ player: _player }: { player: Player }) {
    this.cost += 6;
  }
}

class Sled extends Admin {//test
  static name = "Rosebud";
  static description = "Your last placed program starts hidden";
  static unicode = "U+1F6F7";
  static color = "rgb(185, 185, 185)";
  static rarity = 3;
  constructor() {
    super(Sled.name, Sled.description, Sled.unicode, Sled.color, 7, Sled.rarity, 'playerAndGame', 'onPlacement')
  }

  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    let isLastBp = true;
    for (const bp of player.programs) {
      if(!bp.isPlaced) isLastBp = false;
    };
    if(isLastBp){
      const idx = activePieces.findIndex(p => p.id === id);
      if(activePieces[idx].team==='player'){
        if(!activePieces[idx].statuses.exposed){
          activePieces[idx].statuses.hidden = true;
        }
      }
    }  
  }
}

class Crash extends Admin {//test
  static name = "Blue Screen";
  static description = "Freezes all programs after every turn";
  static unicode = "";
  static color = "rgb(0, 13, 255)";
  static rarity = 4;
  constructor() {
    super(Crash.name, Crash.description, Crash.unicode, Crash.color, 7, Crash.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const piece of activePieces) {
      if(!piece.immunities.frozen){
        piece.statuses.frozen = true;
        piece.movesRemaining = 0;
      }
    };
  }
}

export class Skyscraper extends Admin {//test not working
  static name = "Highrise";
  static description = "Each placed program gains +1 temporary defence for every 2 tiles of currently occupied on the end of your turns";//every 3? can make larger to nerf
  static unicode = "U+1F3E2";
  static color = "rgb(215, 44, 25)";
  static rarity = 5;
  constructor() {
    super(Skyscraper.name, Skyscraper.description, Skyscraper.unicode, Skyscraper.color, 7, Skyscraper.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    //const idx = activePieces.findIndex(p => p.id === id);
    for (const piece of activePieces) {
      if(piece.team === 'player'){
        const noOfTwos = Math.floor(piece.tiles.length / 2);
        piece.addTempModifier({defence: noOfTwos});
      }
    };
  }
}

class School extends Admin {//test
  static name = "Staying in School";
  static description = "Each unplaced program in your inventory gains +1 to all stats at the end of a round, up to a max of +7"
  static unicode = "U+1F3EB";
  static color = "rgb(193, 193, 193)";
  static rarity = 6;
  constructor() {
    super(School.name, School.description, School.unicode, School.color, 12, School.rarity, 'player', 'onRoundEnd')
  }
  private count = 0;
  async apply({ player }: { player: Player }) {
    if(this.count < 7){
      for (const bp of player.programs) {
        if(!bp.isPlaced){
          bp.maxSize += 1;
          bp.moves += 1;
          bp.attack += 1;
          bp.range += 1;
          bp.defence += 1;
        }
      };
      this.count ++
    }
  }
}

class Dharma extends Admin {//test
  static name = "Wheel of Dharma";
  static description = "Every kind of reroll is free"
  static unicode = "U+2638"; //every kind of reroll is free (shop, bosses(roulette) ---- nodes(ferris), skips(dice-already free), )
  static color = "rgb(146, 100, 0)";
  static rarity = 5;
  constructor() {
    super(Dharma.name, Dharma.description, Dharma.unicode, Dharma.color, 2, Dharma.rarity, 'player', 'onRoundEnd')
  }
}

class Putter extends Admin {//test
  static name = "Putter";
  static description = "The last enemy program loses -1 to all stats";//0 defence?
  static unicode = "U+26F3";
  static color = "rgb(25, 215, 107)";
  static rarity = 2;
  constructor() {
    super(Putter.name, Putter.description, Putter.unicode, Putter.color, 2, Putter.rarity, 'gameState', 'onPieceDestruction')
  }
  async apply({ activePieces, piece }: { activePieces: Piece[], piece?: Piece }) {
    if (piece?.team !== 'enemy') return;
    const enemiesLeft = activePieces.filter(p => p.team === 'enemy');
    if(enemiesLeft.length === 1){
      const idx = activePieces.findIndex(p => p.id === enemiesLeft[0].id); 
      if (idx !== -1) activePieces[idx].addModifier({maxSize: -1, moves: -1, range: -1, attack: -1, defence: -1})
    }
  }
}

class Smoker extends Admin {
  static name = "Cigarette";//GOGGLES, U+1F97D
  static description = "Your programs have -1 max size, but are immune to being confused";
  static unicode = "U+1F6AC";
  static color = "rgb(255, 255, 255)";
  static rarity = 1;
  constructor() {
    super(Smoker.name, Smoker.description, Smoker.unicode, Smoker.color, 5, Smoker.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: -1});
    activePieces[idx].immunities.confused = true;
  }
}

class Wine extends Admin {
  static name = "Full Bodied";//Field Wine";
  static description = "+1 max size, +1 defence";
  static unicode = "U+1F377"; //"U+1FA7A";// Wine, + max Size/defence?
  static color = "rgb(226, 186, 99)";
  static rarity = 3;
  constructor() {
    super(Wine.name, Wine.description, Wine.unicode, Wine.color, 5, Wine.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({maxSize: +1});
    activePieces[idx].addModifier({defence: +1});
  }
}

/*class Pie extends Admin {
    static name = "Pie";
    static description = "+2 max size, -1 moves";
    static unicode = "U+1F967";
    static color = "#1c33ffff";
    constructor(){
        super(Pie.name, Pie.description, Pie.unicode, Pie.color, 5, 3, 'blueprint')      
    }
    //Increases a program's maxSize by 1
    apply(target: PieceBlueprint, itemMult: number) {
        target.maxSize += (2* itemMult);
    }
}*/

//to be finished:
export class Ferris extends Admin {
  static name = "Ferris Wheel";
  static description = "Reroll node layouts once each for $5";//will need a hasBeenRerolled flag in each WorldNode
  static unicode = "U+1F3A1"
  static color = "rgb(20, 212, 255)";
  static rarity = 2;
  constructor() {
    super(Ferris.name, Ferris.description, Ferris.unicode, Ferris.color, 2, Ferris.rarity, 'player', 'other')
  }
  //handle in worldmap
}

//anchor
//- sludge slow down enemies

// EVERGREEN TREE, U+1F332, cannot be frozen, scarf already does this
class Evergreen extends Admin {
  static name = "Evergreen";
  static description = "+1 max size to all your programs at the every 2 turns";
  static unicode = "U+1F332";
  static color = "#042703";
  static rarity = 4;
  constructor() {
    super(Evergreen.name, Evergreen.description, Evergreen.unicode, Evergreen.color, 7, Evergreen.rarity, 'gameState', 'onTurnEnd')//playerandgame, we can +1 blueprints as well
  }
  private count = 0;
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    this.count += 1;
    if(this.count === 2){
      for (const p of activePieces) {
        if(p.team==='player'){
          p.addModifier({maxSize: 1})
        }
      };
      this.count = 0;
    }
  }
  onRoundEnd() {
    this.count = 0;
  }
}

//admin to add held item variants to all pieces
//face down card, close to chest etc.
class Cards extends Admin {//test
  static name = "Hidden Hand";
  static description = "Held upgrade item's effects apply to all placed programs";
  static unicode = "U+1FAAD"; //FOLDING HAND FAN, 
  static color = "rgb(0, 13, 255)";
  static rarity = 6;
  constructor() {
    super(Cards.name, Cards.description, Cards.unicode, Cards.color, 7, Cards.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    const idx = activePieces.findIndex(p => p.id === id);
    const maxSizeMod = player.items.filter(i => i.name === 'Formula').length + player.items.filter(i => i.name === 'Blueberry').length + (2*player.items.filter(i => i.name === 'Melon').length) + (3*player.items.filter(i => i.name === 'Pie').length);
    const movesMod = player.items.filter(i => i.name === 'Roids').length + player.items.filter(i => i.name === 'Juice').length + (2*player.items.filter(i => i.name === 'Teapot').length) + (2*player.items.filter(i => i.name === 'Coffee').length);
    const rangeMod = player.items.filter(i => i.name === 'Glasses').length + (2*player.items.filter(i => i.name === 'Carrot').length);
    const attackMod = player.items.filter(i => i.name === 'Roids').length + player.items.filter(i => i.name === 'Mushroom').length + (2*player.items.filter(i => i.name === 'Meat').length);
    const defenceMod = player.items.filter(i => i.name === 'Formula').length + player.items.filter(i => i.name === 'Iron').length + (2*player.items.filter(i => i.name === 'Garlic').length) + (3*player.items.filter(i => i.name === 'Ginger').length);
    const blessingBonus = player.items.filter(i => i.name === 'Blessing').length;

    //[Mushroom, Meat, Iron, Garlic, Ginger, Blueberry, Melon, Pie, Pepper, Carrot, Juice, Teapot, Coffee, Blessing, Roids, Formula]
    activePieces[idx].addModifier({
      maxSize: maxSizeMod + blessingBonus,
      moves: movesMod + blessingBonus,
      range: rangeMod + blessingBonus,
      attack: attackMod + blessingBonus,
      defence: defenceMod + blessingBonus
    })
  }
}

class Ollie extends Admin {
  static name = "Ollie";
  static description = "Moves can cover 2 spaces and jump tile gaps";
  static unicode = "U+1F6F9";
  static color = "rgb(147, 182, 190)";
  static rarity = 4;
  constructor() {
    super(Ollie.name, Ollie.description, Ollie.unicode, Ollie.color, 7, Ollie.rarity, 'player', 'other')
  }
  //handle in board
}

class Triangle extends Admin {
  static name = "Edge Case";
  static description = "Your programs can move diagonally";
  static unicode = "U+1F4D0";//TRIANGULAR RULER, U+1F4D0 , move diagonally? change range calculation?
  static color = "rgb(18, 122, 219)";
  static rarity = 3;
  constructor() {
    super(Triangle.name, Triangle.description, Triangle.unicode, Triangle.color, 6, Triangle.rarity, 'player', 'other')
  }
  //handle in board
}

class Juggler extends Admin {//test
  static name = "Juggler";
  static description = "If your first loaded program is different to the previous round's first, +1 to all its stats";//store multiple ids?
  static unicode = "U+1F939";
  static color = "#000000ff";
  static rarity = 3;
  constructor() {
    super(Juggler.name, Juggler.description, Juggler.unicode, Juggler.color, 7, Juggler.rarity, 'playerAndGame', 'onPlacement')
  }
  private firstId: string = '';
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    let placedBps = [];
    for (const bp of player.programs) {
      if(bp.isPlaced) placedBps.push(bp.id)
    };
    if(placedBps.length <= 1 && this.firstId !== id){
      const idx = activePieces.findIndex(p => p.id === id);
      activePieces[idx].addModifier({maxSize: 1, moves: 1, range: 1, attack: 1, defence: 1})
      this.firstId = id;
    }
  }
}

class Ice extends Admin {//needs to reset
  static name = "Thaw";
  static description = "Freezes all programs on the first turn of a round, then unfreezes them";
  static unicode = "U+1F9CA";
  static color = "rgb(186, 255, 246)";
  static rarity = 5;
  constructor() {
    super(Ice.name, Ice.description, Ice.unicode, Ice.color, 10, Ice.rarity, 'gameState', 'onTurnEnd')
  }
  private count = 0;
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    this.count += 1;
    for (const piece of activePieces) {
      //if(piece.team === 'player'){
        if(this.count <= 1 && !piece.immunities.frozen){
          piece.statuses.frozen = true
        } else {
          piece.statuses.frozen = false;
        }
      //}
    };
  }
  onRoundEnd() {
    this.count = 0;
  }
}

// CRICKET BAT AND BALL, U+1F3CF, Howzat! take a piece off with 1 tile left? broom does this already
class Howzat extends Admin {
  static name = "Howzat!";
  static description = "Clears all enemies with <= 2 size and 0 defence on the end of your turn";
  static unicode = "U+1F3CF";
  static color = "rgb(95, 158, 70)";
  static rarity = 5;
  constructor() {
    super(Howzat.name, Howzat.description, Howzat.unicode, Howzat.color, 11, Howzat.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (let index = 0; index < activePieces.length; index++) {
      const p = activePieces[index];
      if(p.team==='enemy' && p.tiles.length <= 2 && p.defenceRemaining === 0){
        activePieces.splice(index, 1);
      }    
    }
  }
}

class Cherries extends Admin {//test
  static name = "Jackpot";
  static description = "Unplaced programs of the same base type in your inventory add their stats to the loaded program";
  static unicode = "U+1F352";
  static color = "#000000ff";
  static rarity = 5;
  constructor() {
    super(Cherries.name, Cherries.description, Cherries.unicode, Cherries.color, 15, Cherries.rarity, 'playerAndGame', 'onPlacement')
  }
  async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    const idx = activePieces.findIndex(p => p.id === id);
    const matchingBps: PieceBlueprint[] = [];
    for (const bp of player.programs) {
      if((bp.name === activePieces[idx].name) && !bp.isPlaced) matchingBps.push(bp)
    };
    for (const bp of matchingBps) {
      activePieces[idx].addModifier({maxSize: bp.maxSize, moves: bp.moves, range: bp.range, attack: bp.attack, defence: bp.defence})
      //activePieces[idx].addModifier({maxSize: 1, moves: 1, range: 1, attack: 1, defence: 1})
    };
  }
}

class Coin extends Admin {
  static name = "Coin Toss";
  static description = "50% chance for +1 damage multiplyer on attacking";
  static unicode = "U+1FA99";
  static color = "#eb0909";
  static rarity = 2;
  constructor() {
    super(Coin.name, Coin.description, Coin.unicode, Coin.color, 5, Coin.rarity, 'piece', 'onDealDamage')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    if(Math.random() < 0.5){
      const idx = activePieces.findIndex(p => p.id === id);
      activePieces[idx].damageMult += 1;
    }
  }
}

class Monarch extends Admin {
  static name = "Monarch";
  static description = "Charm a random enemy at the start of a round";
  static unicode = "U+1F98B";
  static color = "rgb(40, 11, 167)";
  static rarity = 5;
  constructor() {
    super(Monarch.name, Monarch.description, Monarch.unicode, Monarch.color, 9, Monarch.rarity, 'gameState', 'onRoundStart')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    const enemyPieces = activePieces.filter(p => (p.team === 'enemy'));
    const randomEnemy = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
    if (randomEnemy && !randomEnemy.immunities.charmed) {
      randomEnemy.statuses.charmed = true;
    }
  }
}

class Tempura extends Admin {
  static name = "Tempura";
  static description = "-1 max size, +1 defence";
  static unicode = "U+1F364";
  static color = "rgb(224, 41, 215)";
  static rarity = 1;
  constructor() {
    super(Tempura.name, Tempura.description, Tempura.unicode, Tempura.color, 3, Tempura.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: {  id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 1}) 
    activePieces[idx].addModifier({maxSize: -1}) 
  }
}

class BlackBelt extends Admin {
  static name = "Black Belt";
  static description = "Your programs with an action remaining on the end of your turn will retaliate with their attack on incoming damage";
  static unicode = "U+1F94B";
  static color = "rgb(0, 0, 0)";
  static rarity = 5;
  constructor() {
    super(BlackBelt.name, BlackBelt.description, BlackBelt.unicode, BlackBelt.color, 9, BlackBelt.rarity, 'gameState', 'onTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (let index = 0; index < activePieces.length; index++) {
      const p = activePieces[index];
      if(p.team==='player' && p.actions >= 1){
        p.willRetaliate = true;
      }    
    }
  }
}

class Bell extends Admin {//needs to reset
  static name = "Saved by the Bell";
  static description = "Freezes programs attacking yours when there is only 1 player program in a node";
  static unicode = "U+1F514";
  static color = "rgb(186, 255, 246)";
  static rarity = 5;
  constructor() {
    super(Bell.name, Bell.description, Bell.unicode, Bell.color, 8, Bell.rarity, 'gameState', 'onReceiveDamage')
  }
  
  async apply({ id: id, activePieces }: { id: string, activePieces: Piece[] }) {
    const playerPieces = activePieces.filter(p => (p.team === 'player'));
    const idx = activePieces.findIndex(p => p.id === id);
    const dealer = activePieces[idx];
    if(playerPieces.length === 1 && dealer && !dealer.immunities.frozen){
      dealer.statuses.frozen = true;
      dealer.movesRemaining = 0;
    }
  }
}

//onPieceDestruction gain money
class Violin extends Admin {//test
  static name = "Violin";
  static description = "Gain $3 on destruction of your programs if they match one in your inventory (summons do not count)";//0 defence?
  static unicode = "U+1F3BB";
  static color = "rgb(68, 0, 77)";
  static rarity = 2;
  constructor() {
    super(Violin.name, Violin.description, Violin.unicode, Violin.color, 3, Violin.rarity, 'playerAndGame', 'onPieceDestruction')
  }
  async apply({ player, piece }: { activePieces?: Piece[], player: Player, piece?: Piece }) {
    if (!piece) return;
    const idbp = player.programs.findIndex(bp => bp.id === piece.id);
    if(idbp !== -1 && piece.team === 'player'){
      player.money += 3;
    }
  }
}

// LUGGAGE, U+1F9F3 Carry on
class Luggage extends Admin {
  static name = "Carry On";
  static description = "+1 memory each time a boss is cleared";
  static unicode = "U+1F9F3";
  static color = "#75a8d8";
  static rarity = 3;
  constructor() {
    super(Luggage.name, Luggage.description, Luggage.unicode, Luggage.color, 5, Luggage.rarity, 'player', 'onRoundEnd')
  }

  //noRoundend
  async apply({ player }: { player: Player }) {
    if(player.mapProgress >= 2){
      player.memory += 1;
    }
  }
  /*
  remove({ player }: { player: Player }) {//might not work without other type
    player.memory -= player.difficulty;
  }
  */
}

class Reinforcement extends Admin {
  static name = "Reinforcement";
  static description = "+1 max size, +1 defence, -1 moves";
  static unicode = "U+1F529";
  static color = "rgb(41, 126, 224)";
  static rarity = 1;
  constructor() {
    super(Reinforcement.name, Reinforcement.description, Reinforcement.unicode, Reinforcement.color, 4, Reinforcement.rarity, 'gameState', 'onPlacement')
  }
  async apply({ id, activePieces }: {  id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    activePieces[idx].addModifier({defence: 1}) 
    activePieces[idx].addModifier({maxSize: +1}) 
    activePieces[idx].addModifier({moves: -1}) 
  }
}

class Chime extends Admin {
  static name = "Wind Chime";
  static description = "Enemies that have moved lose -1 defence for 1 turn";
  static unicode = "U+1F390";
  static color = "rgb(185, 250, 255)";
  static rarity = 1;
  constructor() {
    super(Chime.name, Chime.description, Chime.unicode, Chime.color, 3, Chime.rarity, 'gameState', 'onEnemyTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces) {
      if(p.team==='enemy' && p.movesRemaining < p.getStat('moves')){
        p.addTempModifier({defence: -1})
      }    
    };
  }
}

class Fuel extends Admin {
  static name = "Gassed";
  static description = "Player programs get an extra 1 moves remaining after the enemy's turn";
  static unicode = "U+26FD";
  static color = "rgb(185, 250, 255)";
  static rarity = 4;
  constructor() {
    super(Fuel.name, Fuel.description, Fuel.unicode, Fuel.color, 6, Fuel.rarity, 'gameState', 'onEnemyTurnEnd')
  }
  async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
    for (const p of activePieces) {
      if(p.team==='player'){
        p.movesRemaining += 1;
      }    
    };
  }
}

//BRIEFCASE, U+1F4BC bribe $10 reduces defence
class Briefcase extends Admin {
  static name = "Bribe";
  static description = "If possible, spends $5 to lower the defences of all enemy progams by 1 at the start of a round";
  static unicode = "U+1F4BC";
  static color = "rgb(131, 131, 131)";
  static rarity = 2;
  constructor() {
    super(Briefcase.name, Briefcase.description, Briefcase.unicode, Briefcase.color, 5, Briefcase.rarity, 'playerAndGame', 'onRoundStart')
  }
  
  async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
    if(player.effectiveMoney >= 5){
      for (const p of activePieces){
        if(p.team==='enemy'){
          p.addModifier({defence: -1})//enemy pieces only?
        }
      }
      player.spend(5);
    }
  }
}

//4 all require damage receiver
/*
//SELFIE, U+1F933 use action on self for a temp defence?

export class Chain extends Admin {// status test unfinished: make enemies spread to fellow enemies
  static name = "Daisy Chain";
  static description = "Attacks damage enemy programs next to the damage dealer";//effect all programs??
  static unicode = "U+1F33C";
  static color = "rgb(27, 230, 245)";
  static rarity = 5;
  constructor() {
    super(Chain.name, Chain.description, Chain.unicode, Chain.color, 7, Chain.rarity, 'gameState', 'onDealDamage')
  }
  //on turn end
  async apply({ id: id, activePieces }: { id: string; activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    const dealer = activePieces[idx];
    const enemies = activePieces.filter(p => p.team === 'enemy');

    //for (const piece of activePieces) {
    for (const enemy of enemies) {
      const isAdjacent = dealer.tiles.some(st =>
        enemy.tiles.some(tt =>
        Math.abs(st.x - tt.x) + Math.abs(st.y - tt.y) === 1)
      );
      if (!isAdjacent) continue;
      enemy.takeDamage(dealer.getStat('attack'));
    }
  }
}

//SPLATTER, U+1FADF
//SPLASHING SWEAT SYMBOL, U+1F4A6
export class Splash extends Admin {
  static name = "Splash Damage";
  static description = "Damage dealt by your programs also applies to tiles adjacent to the target's head";//change to coord adjacency, need coord instead of id
  static unicode = "U+1FADF";
  static color = "rgb(31, 5, 125)";
  static rarity = 4;
  constructor() {
    super(Splash.name, Splash.description, Splash.unicode, Splash.color, 10, Splash.rarity, 'gameState', 'onDealDamage')
  }
  //to handle here, onDealDamage would need coord of target
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idx = activePieces.findIndex(p => p.id === id);
    //activePieces[idx].takeDamage(activePieces[idx].getStat('attack'));
    const targetTile = activePieces[idx].headPosition
    const adjacent : Coordinate[] = [
      {x: targetTile.x+1, y: targetTile.y },
      {x: targetTile.x-1, y: targetTile.y },
      {x: targetTile.x, y: targetTile.y+1 },
      {x: targetTile.x, y: targetTile.y-1 }
    ];
    for (const piece of activePieces) {
      //if(piece.id === id || piece.team === 'player') return;//skip the receiver?
      const isAdjacent = piece.tiles.some(t =>
        adjacent.some(c => c.x === t.x && c.y === t.y)
      );
      if (isAdjacent) {
        piece.takeDamage(activePieces[idx].getStat('attack'));
      }
    };
  }
}
  */

// BASEBALL, U+26BE Strike out, Enemies that fail to damage a program 3 times are removed - onreceivedamage would need a second id to check
//baseball also needs id of receiver, only onReceiveDamage only gets dealer atm, could use target to determine if tiles were spliced or not
/*
class Baseball extends Admin {
  static name = "Strike Out";
  static description = "Enemies that fail to damage your programs 3 times are removed";
  static unicode = "U+26BE";
  static color = "rgb(36, 255, 138)";
  static rarity = 4;
  constructor() {
    super(Baseball.name, Baseball.description, Baseball.unicode, Baseball.color, 7, Baseball.rarity, 'gameState', 'onReceiveDamage')//pieces?
  }
  //on receive damage
  private candidates: object[{id: string, strikes: number}] = [];
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
    const idxa = activePieces.findIndex(p => p.id === id);//index of attacker
    //activePieces[idx].takeDamage(activePieces[idx].getStat('attack'));
    //using id of defender
    const idxd = activePieces.findIndex(p => p.idR === idR);//index of receiver
    if(activePieces[idxd].defence > 0){
      if(this.candidates.includes(id)){
        //for this id, strikes ++
        //if strikes >= 3, activePieces.splice(idxa)
      } else {
        this.candidates.push({id: id, })
      }
    }
  }
  onRoundEnd() {
    this.candidates = [];
  }
}
  */

export class Clippy extends Admin {
  static name = "Clippy";
  static description = "Provides tutorial hints";
  static unicode = "U+1F4CE";
  static color = "rgb(154, 216, 231)";
  static rarity = 1;
  constructor() {
    super(Clippy.name, Clippy.description, Clippy.unicode, Clippy.color, 2, Clippy.rarity, 'player', 'other')
  }
  //handle in player
}

export const allAdmins = [Bank, Bucket, Candle, Cheese, Smoker, Compass, CreditCard, Crystal, GoldenTicket, Harvest, Heartbreaker, Hermit, Knot, Miner, Nest, Notepad, OffRoader, Parachute, Piggy, Rainbow, Protein, Punching, Reinforcement, Trolley, Seed, Slots, Sprinkler, Tempura, Sneakers, Chime, Abacus, Aesculapius, Appraisal, Balloon, Briefcase, Bubble, Cactus, Coin, Purse, Convenience, FireEngine, Heart, Hermes, Joker, Loot, Clover, Microscope, Newspaper, Pickup, Putter, Relay, Scarf, Stiletto, Bowling, Tracker, Violin, Vitamins, AdminMap, Barber, Ace, AirSupport, Bone, Blood, Bouquet, Camp, Luggage, Communism, Department, Triangle, FakeID, Wine, HedgeFund, Dice, Jammer, Roger, Juggler, Ladder, Puzzle, Razor, Sled, Rune, Shades, Stonks, Telescope, Crown, Toolbox, Ambulance, Backdoor, BionicArm, BionicLeg, Crash, Broom, DartBoard, Dove, Evergreen, Eye, Discount, Fountain, Feather, Fuel, Spoon, Liberty, Lightbulb, Lotus, Monarch, Ollie, Palette, Pazzaz, PetriDish, Prayer, Wheel, Pants, Bipolar, Variety, Volatile, Artic, BlackBelt, Lungs, Chemistry, Chivalry, Toilet, Copier, Diamond, Hamsa, Skyscraper, Howzat, Inheritance, Cherries, Brain, Meteor, Onion, PeaPod, Teddy, Pong, RollerBlades, Bell, Ice, Ballet, Umbrella, Dharma, Bath, Cards, Disco, Minerva, Needle, Pi, Osiris, Ring, School, Taoism];
console.log('admins length: ', allAdmins.length)
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
  | 'onDealDamage' we get dealer, add piece id of receiver?
  | 'onReceiveDamage' we get dealer, add piece id of receiver?
  | 'onPieceDestruction'
  | 'other';
*/
allAdmins.forEach(admin => {
  if(admin.rarity === 1) adminLogs.rarity1 += 1;
  if(admin.rarity === 2) adminLogs.rarity2 += 1;
  if(admin.rarity === 3) adminLogs.rarity3 += 1;
  if(admin.rarity === 4) adminLogs.rarity4 += 1;
  if(admin.rarity === 5) adminLogs.rarity5 += 1;
  if(admin.rarity === 6) adminLogs.rarity6 += 1;
});
console.log("Admins of rarity 1: ", adminLogs.rarity1)
console.log("Admins of rarity 2: ", adminLogs.rarity2)
console.log("Admins of rarity 3: ", adminLogs.rarity3)
console.log("Admins of rarity 4: ", adminLogs.rarity4)
console.log("Admins of rarity 5: ", adminLogs.rarity5)
console.log("Admins of rarity 6: ", adminLogs.rarity6)
//make all immunity admins <= uncommon?

//U+1F5BC Framed picture
//U+26F0 mountain
//landslide U+1F6D8

//GOAT, U+1F410 charge line piece, or GOAT admin

//splash damage- mult to group targets??
//bomb bonuses -
//gene hybrids appear in shop

//TULIP, U+1F337 pair with bubble, some kind of effect based off money???

//CLAPPER BOARD, U+1F3AC Action 
// CRESCENT MOON, U+1F319

// MOUNT FUJI, U+1F5FB
//MEDIUM WHITE CIRCLE, U+26AA Pearl
//ROLLER COASTER, U+1F3A2
//TOOTHBRUSH, U+1FAA5
//TOOTH, U+1F9B7
//HINDU TEMPLE, U+1F6D5 polytheism
//KAABA, U+1F54B move in a circle
//WATER WAVE, U+1F30A surf
//HIBISCUS, U+1F33A + health
//FINGERPRINT, U+1FAC6
//LOLLIPOP, U+1F36D sweet tooth
//CANDY, U+1F36C
//PINCHED FINGERS, U+1F90C
// FISH CAKE WITH SWIRL DESIGN, U+1F365

//Helm Symbol ⎈ U+2388
// ♱ U+2671
// benzene ring ⏣
//fleur de lis U+269C
//۩ U+06E9 Arabic Place of Sajdah. Prayer
// U+1F3C4 surfing
// U+16B9 rune P
//rune bloodborne  U+16C9

//SOCKS, U+1F9E6
// BILLED CAP, U+1F9E2
//DIVING MASK, U+1F93F
//POURING LIQUID, U+1FAD7, spillage
//DUMPLING, U+1F95F Pierog
//PEANUTS, U+1F95C
//⛱️
//🀄
//🤍

//GAMER  VIDEO GAME, U+1F3AE
//Arevakhach LEFT-FACING ARMENIAN ETERNITY SIGN, U+58E
//RIGHT-FACING ARMENIAN ETERNITY SIGN, U+58D
// SAXOPHONE, U+1F3B7 + moves 
// ACCORDION, U+1FA97 Busker - 
//PINE DECORATION, U+1F38D
//SEAT, U+1F4BA Recliner
//CHAIR, U+1FA91
//HAIR PICK, U+1FAAE
//SPOOL OF THREAD, U+1F9F5
// COFFIN, U+26B0
//CLOSED MAILBOX WITH RAISED FLAG, U+1F4EB
//OLD KEY, U+1F5DD
//GOAL NET, U+1F945
// CELTIC CROSS, U+1F548

//complicated edits...
//ROUND PUSHPIN, U+1F4CD trap's heads are marked with pin, doesn't reveal them though
//NEST WITH EGGS, U+1FABA after placing last program, buff all pieces but make their deaths permanent?
//changes to movement/range
//SHOVEL, U+1FA8F remove node memory -

//SEE-NO-EVIL MONKEY, U+1F648 -1 range
//HEAR-NO-EVIL MONKEY, U+1F649 -1 defence
//SPEAK-NO-EVIL MONKEY, U+1F64A -1 attack/actions?

//FISHING POLE AND FISH, U+1F3A3 Bait, enemies attack player with highest defence?

//AMPERSAND, U+26

//AEGEAN NUMBER ONE THOUSAND, U+10122 hit markers

//MUSICAL SYMBOL GLISSANDO UP, U+1D1B1, stairs

//blood tax nerf to only attacking own pieces? overkills? or jolly roger?
//nerf needle to random stat? have a count? only trigger on bosses?
//COCKTAIL GLASS, U+1F378 hybrids get bonus stats on placement
//DECIDΑCPS TREE, U+1F333 OLD OAK, spawns acorns // CHESTNUT, U+1F330
// HOSPITAL, U+1F3E5
//blue screen of death - freezes all programs
// BLACK ROSETTE, U+1F3F6
//MOUNTAIN BICYCLIST, U+1F6B5

//PINE DECORATION, U+1F38D
//SYMBOL FOR SALT OF ANTIMONY, U+1F72D sceptre
//LINK SYMBOL, U+1F517
//ALCHEMICAL SYMBOL FOR GOLD, U+1F71A gold comet
// PUSHPIN, U+1F4CC
//WAVING BLACK FLAG, U+1F3F4


//ANKH, U+2625

//EGYPTIAN HIEROGLYPH S034, U+132F9
//EGYPTIAN HIEROGLYPH O010A, U+13262
// LEFT LUGGAGE, U+1F6C5 Key and suitcase


//CHEQUERED FLAG, U+1F3C1

// PLACARD, U+1FAA7

//WILTED FLOWER, U+1F940

//FOLDING HAND FAN, U+1FAAD

//BANKNOTE WITH DOLLAR SIGN, U+1F4B5

// POTTED PLANT, U+1FAB4

//hex SOFTWARE-FUNCTION SYMBOL, U+2394

//EXTRATERRESTRIAL ALIEN, U+1F47D

// AUTOMATED TELLER MACHINE, U+1F3E7

//TURNED BLACK SHOGI PIECE, U+26CA //black shield 

//8ball BILLIARDS, U+1F3B1

//stag
// LINEAR B IDEOGRAM B104 DEER, U+10082

//horse
//LINEAR B IDEOGRAM B105 EQUID, U+10083

//WHITE-FEATHERED RIGHTWARDS ARROW, U+27B3

//FUNERAL URN, U+26B1

// HIGH VOLTAGE SIGN, U+26A1

//HORSE RACING, U+1F3C7

// SPARKLES, U+2728

//alien
//EGYPTIAN HIEROGLYPH R028, U+132CF

//crosshair
//POSITION INDICATOR, U+2316

//LOCK, U+
//OLD KEY, U+1F5DD

//EGYPTIAN HIEROGLYPH AA024, U+13426 //gate??
//gate
// EGYPTIAN HIEROGLYPH N024, U+13208

//EGYPTIAN HIEROGLYPH D004, U+13079 //eye

//EGYPTIAN HIEROGLYPH D009, U+1307F //eye on stilts

// //bull
//EGYPTIAN HIEROGLYPH E001, U+130D2
//EGYPTIAN HIEROGLYPH F002, U+13100
// EGYPTIAN HIEROGLYPH F001, U+130FE

//turtle
// EGYPTIAN HIEROGLYPH I002, U+13189

//frog
//EGYPTIAN HIEROGLYPH I007, U+1318F

//beetle
//EGYPTIAN HIEROGLYPH L001, U+131A3

//fly
// EGYPTIAN HIEROGLYPH L003, U+131A6

//cricket
//EGYPTIAN HIEROGLYPH L004, U+131A7 Plague of locusts, remove all body tiles from enemies at start of round