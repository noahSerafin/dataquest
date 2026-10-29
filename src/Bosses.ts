import { Admin } from "./AdminPrograms";
import { Blackwall, Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate } from "./types";
import { DIFFICULTY_RARITY } from "./constants";
import { getRandomUnoccupiedTile } from "./helperFunctions";
import { Random } from "./Random";

//lower difficulty of +1 bosses, more +2 bosses
class NorthWind extends Admin {
    static iconID = 398;//🌬️//dash U+1F4A8
    static rarity = 1;
    static name = "North Wind";
    static description = "All player pieces are moved down 1 space after every turn";
    static unicode = "U+1F32C";//"U+1F38F";//carp windsock//U+1F4A8 dash cloud//wind face "U+1F32C";
    static color = "rgb(207, 238, 238)";
    constructor() {
        super(NorthWind.name, NorthWind.description, NorthWind.unicode, NorthWind.color, 5, NorthWind.rarity, 'piecesAndBoard', 'onTurnEnd')
    }
    //type all, tileset and activePieces
    async apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }) {
        const playerPieces: Piece[] = []
        for (const piece of activePieces) {
            if (piece.team === 'player') {
                playerPieces.push(piece)
            }
        };
        for (const piece of playerPieces) {
            const spaceToCheck = { x: piece.headPosition.x, y: piece.headPosition.y + 1 }
            //check space is unnocupied and on board
            const isOccupied = activePieces.some(p =>
                p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            );
            const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            //if(!isOccupied && isOnBoard){
            if (!isOccupied && isOnBoard) {
                piece.moveTo(spaceToCheck);
                this.isTriggering = true;
                setTimeout(() => this.isTriggering = false, 500);
            }
        };
    }

}

class Hook extends Admin {
    static iconID = 404;
    static rarity = 2;
    static name = "Hook";
    static description = "All player pieces are moved up 1 space after every turn";
    static unicode = "U+1FA9D";
    static color = "#0a1179ff";
    constructor() {
        super(Hook.name, Hook.description, Hook.unicode, Hook.color, 5, Hook.rarity, 'piecesAndBoard', 'onTurnEnd')
    }

    async apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }) {
        const playerPieces: Piece[] = []
        for (const piece of activePieces) {
            if (piece.team === 'player') {
                playerPieces.push(piece)
            }
        };
        for (const piece of playerPieces) {
            const spaceToCheck = { x: piece.headPosition.x, y: piece.headPosition.y - 1 }
            //check space is unnocupied and on board
            const isOccupied = activePieces.some(p =>
                p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            );
            const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            if (!isOccupied && isOnBoard) {
                piece.moveTo(spaceToCheck);
                this.isTriggering = true;
                setTimeout(() => this.isTriggering = false, 500);
            }
        };
    }
}

class Mirror extends Admin {
    static iconID = 405;
    static rarity = 2;
    static name = "Mirror";
    static description = "Enemy program's classes are chosen from ones in your inventory";
    static unicode = "U+1FA9E";
    static color = "rgb(172, 5, 213)";
    constructor() {
        super(Mirror.name, Mirror.description, Mirror.unicode, Mirror.color, 5, Mirror.rarity, 'playerAndGame', 'onRoundStart')
    }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const enemyPieces: Piece[] = []
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                enemyPieces.push(piece)
            }
        };

        for (const piece of enemyPieces) {
            const enemyClassName = Random.pick(player.programs).name;//random name from player pieceBlueprints
            const EnemyClass = allPieces.find(p => p.name === enemyClassName);
            if (EnemyClass) {
                const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', piece.removeCallback, crypto.randomUUID());//check later
                activePieces.push(enemyInstance);
                //piece.removeCallback?.(piece);//checks for round end    
            }
            const idx = activePieces.findIndex(p => p.id === piece.id);
            activePieces.splice(idx, 1);
        }  //does this always end the round??
    }
}

class Downturn extends Admin {
    static iconID = 403;
    static rarity = 2;
    static name = "Downturn";
    static description = "Lose $1 every 2 turns";
    static unicode = "U+1F4C9";
    static color = "#f11212ff";
    constructor() {
        super(Downturn.name, Downturn.description, Downturn.unicode, Downturn.color, 5, Downturn.rarity, 'player', 'onTurnEnd')
    }
    private count = 0;
    async apply({ player }: { player: Player }) {
        this.count++
        if (this.count % 2 === 0) {
            player.money--;
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
        }
    }
}

class Factory extends Admin {
    static iconID = 425;
    static rarity = 4;
    static name = "Factory";
    static description = "Places a new enemy piece every 3 turns";
    static unicode = "U+1F3ED";
    static color = "#790a0aff";
    constructor() {
        super(Factory.name, Factory.description, Factory.unicode, Factory.color, 5, Factory.rarity, 'all', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ activePieces, board, player }: { activePieces: Piece[], board: Coordinate[], player: Player }) {
        this.count += 1;
        if (this.count % 3 === 0) {
            //random piece in all pieces using player difficulty level
            const { min, max } = DIFFICULTY_RARITY[player.difficulty];
            const validEnemies = allPieces.filter(p =>
                p.rarity >= min && p.rarity <= max && p.name !== 'Nuke' && p.name !== 'Trap' && p.name !== 'Tar' && p.name !== 'Pitfall' && p.name !== 'Web' && p.name !== 'Mine'
            );
            const pool = validEnemies.length > 0 ? validEnemies : allPieces;
            const EnemyClass = Random.pick(pool);//random piece ranked for diificulty

            //get a random unnoccupied space
            const space = getRandomUnoccupiedTile(board, activePieces);//removeCallback

            if (space) {
                const enemyInstance = new EnemyClass(space, 'enemy', activePieces[0].removeCallback, crypto.randomUUID());//check later
                enemyInstance.movesRemaining = 0;
                enemyInstance.actions = 0;
                activePieces.push(enemyInstance);
                this.isTriggering = true;
                setTimeout(() => this.isTriggering = false, 500);
            }
            this.count = 0;
        }
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Wrath extends Admin {
    static iconID = 443;//⛈️//🌩️
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
        if (this.count >= 1) {
            const playerPieces: Piece[] = []
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    playerPieces.push(piece)
                }
            };
            const randPiece = Random.pick(playerPieces);
            const idx = activePieces.findIndex(p => p.id === randPiece.id);
            activePieces[idx].takeDamage(1 + activePieces[idx].defenceRemaining);//should also remove a size 1 piece from the board
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
        }
        this.count++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Reaper extends Admin {
    static iconID = 441;
    static name = "Reaper";
    static description = "Takes a life every 10 turns (resets at end of each round)";
    static unicode = "U+2620";
    static color = "#790a0aff";
    static rarity = 6;
    constructor() {
        super(Reaper.name, Reaper.description, Reaper.unicode, Reaper.color, 5, Reaper.rarity, 'player', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ player }: { player: Player }) {
        this.count += 1
        if (this.count === 10) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            player.lives--
            this.count = 0;
        }

    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Volcano extends Admin {
    static iconID = 434;
    static name = "Volcano";
    static description = "After 3 turns, burning is applied to every player program at the end of every enemy turn";//coundown to round loss??
    //static description = "After 5 turns, burning is applied to every player program at the end of every turn";//coundown to round loss??
    static unicode = "U+1F30B";
    static color = "rgb(129, 49, 6)";
    static rarity = 5;
    constructor() {
        super(Volcano.name, Volcano.description, Volcano.unicode, Volcano.color, 5, Volcano.rarity, 'gameState', 'onEnemyTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.count += 1
        if (this.count >= 3) {
            for (const piece of activePieces) {
                if (piece.team === 'player' && !piece.immunities.burning) {
                    piece.statuses.burning = true;
                    this.isTriggering = true;
                    setTimeout(() => this.isTriggering = false, 500);
                }
            };
        }
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Circus extends Admin {
    static iconID = 412;
    static name = "Circus";
    static description = "Every enemy gains +1 moves at the start of the round";
    static unicode = "U+1F3AA";
    static color = "rgb(95, 208, 227)";
    static rarity = 3;
    constructor() {
        super(Circus.name, Circus.description, Circus.unicode, Circus.color, 5, Circus.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ moves: 1 })
            }
        };
    }
}

class Castle extends Admin {
    static iconID = 411;
    static name = "Castle";
    static description = "Every enemy gains +1 defence at the start of the round";
    static unicode = "U+1F3EF";
    static color = "rgb(217, 255, 253)";
    static rarity = 3;
    constructor() {
        super(Castle.name, Castle.description, Castle.unicode, Castle.color, 5, Castle.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ defence: 1 })
                piece.defenceRemaining += 1;
            }
        };
    }
}

