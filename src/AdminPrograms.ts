import { Item } from "./Items";
import { Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate, StatModifier } from "./types";

export type AdminTrigger =
  | 'onPlacement'
  | 'onTurnEnd'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onDealDamage'
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
    targetType: "blueprint" | "piece" | "shopItem" | "player" | "gameState"  | 'playerAndGame',
    triggerType: TTrigger
  ) {
    super(name, description, unicode, color, cost, rarity, targetType);
    this.triggerType = triggerType;
  }

  apply(target: any):void{
    //do not destroy the admin
  }
  remove(target: any):void{

  }
  getModifier(): StatModifier {//remove this???
    return {}
  }
}

class Meteor extends Admin {
  static name = "Meteor Shower";
  static description = "Deals 3 damage to every piece at the start of a round";
  static unicode = "☄️";
  static color = "#000000ff";

  constructor() {
    super(Meteor.name, Meteor.description, Meteor.unicode, Meteor.color, 10, 4, 'gameState', 'onRoundStart')
  }

  //onRoundStart
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces) p.takeDamage(3); //enemy pieces only?
  }
}

class Miner extends Admin {
  static name = "Miner";
  static description = "Collect $2 every round";
  static unicode = "U+26CF";
  static color = "#ffa600d3";

  constructor() {
    super(Miner.name, Miner.description, Miner.unicode, Miner.color, 10, 1, 'player', 'onRoundEnd')
  }

  //noRoundend
  apply({ player }: { player: Player }) {
    player.money += 2
  }
  //
}

class Bubble extends Admin {
  static name = "Bubble";
  static description = "Increases interest by 1 every round, 10% chance to pop and reduce money to 0";
  static unicode = "U+1FAE7";
  static color = "#0400daff";

  constructor() {
    super(Bubble.name, Bubble.description, Bubble.unicode, Bubble.color, 10, 2, 'player', 'onRoundEnd')
  }

  //at end of round
  /*
  apply({ player }: { player: Player }) {
    player.interest += 1
  }*/

}

class Crystal extends Admin {
  static name = "Crystal Ball";
  static description = "See the next shop in advance";
  static unicode = "U+1F52E";
  static color = "#4b003bff";

  constructor() {
    super(Crystal.name, Crystal.description, Crystal.unicode, Crystal.color, 5, 1, 'gameState', 'other')
  }
  //modify app for this one
}

class Clover extends Admin {
  static name = "Lucky Clover";
  static description = "Raises chance of rarer items appearing";
  static unicode = "U+1F340";
  static color = "#00ff0dff";

  constructor() {
    super(Clover.name, Clover.description, Clover.unicode, Clover.color, 7, 2, 'gameState', 'other')//shop state, on round end? on OpenShop?
  }
  //interact with shop, modify shop for this
}

class Onion extends Admin {
  static name = "Onion";
  static description = "Saves you from one lost round but is destroyed in the process.";
  static unicode = "U+1F9C5";
  static color = "#00af17ad";

  constructor() {
    super(Onion.name, Onion.description, Onion.unicode, Onion.color, 10, 5, 'player', 'other')
  }
  //
  apply({ player }: { player: Player }) {
    player.lives += 1
  }//add a if for player death to remove this
}
//name desc utf || maxsize moves range atk def
class Blood extends Admin {
  static name = "Blood Tax";
  static description = "Each time damage is dealt earn $1";
  static unicode = "U+1FA78";
  static color = "#790000ff";

  constructor() {
    super(Blood.name, Blood.description, Blood.unicode, Blood.color, 10, 3, 'gameState', 'onDealDamage')//player?
  }

  //on damage
  apply({ player }: { player: Player }) {
    player.money += 2 //enemy pieces only?
  }
  
}

class BionicArm extends Admin {
  static name = "Bionic Arms";
  static description = "Raises all your program's attack by 2";
  static unicode = "U+1F9BE";
  static color = "#ff4040ff";

  constructor() {
    super(BionicArm.name, BionicArm.description, BionicArm.unicode, BionicArm.color, 7, 4, 'gameState', 'onPlacement')
  }
  
  //on placement/after hydration
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({attack: 2})//enemy pieces only?
      }
    }
  }
}

