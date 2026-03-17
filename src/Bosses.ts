import { Admin } from "./AdminPrograms";
import { Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate } from "./types";
import { DIFFICULTY_RARITY } from "./constants";
import { getRandomUnoccupiedTile } from "./helperFunctions";
/*
targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame' | 'piecesandBoard' | 'all'
| 'onPlacement'
  | 'onTurnEnd'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onDealDamage' //piece id of receiver?
  | 'onReceiveDamage'
  | 'onPieceDestruction'
  | 'other';
  
*/

//lower difficulty of +1 bosses, more +2 bosses
//have boss maximums before endless mode
class NorthWind extends Admin {//🌬️//dash U+1F4A8
    static rarity = 1;
  static name = "North Wind";
  static description = "All player pieces are moved down 1 space after every turn";
  static unicode = "U+1F32C";//"U+1F38F";//carp windsock//U+1F4A8 dash cloud//wind face "U+1F32C";
  static color = "rgb(207, 238, 238)";
  constructor() {
    super(NorthWind.name, NorthWind.description, NorthWind.unicode, NorthWind.color, 5, NorthWind.rarity, 'piecesAndBoard', 'onTurnEnd')
  }
    //type all, tileset and activePieces
    async apply({activePieces, board }: {activePieces: Piece[], board: Coordinate[] }) {
        const playerPieces: Piece[] = []
        for(const piece of activePieces){
            if(piece.team === 'player'){
                playerPieces.push(piece)
            }
        };
        for(const piece of playerPieces){
            const spaceToCheck  = {x: piece.headPosition.x, y: piece.headPosition.y+1}
            //check space is unnocupied and on board
            const isOccupied = activePieces.some(p =>
                p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            );
            const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            //if(!isOccupied && isOnBoard){
            if(!isOccupied && isOnBoard){
                piece.moveTo(spaceToCheck);
            }
        };
    }
  
}

class Hook extends Admin {
    static rarity = 2;
  static name = "Hook";
  static description = "All player pieces are moved up 1 space after every turn";
  static unicode = "U+1FA9D";
  static color = "#0a1179ff";
  constructor() {
    super(Hook.name, Hook.description, Hook.unicode, Hook.color, 5, Hook.rarity, 'piecesAndBoard', 'onTurnEnd')
  }

    async apply({activePieces, board }: {activePieces: Piece[], board: Coordinate[] }) {
        const playerPieces: Piece[] = []
        for(const piece of activePieces){
            if(piece.team === 'player'){
                playerPieces.push(piece)
            }
        };
        for(const piece of activePieces){
            const spaceToCheck  = {x: piece.headPosition.x, y: piece.headPosition.y-1}
            //check space is unnocupied and on board
            const isOccupied = activePieces.some(p =>
                p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            );
            const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            if(!isOccupied && isOnBoard){
                piece.moveTo(spaceToCheck);
            }
        };
    }
}

class Mirror extends Admin {
    static rarity = 2;
  static name = "Mirror";
  static description = "Enemy Programs are chosen from blueprints in your inventory";
  static unicode = "U+1FA9E";
  static color = "rgb(30, 0, 112)";
  constructor() {
    super(Mirror.name, Mirror.description, Mirror.unicode, Mirror.color, 5, Mirror.rarity, 'playerAndGame', 'onRoundStart')
  }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        const enemyPieces: Piece[] = []
        for(const piece of activePieces){
            enemyPieces.push(piece)
            if(piece.team === 'enemy'){
            }
        };

        for (const piece of enemyPieces){
            const enemyClassName = player.programs[Math.floor(Math.random() *player.programs.length)].name;//random name from player pieceBlueprints
            const EnemyClass = allPieces.find(p => p.name === enemyClassName);
            if(EnemyClass){
                const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', piece.removeCallback, crypto.randomUUID());//check later
                activePieces.push(enemyInstance);
                piece.removeCallback?.(piece);
            }
        }  //does this always end the round??
    }
}

class Downturn extends Admin {
    static rarity = 2;
    static name = "Downturn";
    static description = "Lose $1 after every turn";
    static unicode = "U+1F4C9";
    static color = "#f11212ff";
    constructor() {
        super(Downturn.name, Downturn.description, Downturn.unicode, Downturn.color, 5, Downturn.rarity, 'player', 'onTurnEnd')
    }
    async apply({ player }: { player: Player }) {
       player.money --
    }
}

