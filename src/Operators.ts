import type { OS } from "./types";
import type { PieceBlueprint } from "./types";
import { allPieces } from "./Pieces";
import type { Piece } from "./Pieces";

/*
export function findPieceClassByName(name: string) {
  return allPieces.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}
export function blueprintFromPieceClass(piece: typeof Piece): PieceBlueprint {
    return {
        id: crypto.randomUUID(),
        name: piece.name,
        description: piece.description,
        unicode: piece.unicode,
        maxSize: piece.maxSize,
        moves: piece.moves,
        range: piece.range,
        attack: piece.attack,
        defence: piece.defence,
        rarity: piece.rarity,
        color: piece.color,

        // blueprint-only fields:
        isPlaced: false,
        cost: piece.rarity * 10 // or whatever cost formula you want
    };
}*/

const knife =  {
        id: crypto.randomUUID(),
        name: "Knife",
        description: '"A basic attack program"',
        unicode: 'U+1F52A',
        maxSize: 3,
        moves: 2,
        range: 1,
        attack: 2,
        defence: 0,
        rarity: 1,
        color: '#2fc5ebff',
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }

    const shield =  {
        id: crypto.randomUUID(),
        name: "Shield",
        description: '"A basic defensive program"',
        unicode: "U+1F6E1",
        maxSize: 3,
        moves: 1,
        range: 0,
        attack: 0,
        defence: 1,
        rarity: 1,
        color: "#2fa7ca",
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }

    const sling =  {
        id: crypto.randomUUID(),
        name: "Sling",
        description: '"A basic ranged program"',
        unicode: "U+1F94F",
        maxSize: 2,
        moves: 2,
        range: 2,
        attack: 1,
        defence: 0,
        rarity: 1,
        color: "#019700",
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }

    const potato =  {
        id: crypto.randomUUID(),
        name: "Sling",
        description: '"A basic all around program"',
        unicode: "U+1F954",
        maxSize: 3,
        moves: 1,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        color: "#ad8226ff",
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }

    //guard, snail, TP, Lance, Bug, Screwdriver

/*
        this.interestCap = interestCap;
        this.bonusInterest = bonusInterest;
        this.hasTrolley = hasTrolley;
        this.hasToolbox = hasToolbox;
        */
const Steam : OS = {//knife //shield //sling
    name: 'Steam',
    unicode: 'U+1F682',
    money: 5,
    memory: 6,
    adminSlots: 5,
    blueprints: [knife, shield, sling],
    items: [],
    admins: [],
    lives: 3,
    description: 'The Gamers choice. High starting memory, and comes with some unique starting programs'
}
const Penguin : OS = {//potato //shield
    name: 'Penguin',
    unicode: 'U+1F427',
    money: 3,
    memory: 5,
    adminSlots: 5,
    blueprints: [potato, shield],
    items: [],
    admins: [],
    lives: 2,
    description: 'A versatile all around system, though a bit barebones out of the box'
}

const Window : OS = {//knife //gaurd //snail
    name: 'Window',
    unicode: ' U+1FA9F',
    money: 5,
    memory: 4,
    adminSlots: 5,
    blueprints: [],
    items: [],
    admins: [],
    lives: 1,
    description: 'Limited memory, but starts with some useful programs'

}

const Apple : OS = {//TP //guard
    name: 'Apple',
    unicode: 'U+1F34F',
    money: 10,
    memory: 4,
    adminSlots: 4,
    blueprints: [],
    items: [],
    admins: [],
    lives: 1,
    description: 'Limited admin functionality, but starts with excess money and some situational programs'
}

const Temple : OS = {//lance //bug //screwdriver
    name: 'Temple',
    unicode: 'U+2696',
    money: 2,
    memory: 3,
    adminSlots: 6,
    blueprints: [],
    items: [],
    admins: [],
    lives: 2,
    description: 'Overclocked admin slots, low money. Some unique starting programs'
}
// SCALES, U+2696 --- CROSSED SWORDS, U+2694
//scales: EGYPTIAN HIEROGLYPH U038, U+1335D
//temple - +1 admin +1 memory -1 interest
//---------

//STEAM LOCOMOTIVE, U+1F682
//+2 admin 

//BITCOIN SIGN, U+20BF

//U+1F403 GNU

//GREEK CAPITAL LETTER DELTA, U+394

export const allOSes = [Steam, Penguin, Window, Apple, Temple];