class BionicLeg extends Admin {
  static name = "Bionic Legs";
  static description = "Raises all your program's moves by 2";
  static unicode = "U+1F9BF";
  static color = "#d240ffff";

  constructor() {
    super(BionicLeg.name, BionicLeg.description, BionicLeg.unicode, BionicLeg.color, 7, 4, 'gameState', 'onPlacement')
  }

  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({moves: 2})//enemy pieces only?
      }
    }
  }
}

class Convenience extends Admin {
  static name = "Convenience Store";
  static description = "Open the shop any time";
  static unicode = "U+1F3EA";
  static color = "#55ff71ff";

  constructor() {
    super(Convenience.name, Convenience.description, Convenience.unicode, Convenience.color, 4, 2, 'gameState', 'other')//shop
  }
  //modify shop/player
}

class Department extends Admin {
  static name = "Department Store";
  static description = "+3 shop slots";
  static unicode = "U+1F3EC";
  static color = "#bebebeff";
  constructor() {
    super(Department.name, Department.description, Department.unicode, Department.color, 5, 3, 'gameState', 'other')//shop
  }
  //modify shop/player bool for this
}

class Eye extends Admin {//not passive
  static name = "Evil Eye";
  static description = "Lower's the defences of all enemy progams by 1 at start of round";
  static unicode = "U+1F9FF";
  static color = "#020072ff";

  constructor() {
    super(Eye.name, Eye.description, Eye.unicode, Eye.color, 8, 4, 'gameState', 'onRoundStart')
  }
  
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='enemy'){
        p.addModifier({defence: -2})//enemy pieces only?
      }
    }
  }
}

class Bouquet extends Admin {
  static name = "Bouquet";
  static description = "Held admin program's can reappear in the shop";
  static unicode = "U+1F490";
  static color = "#85e758ff";

  constructor() {
    super(Bouquet.name, Bouquet.description, Bouquet.unicode, Bouquet.color, 3, 3, 'gameState', 'other')//shop
  }
  //shop, disable for now
}

class Heartbreaker extends Admin {
  static name = "Heartbreaker";
  static description = "Makes your programs immune to being charmed on placement";
  static unicode = "U+1F498";
  static color = "#dadadaff";
  constructor() {
    super(Heartbreaker.name, Heartbreaker.description, Heartbreaker.unicode, Heartbreaker.color, 5, 3, 'player', 'onPlacement')
  }

  //on placement
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
       // p.charmImmune == true
      }
    }
  }
}

class Hamsa extends Admin {
  static name = "Hamsa";
  static description = "Raises all your placed program's defences by 1";
  static unicode = "U+1FAAC";
  static color = "#5560ffff";
  constructor() {
    super(Hamsa.name, Hamsa.description, Hamsa.unicode, Hamsa.color, 8, 5, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({defence: 1})//enemy pieces only?
      }
    }
  }
}

class Relay extends Admin {
  static name = "Relay";
  static description = "All placed programs with a range < 1 gain +1 attack";
  static unicode = "U+1F4E1";
  static color = "#e4d26fff";
  constructor() {
    super(Relay.name, Relay.description, Relay.unicode, Relay.color, 5, 3, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.getStat('range') > 1){
        p.addModifier({attack: 1})//enemy pieces only?
      }
    }
  }
}

class Hivis extends Admin {
  static name = "Hi-Vis";
  static description = "Saves a program from destruction once, then is deleted";
  static unicode = "U+1F9BA";
  static color = "#a7ff55ff";
  constructor() {
    super(Hivis.name, Hivis.description, Hivis.unicode, Hivis.color, 5, 1, 'gameState', 'onPieceDestruction')//??//onroundstart
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //p.addModifier({lives: 1})
      }
    }
  }
}

class Notepad extends Admin {
  static name = "Notepad";
  static description = "Increases memory by 3";
  static unicode = "U+1F5C7";
  static color = "#4b4b4bff";
  constructor() {
    super(Notepad.name, Notepad.description, Notepad.unicode, Notepad.color, 5, 3, 'player', 'other')
  }
  apply({ player }: { player: Player }) {
    player.memory += 3
  }
  remove({ player }: { player: Player }) {
    player.memory -= 3
  }
}

