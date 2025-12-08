import { Admin } from "./AdminPrograms";
import { Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate, StatModifier } from "./types";
/*
targetType: 'blueprint' | 'piece' | 'shopItem' | 'player' | 'gameState'  | 'playerAndGame'
| 'onPlacement'
  | 'onTurnEnd'
  | 'onRoundStart'
  | 'onRoundEnd'
  | 'onDealDamage' //piece id of receiver?
  | 'onReceiveDamage'
  | 'onPieceDestruction'
  | 'other';
*/

class Fog extends Admin {//unfinished
  static name = "Fog of War";
  static description = "All tiles outside player range are obscured";//handle in app
  static unicode = "U+2601";
  static color = "#575757ff";
  constructor() {
    super(Fog.name, Fog.description, Fog.unicode, Fog.color, 5, 9, 'playerAndGame', 'onRoundStart')
  }

   async apply({ id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {

    const idx = activePieces.findIndex(p => p.id === id);
    console.log('applying:', this.name)
    activePieces[idx].addModifier({moves: 2})
    activePieces[idx].movesRemaining += 2;
  }
}

class NorthWind extends Admin {//unfinished
  static name = "North Wind";
  static description = "All player pieces are moved down 1 space after every turn";
  static unicode = "U+1F32C";
  static color = "#969c9cff";
  constructor() {
    super(NorthWind.name, NorthWind.description, NorthWind.unicode, NorthWind.color, 5, 9, 'all', 'onTurnEnd')
  }
    //type all, tileset and activePieces
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        console.log('applying:', this.name)
        activePieces[idx].addModifier({
            attack: 1,
            defence: 1,

            maxSize: 1,
            moves: 1,
            range: 1
      })
    }
  
}

class Hook extends Admin {//unfinished
  static name = "Hook";
  static description = "All player pieces are moved up 1 space after every turn";
  static unicode = "U+1FA9D";
  static color = "#0a1179ff";
  constructor() {
    super(Hook.name, Hook.description, Hook.unicode, Hook.color, 5, 9, 'all', 'onTurnEnd')
  }

    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({
          
      })
    }
}

class Mirror extends Admin {//unfinished
  static name = "Mirror";
  static description = "Enemy Programs are chosen from blueprints in your inventory";//handle in app???
  static unicode = "U+1FA9E";
  static color = "#0a1179ff";
  constructor() {
    super(Mirror.name, Mirror.description, Mirror.unicode, Mirror.color, 5, 9, 'gameState', 'onRoundStart')
  }

    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        console.log('applying:', this.name)
        activePieces[idx].addModifier({
            attack: 1,
            defence: 1,

            maxSize: 1,
            moves: 1,
            range: 1
      })
    }
}

class Downturn extends Admin {
  static name = "Downturn";
  static description = "Lose $1 after every turn";
  static unicode = "U+1F4C9";
  static color = "#f11212ff";
  constructor() {
    super(Downturn.name, Downturn.description, Downturn.unicode, Downturn.color, 5, 9, 'player', 'onTurnEnd')
  }
    async apply({ player }: { player: Player }) {
       player.money --
    }
}

class Factory extends Admin {//unfinished
  static name = "Factory";
  static description = "The enemy places a new piece at the end of every 3 turns";
  static unicode = "U+1F3ED";
  static color = "#790a0aff";
  constructor() {
    super(Factory.name, Factory.description, Factory.unicode, Factory.color, 5, 9, 'all', 'onTurnEnd')
  }
  private count: number = 0
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.count += 1;
        if(this.count === 3){
            //random piece in all pieces using player difficulty level
            //const newPiece =
            //find a random free tile from tileset / activePieces
            //activePieces.push(newPiece) 
            this.count = 0;
        }
        const idx = activePieces.findIndex(p => p.id === id);
    }
}

class Tornado extends Admin {//unfinished
  static name = "Tornado";
  static description = "All load points are randomised";
  static unicode = "U+1F32A";
  static color = "#790a0aff";
  constructor() {
    super(Tornado.name, Tornado.description, Tornado.unicode, Tornado.color, 5, 9, 'all', 'onRoundStart')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
    }
}