class Anchor extends Admin {
    static iconID = 410;
    static name = "Anchor";
    static description = "Every player program loses -2 moves";
    static unicode = "U+2693";
    static color = "rgb(52, 48, 112)";
    static rarity = 3;
    constructor() {
        super(Anchor.name, Anchor.description, Anchor.unicode, Anchor.color, 5, Anchor.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ moves: -2 })
    }
}

class Jack extends Admin {
    static iconID = 426;
    static name = "Jack O' Lantern";
    static description = "Every enemy gains +1 range at the start of the round";
    static unicode = "U+1F383";
    static color = "rgb(180, 63, 5)";
    static rarity = 4;
    constructor() {
        super(Jack.name, Jack.description, Jack.unicode, Jack.color, 5, Jack.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ range: 1 })
            }
        };
    }
}

class Lock extends Admin {
    static iconID = 424;
    static name = "Encryption";
    static description = "Every enemy gains +2 defence at the start of the round";
    static unicode = "U+1F512";
    static color = "#ad1400ff";
    static rarity = 4;
    constructor() {
        super(Lock.name, Lock.description, Lock.unicode, Lock.color, 6, Lock.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ defence: 2 })
                piece.defenceRemaining += 2;
            }
        };
    }
}

class Eclipse extends Admin {
    static iconID = 423;
    static name = "Eclipse";
    static description = "Every player program loses -1 range";//hides enemies?
    static unicode = "U+1F31A";
    static color = "#000000ff";
    static rarity = 4;
    constructor() {
        super(Eclipse.name, Eclipse.description, Eclipse.unicode, Eclipse.color, 5, Eclipse.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ range: -1 })
    }
}

class LowBattery extends Admin {
    static iconID = 397;
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
        if (activePieces[idx].getStat('maxSize') > 1) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].addModifier({ maxSize: -1 })
        }
    }
}

class Customs extends Admin {
    static iconID = 402;
    static name = "Customs";
    static description = "Every player program is exposed and loses -1 moves";
    static unicode = "U+1F6C3";
    static color = "#127a3eff";
    static rarity = 2;
    constructor() {
        super(Customs.name, Customs.description, Customs.unicode, Customs.color, 3, Customs.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const idx = activePieces.findIndex(p => p.id === id);
        if (!activePieces[idx].immunities.exposed) {
            activePieces[idx].statuses.exposed = true;
            activePieces[idx].statuses.hidden = false;
        }
        activePieces[idx].addModifier({ moves: -1 })
    }
}

class Shrine extends Admin {
    static iconID = 407;
    static name = "Shrine";
    static description = "Every player program loses -1 attack";
    static unicode = "U+26E9";
    static color = "rgb(255, 255, 255)";
    static rarity = 2;
    constructor() {
        super(Shrine.name, Shrine.description, Shrine.unicode, Shrine.color, 4, Shrine.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ attack: -1 })
    }
}

class Izakaya extends Admin {
    static iconID = 415;
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
        if (!activePieces[idx].immunities.confused) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.confused = true;
        }
    }
}

class Snowflake extends Admin {
    static iconID = 429;
    static name = "Cold Snap";
    static description = "Every player program is frozen";
    static unicode = "U+2744";
    static color = "rgb(184, 218, 234)";
    static rarity = 5;
    constructor() {
        super(Snowflake.name, Snowflake.description, Snowflake.unicode, Snowflake.color, 6, Snowflake.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (!activePieces[idx].immunities.frozen) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.frozen = true;
        }
    }
}

class Sun extends Admin {
    static iconID = 436;
    static name = "Don't look at the sun";
    static description = "Every player program is blinded";
    static unicode = "U+1F31E";
    static color = "#f0fd33ff";
    static rarity = 6;
    constructor() {
        super(Sun.name, Sun.description, Sun.unicode, Sun.color, 6, Sun.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (!activePieces[idx].immunities.blinded) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.blinded = true;
        }
    }
}

class Whale extends Admin {
    static iconID = 409;
    static name = "Whale";
    static description = "Every enemy gains +2 max size at the start of the round";
    static unicode = "U+1F433";
    static color = "#060143ff";
    static rarity = 2;
    constructor() {
        super(Whale.name, Whale.description, Whale.unicode, Whale.color, 3, Whale.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ maxSize: 2 })
            }
        };
    }
}

class Hammer extends Admin {
    static iconID = 413;
    static name = "Banhammer";
    static description = "Every enemy gains +1 attack at the start of the round";
    static unicode = "U+1F528";
    static color = "#c7200aff";
    static rarity = 3;
    constructor() {
        super(Hammer.name, Hammer.description, Hammer.unicode, Hammer.color, 3, Hammer.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ maxSize: 2 })
            }
        };
    }
}

class Omega extends Admin {
    static iconID = 440;
    static name = "Omega";
    static description = "Every enemy gains +1 to all stats";
    static unicode = "U+3A9";
    static color = "#000000ff";
    static rarity = 6;
    constructor() {
        super(Omega.name, Omega.description, Omega.unicode, Omega.color, 6, Omega.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({
                    maxSize: 1,
                    moves: 1,
                    range: 1,
                    attack: 1,
                    defence: 1
                })
                piece.defenceRemaining += 1;
            }
        };
    }
}

class Bones extends Admin {
    static iconID = 430;
    static name = "Mr Bones";
    static description = "Destroyed non-trap player progams are revived as enemies";
    static unicode = "U+1FA7B";
    static color = "#000000ff";
    static rarity = 5;
    constructor() {
        super(Bones.name, Bones.description, Bones.unicode, Bones.color, 4, Bones.rarity, 'gameState', 'onPieceDestruction')
    }
    async apply({ activePieces, piece }: { activePieces: Piece[], piece?: Piece }) {
        if (!piece) return;
        if (piece.team === 'player') {
            const EnemyClass = allPieces.find(p => p.name === piece.name);
            if (EnemyClass) {
                const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', piece.removeCallback, crypto.randomUUID());//check later
                if (enemyInstance.targetType !== 'trapPiece') {
                    this.isTriggering = true;
                    setTimeout(() => this.isTriggering = false, 500);
                    //STATS?
                    activePieces.push(enemyInstance);
                    //original pieces destruction happens in app, but we do it here to stop the piece entering the graveyard
                    activePieces.filter(p => p.id !== piece.id);
                }
            }
        }
    }
}