// GLOBE WITH MERIDIANS, U+1F310
class AdminMap extends Admin {
  static name = "AdminMap";
  static description = "See the incoming level in advance";
  static unicode = "U+1F5FA";
  static color = "#001cbbff";
  constructor() {
    super(AdminMap.name, AdminMap.description, AdminMap.unicode, AdminMap.color, 1, 2, 'gameState', 'other')
  }
  //player bool
}

class PetriDish extends Admin {
  static name = "Petri Dish";
  static description = "Status effects can spread to adjacent enemy programs at the end of your turn";
  static unicode = "U+1F9EB";
  static color = "#14532dff";
  constructor() {
    super(PetriDish.name, PetriDish.description, PetriDish.unicode, PetriDish.color, 7, 4, 'gameState', 'onTurnEnd')
  }
  //on turn end
  /*apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.statuses.length > 0){
        //find enemies next to it
        //50% chance to add 1 status from player to enemy
      }
    }
  }*/
}

class Volatile extends Admin {
  static name = "Volatile";
  static description = "Status effects are doubled";//sell for buying price?
  static unicode = "U+1F9EA";
  static color = "#00ff22c7";
  constructor() {
    super(Volatile.name, Volatile.description, Volatile.unicode, Volatile.color, 6, 4, 'gameState', 'onTurnEnd')
  }
  //mod status
}

class Inheritance extends Admin {
  static name = "Inheritance";
  static description = "Interest is doubled";
  static unicode = "U+1F911";
  static color = "#ffc955ff";
  constructor() {
    super(Inheritance.name, Inheritance.description, Inheritance.unicode, Inheritance.color, 10, 5, 'player', 'onRoundEnd')
  }
  /*
  apply({ player }: { player: Player }) {
    player.interest = player.interest * 2
  }
  remove({ player }: { player: Player }) {
    player.interest = player.interest / 2
  }*/
}

class CreditCard extends Admin {
  static name = "Credit Card";
  static description = "Go up to $20 in debt";
  static unicode = "U+1F4B3";
  static color = "#ff5555";
  constructor() {
    super(CreditCard.name, CreditCard.description, CreditCard.unicode, CreditCard.color, 1, 2, 'gameState', 'other')//shop
  }
  //shop lower limit change
}

class Needle extends Admin {
  static name = "Needle";
  static description = "Winning a round with one program placed boosts all it's stats by one permanently - unfinished";
  static unicode = "U+1FAA1";
  static color = "#b448a6ff";
  constructor() {
    super(Needle.name, Needle.description, Needle.unicode, Needle.color, 10, 5, 'gameState', 'onRoundEnd')//6 and player?
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      const playerPieces = [];
      if(p.team==='player'){
        playerPieces.push(p)
        //p.addModifier({lives: 1})
      }
      if(playerPieces.length = 1){
       //needs to interact with the blueprint
      }
    }
  }
}

class Rune extends Admin {
  static name = "Rune";
  static description = "Programs with a range of 1 deal x2 damage on attacking";
  static unicode = "U+16B1";
  static color = "#ff5555";
  constructor() {
    super(Rune.name, Rune.description, Rune.unicode, Rune.color, 5, 3, 'player', 'onDealDamage')
  }
  //onDamage
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.getStat('range') === 1){
        p.attack = p.attack *2 //include mods??? add a mult to takeDamage function
      }
    }
  }
}

class Joker extends Admin {
  static name = "Joker";
  static description = "Player damage is x1.5 on attacking";
  static unicode = "U+1F0CF";
  static color = "#ff5555";
  constructor() {
    super(Joker.name, Joker.description, Joker.unicode, Joker.color, 7, 2, 'player', 'onDealDamage')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.getStat('range') === 1){
        p.attack = p.attack *1.5 //include mods???
      }
    }
  }
}

class Chemistry extends Admin {
  static name = "Chemistry";
  static description = "Items effects are doubled";
  static unicode = "U+2697";
  static color = "#4eb95cff";
  constructor() {
    super(Chemistry.name, Chemistry.description, Chemistry.unicode, Chemistry.color, 6, 5, 'gameState', 'other')//on Item use
  }
  //seperate flag for this
}