class Factory extends Admin {
static rarity = 4;
  static name = "Factory";
  static description = "Places a new enemy piece every 3 turns";
  static unicode = "U+1F3ED";
  static color = "#790a0aff";
  constructor() {
    super(Factory.name, Factory.description, Factory.unicode, Factory.color, 5, Factory.rarity, 'all', 'onTurnEnd')
  }
    private count: number = 0
    async apply({activePieces, board, player }: {activePieces: Piece[], board: Coordinate[], player: Player}) {
        this.count += 1;
        if(this.count%3 === 0){
            //random piece in all pieces using player difficulty level
            const { min, max } = DIFFICULTY_RARITY[player.difficulty];
            const validEnemies = allPieces.filter(p =>
                p.rarity >= min && p.rarity <= max && p.name !== 'Nuke' && p.name !== 'Trap' &&  p.name !== 'Tar' && p.name !== 'Pitfall' && p.name !== 'Web' && p.name !== 'Mine'
            );
            const pool = validEnemies.length > 0 ? validEnemies : allPieces;
            const EnemyClass = pool[Math.floor(Math.random() * pool.length)];//random piece ranked for diificulty

            //get a random unnoccupied space
            const space = getRandomUnoccupiedTile(board, activePieces);//removeCallback

            if(space){
                const enemyInstance = new EnemyClass(space, 'enemy', activePieces[0].removeCallback, crypto.randomUUID());//check later
                enemyInstance.movesRemaining = 0;
                enemyInstance.actions = 0;
                activePieces.push(enemyInstance);
            }
            this.count = 0;
        }
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Wrath extends Admin {//⛈️//🌩️
  static name = "Wrath";
  static description = "A random player piece loses their remaining defence and a tile each turn after the first";
  static unicode = "U+1F329";
  static color = "rgb(9, 2, 107)";
  static rarity = 6;
  constructor() {
    super(Wrath.name, Wrath.description, Wrath.unicode, Wrath.color, 5, Wrath.rarity, 'gameState', 'onTurnEnd')
  }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        if(this.count >= 1){
            const playerPieces: Piece[] = []
            for(const piece of activePieces){
                if(piece.team === 'player'){
                    playerPieces.push(piece)
                }
            };
            const randId = playerPieces[Math.floor(Math.random() * playerPieces.length)].id
            const idx = activePieces.findIndex(p => p.id === randId);
            activePieces[idx].takeDamage(1 + activePieces[idx].defenceRemaining);//should also remove a size 1 piece from the board
        }
        this.count ++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Reaper extends Admin {
  static name = "Reaper";
  static description = "Takes a life every 10 turns";
  static unicode = "U+1F480";
  static color = "#790a0aff";
  static rarity = 6;
  constructor() {
    super(Reaper.name, Reaper.description, Reaper.unicode, Reaper.color, 5, Reaper.rarity, 'player', 'onTurnEnd')
  }
    private count: number = 0
    async apply({ player }: { player : Player }) {
        this.count += 1
        if(this.count === 10){
            player.lives --
            this.count = 0;
        }

    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Volcano extends Admin {
  static name = "Volcano";
  static description = "After 5 turns, burning is applied to every player program at the end of every turn";//coundown to round loss??
  static unicode = "U+1F30B";
  static color = "#790a0aff";
  static rarity = 5;
  constructor() {
    super(Volcano.name, Volcano.description, Volcano.unicode, Volcano.color, 5, Volcano.rarity, 'gameState', 'onTurnEnd')
  }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.count += 1
        if(this.count >= 5){
            for(const piece of activePieces){
                if(piece.team === 'player' && !piece.immunities.burning){
                    piece.statuses.burning = true;
                }
            };
        }
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Circus extends Admin {
    static name = "Circus";
    static description = "Every enemy gains +1 moves at the start of the round";
    static unicode = "U+1F3AA";
    static color = "rgb(255, 131, 245)";
    static rarity = 3;
    constructor() {
        super(Circus.name, Circus.description, Circus.unicode, Circus.color, 5, Circus.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ moves: 1 })
            }
        };
    }
}

class Castle extends Admin {
    static name = "Castle";
    static description = "Every enemy gains +1 defence at the start of the round";
    static unicode = "U+1F3EF";
    static color = "rgb(217, 255, 253)";
    static rarity = 4;
    constructor() {
        super(Castle.name, Castle.description, Castle.unicode, Castle.color, 5, Castle.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ defence: 1 })
            }
        };
    }
}