class Frog extends Admin {
    static iconID = 431;
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
        if (!activePieces[idx].immunities.poisoned) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.poisoned = true;
        }
    }
}

class Coral extends Admin {
    static iconID = 422;
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
        if (!activePieces[idx].immunities.slowed) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.slowed = true;
        }
    }
}

class REDACTED extends Admin {
    static iconID = 442;
    static name = "REDACTED";
    static description = "All enemy program information is obscured";//1 damage for security level?
    static unicode = "U+2B1B";
    static color = "rgb(255, 255, 255)";
    static rarity = 6;
    constructor() {
        super(REDACTED.name, REDACTED.description, REDACTED.unicode, REDACTED.color, 6, REDACTED.rarity, 'all', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.redacted = true;
            }
        };
    }
}

class Fog extends Admin {
    static iconID = 437;//😶‍🌫️🌫️
    static name = "Fog of War";
    static description = "All tiles outside your programs range are obscured";//handle in app
    static unicode = "U+1F301";//fog //"U+1FAEF";//fight //"U+2601"; //cloud
    static color = "#575757ff";
    static rarity = 6;
    constructor() {
        super(Fog.name, Fog.description, Fog.unicode, Fog.color, 6, Fog.rarity, 'player', 'onRoundStart')
    }

    async apply({ player }: { player: Player }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        player.fogged = true
    }
    /*
    onRoundEnd() {//no access to player
        player.fogged = false
    }
    */
}

class Wilt extends Admin {
    static iconID = 418;
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
        if (activePieces[idx].getStat('maxSize') > 1) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].addModifier({ maxSize: -2 })
        }
    }
}

class Biohazard extends Admin {
    static iconID = 420;
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
        if (!activePieces[idx].immunities.diseased) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].statuses.diseased = true;
        }
    }
}

class Nofun extends Admin {
    static iconID = 439;
    static name = "No Fun Allowed";
    static description = "Disables 1 random admin after each turn";
    static unicode = "U+1F6D1"; //NO ENTRY, U+26D4
    static color = "rgb(244, 152, 16)";
    static rarity = 6;
    constructor() {
        super(Nofun.name, Nofun.description, Nofun.unicode, Nofun.color, 6, Nofun.rarity, 'player', 'onTurnEnd')
    }
    async apply({ player }: { player: Player }) {
        for (const admin of player.admins) {
            admin.disabled = false;
        }
        if (player.admins.length > 0) {
            Random.pick(player.admins).disabled = true;
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
        }
    }
}

class Tornado extends Admin {
    static iconID = 433;
    static name = "Tornado";
    static description = "Player load points are randomised";
    static unicode = "U+1F32A";
    static color = "rgb(84, 139, 138)";
    static rarity = 5;
    constructor() {
        super(Tornado.name, Tornado.description, Tornado.unicode, Tornado.color, 5, Tornado.rarity, 'all', 'onRoundStart')
    }
    async apply({ activePieces, board, playerSpawns }: { activePieces: Piece[], board: Coordinate[], playerSpawns?: Coordinate[] }) {
        if (!playerSpawns) return;
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const unoccupiedTiles = board.filter(t => !activePieces.some(p => p.tiles.some(pt => pt.x === t.x && pt.y === t.y)));

        const playerSpawnPieces = activePieces.filter(p => p.team === 'player' && p.name === 'Spawn');


        const newSpawns: Coordinate[] = [];
        for (let i = 0; i < playerSpawns.length; i++) {
            if (unoccupiedTiles.length === 0) break;
            const randIdx = Random.floor(unoccupiedTiles.length);
            newSpawns.push(unoccupiedTiles[randIdx]);
            unoccupiedTiles.splice(randIdx, 1);
        }

        for (let i = 0; i < playerSpawnPieces.length; i++) {
            const coord = newSpawns[i];
            if (coord) {
                playerSpawnPieces[i].headPosition = coord;
                playerSpawnPieces[i].tiles = [coord];
            }
        }

        playerSpawns.splice(0, playerSpawns.length, ...newSpawns);
    }
}

