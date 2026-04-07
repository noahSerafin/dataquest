import { Admin } from "./AdminPrograms";
import { Piece, allPieces } from "./Pieces";
import { Player } from "./Player";
import type { Coordinate } from "./types";
import { DIFFICULTY_RARITY } from "./constants";
import { getRandomUnoccupiedTile } from "./helperFunctions";

//lower difficulty of +1 bosses, more +2 bosses
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
            }
        };
    }
}

class Mirror extends Admin {
    static rarity = 2;
    static name = "Mirror";
    static description = "Enemy program's classes are chosen from blueprints in your inventory";
    static unicode = "U+1FA9E";
    static color = "rgb(172, 5, 213)";
    constructor() {
        super(Mirror.name, Mirror.description, Mirror.unicode, Mirror.color, 5, Mirror.rarity, 'playerAndGame', 'onRoundStart')
    }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        const enemyPieces: Piece[] = []
        for (const piece of activePieces) {
            enemyPieces.push(piece)
            if (piece.team === 'enemy') {
            }
        };

        for (const piece of enemyPieces) {
            const enemyClassName = player.programs[Math.floor(Math.random() * player.programs.length)].name;//random name from player pieceBlueprints
            const EnemyClass = allPieces.find(p => p.name === enemyClassName);
            if (EnemyClass) {
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
        player.money--
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
    async apply({ activePieces, board, player }: { activePieces: Piece[], board: Coordinate[], player: Player }) {
        this.count += 1;
        if (this.count % 3 === 0) {
            //random piece in all pieces using player difficulty level
            const { min, max } = DIFFICULTY_RARITY[player.difficulty];
            const validEnemies = allPieces.filter(p =>
                p.rarity >= min && p.rarity <= max && p.name !== 'Nuke' && p.name !== 'Trap' && p.name !== 'Tar' && p.name !== 'Pitfall' && p.name !== 'Web' && p.name !== 'Mine'
            );
            const pool = validEnemies.length > 0 ? validEnemies : allPieces;
            const EnemyClass = pool[Math.floor(Math.random() * pool.length)];//random piece ranked for diificulty

            //get a random unnoccupied space
            const space = getRandomUnoccupiedTile(board, activePieces);//removeCallback

            if (space) {
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
        if (this.count >= 1) {
            const playerPieces: Piece[] = []
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    playerPieces.push(piece)
                }
            };
            const randId = playerPieces[Math.floor(Math.random() * playerPieces.length)].id
            const idx = activePieces.findIndex(p => p.id === randId);
            activePieces[idx].takeDamage(1 + activePieces[idx].defenceRemaining);//should also remove a size 1 piece from the board
        }
        this.count++
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
    async apply({ player }: { player: Player }) {
        this.count += 1
        if (this.count === 10) {
            player.lives--
            this.count = 0;
        }

    }
    onRoundEnd() {
        this.count = 0;
    }
}

class Volcano extends Admin {
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
    static color = "rgb(95, 208, 227)";
    static rarity = 3;
    constructor() {
        super(Circus.name, Circus.description, Circus.unicode, Circus.color, 5, Circus.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
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
    static rarity = 3;
    constructor() {
        super(Castle.name, Castle.description, Castle.unicode, Castle.color, 5, Castle.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ defence: 1 })
            }
        };
    }
}

class Anchor extends Admin {
    static name = "Anchor";
    static description = "Every player program loses -2 moves";
    static unicode = "U+2693";
    static color = "rgb(52, 48, 112)";
    static rarity = 3;
    constructor() {
        super(Anchor.name, Anchor.description, Anchor.unicode, Anchor.color, 5, Anchor.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ moves: -2 })
    }
}

class Jack extends Admin {
    static name = "Jack O' Lantern";
    static description = "Every enemy gains +1 range at the start of the round";
    static unicode = "U+1F383";
    static color = "rgb(180, 63, 5)";
    static rarity = 4;
    constructor() {
        super(Jack.name, Jack.description, Jack.unicode, Jack.color, 5, Jack.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
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
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ defence: 2 })
            }
        };
    }
}