class Aesculapius extends Admin {
  static name = "Aesculapius";
  static description = "All placed programs are immune to posion and disease";
  static unicode = "U+2695";
  static color = "#084610ff";
  constructor() {
    super(Aesculapius.name, Aesculapius.description, Aesculapius.unicode, Aesculapius.color, 4, 2, 'player', 'onPlacement')//or gamestate?
  }

  //on placement
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //p.poisonImmune = true;
        //p.diseaseImmune = true;
      }
    }
  }
  remove({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //p.poisonImmune = false;
        //p.diseaseImmune = false;
      }
    }
  }
}

class Heart extends Admin {
  static name = "Heart";
  static description = "Programs all gain +1 max size";
  static unicode = "U+1FAC0";
  static color = "#ff5555";
  constructor() {
    super(Heart.name, Heart.description, Heart.unicode, Heart.color, 6, 3, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({maxSize: 1})
      }
    }
  }
}

class Lungs extends Admin {
  static name = "Lungs";
  static description = "Programs all gain +1 moves";
  static unicode = "U+1FAC1";
  static color = "#ff5555";
  constructor() {
    super(Lungs.name, Lungs.description, Lungs.unicode, Lungs.color, 5, 3, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({moves: 1})
      }
    }
  }
}

class Brain extends Admin {
  static name = "Brain";
  static description = "placed programs all have +1 actions";
  static unicode = "U+1F9E0";
  static color = "#ff5555";
  constructor() {
    super(Brain.name, Brain.description, Brain.unicode, Brain.color, 9, 4, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({actions: 1})
      }
    }
  }
}

class GoldenTicket extends Admin {
  static name = "Golden Ticket";
  static description = "Skip a level for $5";
  static unicode = "U+1F3AB";
  static color = "#dfba42ff";
  constructor() {
    super(GoldenTicket.name, GoldenTicket.description, GoldenTicket.unicode, GoldenTicket.color, 5, 4, 'gameState', 'other');
  }
  //intereact with map
}

class Dove extends Admin {
  static name = "Dove";
  static description = "1 free move after placing at the start of every round";
  static unicode = "U+1F54A";
  static color = "#3be2ffff";
  constructor() {
    super(Dove.name, Dove.description, Dove.unicode, Dove.color, 7, 5, 'gameState', 'onRoundStart')//other
  }
  //bool
}

class Stonks extends Admin {
  static name = "Stonks";
  static description = "+1 interest for every $5 you have";
  static unicode = "U+1F4C8";
  static color = "#55ff6cff";
  constructor() {
    super(Stonks.name, Stonks.description, Stonks.unicode, Stonks.color, 5, 3, 'player', 'onRoundEnd')
  }

  //on end of round
  apply({ player }: { player: Player }) {
    //const noOfFives = player.interest / 5 //round down
    //player.interest += noOfFives;
  }
  remove({ player }: { player: Player }) {
   
  }
}

class Trolley extends Admin {
  static name = "Trolley";
  static description = "Items only use 0.5 memory each";
  static unicode = "U+1F6D2";
  static color = "#55fff1ff";
  constructor() {
    super(Trolley.name, Trolley.description, Trolley.unicode, Trolley.color, 5, 2, 'gameState', 'other')//'player')??
  }
  //all items/ shop mod
}

export class Toolbox extends Admin {
  static name = "Toolbox";
  static description = "Programs only use 0.5 memory each";
  static unicode = "U+1F9F0";
  static color = "#ff55c6ff";
  constructor() {
    super(Toolbox.name, Toolbox.description, Toolbox.unicode, Toolbox.color, 7, 3, 'gameState', 'other')//'player')??
  }
  //all items/ shop mod
}

class Backdoor extends Admin {
  static name = "Backdoor";
  static description = "Load Progams anywhere";
  static unicode = "U+1F6AA";
  static color = "#0a0a0aff";
  constructor() {
    super(Backdoor.name, Backdoor.description, Backdoor.unicode, Backdoor.color, 8, 4, 'gameState', 'other')
  }
  //bool for placement function
}