class Tsunami extends Admin {
    static iconID = 417;
    static name = "Tsunami";
    static description = "Every piece is moved left 3 spaces each turn after the first";//the player's current security level no.?
    static unicode = "U+1F30A";
    static color = "#3eebd4ff";
    static rarity = 3;
    constructor() {
        super(Tsunami.name, Tsunami.description, Tsunami.unicode, Tsunami.color, 5, Tsunami.rarity, 'piecesAndBoard', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }) {
        if (this.count >= 1) {
            const playerPieces: Piece[] = []
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    playerPieces.push(piece)
                }
            };
            //do 3 times
            for (const piece of playerPieces) {
                for (let i = 0; i < 3; i++) {
                    const spaceToCheck = { x: piece.headPosition.x - 1, y: piece.headPosition.y }
                    //check space is unoccupied and on board
                    const isOccupied = activePieces.some(p =>
                        p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
                    );
                    const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
                    if (!isOccupied && isOnBoard) {
                        piece.moveTo(spaceToCheck);
                        this.isTriggering = true;
                        setTimeout(() => this.isTriggering = false, 500);
                    } else {
                        break;
                    }
                }
            };
        }
        this.count++;
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Coaster extends Admin {
    static iconID = 427;
    static name = "Up and Up";//cranking up
    static description = "Every player piece takes a cumulating +1 damage after every 2 turns";//turn count is damage?
    static unicode = "U+1F3A2";//"U+1F3D4";//mountain
    static color = "rgb(196, 233, 245)";
    static rarity = 4;
    constructor() {
        super(Coaster.name, Coaster.description, Coaster.unicode, Coaster.color, 5, Coaster.rarity, 'playerAndGame', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces, player: _player }: { id: string, activePieces: Piece[], player: Player }) {
        if (this.count % 2 == 0 && this.count > 0) {
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    piece.takeDamage(this.count / 2);
                    this.isTriggering = true;
                    setTimeout(() => this.isTriggering = false, 500);
                }
            };
        }
        this.count++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Singularity extends Admin {
    static iconID = 432;
    static name = "Singularity";
    static description = "After 3 turns, all enemies' actions are doubled";
    static unicode = "U+1F916";
    static color = "rgb(59, 59, 59)";
    static rarity = 5;
    constructor() {
        super(Singularity.name, Singularity.description, Singularity.unicode, Singularity.color, 5, 5, 'all', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        if (this.count >= 3) {
            for (const piece of activePieces) {
                if (piece.team === 'enemy') {
                    piece.actions = 2;
                    this.isTriggering = true;
                    setTimeout(() => this.isTriggering = false, 500);
                }
            };
        }
        this.count++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Cocktail extends Admin {
    static iconID = 421;
    static name = "Deadly Cocktail";
    static description = "Loads 2 random Bosses of lower security levels";//do not weight the pick
    static unicode = "U+1F378";
    static color = "rgb(85, 0, 102)";
    static rarity = 4;
    private addedBosses: Admin[] = [];

    constructor() {
        super(Cocktail.name, Cocktail.description, Cocktail.unicode, Cocktail.color, 5, Cocktail.rarity, 'all', 'onRoundStart')
    }
    async apply({ player, bosses }: { player: Player, bosses?: Admin[] }) {
        if (!bosses) return;
        this.onRoundEnd(bosses); // in case previous bosses were not cleared
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);

        const possibleBosses = allBosses.filter(b => b.rarity < player.difficulty && b.name !== Cocktail.name);
        if (possibleBosses.length === 0) return;

        const Boss1 = Random.pick(possibleBosses);
        const Boss2 = Random.pick(possibleBosses);

        const b1 = new Boss1();
        const b2 = new Boss2();

        this.addedBosses.push(b1, b2);

        const cocktailIndex = bosses.indexOf(this);
        if (cocktailIndex !== -1) {
            bosses.splice(cocktailIndex + 1, 0, b1, b2);
        } else {
            bosses.push(b1, b2);
        }
    }
    onRoundEnd(bosses?: Admin[]) {
        if (!bosses || this.addedBosses.length === 0) return;
        this.addedBosses.forEach(b => {
            const idx = bosses.indexOf(b);
            if (idx !== -1) bosses.splice(idx, 1);
        });
        this.addedBosses = [];
    }
}
//"U+1F3D4";//mountain +4 maxsize (3)
class Mountain extends Admin {
    static iconID = 416;
    static name = "Mountain";
    static description = "Every enemy gains +4 max size at the start of the round";
    static unicode = "U+1F3D4";
    static color = "rgb(154, 155, 155)";
    static rarity = 3;
    constructor() {
        super(Mountain.name, Mountain.description, Mountain.unicode, Mountain.color, 3, Mountain.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ maxSize: 4 })
            }
        };
    }
}
//quicksand BEACH WITH UMBRELLA, U+1F3D6 //THONG SANDAL, U+1FA74 //HOURGLASS WITH FLOWING SAND,// U+23F3 DESERT, U+1F3DC
class Quicksand extends Admin {
    static iconID = 401;
    static name = "Quicksand";
    static description = "Programs that move temporarily lose -1 moves at the end of enemy's turn";
    static unicode = "U+1F3D6";
    static color = "rgb(252, 230, 148)";
    static rarity = 1;
    constructor() {
        super(Quicksand.name, Quicksand.description, Quicksand.unicode, Quicksand.color, 3, Quicksand.rarity, 'gameState', 'onEnemyTurnEnd')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const p of activePieces) {
            if (p.team === 'player' && p.hasMoved) {//p.movesRemaining < p.getStat('moves')) {
                p.quickSanded = true;
                this.isTriggering = true;
                setTimeout(() => this.isTriggering = false, 500);
            } else {
                p.quickSanded = false;
            }
        };
    }
}
//CLOUD WITH SNOW, U+1F328 - white out -1 moves -1 range 5
class Snow extends Admin {
    static iconID = 435;
    static name = "White Out";
    static description = "Every player program loses -1 range and -1 moves";
    static unicode = "U+1F328";
    static color = "rgb(255, 255, 255)";
    static rarity = 5;
    constructor() {
        super(Snow.name, Snow.description, Snow.unicode, Snow.color, 5, Snow.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ range: -1 })
        activePieces[idx].addModifier({ moves: -1 })
    }
}
class Nightfall extends Admin {
    static iconID = 438;
    static name = "Nightfall";
    static description = "Hides a random enemy on the end of each turn";
    static unicode = "U+1F303";
    static color = "rgb(0, 0, 0)";
    static rarity = 6;
    constructor() {
        super(Nightfall.name, Nightfall.description, Nightfall.unicode, Nightfall.color, 5, Nightfall.rarity, 'gameState', 'onTurnEnd')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        const enemyPieces: Piece[] = []
        for (const piece of activePieces) {
            if (piece.team === 'enemy' && !piece.statuses.exposed) {
                enemyPieces.push(piece)
            }
        };
        const randPiece = Random.pick(enemyPieces);
        const idx = activePieces.findIndex(p => p.id === randPiece.id);
        activePieces[idx].statuses.hidden = true;
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
    }
}
//black book NOTEBOOK, U+1F4D3 after 3 turns switch the side of a friendly 5
class Blackmail extends Admin {
    static iconID = 428;
    static name = "Blackmail";
    static description = "After 5 turns, a random player piece switches sides.";
    static unicode = "U+1F4D3";
    static color = "rgb(9, 2, 107)";
    static rarity = 5;
    constructor() {
        super(Blackmail.name, Blackmail.description, Blackmail.unicode, Blackmail.color, 5, Blackmail.rarity, 'gameState', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        if (this.count === 5) {
            const playerPieces: Piece[] = []
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    playerPieces.push(piece)
                }
            };
            const randPiece = Random.pick(playerPieces);
            const idx = activePieces.findIndex(p => p.id === randPiece.id);
            activePieces[idx].team = 'enemy';
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
        }
        this.count++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

// CLIPBOARD, U+1F4CB inspection nerfs all your placed programs 3
class ClipBoard extends Admin {
    static iconID = 414;
    static name = "Inspection";
    static description = "Every player program loses -1 max size and -1 attack";
    static unicode = "U+1F4CB";
    static color = "rgb(158, 158, 158)";
    static rarity = 3;
    constructor() {
        super(ClipBoard.name, ClipBoard.description, ClipBoard.unicode, ClipBoard.color, 3, ClipBoard.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (activePieces[idx].getStat('maxSize') > 1) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].addModifier({ maxSize: -1 })
        }
    }
}

//TRAFFIC LIGHT, U+1F6A6 pieces that take an action take 1 damage
class TrafficLight extends Admin {
    static iconID = 400;
    static name = "Traffic Light";
    static description = "Programs that move or action when the light is red take damage equal to your security level at the end of your turn";
    static unicode = "U+1F6A6";
    static color = "hsl(0, 0%, 69%)";
    static rarity = 1;
    constructor() {
        super(TrafficLight.name, TrafficLight.description, TrafficLight.unicode, TrafficLight.color, 3, TrafficLight.rarity, 'playerAndGame', 'onTurnEnd')
    }
    private count = 0;
    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        if (this.count === 2) {
            for (const p of activePieces) {
                if (p.team === 'player' && (p.actions < 1 || p.hasMoved)) {//p.getStat('moves') > p.movesRemaining)) {
                    await p.takeDamage(player.difficulty)
                }
            }
            this.color = 'green';
            this.count = 0;
        } else {
            this.count++
            if (this.count === 1) {
                this.color = 'orange';
            } else if (this.count === 2) {
                this.color = 'red';
                this.isTriggering = true;
                setTimeout(() => this.isTriggering = false, 500);
            }
        }
    }
    onRoundEnd() {
        this.count = 0;
        this.color = 'green';
    }
}

class Concussion extends Admin {
    static iconID = 396;
    static name = "Concussion";
    static description = "Your programs that take damage twice are confused";
    static unicode = "U+1F4AB";
    static color = "rgb(10, 8, 1)";
    static rarity = 1;
    constructor() {
        super(Concussion.name, Concussion.description, Concussion.unicode, Concussion.color, 3, Concussion.rarity, 'gameState', 'onReceiveDamage')
    }
    private candidates: Record<string, number> = {};
    async apply({ id: _id, activePieces: _activePieces, piece }: { id: string, activePieces: Piece[], piece?: Piece }) {
        if (!piece) return;

        if (piece.defenceRemaining < 0) {
            // Increment hit count for this program
            this.candidates[piece.id] = (this.candidates[piece.id] || 0) + 1;
        }
        if (this.candidates[piece.id] >= 2) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            if (!piece.immunities.confused) {
                piece.statuses.confused = true;
                // Clean up tracking for this specific ID
                delete this.candidates[piece.id];
            }
        };
    }
    onRoundEnd() {
        this.candidates = {};
    }
}

