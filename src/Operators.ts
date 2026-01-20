import type { OS } from "./types";
import { Voucher, Whetstone, Garlic, Lightning, RedMeat, Genie, Box, Gift, Pinata, Pandora, Update2, Update3, Floppy } from "./Items";

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
    const testPiece =  {
        id: crypto.randomUUID(),
        name: "Highwayman",
        description: '"testing this pieces special move"',
        unicode: 'U+1F47E',
        maxSize: 3,
        moves: 10,
        range: 2,
        attack: 2,
        defence: 2,
        rarity: 5,
        color: "#ee74eeff",
        // blueprint-only fields:
        isPlaced: false,
        cost: 10 // or whatever cost formula you want
    }
    const superKnife =  {
        id: crypto.randomUUID(),
        name: "Arms",
        description: '"A suped up attack program"',
        unicode: 'U+2694',
        maxSize: 2,
        moves: 10,
        range: 10,
        attack: 20,
        defence: 50,
        rarity: 1,
        color: '#902febff',
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
        name: "Potato",
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
    const tp =  {
        id: crypto.randomUUID(),
        name: "TP",
        description: "A large program with high movement",
        unicode: "U+1F9FB",
        color: "#0d92ffff",
        maxSize: 6,
        moves: 3,
        range: 0,
        attack: 0,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const rat =  {
        id: crypto.randomUUID(),
        name: "Rat",
        description: "A small but fast program ",
        unicode: "U+1F400",
        color: "#6e6e6eff",
        maxSize: 1,
        moves: 3,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const snail =  {
        id: crypto.randomUUID(),
        name: "Snail",
        description: "A slow program that can retract itself to boost its defence",
        unicode: "U+1F40C",
        color: "#4d3502ff",
        maxSize: 3,
        moves: 1,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const bug =  {
        id: crypto.randomUUID(),
        name : "Bug",
        description: "A fast but small program",
        unicode: "U+1F47E",
        color: "#04ca0eff",
        maxSize: 1,
        moves: 5,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const bee =  {
        id: crypto.randomUUID(),
        name: "Bee",
        description: "A small program which can sting, sacrificing itself for a high damage attack",
        unicode: "U+1F41D",
        color: "#eeff00ff",
        maxSize: 1,
        moves: 2,
        range: 1,
        attack: 3,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const aegis =  {
        id: crypto.randomUUID(),
        name: "Aegis",
        description: "An advanced defensive piece that can retaliate against attacks",
        unicode: "U+26FB",
        color: "#06789bff",
        maxSize: 3,
        moves: 2,
        range: 0,
        attack: 1,
        defence: 2,
        rarity: 2,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1 // or whatever cost formula you want
    }
    const screwdriver =  {
        id: crypto.randomUUID(),
        name: "Screwdriver",
        description: "A program that can tinker with another, boosting a random stat by 1",
        unicode: "U+1FA9B",
        color: "#ff1d0dff",
        maxSize: 1,
        moves: 1,
        range: 1,
        attack: 0,
        defence: 0,
        rarity: 5,
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
    blueprints: [knife, sling, shield],
    items: [new Voucher],
    admins: [],
    lives: 3,
    description: 'The Gamers choice. High starting memory, comes with all the essential base programs, and one voucher to redeem a free shop item.'
}
const Penguin : OS = {//potato //shield
    name: 'Penguin',
    unicode: 'U+1F427',
    money: 3,
    memory: 5,
    adminSlots: 5,
    blueprints: [potato, sling, aegis],
    items: [new Whetstone, new Lightning],
    admins: [],
    lives: 4,
    description: 'A versatile system with extra lives. Start with some upgrade items.'
}

const Window : OS = {//knife //shield //snail
    name: 'Window',
    unicode: ' U+1FA9F',
    money: 5,
    memory: 4,
    adminSlots: 5,
    blueprints: [knife, snail, tp, shield],
    items: [],
    admins: [],
    lives: 2,
    description: 'Limited memory. Starts with some basic programs'

}

const Apple : OS = {//TP //rat
    name: 'Apple',
    unicode: 'U+1F34F',
    money: 10,
    memory: 5,
    adminSlots: 4,
    blueprints: [rat, bee, shield],
    items: [new Garlic, new RedMeat],
    admins: [],
    lives: 3,
    description: 'Limited admin functionality, but start with excess money and some consumable items.'
}

const Temple : OS = {//lance //bug //screwdriver
    name: 'Temple',
    unicode: 'U+2696',
    money: 1,
    memory: 6,
    adminSlots: 6,
    blueprints: [bug, aegis, screwdriver],
    items: [new Pandora],
    admins: [],
    lives: 3,
    description: "Overclocked memory and admin slots, low money. Some unique starting programs, and a pandora's Box."
}

const Debugger : OS = {//lance //bug //screwdriver
    name: 'Debugger',
    unicode: 'U+1F41B',
    money: 50,
    memory: 10,
    adminSlots: 6,
    blueprints: [bug, aegis, superKnife, screwdriver],
    items: [new Genie, new Box, new Pinata, new Gift, new Pandora, new Update2, new Update3, new Floppy ],
    admins: [],
    lives: 9,
    description: 'FOR TESTING'
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

export const allOSes = [Steam, Penguin, Window, Apple, Temple, Debugger];