class Anchor extends Admin {
    static name = "Anchor";
    static description = "Every player program loses -1 moves";
    static unicode = "U+2693";
    static color = "#0a063fff";
    static rarity = 3;
    constructor() {
        super(Anchor.name, Anchor.description, Anchor.unicode, Anchor.color, 5, Anchor.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({moves: -1})
    }
}

class Jack extends Admin {
    static name = "Jack O' Lantern";
    static description = "Every enemy gains +1 range at the start of the round";
    static unicode = "U+1F383";
    static color = "#000000ff";
    static rarity = 4;
    constructor() {
        super(Jack.name, Jack.description, Jack.unicode, Jack.color, 5, Jack.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ range: 1 })
            }
        };
    }
}

class Lock extends Admin {
    static name = "Encryption";
    static description = "Every enemy gains +2 defence at the start of the round";
    static unicode = "U+1F512";
    static color = "#ad1400ff";
    static rarity = 4;
    constructor() {
        super(Lock.name, Lock.description, Lock.unicode, Lock.color, 6, Lock.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ defence: 2 })
            }
        };
    }
}

class Eclipse extends Admin {
    static name = "Eclipse";
    static description = "Every player program loses -1 range";
    static unicode = "U+1F31A";
    static color = "#000000ff";
    static rarity = 5;
    constructor() {
        super(Eclipse.name, Eclipse.description, Eclipse.unicode, Eclipse.color, 5, Eclipse.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({range: -1})
    }
}

class LowBattery extends Admin {
    static name = "Drain";
    static description = "Every player program loses -1 max size";
    static unicode = "U+1FAAB";
    static color = "#ca220bff";
    static rarity = 1;
    constructor() {
        super(LowBattery.name, LowBattery.description, LowBattery.unicode, LowBattery.color, 3, LowBattery.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(activePieces[idx].getStat('maxSize') > 1){
            activePieces[idx].addModifier({maxSize: -1})
        }
    }
}

class Customs extends Admin {//remove
    static name = "Customs";
    static description = "Every player program is exposed";
    static unicode = "U+1F6C3";
    static color = "#127a3eff";
    static rarity = 3;
    constructor() {
        super(Customs.name, Customs.description, Customs.unicode, Customs.color, 3, Customs.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.exposed){
            activePieces[idx].statuses.exposed = true;
            activePieces[idx].statuses.hidden = false;
        }
        //activePieces[idx].addModifier({moves: -1})
    }
}
class Shrine extends Admin {
    static name = "Shrine";
    static description = "Every player program loses -1 attack";
    static unicode = "U+26E9";
    static color = "#7a1217ff";
    static rarity = 2;
    constructor() {
        super(Shrine.name, Shrine.description, Shrine.unicode, Shrine.color, 4, Shrine.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({attack: -1})
    }
}
class Izakaya extends Admin {
    static name = "Izakaya";
    static description = "Every player program is confused";
    static unicode = "U+1F3EE";
    static color = "#dbb60dff";
    static rarity = 3;
    constructor() {
        super(Izakaya.name, Izakaya.description, Izakaya.unicode, Izakaya.color, 6, Izakaya.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.confused){
            activePieces[idx].statuses.confused = true;
        }
    }
}

class Snowflake extends Admin {//LEAFLESS TREE, U+1FABE
    static name = "Cold Snap";
    static description = "Every player program is frozen";
    static unicode = "U+2744";
    static color = "#0d9adbff";
    static rarity = 5;
    constructor() {
        super(Snowflake.name, Snowflake.description, Snowflake.unicode, Snowflake.color, 6, Snowflake.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.frozen){
            activePieces[idx].statuses.frozen = true;
        }
    }
}

class Sun extends Admin {
    static name = "Don't look at the sun";
    static description = "Every player program is blinded";
    static unicode = "U+1F31E";
    static color = "#f0fd33ff";
    static rarity = 5;
    constructor() {
        super(Sun.name, Sun.description, Sun.unicode, Sun.color, 6, Sun.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.blinded){
            activePieces[idx].statuses.blinded = true;
        }
    }
}

class Whale extends Admin {
    static name = "Whale";
    static description = "Every enemy gains +2 max size at the start of the round";
    static unicode = "U+1F433";
    static color = "#060143ff";
    static rarity = 2;
    constructor() {
        super(Whale.name, Whale.description, Whale.unicode, Whale.color, 3, Whale.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ maxSize: 2 })
            }
        };
    }
}

class Hammer extends Admin {
    static name = "Banhammer";
    static description = "Every enemy gains +1 attack at the start of the round";
    static unicode = "U+1F528";
    static color = "#c7200aff";
    static rarity = 3;
    constructor() {
        super(Hammer.name, Hammer.description, Hammer.unicode, Hammer.color, 3, Hammer.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ maxSize: 2 })
            }
        };
    }
}