class Taxman extends Admin {
    static iconID = 399;
    static rarity = 1;
    static name = "Taxman";
    static description = "Lose $1 every tile lost";//too similar to battery, set money to 0 after something happens
    static unicode = "U+1F4D2";
    static color = "rgb(70, 70, 70)";
    constructor() {
        super(Taxman.name, Taxman.description, Taxman.unicode, Taxman.color, 5, Taxman.rarity, 'playerAndGame', 'onReceiveDamage')
    }

    async apply({ id: id, activePieces, player, piece }: { id: string, activePieces: Piece[], player: Player, piece: Piece }) {
        //const noOfFives = Math.floor(player.money / 5) //round down
        const idx = activePieces.findIndex(p => p.id === id);
        if (activePieces[idx].getStat('attack') > piece.defenceRemaining) {
            player.money -= activePieces[idx].getStat('attack') - piece.defenceRemaining
        }
    }
}

class Rage extends Admin {
    static iconID = 406;
    static name = "Rage";
    static description = "Enemy programs that take health damage from attacks become enraged";
    static unicode = "U+1F620";//"U+1F4A2";
    static color = "rgb(92, 0, 0)";
    static rarity = 2;
    constructor() {
        super(Rage.name, Rage.description, Rage.unicode, Rage.color, 3, Rage.rarity, 'gameState', 'onDealDamage')//onTurnEnd?
    }
    async apply({ id, activePieces, piece }: { id: string, activePieces: Piece[], piece: Piece }) {
        if (!piece) return;
        console.log('rage receiver')
        const idx = activePieces.findIndex(p => p.id === id);
        if (piece.team === 'enemy' && piece.defenceRemaining < (activePieces[idx].getStat('attack') * activePieces[idx].damageMult)) {
            piece.statuses.enraged = true;
            piece.addTempModifier({ attack: 1 })
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
        };
    }
}

class Autumn extends Admin {
    static iconID = 419;
    static name = "Autumn";
    static description = "Every player program loses -3 max size"; //and -1 defence?
    static unicode = "U+1FABE";
    static color = "rgb(220, 135, 0)";
    static rarity = 4;
    constructor() {
        super(Autumn.name, Autumn.description, Autumn.unicode, Autumn.color, 3, Autumn.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (activePieces[idx].getStat('maxSize') > 1) {
            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);
            activePieces[idx].addModifier({ maxSize: -3 })
        }
    }
}

//SLEEPING SYMBOL, U+1F4A4 //EXPRESSIONLESS FACE, U+1F611 sleepys
class Snoozefest extends Admin {
    static iconID = 408;
    static name = "Snoozefest";
    static description = "Your programs lose 1 action the first turn after they are placed";
    static unicode = "U+1F4A4";
    static color = "rgb(25, 25, 21)";
    static rarity = 2;
    constructor() {
        super(Snoozefest.name, Snoozefest.description, Snoozefest.unicode, Snoozefest.color, 3, Snoozefest.rarity, 'gameState', 'onTurnEnd')
    }
    private candidates: Record<string, number> = {};
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'player') {
                this.candidates[piece.id] = (this.candidates[piece.id] || 0) + 1;
                if (this.candidates[piece.id] < 2) {
                    piece.statuses.disarmed = true;
                    this.isTriggering = true;
                    setTimeout(() => this.isTriggering = false, 500);
                } else {
                    piece.statuses.disarmed = false;
                }
            }
        };
    }
    onRoundEnd() {
        this.candidates = {};
    }
}

//U+1F9C8 Butter - Moves enemy programs randomly after they are attacked
class Butter extends Admin {
    static iconID = 518;
    static name = "Butter";
    static description = "Non max size enemies slip into empty spaces when attacked";//would be nice to only effect the attacked piece, but we would need a new target type set up
    static unicode = "U+1F9C8";
    static color = "rgb(255, 250, 200)";
    static rarity = 2;
    constructor() {
        super(Butter.name, Butter.description, Butter.unicode, Butter.color, 3, Butter.rarity, 'piecesAndBoard', 'onDealDamage')
    }
    async apply({ activePieces, board, piece: piece }: { activePieces: Piece[], board: Coordinate[], piece?: Piece }) {//test something isnt missing here
        if (!piece || piece.tiles.length >= piece.maxSize) {
            return;
        }
        const spacesToCheck = [
            { x: piece.headPosition.x, y: piece.headPosition.y + 1 },
            { x: piece.headPosition.x + 1, y: piece.headPosition.y },
            { x: piece.headPosition.x, y: piece.headPosition.y - 1 },
            { x: piece.headPosition.x - 1, y: piece.headPosition.y },
        ]
        const freeSpaces = [];
        for (const spaceToCheck of spacesToCheck) {
            const isOccupied = activePieces.some(p =>
                p.tiles.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            );
            const isOnBoard = board.some(t => t.x === spaceToCheck.x && t.y === spaceToCheck.y)
            //if(!isOccupied && isOnBoard){
            if (!isOccupied && isOnBoard) {
                freeSpaces.push(spaceToCheck);
            }
        }
        if (freeSpaces.length === 0) {
            return;
        }
        piece.moveTo(Random.pick(freeSpaces));
    }
}

//U+1F483 Salsa - 
class Salsa extends Admin {
    static iconID = 519;
    static name = "Salsa";
    static description = "Enemies gain +1 moves when they deal damage";
    static unicode = "U+1F483";
    static color = "rgb(36, 56, 207)";
    static rarity = 2;
    constructor() {
        super(Salsa.name, Salsa.description, Salsa.unicode, Salsa.color, 3, Salsa.rarity, 'gameState', 'onReceiveDamage')
    }
    async apply({ id: id, activePieces: activePieces, piece: _piece }: { id: string, activePieces: Piece[], piece?: Piece }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ moves: 1 });
        activePieces[idx].movesRemaining += 1;
    }
}

//U+1F44F Clapback - All enemies retaliate after their first turn - 3 - onEnemyTurnEnd
class Clapback extends Admin {
    static iconID = 520;
    static name = "Clapback";
    static description = "All enemies always retaliate when attacked";
    static unicode = "U+1F44F";
    static color = "rgb(250, 45, 45)";
    static rarity = 3;
    constructor() {
        super(Clapback.name, Clapback.description, Clapback.unicode, Clapback.color, 3, Clapback.rarity, 'gameState', 'onEnemyTurnEnd')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.willRetaliate = true;
            }
        };
    }
}

//U+1F6D8 Avalanche - Damaging an enemy increases their attack by 1 
class Avalanche extends Admin {
    static iconID = 521;
    static name = "Avalanche";
    static description = "Damaging an enemy increases other enemies' attack by 1, and moves by 1";
    static unicode = "U+1F6D8";
    static color = "rgb(223, 243, 237)";
    static rarity = 4;
    constructor() {
        super(Avalanche.name, Avalanche.description, Avalanche.unicode, Avalanche.color, 3, Avalanche.rarity, 'gameState', 'onDealDamage')
    }
    async apply({ id: _id, activePieces, piece }: { id: string, activePieces: Piece[], piece: Piece }) {
        if (!piece) return;//if the piece was destroyed, do nothing?
        for (const p of activePieces) {
            if (p.team === 'enemy' && p.id !== piece.id) {//if it is not the receiver
                p.addModifier({ attack: 1 })
                p.addModifier({ moves: 1 })
            }
        };
    }
}