class Communism extends Admin {
  static name = "Communism";
  static description = "+1 all stats to all placed programs while money is under 4";
  static unicode = "U+262D";
  static color = "#ff0000ff";
  constructor() {
    super(Communism.name, Communism.description, Communism.unicode, Communism.color, 5, 3, 'playerAndGame', 'onPlacement')
  }

  //on placement
  apply({ player, activePieces }: { player: Player, activePieces: Piece[] }) {
    if (player.money <= 4){
      for (const p of activePieces){
        if(p.team==='player'){
          p.addModifier({
            attack: 1,
            defence: 1,
            maxSize: 1,
            moves: 1,
            range: 1
          })
        }
      }
    }
  }
  remove({ activePieces }: { activePieces: Piece[] }) {
      for (const p of activePieces){
        if(p.team==='player'){
          p.addModifier({
            attack: -1,
            defence: -1,
            maxSize: -1,
            moves: -1,
            range: -1
          })
        }
      }
  }
}

class Palette extends Admin {
  static name = "Pallete";
  static description = "Place twice at the start of a round";
  static unicode = "U+1F3A8";
  static color = "#ff55f6ff";
  constructor() {
    super(Palette.name, Palette.description, Palette.unicode, Palette.color, 6, 4, 'gameState', 'onRoundStart')//other
  }
  //round logic edit
}

class Osiris extends Admin {
  static name = "Osiris";
  static description = "+1 damage to every placed piece each time one of a program is destroyed";
  static unicode = "U+1314A";
  static color = "#33073bff";
  constructor() {
    super(Osiris.name, Osiris.description, Osiris.unicode, Osiris.color, 8, 4, 'gameState', 'onPieceDestruction')
  }
  //on receive damage //on piece destrcution
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({attack: 1})
      }
    }
  }
}

class Slots extends Admin {
  static name = "Slots";
  static description = "Rerolls cos $2 less";
  static unicode = "U+1F3B0";
  static color = "#ff5555";
  constructor() {
    super(Slots.name, Slots.description, Slots.unicode, Slots.color, 5, 1, 'gameState', 'other')//shop
  }
  //shop edit
}

class Newspaper extends Admin {
  static name = "Millwall Brick";
  static description = "+1 damage for programs with 1 range on load";
  static unicode = "U+1F5DE";
  static color = "#5c5c5cff";
  constructor() {
    super(Newspaper.name, Newspaper.description, Newspaper.unicode, Newspaper.color, 1, 2, 'player', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.getStat('range')===1){
        p.addModifier({attack: 1})
      }
    }
  }
}

class Crown extends Admin {
  static name = "Landed";
  static description = "Gain $5 every round";
  static unicode = " U+1F451";
  static color = "#e6c98bff";
  constructor() {
    super(Crown.name, Crown.description, Crown.unicode, Crown.color, 9, 3, 'gameState', 'onRoundEnd')//maybe player
  }
  //on round end
  apply({ player }: { player: Player }) {
   player.money += 5;
  }
}

class Cactus extends Admin {
  static name = "Cactus";
  static description = "Programs retaliate 1 damage when they are attacked";
  static unicode = "U+1F335";
  static color = "#dfb372ff";
  constructor() {
    super(Cactus.name, Cactus.description, Cactus.unicode, Cactus.color, 10, 5, 'gameState', 'onReceiveDamage')//pieces?
  }
  //on receive damage
}

class Compass extends Admin {
  static name = "Compass";
  static description = "Always show the path to the nearest shop - unfinished";
  static unicode = "U+1F9ED";
  static color = "#ff5555";
  constructor() {
    super(Compass.name, Compass.description, Compass.unicode, Compass.color, 2, 1, 'gameState', 'other')
  }
  //map edit
}

class Seed extends Admin {
  static name = "Seed";
  static description = "Raises maximum interest to $10";
  static unicode = "U+1F331";
  static color = "#ff5555";
  constructor() {
    super(Seed.name, Seed.description, Seed.unicode, Seed.color, 10, 1, 'player', 'other')
  }
  //interest
  /*
  apply({ player }: { player: Player }) {
   player.interestCap = 10;
  }
  remove({ player }: { player: Player }) {
   player.interestCap = 5;
  }
   */
}