class Omega extends Admin {
    static name = "Omega";
    static description = "Every enemy gains +1 to all stats";
    static unicode = "U+3A9";
    static color = "#000000ff";
    static rarity = 6;
    constructor() {
        super(Omega.name, Omega.description, Omega.unicode, Omega.color, 6, Omega.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
               piece.addModifier({ 
                maxSize: 1,
                moves: 1,
                range: 1,
                attack: 1,
                defence: 1
                })
            }
        };
    }
}

class Bones extends Admin {
  static name = "Mr Bones";
  static description = "Destroyed player progams are revived as enemies";
  static unicode = "U+1FA7B";
  static color = "#000000ff";
  static rarity = 5;
  constructor() {
    super(Bones.name, Bones.description, Bones.unicode, Bones.color, 4, Bones.rarity, 'gameState', 'onPieceDestruction')
  }
  async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
      const idx = activePieces.findIndex(p => p.id === id);
      if(activePieces[idx].team === 'player'){
        const piece = activePieces[idx];
        const EnemyClass = allPieces.find(p => p.name === piece.name);
        if(EnemyClass){
            const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', piece.removeCallback, crypto.randomUUID());//check later
            activePieces.push(enemyInstance);
            //original pieces destruction happens in app, but we do it here to stop the piece entering the graveyard
            activePieces.filter(p => p.id !== piece.id);
            //activePieces.splice(idx, 1);
        }
    }
  }
}

class Frog extends Admin {
  static name = "Poison Swamp";
  static description = "Every player program is poisoned";
    static unicode = "U+1F438";
    static color = "#415800ff";
    static rarity = 5;
    constructor() {
        super(Frog.name, Frog.description, Frog.unicode, Frog.color, 5, Frog.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.poisoned){
            activePieces[idx].statuses.poisoned = true;
        }
    }
}
//quicksand
//THONG SANDAL, U+1FA74
//HOURGLASS WITH FLOWING SAND, U+23F3
class Coral extends Admin {
  static name = "Deep Water";
  static description = "Every player program is slowed";
    static unicode = "U+1FAB8";
    static color = "rgb(0, 59, 59)";
    static rarity = 4;
    constructor() {
        super(Coral.name, Coral.description, Coral.unicode, Coral.color, 4, Coral.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.slowed){
            activePieces[idx].statuses.slowed = true;
        }
    }
}

/*class Tornado extends Admin {//unfinished, needs access to the whole tileset
  static name = "Tornado";
  static description = "All load points are randomised";
  static unicode = "U+1F32A";
  static color = "#790a0aff";
  constructor() {
    super(Tornado.name, Tornado.description, Tornado.unicode, Tornado.color, 5, 3, 'piecesAndBoard', 'onRoundStart')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
    }
}*/
/*
class Tsunami extends Admin { //coundown to round loss??
  static name = "Tsunami";
  static description = "Every piece takes 1 damage each turn after the first";//1 damage for security level?
  static unicode = "U+1F30A";
  static color = "#3eebd4ff";
  constructor() {
    super(Tsunami.name, Tsunami.description, Tsunami.unicode, Tsunami.color, 5, 9, 'all', 'onTurnEnd')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const playerPieces: Piece[] = []
        for(const piece of activePieces){
            if(piece.team === 'player'){
                piece.takeDamage(1)
                //piece.takeDamage(player.difficulty)
            }
        };
    }
}*/

class REDACTED extends Admin {
    static name = "REDACTED";
    static description = "All enemy programs information is hidden from you";//1 damage for security level?
    static unicode = "U+2B1B";
    static color = "rgb(255, 255, 255)";
    static rarity = 6;
  constructor() {
    super(REDACTED.name, REDACTED.description, REDACTED.unicode, REDACTED.color, 6, REDACTED.rarity, 'all', 'onRoundStart')
  }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for(const piece of activePieces){
            if(piece.team === 'enemy'){
                piece.redacted = true;
            }
        };
    }
}

class Fog extends Admin {//😶‍🌫️🌫️
    static name = "Fog of War";
    static description = "All tiles outside your programs range are obscured";//handle in app
    static unicode =  "U+1F301";//fog //"U+1FAEF";//fight //"U+2601"; //cloud
    static color = "#575757ff";
    static rarity = 6;
    constructor() {
        super(Fog.name, Fog.description, Fog.unicode, Fog.color, 6, Fog.rarity, 'player', 'onRoundStart')
    }
    