class Eclipse extends Admin {
    static name = "Eclipse";
    static description = "Every player program loses -1 range";//hides enemies?
    static unicode = "U+1F31A";
    static color = "#000000ff";
    static rarity = 4;
    constructor() {
        super(Eclipse.name, Eclipse.description, Eclipse.unicode, Eclipse.color, 5, Eclipse.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ range: -1 })
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
        if (activePieces[idx].getStat('maxSize') > 1) {
            activePieces[idx].addModifier({ maxSize: -1 })
        }
    }
}

class Customs extends Admin {//remove
    static name = "Customs";
    static description = "Every player program is exposed and loses -1 moves";
    static unicode = "U+1F6C3";
    static color = "#127a3eff";
    static rarity = 2;
    constructor() {
        super(Customs.name, Customs.description, Customs.unicode, Customs.color, 3, Customs.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (!activePieces[idx].immunities.exposed) {
            activePieces[idx].statuses.exposed = true;
            activePieces[idx].statuses.hidden = false;
        }
        activePieces[idx].addModifier({moves: -1})
    }
}

class Shrine extends Admin {
    static name = "Shrine";
    static description = "Every player program loses -1 attack";
    static unicode = "U+26E9";
    static color = "rgb(255, 255, 255)";
    static rarity = 2;
    constructor() {
        super(Shrine.name, Shrine.description, Shrine.unicode, Shrine.color, 4, Shrine.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ attack: -1 })
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
        if (!activePieces[idx].immunities.confused) {
            activePieces[idx].statuses.confused = true;
        }
    }
}

class Snowflake extends Admin {//LEAFLESS TREE, U+1FABE
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
            activePieces[idx].statuses.frozen = true;
        }
    }
}

class Sun extends Admin {
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
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
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
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
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
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
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
        if (activePieces[idx].team === 'player') {
            const piece = activePieces[idx];
            const EnemyClass = allPieces.find(p => p.name === piece.name);
            if (EnemyClass) {
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
        if (!activePieces[idx].immunities.poisoned) {
            activePieces[idx].statuses.poisoned = true;
        }
    }
}

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
        if (!activePieces[idx].immunities.slowed) {
            activePieces[idx].statuses.slowed = true;
        }
    }
}

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
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.redacted = true;
            }
        };
    }
}

class Fog extends Admin {//😶‍🌫️🌫️
    static name = "Fog of War";
    static description = "All tiles outside your programs range are obscured";//handle in app
    static unicode = "U+1F301";//fog //"U+1FAEF";//fight //"U+2601"; //cloud
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
        if (activePieces[idx].getStat('maxSize') > 1) {
            activePieces[idx].addModifier({ maxSize: -2 })
        }
    }
}

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
        if (!activePieces[idx].immunities.diseased) {
            activePieces[idx].statuses.diseased = true;
        }
    }
}

class Nofun extends Admin {
    static name = "No Fun Allowed";
    static description = "Disables 1 random admin each turn";
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
            player.admins[Math.floor(Math.random() * player.admins.length)].disabled = true;
        }
    }
}

class Tornado extends Admin {
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
        const unoccupiedTiles = board.filter(t => !activePieces.some(p => p.tiles.some(pt => pt.x === t.x && pt.y === t.y)));

        const newSpawns: Coordinate[] = [];
        for (let i = 0; i < playerSpawns.length; i++) {
            if (unoccupiedTiles.length === 0) break;
            const randIdx = Math.floor(Math.random() * unoccupiedTiles.length);
            newSpawns.push(unoccupiedTiles[randIdx]);
            unoccupiedTiles.splice(randIdx, 1);
        }
        playerSpawns.splice(0, playerSpawns.length, ...newSpawns);
    }
}