//U+1F624 Seething - All enemies get +0.5 damage mult at the start of the round - 5 - onRoundStart
class Seething extends Admin {
    static iconID = 522;
    static name = "Seething";
    static description = "All enemies get +0.5 damage mult at the start of the round";//does damage mult get reset on turns? change to on turn end if so
    static unicode = "U+1F624";
    static color = "rgb(196, 15, 9)";
    static rarity = 5;
    constructor() {
        super(Seething.name, Seething.description, Seething.unicode, Seething.color, 3, Seething.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.damageMult += 0.5;
            }
        };
    }
}

//U+1F49E Love Triangle -  - 5 onTurnEnd
class Love extends Admin {
    static iconID = 523;
    static name = "Love Triangle";
    static description = "After 3 turns, charms one of your programs. Then charms a different one each following turn, removing charmed from the previous program";
    static unicode = "U+1F49E";
    static color = "rgb(234, 167, 255)";
    static rarity = 5;
    constructor() {
        super(Love.name, Love.description, Love.unicode, Love.color, 3, Love.rarity, 'gameState', 'onTurnEnd')
    }
    private count: number = 0;
    private candidate: string = '';
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        this.count++
        if (this.count <= 3) return;
        //remove charmed from the previous candidate

        //pick a different eligible player program
        const eligible = activePieces.filter(p =>
            p.team === 'player' && !p.immunities.charmed && p.id !== this.candidate);

        if (eligible.length > 0) {
            const previous = activePieces.find(p => p.id === this.candidate);
            if (previous) previous.statuses.charmed = false;
            const next = Random.pick(eligible);
            next.statuses.charmed = true;
            this.candidate = next.id;
        }
    }

    onRoundEnd() {
        this.count = 0;
        this.candidate = '';
    }
}

//Technocore bosses

//Air Gap - removes tiles from level creating seperated islands
class AirGap extends Admin {//to finish
    static iconID = 524;
    static rarity = 7;
    static name = "Air Gapped";
    static description = "Removes tiles from nodes creating seperated islands";
    static unicode = "U+1F3DD";//U+26A0";
    static color = "rgb(31, 173, 255)";
    constructor() {
        super(AirGap.name, AirGap.description, AirGap.unicode, AirGap.color, 5, AirGap.rarity, 'piecesAndBoard', 'onRoundStart')
    }

    async apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const playerSpawnPieces = activePieces.filter(p => p.team === 'player' && p.name === 'Spawn');
        const enemyPieces = activePieces.filter(p => p.team === 'enemy');
        const unoccupiedTiles = board.filter(t => !activePieces.some(p => p.tiles.some(pt => pt.x === t.x && pt.y === t.y)));
        if (playerSpawnPieces.length === 0 || enemyPieces.length === 0 || unoccupiedTiles.length === 0) return;

        //find unnoccupied tiles between player spawn pieces and enemy pieces
        const playerCoords = playerSpawnPieces.flatMap(p => p.tiles);
        const enemyCoords = enemyPieces.flatMap(p => p.tiles);

        const pAvgX = playerCoords.reduce((sum, c) => sum + c.x, 0) / playerCoords.length;
        const pAvgY = playerCoords.reduce((sum, c) => sum + c.y, 0) / playerCoords.length;
        const eAvgX = enemyCoords.reduce((sum, c) => sum + c.x, 0) / enemyCoords.length;
        const eAvgY = enemyCoords.reduce((sum, c) => sum + c.y, 0) / enemyCoords.length;

        const minX = Math.min(...board.map(t => t.x));
        const maxX = Math.max(...board.map(t => t.x));
        const minY = Math.min(...board.map(t => t.y));
        const maxY = Math.max(...board.map(t => t.y));

        const unoccupiedSet = new Set(unoccupiedTiles.map(t => `${t.x},${t.y}`));
        const isUnoccupied = (x: number, y: number) => unoccupiedSet.has(`${x},${y}`);

        const pathToRemove = new Set<string>();

        // Divide horizontally (step across X) if separated more vertically, else divide vertically (step across Y)
        const stepAcrossX = Math.abs(pAvgY - eAvgY) >= Math.abs(pAvgX - eAvgX);

        if (stepAcrossX) {
            const pMinY = Math.min(...playerCoords.map(c => c.y));
            const pMaxY = Math.max(...playerCoords.map(c => c.y));
            const eMinY = Math.min(...enemyCoords.map(c => c.y));
            const eMaxY = Math.max(...enemyCoords.map(c => c.y));

            const lowY = Math.min(pMaxY, eMaxY);
            const highY = Math.max(pMinY, eMinY);
            const bandMinY = lowY < highY ? lowY : Math.floor(Math.min(pAvgY, eAvgY));
            const bandMaxY = lowY < highY ? highY : Math.ceil(Math.max(pAvgY, eAvgY));
            const midY = (pAvgY + eAvgY) / 2;

            let currentY = Math.round(midY);
            const startCandidates = unoccupiedTiles.filter(t => t.x === minX && t.y >= bandMinY && t.y <= bandMaxY);
            if (startCandidates.length > 0) {
                currentY = Random.pick(startCandidates).y;
            } else {
                const colTiles = unoccupiedTiles.filter(t => t.x === minX);
                if (colTiles.length > 0) {
                    colTiles.sort((a, b) => Math.abs(a.y - midY) - Math.abs(b.y - midY));
                    currentY = colTiles[0].y;
                }
            }

            if (isUnoccupied(minX, currentY)) {
                pathToRemove.add(`${minX},${currentY}`);
            }

            for (let x = minX + 1; x <= maxX; x++) {
                // Step orthogonally or diagonally to x (dy in -1, 0, 1)
                let candidates = [-1, 0, 1]
                    .map(dy => currentY + dy)
                    .filter(y => y >= bandMinY && y <= bandMaxY && isUnoccupied(x, y));

                if (candidates.length === 0) {
                    candidates = [-1, 0, 1]
                        .map(dy => currentY + dy)
                        .filter(y => isUnoccupied(x, y));
                }

                if (candidates.length > 0) {
                    const nextY = Random.pick(candidates);
                    // Optionally add an orthogonal turn tile at (x - 1, nextY) or (x, currentY) to vary orthogonal/diagonal steps
                    if (nextY !== currentY && Random.bool(0.5)) {
                        if (isUnoccupied(x - 1, nextY)) {
                            pathToRemove.add(`${x - 1},${nextY}`);
                        } else if (isUnoccupied(x, currentY)) {
                            pathToRemove.add(`${x},${currentY}`);
                        }
                    }
                    currentY = nextY;
                    pathToRemove.add(`${x},${currentY}`);
                } else {
                    // Fallback: find the nearest unoccupied tile in column x and step orthogonally toward it
                    const colTiles = unoccupiedTiles.filter(t => t.x === x);
                    if (colTiles.length > 0) {
                        colTiles.sort((a, b) => Math.abs(a.y - currentY) - Math.abs(b.y - currentY));
                        const targetY = colTiles[0].y;
                        const dir = Math.sign(targetY - currentY);
                        for (let y = currentY; y !== targetY + dir; y += dir) {
                            if (isUnoccupied(x - 1, y)) pathToRemove.add(`${x - 1},${y}`);
                            if (isUnoccupied(x, y)) pathToRemove.add(`${x},${y}`);
                        }
                        currentY = targetY;
                    }
                }
            }
        } else {
            const pMinX = Math.min(...playerCoords.map(c => c.x));
            const pMaxX = Math.max(...playerCoords.map(c => c.x));
            const eMinX = Math.min(...enemyCoords.map(c => c.x));
            const eMaxX = Math.max(...enemyCoords.map(c => c.x));

            const lowX = Math.min(pMaxX, eMaxX);
            const highX = Math.max(pMinX, eMinX);
            const bandMinX = lowX < highX ? lowX : Math.floor(Math.min(pAvgX, eAvgX));
            const bandMaxX = lowX < highX ? highX : Math.ceil(Math.max(pAvgX, eAvgX));
            const midX = (pAvgX + eAvgX) / 2;

            let currentX = Math.round(midX);
            const startCandidates = unoccupiedTiles.filter(t => t.y === minY && t.x >= bandMinX && t.x <= bandMaxX);
            if (startCandidates.length > 0) {
                currentX = Random.pick(startCandidates).x;
            } else {
                const rowTiles = unoccupiedTiles.filter(t => t.y === minY);
                if (rowTiles.length > 0) {
                    rowTiles.sort((a, b) => Math.abs(a.x - midX) - Math.abs(b.x - midX));
                    currentX = rowTiles[0].x;
                }
            }

            if (isUnoccupied(currentX, minY)) {
                pathToRemove.add(`${currentX},${minY}`);
            }

            for (let y = minY + 1; y <= maxY; y++) {
                // Step orthogonally or diagonally to y (dx in -1, 0, 1)
                let candidates = [-1, 0, 1]
                    .map(dx => currentX + dx)
                    .filter(x => x >= bandMinX && x <= bandMaxX && isUnoccupied(x, y));

                if (candidates.length === 0) {
                    candidates = [-1, 0, 1]
                        .map(dx => currentX + dx)
                        .filter(x => isUnoccupied(x, y));
                }

                if (candidates.length > 0) {
                    const nextX = Random.pick(candidates);
                    if (nextX !== currentX && Random.bool(0.5)) {
                        if (isUnoccupied(nextX, y - 1)) {
                            pathToRemove.add(`${nextX},${y - 1}`);
                        } else if (isUnoccupied(currentX, y)) {
                            pathToRemove.add(`${currentX},${y}`);
                        }
                    }
                    currentX = nextX;
                    pathToRemove.add(`${currentX},${y}`);
                } else {
                    const rowTiles = unoccupiedTiles.filter(t => t.y === y);
                    if (rowTiles.length > 0) {
                        rowTiles.sort((a, b) => Math.abs(a.x - currentX) - Math.abs(b.x - currentX));
                        const targetX = rowTiles[0].x;
                        const dir = Math.sign(targetX - currentX);
                        for (let x = currentX; x !== targetX + dir; x += dir) {
                            if (isUnoccupied(x, y - 1)) pathToRemove.add(`${x},${y - 1}`);
                            if (isUnoccupied(x, y)) pathToRemove.add(`${x},${y}`);
                        }
                        currentX = targetX;
                    }
                }
            }
        }