class Puzzle extends Admin {
  static name = "Puzzle Piece";
  static description = "Programs with an ally adjacent to their head gain +1 defence at the end of your turn";
  static unicode = " U+1F9E9";
  static color = "#ff5555";
  constructor() {
    super(Puzzle.name, Puzzle.description, Puzzle.unicode, Puzzle.color, 6, 3, 'gameState', 'onTurnEnd')
  }
  //on turn end
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        p.addModifier({defence: 1})
        //else no buff
      }
    }
  }
}

class Roger extends Admin {
  static name = "Jolly Roger";
  static description = "Gain $1 per destroyed program";
  static unicode = "U+2620";
  static color = "#ff5555";
  constructor() {
    super(Roger.name, Roger.description, Roger.unicode, Roger.color, 6, 3, 'player', 'onPieceDestruction')
  }
  //on piece destruction
  apply({ player }: { player: Player }) {
   player.money += 1;
  }
}

class Bucket extends Admin {
  static name = "Bucket";
  static description = "+2 memory";
  static unicode = "U+1FAA3";
  static color = "#ff5555";
  constructor() {
    super(Bucket.name, Bucket.description, Bucket.unicode, Bucket.color, 4, 1, 'player', 'other')
  }
  //
  apply({ player }: { player: Player }) {
   player.memory += 2;
  }
  remove({ player }: { player: Player }) {
   player.memory -= 2;
  }
}

class Diamond extends Admin {
  static name = "Diamond";//payroll
  static description = "Every $10 at the end of your turn increases all program's defence by 1";
  static unicode = "U+1F48E";
  static color = "#ff5555";
  constructor() {
    super(Diamond.name, Diamond.description, Diamond.unicode, Diamond.color, 8, 5, 'playerAndGame', 'onTurnEnd')
  }
  apply({ player, activePieces }: { player: Player, activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        const noOfTens = player.money / 10 //rounded down
        p.addModifier({defence: noOfTens})
        //else no buff
      }
    }
  }
}

class Drum extends Admin {
  static name = "Marching Drum";
  static description = "+1 moves for all placed programs";
  static unicode = "U+1F941";
  static color = "#ff5555";
  constructor() {
    super(Drum.name, Drum.description, Drum.unicode, Drum.color, 3, 1, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        p.addModifier({moves: 1})
        //else no buff
      }
    }
  }
}

class Sneakers extends Admin {//item???
  static name = "Trainers";
  static description = "+1 moves for all placed programs";
  static unicode = "U+1F45F";
  static color = "#36c723ff";
  constructor() {
    super(Sneakers.name, Sneakers.description, Sneakers.unicode, Sneakers.color, 6, 3, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        p.addModifier({moves: 1})
        //else no buff
      }
    }
  }
}

//candle U+1F56F
class Torch extends Admin {
  static name = "Torch";
  static description = "+1 range for all programs";
  static unicode = "U+1F526";
  static color = "#f0aa13ff";
  constructor() {
    super(Torch.name, Torch.description, Torch.unicode, Torch.color, 4, 1, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        //from the headposition, look for adjacent player tiles
        p.addModifier({range: 1})
        //else no buff
      }
    }
  }
}

class Feather extends Admin {
  static name = "Feather";
  static description = "+3 moves, -1 maxSize for all placed programs";
  static unicode = "U+1FAB6";
  static color = "#ff5555";
  constructor() {
    super(Feather.name, Feather.description, Feather.unicode, Feather.color, 8, 5, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({moves: 1})
        p.addModifier({maxSize: -1})
      }
    }
  }
}

class Copier extends Admin {
  static name = "Copier";
  static description = "Places a copy of your first placed program 1 space to the right";
  static unicode = "U+1F5A8";
  static color = "#ff5555";
  constructor() {
    super(Copier.name, Copier.description, Copier.unicode, Copier.color, 9, 5, 'playerAndGame', 'onPlacement')
  }
  //on placement, handle in App
  apply({ activePieces }: { activePieces: Piece[] }) {
    const playerPieces : Piece[] = [];
    for (const p of activePieces){
      if(p.team==='player'){
        playerPieces.push(p)
      }
    }
    if(playerPieces.length === 1){
      const PieceClass = allPieces.find(p => p.name === playerPieces[0].name)
      if (!PieceClass) return
      const newHead : Coordinate = {x: playerPieces[0].headPosition.x + 1, y: playerPieces[0].headPosition.y}
      //no ref of activePieces to removePiece from
      //const copy = new PieceClass(newHead, 'player', removePiece, crypto.randomUUID());
      //const copy = playerPieces[0]//new Instance???
      //activePieces.push(copy)
    }
  }
}