class Tsunami extends Admin {
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
    static name = "Up and Up";//cranking up
    static description = "Every player piece takes a cumulating +1 damage after each turn after the first";//turn count is damage?
    static unicode = "U+1F3A2";//"U+1F3D4";//mountain
    static color = "rgb(196, 233, 245)";
    static rarity = 4;
    constructor() {
        super(Coaster.name, Coaster.description, Coaster.unicode, Coaster.color, 5, Coaster.rarity, 'playerAndGame', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces, player: _player }: { id: string, activePieces: Piece[], player: Player }) {
        if (this.count >= 1) {
            for (const piece of activePieces) {
                if (piece.team === 'player') {
                    piece.takeDamage(this.count);
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
    static name = "Singularity";
    static description = "After 3 turns, all enemies' actions are doubled";
    static unicode = "U+1F916";
    static color = "rgb(59, 59, 59)";
    static rarity = 5;
    constructor() {
        super(Singularity.name, Singularity.description, Singularity.unicode, Singularity.color, 5, 9, 'all', 'onTurnEnd')
    }
    private count: number = 0
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        if (this.count >= 3) {
            for (const piece of activePieces) {
                if (piece.team === 'enemy') {
                    piece.actions = 2;
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

        const possibleBosses = allBosses.filter(b => b.rarity < player.difficulty && b.name !== Cocktail.name);
        if (possibleBosses.length === 0) return;

        const Boss1 = possibleBosses[Math.floor(Math.random() * possibleBosses.length)];
        const Boss2 = possibleBosses[Math.floor(Math.random() * possibleBosses.length)];
        
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
    static name = "Mountain";
    static description = "Every enemy gains +4 max size at the start of the round";
    static unicode = "U+1F3D4";
    static color = "rgb(154, 155, 155)";
    static rarity = 3;
    constructor() {
        super(Mountain.name, Mountain.description, Mountain.unicode, Mountain.color, 3, Mountain.rarity, 'gameState', 'onRoundStart')
    }
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        for (const piece of activePieces) {
            if (piece.team === 'enemy') {
                piece.addModifier({ maxSize: 4 })
            }
        };
    }
}
//quicksand BEACH WITH UMBRELLA, U+1F3D6 //THONG SANDAL, U+1FA74 //HOURGLASS WITH FLOWING SAND,// U+23F3 DESERT, U+1F3DC
class Quicksand extends Admin {
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
      if(p.team==='player' && p.movesRemaining < p.getStat('moves')){
        p.quickSanded = true;
      } else {
        p.quickSanded = false;
      }
    };
  }
}
//CLOUD WITH SNOW, U+1F328 - white out -1 moves -1 range 5
class Snow extends Admin {
    static name = "White Out";
    static description = "Every player program loses -1 range and -1 moves";
    static unicode = "U+1F328";
    static color = "rgb(255, 255, 255)";
    static rarity = 5;
    constructor() {
        super(Snow.name, Snow.description, Snow.unicode, Snow.color, 5, Snow.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        activePieces[idx].addModifier({ range: -1 })
        activePieces[idx].addModifier({ moves: -1 })
    }
}
class Nightfall extends Admin {
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
        const randId = enemyPieces[Math.floor(Math.random() * enemyPieces.length)].id
        const idx = activePieces.findIndex(p => p.id === randId);
        activePieces[idx].statuses.hidden = true
    }
}
//black book NOTEBOOK, U+1F4D3 after 3 turns switch the side of a friendly 5
class Blackmail extends Admin {
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
            const randId = playerPieces[Math.floor(Math.random() * playerPieces.length)].id
            const idx = activePieces.findIndex(p => p.id === randId);
            activePieces[idx].team = 'enemy'
        }
        this.count++
    }
    onRoundEnd() {
        this.count = 0;
    }
}

// CLIPBOARD, U+1F4CB inspection nerfs all your placed programs 3
class ClipBoard extends Admin {
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
            activePieces[idx].addModifier({ maxSize: -1 })
        }
    }
}

//TRAFFIC LIGHT, U+1F6A6 pieces that take an action take 1 damage
class TrafficLight extends Admin {
    static name = "Traffic Light";
    static description = "Programs that move or action when the light is red take 1 damage at the end of your turn";//or lose 1 moves:
    static unicode = "U+1F6A6";
    static color = "hsl(0, 0%, 69%)";
    static rarity = 1;
    constructor() {
        super(TrafficLight.name, TrafficLight.description, TrafficLight.unicode, TrafficLight.color, 3, TrafficLight.rarity, 'gameState', 'onTurnEnd')
    }
    private count = 0;
    async apply({ id: _id, activePieces }: { id: string, activePieces: Piece[] }) {
        if(this.count === 2){
            for (const p of activePieces) {
                if(p.team==='player' && (p.actions < 1 || p.getStat('moves') > p.movesRemaining)){
                    await p.takeDamage(1)
                }
            }
            this.color = 'green';
            this.count = 0;
        } else {
            this.count ++
            if(this.count === 1){
                this.color = 'orange';
            } else  if(this.count === 2){
                this.color = 'red';
            }
        }
    }
    onRoundEnd() {
        this.count = 0;
        this.color = 'green';
    }
}