        //remove board tiles that no pieces occupy, creating an impassable gap.
        for (let i = board.length - 1; i >= 0; i--) {
            if (pathToRemove.has(`${board[i].x},${board[i].y}`)) {
                board.splice(i, 1);
            }
        }
    }
}
//Battle Royale - removes edge of map tiles every 3 turns until tileset is min 2x2
class Battle extends Admin {//to finish
    static iconID = 525;
    static rarity = 7;
    static name = "Battle Royale";
    static description = "Removes all spaces on the edge of a node every 3 turns";
    static unicode = "U+1F3DF";////STADIUM, U+1F3DF colloseum
    static color = "rgb(25, 124, 204)";
    constructor() {
        super(Battle.name, Battle.description, Battle.unicode, Battle.color, 5, Battle.rarity, 'piecesAndBoard', 'onTurnEnd')
    }
    private count: number = 0;
    async apply({ activePieces, board }: { activePieces: Piece[], board: Coordinate[] }) {
        this.count++
        if (this.count % 3 === 0) {
            if (board.length === 0) return;
            //look at width and height of board (highest x and y values of all spaces)
            const maxX = Math.max(...board.map(t => t.x));
            const maxY = Math.max(...board.map(t => t.y));
            //look at lowest current x and y values of spaces
            const minX = Math.min(...board.map(t => t.x));
            const minY = Math.min(...board.map(t => t.y));

            //guard here to not remove middle tile (or middle 2 tiles on level of even width)
            const canShrinkX = (maxX - minX) >= 2;
            const canShrinkY = (maxY - minY) >= 2;
            if (!canShrinkX && !canShrinkY) return;

            this.isTriggering = true;
            setTimeout(() => this.isTriggering = false, 500);

            //remove all around the edge (all spaces that have either the current lowest or highest x or y values)
            const removedCoords = new Set<string>();
            for (let i = board.length - 1; i >= 0; i--) {
                const tile = board[i];
                const isEdgeX = canShrinkX && (tile.x === minX || tile.x === maxX);
                const isEdgeY = canShrinkY && (tile.y === minY || tile.y === maxY);
                if (isEdgeX || isEdgeY) {
                    removedCoords.add(`${tile.x},${tile.y}`);
                    board.splice(i, 1);
                }
            }

            //if any pieces have tiles in these spaces, remove those as well
            for (const piece of [...activePieces]) {
                const hadTiles = piece.tiles.length > 0;
                piece.tiles = piece.tiles.filter(t => !removedCoords.has(`${t.x},${t.y}`));
                if (hadTiles && piece.tiles.length === 0) {
                    if (piece.removeCallback) {
                        piece.removeCallback(piece);
                    } else {
                        const idx = activePieces.indexOf(piece);
                        if (idx !== -1) activePieces.splice(idx, 1);
                    }
                } else if (piece.tiles.length > 0 && removedCoords.has(`${piece.headPosition.x},${piece.headPosition.y}`)) {
                    piece.headPosition = { ...piece.tiles[0] };
                }
            }
        }
    }

    onRoundEnd() {
        this.count = 0;
    }
}
//Lockdown - places Blackwall enemies next to player (20ms, 4moves, 0range, 10def, 0atk)// 
class Lockdown extends Admin {//to test
    static iconID = 526;
    static name = "Lockdown";
    static description = "Places Blackwall enemies next to player spawns";
    static unicode = "U+1F3D7";
    static color = "rgb(84, 139, 138)";
    static rarity = 7;
    constructor() {
        super(Lockdown.name, Lockdown.description, Lockdown.unicode, Lockdown.color, 5, Lockdown.rarity, 'all', 'onRoundStart')
    }
    async apply({ activePieces, board, playerSpawns }: { activePieces: Piece[], board: Coordinate[], playerSpawns?: Coordinate[] }) {
        if (!playerSpawns) return;
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);

        const playerSpawnPieces = activePieces.filter(p => p.team === 'player' && p.name === 'Spawn');
        const unoccupiedTiles = board.filter(t => !activePieces.some(p => p.tiles.some(pt => pt.x === t.x && pt.y === t.y)));

        //find unoccupied tiles next to player headpositions
        for (let i = 0; i < playerSpawnPieces.length; i++) {
            if (playerSpawnPieces.length === 0) break;
            const nextToPlayerHeads: Coordinate[] = [];
            nextToPlayerHeads.push({ x: playerSpawnPieces[i].headPosition.x + 1, y: playerSpawnPieces[i].headPosition.y })
            nextToPlayerHeads.push({ x: playerSpawnPieces[i].headPosition.x, y: playerSpawnPieces[i].headPosition.y + 1 })
            nextToPlayerHeads.push({ x: playerSpawnPieces[i].headPosition.x - 1, y: playerSpawnPieces[i].headPosition.y })
            nextToPlayerHeads.push({ x: playerSpawnPieces[i].headPosition.x, y: playerSpawnPieces[i].headPosition.y - 1 })
            const candidates = nextToPlayerHeads.filter(element => unoccupiedTiles.includes(element));//coords are {x: number, y: number} , will .filter work??
            if (candidates.length === 0) break;
            new Blackwall(Random.pick(candidates), 'enemy', playerSpawnPieces[i].removeCallback, crypto.randomUUID());
        }

    }
}