class Wrath extends Admin {
  static name = "Wrath";
  static description = "A random player piece loses a tile each turn after the first";
  static unicode = "U+1F329";
  static color = "#790a0aff";
  constructor() {
    super(Wrath.name, Wrath.description, Wrath.unicode, Wrath.color, 5, 2, 'gameState', 'onTurnEnd')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const playerPieces: Piece[] = []
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                playerPieces.push(piece)
            }
        });
        const rand = Math.floor((Math.random() * playerPieces.length) + 1);
        const randId = playerPieces[rand].id
        const idx = activePieces.findIndex(p => p.id === randId);
        //activePieces[idx].takeDamage(1);
        activePieces[idx].tiles.pop()
    }
}

class Reaper extends Admin {
  static name = "Reaper";
  static description = "Player loses a life every 20 turns";
  static unicode = "U+1F480";
  static color = "#790a0aff";
  constructor() {
    super(Reaper.name, Reaper.description, Reaper.unicode, Reaper.color, 5, 6, 'player', 'onTurnEnd')
  }
    private count: number = 0
    async apply({ player }: { player : Player }) {
        this.count += 1
        if(this.count === 20){
            player.lives --
            this.count = 0;
        }

    }
}

class Volcano extends Admin {
  static name = "Volcano";
  static description = "Every piece loses 1 tile damage each turn after the first";//coundown to round loss??
  static unicode = "U+1F30B";
  static color = "#790a0aff";
  constructor() {
    super(Volcano.name, Volcano.description, Volcano.unicode, Volcano.color, 5, 9, 'gameState', 'onTurnEnd')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                piece.tiles.pop()
            }
        });
    }
}
/*
class Tsunami extends Admin {//unfinished, //coundown to round loss??
  static name = "Tsunami";
  static description = "Every piece loses 1 tile damage each turn after the first";
  static unicode = "U+1F30A";
  static color = "#3eebd4ff";
  constructor() {
    super(Tsunami.name, Tsunami.description, Tsunami.unicode, Tsunami.color, 5, 9, 'all', 'onTurnEnd')
  }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const playerPieces: Piece[] = []
        activePieces.forEach(piece => {
            if(piece.team === 'player'){
                playerPieces.push(piece)
                piece.tiles.pop()
            }
        });
    }
}
*/

class Circus extends Admin {
    static name = "Circus";
    static description = "Every enemy gains +1 moves at the start of the round";
    static unicode = "U+1F3AA";
    static color = "#eb3ec0ff";
    constructor() {
        super(Circus.name, Circus.description, Circus.unicode, Circus.color, 5, 9, 'gameState', 'onRoundStart')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
               piece.addModifier({ moves: 1 })
            }
        });
    }
}

class Castle extends Admin {
    static name = "Castle";
    static description = "Every enemy gains +1 defence at the start of the round";
    static unicode = "U+1F3F0";
    static color = "#eb523eff";
    constructor() {
        super(Castle.name, Castle.description, Castle.unicode, Castle.color, 5, 9, 'gameState', 'onRoundStart')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
               piece.addModifier({ defence: 1 })
            }
        });
    }
}

class Anchor extends Admin {
    static name = "Anchor";
    static description = "Every player program loses -1 moves on load";
    static unicode = "U+2693";
    static color = "#0a063fff";
    constructor() {
        super(Anchor.name, Anchor.description, Anchor.unicode, Anchor.color, 5, 9, 'gameState', 'onPlacement')
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
    constructor() {
        super(Jack.name, Jack.description, Jack.unicode, Jack.color, 5, 5, 'gameState', 'onRoundStart')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
               piece.addModifier({ range: 1 })
            }
        });
    }
}

class Lock extends Admin {
    static name = "Encryption";
    static description = "Every enemy gains +2 defence at the start of the round";
    static unicode = "U+1F512";
    static color = "#ad1400ff";
    constructor() {
        super(Lock.name, Lock.description, Lock.unicode, Lock.color, 6, 9, 'gameState', 'onRoundStart')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
               piece.addModifier({ defence: 2 })
            }
        });
    }
}