class Concussion extends Admin {
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
        if(!piece) return;
        
        if(piece.defenceRemaining < 0){
            // Increment hit count for this program
            this.candidates[piece.id] = (this.candidates[piece.id] || 0) + 1;
        }
        if (this.candidates[piece.id] >= 2) {
            if(!piece.immunities.confused){
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
    static rarity = 1;
    static name = "Taxman";
    static description = "Your program's attack is nerfed by -1 for every $5 you have on load";
    static unicode = "U+1F4D2";
    static color = "rgb(70, 70, 70)";
    constructor() {
        super(Taxman.name, Taxman.description, Taxman.unicode, Taxman.color, 5, Taxman.rarity, 'playerAndGame', 'onPlacement')
    }

    async apply({ id: _id, activePieces, player }: { id: string, activePieces: Piece[], player: Player }) {
        const noOfFives = Math.floor(player.money / 5) //round down
        for(const p of activePieces){
            if(p.team === 'player'){
                p.addModifier({attack: -noOfFives})
            }
        }
    }
}

class Rage extends Admin {
    static name = "Rage";
    static description = "Enemy programs that take health damage become enraged";
    static unicode = "U+1F4A2";
    static color = "rgb(92, 0, 0)";
    static rarity = 2;
    constructor() {
        super(Rage.name, Rage.description, Rage.unicode, Rage.color, 3, Rage.rarity, 'gameState', 'onDealDamage')
    }
    async apply({ id, activePieces, piece }: { id: string, activePieces: Piece[], piece: Piece }) {
        if(!piece) return;
        console.log('rage receiver')
        const idx = activePieces.findIndex(p => p.id === id);
        if(piece.team === 'enemy' && piece.defenceRemaining < (activePieces[idx].getStat('attack') * activePieces[idx].damageMult)){
            piece.statuses.enraged = true;
        };
    }
}

class Autumn extends Admin {
    static name = "Autumn";
    static description = "Every player program loses -3 max size"; //and -1 defence?
    static unicode = "U+1FABE";
    static color = "rgb(69, 76, 90)";
    static rarity = 4;
    constructor() {
        super(Autumn.name, Autumn.description, Autumn.unicode, Autumn.color, 3, Autumn.rarity, 'gameState', 'onPlacement')
    }
    async apply({ id, activePieces }: { id: string, activePieces: Piece[] }) {
        const idx = activePieces.findIndex(p => p.id === id);
        if (activePieces[idx].getStat('maxSize') > 1) {
            activePieces[idx].addModifier({ maxSize: -3 })
        }
    }
}

//SLEEPING SYMBOL, U+1F4A4
class Snoozefest extends Admin {
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
        for(const piece of activePieces){
            if(piece.team==='player'){
                this.candidates[piece.id] = (this.candidates[piece.id] || 0) + 1;
                if (this.candidates[piece.id] < 2) {
                    piece.disarmed = true;
                } else {
                    piece.disarmed = false;
                }
            }
        };
    }
    onRoundEnd() {
        this.candidates = {};
    }
}

// damage mult for enemy?
export const allBosses = [Concussion, LowBattery, NorthWind, Taxman, TrafficLight, Quicksand, Customs, Downturn, Hook, Mirror, Rage, Shrine, Snoozefest, Whale, Anchor, Castle, Circus, Hammer, ClipBoard, Izakaya, Mountain, Tsunami, Wilt, Autumn, Biohazard, Cocktail, Coral, Eclipse, Lock, Factory, Jack, Coaster, Blackmail, Snowflake, Bones, Frog, Singularity, Tornado, Volcano, Snow, Sun, Fog, Nightfall, Nofun, Omega, Reaper, REDACTED, Wrath]
export const nonStackableBosses = [Mirror, Customs, Snowflake, Sun, Frog, Biohazard, Coral, Izakaya, REDACTED, Fog, Singularity, Tornado, Cocktail]

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

//FACE WITH LOOK OF TRIUMPH, U+1F624
//angry pieces, deadly pieces - apply variants?


//EXPRESSIONLESS FACE, U+1F611 sleepy