//Paywall - player money buffs all enemy stats + 1 per $5
class Paywall extends Admin {//to test
    static iconID = 527;
    static rarity = 7;
    static name = "Paywall";
    static description = "Every $5 owned by the player boosts all enemy stats by 1 at the start of a round";
    static unicode = "U+1F4CA";//U+1F4DC //abacus??
    static color = "rgb(255, 196, 0)";
    constructor() {
        super(Paywall.name, Paywall.description, Paywall.unicode, Paywall.color, 5, Paywall.rarity, 'playerAndGame', 'onRoundStart')
    }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        const noOfFives = Math.floor(player.money / 5) //round down
        const enemyPieces = activePieces.filter(p => p.team === 'enemy');
        for (let i = 0; i < enemyPieces.length; i++) {
            if (enemyPieces.length === 0) break;
            enemyPieces[i].addModifier({
                attack: noOfFives,
                defence: noOfFives,
                maxSize: noOfFives,
                moves: noOfFives,
                range: noOfFives
            });
        }
    }
}

//Soulkiller - uses the players blueprints , negative mirror
class SoulKiller extends Admin {//to test
    static iconID = 528;
    static rarity = 7;
    static name = "Soulkiller";
    static description = "Enemy programs are replaced with copies of your own";
    static unicode = "U+1FA9E";
    static color = "rgb(0, 0, 0)";
    constructor() {
        super(SoulKiller.name, SoulKiller.description, SoulKiller.unicode, SoulKiller.color, 5, SoulKiller.rarity, 'playerAndGame', 'onRoundStart')
    }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);
        const enemyPieces: Piece[] = []
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                enemyPieces.push(piece)
            }
        };

        for (const piece of enemyPieces) {
            const blueprint = Random.pick(player.programs);//random name from player pieceBlueprints
            const enemyClassName = blueprint.name;
            const EnemyClass = allPieces.find(p => p.name === enemyClassName);
            if (EnemyClass) {
                const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', piece.removeCallback, crypto.randomUUID());//check later
                enemyInstance.maxSize = blueprint.maxSize;
                enemyInstance.moves = blueprint.moves;
                enemyInstance.range = blueprint.range;
                enemyInstance.attack = blueprint.attack;
                enemyInstance.defence = blueprint.defence;
                activePieces.push(enemyInstance);
                //piece.removeCallback?.(piece);//checks for round end    
            }
            const idx = activePieces.findIndex(p => p.id === piece.id);
            activePieces.splice(idx, 1);
        }  //does this always end the round??
    }
}

//Zero Day - player spawns are put next to enemies
class Zero extends Admin {//to test
    static iconID = 529;
    static name = "Zero Day";
    static description = "Places all spawns next to enemy programs' head positions";
    static unicode = "U+26A0";
    static color = "rgb(255, 0, 0)";
    static rarity = 7;
    constructor() {
        super(Zero.name, Zero.description, Zero.unicode, Zero.color, 5, Zero.rarity, 'all', 'onRoundStart')
    }
    async apply({ activePieces, board, playerSpawns }: { activePieces: Piece[], board: Coordinate[], playerSpawns?: Coordinate[] }) {
        if (!playerSpawns) return;
        this.isTriggering = true;
        setTimeout(() => this.isTriggering = false, 500);

        const playerSpawnPieces = activePieces.filter(p => p.team === 'player' && p.name === 'Spawn');
        const enemyPieces = activePieces.filter(p => p.team === 'enemy');

        const unoccupiedTiles = board.filter(t => !activePieces.some(p => p.tiles.some(pt => pt.x === t.x && pt.y === t.y)));
        //find unoccupied tiles next to enemy headpositions
        const nextToEnemyHeads: Coordinate[] = [];
        for (let i = 0; i < enemyPieces.length; i++) {
            if (enemyPieces.length === 0) break;
            nextToEnemyHeads.push({ x: enemyPieces[i].headPosition.x + 1, y: enemyPieces[i].headPosition.y })
            nextToEnemyHeads.push({ x: enemyPieces[i].headPosition.x, y: enemyPieces[i].headPosition.y + 1 })
            nextToEnemyHeads.push({ x: enemyPieces[i].headPosition.x - 1, y: enemyPieces[i].headPosition.y })
            nextToEnemyHeads.push({ x: enemyPieces[i].headPosition.x, y: enemyPieces[i].headPosition.y - 1 })
        }

        const candidates = nextToEnemyHeads.filter(element => unoccupiedTiles.includes(element));//coords are {x: number, y: number} , will .filter work??

        const newSpawns: Coordinate[] = [];
        for (let i = 0; i < playerSpawns.length; i++) {
            if (candidates.length === 0) break;
            const randIdx = Random.floor(unoccupiedTiles.length);
            newSpawns.push(candidates[randIdx]);
            candidates.splice(randIdx, 1);
        }

        for (let i = 0; i < playerSpawnPieces.length; i++) {
            const coord = newSpawns[i];
            if (coord) {
                playerSpawnPieces[i].headPosition = coord;
                playerSpawnPieces[i].tiles = [coord];
            }
        }

        playerSpawns.splice(0, playerSpawns.length, ...newSpawns);
    }
}

export const allBosses = [Concussion, LowBattery, NorthWind, Taxman, TrafficLight, Quicksand, Butter, Customs, Downturn, Hook, Mirror, Rage, Salsa, Shrine, Snoozefest, Whale, Anchor, Hammer, Castle, Circus, Clapback, ClipBoard, Izakaya, Mountain, Tsunami, Wilt, Autumn, Avalanche, Biohazard, Cocktail, Coral, Eclipse, Lock, Factory, Jack, Coaster, Blackmail, Snowflake, Love, Bones, Frog, Singularity, Seething, Tornado, Volcano, Snow, Sun, Fog, Nightfall, Nofun, Omega, Reaper, REDACTED, Wrath, AirGap, Battle, Lockdown, Paywall, SoulKiller, Zero];
export const nonStackableBosses = [Mirror, Customs, Snowflake, Sun, Frog, Biohazard, Coral, Izakaya, REDACTED, Fog, Singularity, Tornado, Cocktail];

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
    if (admin.rarity === 1) adminLogs.rarity1 += 1;
    if (admin.rarity === 2) adminLogs.rarity2 += 1;
    if (admin.rarity === 3) adminLogs.rarity3 += 1;
    if (admin.rarity === 4) adminLogs.rarity4 += 1;
    if (admin.rarity === 5) adminLogs.rarity5 += 1;
    if (admin.rarity === 6) adminLogs.rarity6 += 1;
});
console.log("Bosses of rarity 1: ", adminLogs.rarity1)
console.log("Bosses of rarity 2: ", adminLogs.rarity2)
console.log("Bosses of rarity 3: ", adminLogs.rarity3)
console.log("Bosses of rarity 4: ", adminLogs.rarity4)
console.log("Bosses of rarity 5: ", adminLogs.rarity5)
console.log("Bosses of rarity 6: ", adminLogs.rarity6)