class Telescope extends Admin {
  static name = "Telescope";
  static description = "+2 range for all your placed programs";
  static unicode = "U+1F52D";
  static color = "#ff5555";
  constructor() {
    super(Telescope.name, Telescope.description, Telescope.unicode, Telescope.color, 6, 4, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player'){
        p.addModifier({range: 1})
      }
    }
  }
}

class Microscope extends Admin {
  static name = "Microbiology";
  static description = "Placed programs with a max size of 1 get +1 defence";
  static unicode = "U+1F52C";
  static color = "#ff5555";
  constructor() {
    super(Microscope.name, Microscope.description, Microscope.unicode, Microscope.color, 5, 3, 'gameState', 'onPlacement')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='player' && p.maxSize === 1){
        p.addModifier({defence: 1})
      }
    }
  }
}

class Lotus extends Admin {//boss? remove money?
  static name = "Lotus";
  static description = "Rare admin pieces give x1.5 damage";
  static unicode = "U+1FAB7";
  static color = "#ff5555";
  constructor() {
    super(Lotus.name, Lotus.description, Lotus.unicode, Lotus.color, 10, 5, 'player', 'onDealDamage')
  }
  //on damage
  apply({ player}: { player: Player}) {
    let mult = 0;
    for (const a of player.admins){
      if(a.rarity === 3){
        mult +=1
      }
    }
    //player.dmgMult += mult;
  }
}

export class Broom extends Admin {
  static name = "Broom";
  static description = "Automatically clears all enemies with 1 size and 0 defence on the end of your turn";
  static unicode = "U+1F9F9";
  static color = "#c7b07eff";
  constructor() {
    super(Broom.name, Broom.description, Broom.unicode, Broom.color, 10, 5, 'gameState', 'onTurnEnd')
  }
  apply({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces){
      if(p.team==='enemy' && p.tiles.length === 1 && p.defence === 0){
        //activePieces.value = activePieces.value.filter(p => p.id !== piece.id);
        //splice or equivalent???
      }
    }
  }
}

export const allAdmins = [Meteor, Miner, Bubble, Crystal, Clover, Onion, Blood, BionicArm, BionicLeg, Convenience, Department, Eye, Bouquet, Heartbreaker, Hamsa, Relay, Hivis, Notepad, AdminMap, PetriDish, Volatile, Inheritance, CreditCard, Needle, Rune, Joker, Chemistry, Aesculapius, Heart, Lungs, Brain, GoldenTicket, Dove, Stonks, Trolley, Toolbox, Backdoor, Communism, Palette, Osiris, Slots, Newspaper, Crown, Cactus, Compass, Seed, Puzzle, Roger, Bucket, Diamond, Drum, Sneakers, Torch, Feather, Copier, Telescope, Microscope, Lotus, Broom];

// GLOBE WITH MERIDIANS, U+1F310
//Daemon
//IMP, U+1F47F

//passive programs

// FLOWER PLAYING CARDS, U+1F3B4

// GAME DIE, U+1F3B2

//PEA POD, U+1FADB
// PLACARD, U+1FAA7
//disco  CARPENTRY SAW, U+1FA9A
//FOLDING HAND FAN, U+1FAAD
//// MONEY BAG, U+1F4B0
//BANKNOTE WITH DOLLAR SIGN, U+1F4B5

// BROOM, U+1F9F9

//clippy - provides hints
//PAPERCLIP, U+1F4CE

//FISHING POLE AND FISH, U+1F3A3

//8ball  BILLIARDS, U+1F3B1

//LEFT-POINTING MAGNIFYING GLASS, U+1F50D
// //reveal secrets

//GREEK SMALL LETTER PI, U+3C0

//copier - copy a program