class Eclipse extends Admin {
    static name = "Eclipse";
    static description = "Every player program loses -1 range on load";
    static unicode = "U+1F31A";
    static color = "#000000ff";
    constructor() {
        super(Eclipse.name, Eclipse.description, Eclipse.unicode, Eclipse.color, 4, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({range: -1})
    }
}
class Battery extends Admin {
    static name = "Drain";
    static description = "Every player program loses -1 max size on load";
    static unicode = "U+1FAAB";
    static color = "#ca220bff";
    constructor() {
        super(Battery.name, Battery.description, Battery.unicode, Battery.color, 3, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({maxSize: -1})
    }
}
class Customs extends Admin {
    static name = "Customs";
    static description = "Every player program is exposed on load";
    static unicode = "U+1F6C3";
    static color = "#127a3eff";
    constructor() {
        super(Customs.name, Customs.description, Customs.unicode, Customs.color, 3, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        //activePieces[idx].statuses.exposed = true
        //activePieces[idx].addModifier({moves: -1})
    }
}
class Shrine extends Admin {
    static name = "Shrine";
    static description = "Every player program loses -1 attack on load";
    static unicode = "U+26E9";
    static color = "#7a1217ff";
    constructor() {
        super(Shrine.name, Shrine.description, Shrine.unicode, Shrine.color, 4, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({attack: -1})
    }
}
class Izakaya extends Admin {
    static name = "Izakaya";
    static description = "Every player program is confused on load";
    static unicode = "U+1F3EE";
    static color = "#dbb60dff";
    constructor() {
        super(Izakaya.name, Izakaya.description, Izakaya.unicode, Izakaya.color, 6, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.confuseImmune){
            activePieces[idx].statuses.confused = true;
        }
    }
}

class Snowflake extends Admin {
    static name = "Cold Snap";
    static description = "Every player program is frozen on load";
    static unicode = "U+2744";
    static color = "#0d9adbff";
    constructor() {
        super(Snowflake.name, Snowflake.description, Snowflake.unicode, Snowflake.color, 6, 9, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if(!activePieces[idx].immunities.freezeImmune){
            activePieces[idx].statuses.frozen = true;
        }
    }
}

class Whale extends Admin {
    static name = "Whale";
    static description = "Every enemy gains +2 max size at the start of the round";
    static unicode = "U+1F433";
    static color = "#ad1400ff";
    constructor() {
        super(Whale.name, Whale.description, Whale.unicode, Whale.color, 3, 9, 'gameState', 'onRoundStart')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        activePieces.forEach(piece => {
            if(piece.team === 'enemy'){
               piece.addModifier({ maxSize: 2 })
            }
        });
    }
}

//fog northwind hook mirror factory tornado //6
export const allBosses = [Downturn, Wrath, Reaper, Volcano, Circus, Castle, Anchor, Jack, Lock, Eclipse, Battery, Customs, Shrine, Izakaya, Snowflake, Whale]//16

//ROBOT HEAD "U+1F916"
//YIN YANG, U+262F
//modifiers:
//JAPANESE CASTLE, U+1F3EF enemies def up +1, moves up +1

//CLOUD WITH SNOW, U+1F328

//EUROPEAN CASTLE, U+1F3F0 enemies def up +1, maxsize + 1
//FIREWORKS, U+1F386 enemy splash damage
//SMOKING SYMBOL, U+1F6AC
//black book NOTEBOOK, U+1F4D3

// LEDGER, U+1F4D2 all transactions
// CLIPBOARD, U+1F4CB inspection

//RIBBON, U+1F380

// ICE CUBE, U+1F9CA -1 max size each turn

// BEER MUG, U+1F37A move buttons randomised

//MIRROR BALL, U+1FAA9

//BATHTUB, U+1F6C1

//SHOWER, U+1F6BF

//monarch  BUTTERFLY, U+1F98B

// CHERRY BLOSSOM, U+1F338
//WILTED FLOWER, U+1F940