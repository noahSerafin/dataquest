import { Piece, allPieces } from "./Pieces";
import { Item, allItems } from "./Items";
import { Admin, allAdmins } from "./AdminPrograms";
import { allBosses } from "./Bosses";
import { Player } from "./Player";
import type {OS} from "./types";

// Registry for class-based objects
const pieceRegistry: Record<string, any> = {};
allPieces.forEach(P => { pieceRegistry[P.name] = P; });

const itemRegistry: Record<string, any> = {};
allItems.forEach(I => { itemRegistry[I.name] = I; });

const adminRegistry: Record<string, any> = {};
allAdmins.forEach(A => { adminRegistry[A.name] = A; });
allBosses.forEach(B => { adminRegistry[B.name] = B; });

// --- PIECE SERIALIZATION ---

export function serializePiece(piece: Piece): any {
    return {
        name: piece.name,
        id: piece.id,
        headPosition: { ...piece.headPosition },
        tiles: piece.tiles.map(t => ({ ...t })),
        team: piece.team,
        movesRemaining: piece.movesRemaining,
        defenceRemaining: piece.defenceRemaining,
        actions: piece.actions,
        damageMult: piece.damageMult,
        redacted: piece.redacted,
        statuses: { ...piece.statuses },
        immunities: { ...piece.immunities },
        statModifiers: { ...piece.statModifiers },
        // Base stats (in case they were modified from the class default)
        maxSize: piece.maxSize,
        moves: piece.moves,
        range: piece.range,
        attack: piece.attack,
        defence: piece.defence,
        color: piece.color,
        unicode: piece.unicode,
        description: piece.description,
        rarity: piece.rarity,
        variantName: piece.variantName,
        hybridName: piece.hybridName,
        extraUnicode: piece.extraUnicode
    };
}

export function rehydratePiece(data: any, removeCallback?: (p: Piece) => void): Piece {
    const PieceClass = pieceRegistry[data.name];
    if (!PieceClass) {
        throw new Error(`Piece class not found for name: ${data.name}`);
    }

    const instance = new PieceClass(
        data.headPosition,
        data.team,
        removeCallback,
        data.id
    );

    // Override with saved properties
    instance.tiles = data.tiles;
    instance.movesRemaining = data.movesRemaining;
    instance.defenceRemaining = data.defenceRemaining;
    instance.actions = data.actions;
    instance.damageMult = data.damageMult;
    instance.redacted = data.redacted;
    instance.statuses = data.statuses;
    instance.immunities = data.immunities;
    instance.statModifiers = data.statModifiers;
    instance.maxSize = data.maxSize;
    instance.moves = data.moves;
    instance.range = data.range;
    instance.attack = data.attack;
    instance.defence = data.defence;
    instance.color = data.color;
    instance.unicode = data.unicode;
    instance.description = data.description;
    instance.rarity = data.rarity;
    instance.variantName = data.variantName;
    instance.hybridName = data.hybridName;
    instance.extraUnicode = data.extraUnicode;

    return instance;
}

// --- ITEM & ADMIN SERIALIZATION ---

export function serializeItem(item: Item): any {
    return {
        name: item.name,
        id: item.id
    };
}

export function rehydrateItem(data: any): Item {
    const ItemClass = itemRegistry[data.name];
    if (!ItemClass) {
        throw new Error(`Item class not found for name: ${data.name}`);
    }
    const instance = new ItemClass();
    instance.id = data.id;
    return instance;
}

export function serializeAdmin(admin: Admin): any {
    return {
        name: admin.name,
        id: admin.id,
        disabled: admin.disabled
    };
}

export function rehydrateAdmin(data: any): Admin {
    const AdminClass = adminRegistry[data.name];
    if (!AdminClass) {
        throw new Error(`Admin class not found for name: ${data.name}`);
    }
    const instance = new AdminClass();
    instance.id = data.id;
    instance.disabled = data.disabled;
    return instance;
}

// --- PLAYER SERIALIZATION ---

export function serializePlayer(player: Player): any {
    return {
        money: player.money,
        memory: player.memory,
        adminSlots: player.adminSlots,
        blueprints: player.programs.map(bp => ({ ...bp })),
        items: player.items.map(i => serializeItem(i)),
        admins: player.admins.map(a => serializeAdmin(a)),
        lives: player.lives,
        difficulty: player.difficulty,
        mapProgress: player.mapProgress,
        bossesCleared: player.bossesCleared,
        hasWonGame: player.hasWonGame,
        bonusInterest: player.bonusInterest,
        bonusReward: player.bonusReward,
        nextInterest: player.nextInterest,
        fogged: player.fogged,
        osunicode: player.osunicode
    };
}

export function rehydratePlayer(data: any, allOSes: OS[]): Player {
    const player = new Player(
        data.osunicode,
        data.money,
        data.memory,
        data.adminSlots,
        data.items.map((i: any) => rehydrateItem(i)),
        data.blueprints,
        data.admins.map((a: any) => rehydrateAdmin(a)),
        data.lives,
        data.interestCap,
        data.bonusInterest,
        data.bonusReward,
        data.nextInterest,
        data.nextReward,
        data.stake
    );

    player.difficulty = data.difficulty;
    player.mapProgress = data.mapProgress;
    player.bossesCleared = data.bossesCleared;
    player.hasWonGame = data.hasWonGame;
    player.fogged = data.fogged;

    return player;
}