//PAPERCLIP, U+1F4CE
// PUSHPIN, U+1F4CC

// PERFORMING ARTS, U+1F3AD

// LOCK, U+1F512

//JIGSAW PUZZLE PIECE, U+1F9E9

//hex SOFTWARE-FUNCTION SYMBOL, U+2394

//BENZENE RING, U+232C

//EXTRATERRESTRIAL ALIEN, U+1F47D
//space invaders ALIEN MONSTER, U+1F47E

// AUTOMATED TELLER MACHINE, U+1F3E7
// SNOWFLAKE, U+2744
//AI TRACKBALL, U+1F5B2
// WHALE, U+1F40B

// TOOLBOX, U+1F9F0

// ICE CUBE, U+1F9CA

//BLACK CHESS KNIGHT, U+265E
//TURNED BLACK SHOGI PIECE, U+26CA //black shield 

//BUILDING CONSTRUCTION, U+1F3D7 crane

//8ball BILLIARDS, U+1F3B1

//LINK SYMBOL, U+1F517

//BLACK SPADE SUIT, U+2660

// MILKY WAY, U+1F30C

//stag
// LINEAR B IDEOGRAM B104 DEER, U+10082

//horse
//LINEAR B IDEOGRAM B105 EQUID, U+10083

//BLACK CROSS ON SHIELD, U+26E8

//IDENTIFICATION CARD, U+1FAAA

// RINGED PLANET, U+1FA90

// RING BUOY, U+1F6DF lifeline

// X-RAY, U+1FA7B

//DNA DOUBLE HELIX, U+1F9EC

// FEATHER, U+1FAB6

//SKULL, U+1F480

//CHEQUERED FLAG, U+1F3C1

//interest
//CHART WITH UPWARDS TREND AND YEN SIGN, U+1F4B9

// TEDDY BEAR, U+1F9F8

//WHITE-FEATHERED RIGHTWARDS ARROW, U+27B3

//BRIEFCASE, U+1F4BC

// COFFIN, U+26B0

// HEADSTONE, U+1FAA6

//FUNERAL URN, U+26B1

// HIGH VOLTAGE SIGN, U+26A1

// PASSPORT CONTROL, U+1F6C2

// LEFT LUGGAGE, U+1F6C5 Key and suitcase

// MAP SYMBOL FOR LIGHTHOUSE, U+26EF

// BLACK SCISSORS, U+2702

//HORSE RACING, U+1F3C7

// FENCER, U+1F93A

//BOXING GLOVE, U+1F94A

//ankh
//EGYPTIAN HIEROGLYPH S034, U+132F9

//alien
//EGYPTIAN HIEROGLYPH R028, U+132CF

//crosshair
//POSITION INDICATOR, U+2316

//LOCK, U+
//OLD KEY, U+1F5DD

//EGYPTIAN HIEROGLYPH AA024, U+13426 //gate??
//gate
// EGYPTIAN HIEROGLYPH N024, U+13208

// CROWN, U+1F451

//DARK SUNGLASSES, U+1F576

// FLOPPY DISK, U+1F4BE //backup

//EGYPTIAN HIEROGLYPH D004, U+13079 //eye

//EGYPTIAN HIEROGLYPH D009, U+1307F //eye on stilts

//PURSE, U+1F45B

//DARK SUNGLASSES, U+1F576

//NO MOBILE PHONES, U+1F4F5

//SEEDLING, U+1F331

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
//EGYPTIAN HIEROGLYPH L004, U+131A7

//MONEY BAG, U+1F4B0

//MONEY WITH WINGS, U+1F4B8

// LUGGAGE, U+1F9F3

// TICKET, U+1F3AB

//ADMISSION TICKETS, U+1F39F

// HIGH VOLTAGE SIGN, U+26A1



//OS-vouchers???
// PENGUIN, U+1F427
//+1 to all player stats - memory admin interest

//WINDOW, U+1FA9F
//+1 admin -1 memory

// GREEN APPLE, U+1F34F
//+1 memory -1 interest

// SCALES, U+2696 --- CLASSICAL BUILDING, U+1F3DB --- CROSSED SWORDS, U+2694
//temple - +1 admin +1 memory -1 interest
//---------