    async apply({ player }: { player: Player }) {
        player.fogged = true
    }
    /*
    onRoundEnd() {//no access to player
        player.fogged = false
    }
    */
}

class Wilt extends Admin {
    static name = "Wilted";
    static description = "Every player program loses -2 max size";
    static unicode = "U+1F940";
    static color = "rgb(69, 76, 90)";
    static rarity = 3;
    constructor() {
        super(Wilt.name, Wilt.description, Wilt.unicode, Wilt.color, 3, Wilt.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(activePieces[idx].getStat('maxSize') > 1){
            activePieces[idx].addModifier({maxSize: -2})
        }
    }
}

// BIOHAZARD SIGN, U+2623 -2 max size
class Biohazard extends Admin {
    static name = "Biohazard";
    static description = "Every player program is diseased";
    static unicode = "U+2623";
    static color = "#00c41aff";
    static rarity = 4;
    constructor() {
        super(Biohazard.name, Biohazard.description, Biohazard.unicode, Biohazard.color, 6, Biohazard.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.diseased){
            activePieces[idx].statuses.diseased = true;
        }
    }
}

/*class Nofun extends Admin {
    static name = "No Fun Allowed";
    static description = "Disables 1 random admin each turn";
    static unicode = "U+1F6D1";
    static color = "#00c41aff";
    static rarity = 4;
    constructor() {
        super(Nofun.name, Nofun.description, Nofun.unicode, Nofun.color, 6, Nofun.rarity, 'player', 'onTurnEnd')
    }
    async apply({ player }: { player: Player }) {
        for(const admin of player.admins){
            admin.disabled = false;
        }
        player.admins[Math.floor(Math.random()*player.admins.length)].disabled = true;
    }
    
    onRoundEnd() {//no access to player
        for(const admin of player.admins){
            admin.disabled = false;
        }
    }
}*/

//OCTAGONAL SIGN, U+1F6D1
//NO ENTRY, U+26D4
//FACE WITH LOOK OF TRIUMPH, U+1F624
//EXPRESSIONLESS FACE, U+1F611 sleepy
//1 admin disabled after each turn

//fog //square //tornado tsunami
// damage mult for enemy
export const allBosses = [LowBattery, NorthWind, Downturn, Hook, Mirror, Shrine, Whale, Anchor, Circus, Customs, Hammer, Izakaya, Wilt, Biohazard, Castle, Lock, Coral, Jack, Snowflake, Sun, Eclipse, Factory, Bones, Frog, Volcano, Fog, Omega, Reaper, REDACTED, Wrath,]
export const nonStackableBosses = [Mirror, Customs, Snowflake, Sun, Frog, Biohazard, Coral, Izakaya, REDACTED, Fog]//no disease
//3
console.log('bosses length: ', allBosses.length)
let adminLogs = {
  rarity1: 0,
  rarity2: 0,
  rarity3: 0,
  rarity4: 0,
  rarity5: 0,
  rarity6: 0
}
allBosses.forEach(admin => {
  if(admin.rarity === 1) adminLogs.rarity1 += 1;
  if(admin.rarity === 2) adminLogs.rarity2 += 1;
  if(admin.rarity === 3) adminLogs.rarity3 += 1;
  if(admin.rarity === 4) adminLogs.rarity4 += 1;
  if(admin.rarity === 5) adminLogs.rarity5 += 1;
  if(admin.rarity === 6) adminLogs.rarity6 += 1;
});
console.log("Bosses of rarity 1: ", adminLogs.rarity1)
console.log("Bosses of rarity 2: ", adminLogs.rarity2)
console.log("Bosses of rarity 3: ", adminLogs.rarity3)
console.log("Bosses of rarity 4: ", adminLogs.rarity4)
console.log("Bosses of rarity 5: ", adminLogs.rarity5)
console.log("Bosses of rarity 6: ", adminLogs.rarity6)

//ROBOT HEAD "U+1F916"

//CLOUD WITH SNOW, U+1F328

//EUROPEAN CASTLE, U+1F3F0 enemies def up +1, maxsize + 1
//FIREWORKS, U+1F386 enemy splash damage
//black book NOTEBOOK, U+1F4D3

// LEDGER, U+1F4D2 all transactions
// CLIPBOARD, U+1F4CB inspection

//RIBBON, U+1F380

// ICE CUBE, U+1F9CA -1 max size each turn

// BEER MUG, U+1F37A move buttons randomised

//monarch  BUTTERFLY, U+1F98B

// CHERRY BLOSSOM, U+1F338
//WILTED FLOWER, U+1F940