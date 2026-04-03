import type { OS } from "./types";
import { Voucher, Mushroom, Garlic, Juice, Meat, Genie, Pandora, Update2, Dupe, Headphones} from "./Items";
import { Abacus, Bank, Bubble, Cheese, Chemistry, Crystal, PetriDish, Seed, Volatile, Clippy, Notepad} from "./AdminPrograms";
import { createDefaultStatuses } from "./types";

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
        cost: 1 ,
        immunities: createDefaultStatuses()
    }
    const testPiece =  {
        id: crypto.randomUUID(),
        name: "Daemon",
        description: '"testing this pieces special move"',
        unicode: 'U+1F47E',
        maxSize: 2,
        moves: 10,
        range: 2,
        attack: 2,
        defence: 0,
        rarity: 5,
        color: "#ee74eeff",
        // blueprint-only fields:
        isPlaced: false,
        cost: 10 ,
        immunities: createDefaultStatuses(),
        variantName: 'Holographic'
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
        cost: 1 ,
        immunities: createDefaultStatuses()
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
        cost: 1 ,
        immunities: createDefaultStatuses()
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
        cost: 1 ,
        immunities: createDefaultStatuses()
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
        cost: 1 ,
        immunities: createDefaultStatuses()
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
        cost: 1,
        immunities: createDefaultStatuses()
    }
    const rat =  {
        id: crypto.randomUUID(),
        name: "Rat",
        description: "A small and fast program",
        unicode: "U+1F400",
        color: "#6e6e6eff",
        maxSize: 2,
        moves: 3,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }
    const ant =  {
        id: crypto.randomUUID(),
        name: "Ant",
        description: "A very fast but small program",
        unicode: "U+1F41C",
        color: "rgb(4, 156, 202",
        maxSize: 1,
        moves: 5,
        range: 1,
        attack: 1,
        defence: 0,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }
    const labrat =  {
        id: crypto.randomUUID(),
        name: "Lab Rat",
        description: "A small and fast program that can spread disease, reducing max size",
        unicode: "U+1F401",
        color: "rgb(190, 214, 81)",
        maxSize: 2,
        moves: 3,
        range: 1,
        attack: 2,
        defence: 0,
        rarity: 3,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }
    /*const egg =  {
        id: crypto.randomUUID(),
        name: "Egg",
        description: "What came first? Spawns a Chick",
        unicode: "U+1F95A",
        color: "rgb(240, 232, 216)",
        maxSize: 1,
        moves: 0,
        range: 1,
        attack: 0,
        defence: 1,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }*/
    const snail =  {
        id: crypto.randomUUID(),
        name: "Snail",
        description: "A slow program that can retract itself to boost its defence",
        unicode: "U+1F40C",
        color: "#4d3502ff",
        maxSize: 2,
        moves: 1,
        range: 1,
        attack: 1,
        defence: 1,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }
    const bug =  {
        id: crypto.randomUUID(),
        name : "Bug",
        description: "A fast but small program that can slow others",
        unicode: "U+1F47E",
        color: "#04ca0eff",
        maxSize: 1,
        moves: 5,
        range: 1,
        attack: 2,
        defence: 1,
        rarity: 1,
        // blueprint-only fields:
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
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
        cost: 1,
        immunities: createDefaultStatuses()
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
        cost: 1,
        immunities: createDefaultStatuses()
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
        cost: 1,
        immunities: createDefaultStatuses()
    }
    const lance = {
        id: crypto.randomUUID(),
        name: "Lance",
        description: "An attacking piece that can charge, damaging targets in a staight line and moving forward until stopped",
        unicode: "U+1F3A0",
        maxSize: 3,
        moves: 2,
        range: 2,
        attack: 2,
        defence: 0,
        rarity: 2,
        color: "#2fc5ebff",
        isPlaced: false,
        cost: 2,
        immunities: createDefaultStatuses()
    }
    const banana = {
        id: crypto.randomUUID(),
        name: "Banana Peel",
        description: "A test piece",
        unicode: "U+1F34C",
        maxSize: 1,
        moves: 1,
        range: 0,
        attack: 0,
        defence: 0,
        rarity: 1,
        color: "#2f724b",
        isPlaced: false,
        cost: 1,
        immunities: createDefaultStatuses()
    }
    //1, 1, 0, 0, 0,

    const testhybrid = {
        id: "274ec329-8c17-4265-8c12-e9a28bcf0112",
        name: "Lance",
        description: "A test piece",
        unicode: "U+1F3A0",
        maxSize: 3,
        moves: 2,
        range: 3,
        attack: 2,
        defence: 0,
        rarity: 1,
        color: "#2fc5ebff",
        isPlaced: false,
        cost: 1,
        hybridName: 'LanceHog',
        extraUnicode: 'U+1F994',
        immunities: createDefaultStatuses()
    }

    //guard, snail, TP, Lance, Bug, Screwdriver

/*
    this.interestCap = interestCap;
    this.bonusInterest = bonusInterest;
    this.hasTrolley = hasTrolley;
    this.hasToolbox = hasToolbox;
*/

//MINUS WHITE X, U+2756
//

const Window95 : OS = {
    name: 'Classic95',
    unicode: 'U+229E',
    money: 5,
    memory: 5,
    adminSlots: 5,
    blueprints: [lance, shield, banana],
    items: [new Voucher, new Mushroom],
    admins: [new Notepad, new Clippy],
    lives: 3,
    description: 'The intro to cyberspace, comes with a helpful assistant.'
}
const Steam : OS = {
    name: 'Steam',
    unicode: 'U+1F682',
    money: 3,
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
    money: 4,
    memory: 6,
    adminSlots: 5,
    blueprints: [potato, sling, aegis],
    items: [new Garlic, new Meat],
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
    blueprints: [knife, sling, snail, tp],
    items: [],
    admins: [],
    lives: 2,
    description: 'Limited memory. Starts with some basic programs'

}

const Apple : OS = {
    name: 'Apple',
    unicode: 'U+1F34F',
    money: 10,
    memory: 5,
    adminSlots: 4,
    blueprints: [ant, bee, shield],
    items: [new Mushroom, new Juice],
    admins: [],
    lives: 3,
    description: 'Limited admin functionality, but start with excess money and some consumable items.'
}

const Temple : OS = {
    name: 'Temple',
    unicode: 'U+2696',
    money: 1,
    memory: 6,
    adminSlots: 6,
    blueprints: [bug, aegis, screwdriver],
    items: [new Pandora],
    admins: [],
    lives: 3,
    description: "Overclocked memory and admin slots, low money. Some unique starting programs, and a Pandora's Box."
}

const Fortran : OS = {
    name: 'Fortran',
    unicode: 'U+2697',
    money: 0,
    memory: 4,
    adminSlots: 3,
    blueprints: [rat, labrat],
    items: [new Pandora],
    admins: [new Chemistry, new Volatile, new PetriDish],//Microscope?
    lives: 2,
    description: "Ancient alchemical technology, heavily focused on statuses."
}

const Cobol : OS = {
    name: 'Cobol',
    unicode: 'U+1F3DB',
    money: 15,
    memory: 3,
    adminSlots: 5,
    blueprints: [bug, sling, aegis],
    items: [],
    admins: [new Cheese, new Abacus, new Bank, new Seed, new Bubble],
    lives: 1,
    description: "All about money"
}

//challenges:
//explorer - map, compass, offroader
//Fleet - vehicles: offroader, pickup, van, artic, ambulance, firetruck

// SCALES, U+2696 --- CROSSED SWORDS, U+2694
//scales: EGYPTIAN HIEROGLYPH U038, U+1335D
//temple - +1 admin +1 memory -1 interest
//---------

//STEAM LOCOMOTIVE, U+1F682
//+2 admin 

//BITCOIN SIGN, U+20BF

//U+1F403 GNU

/*
//Arch /Kali - dragon head
//GREEK CAPITAL LETTER DELTA, U+394
[daemon, dataworm]
[backdoor]

//CP/M DESKTOP COMPUTER, U+1F5A5
//Precursor to many PC operating systems including MS‑DOS
//Huge ecosystem of early software (WordStar, dBase, etc.)
[pandora, genie,]
[notepad]

//AmigaOS
Advanced multitasking
Built-in GUI (Workbench)
Strong multimedia capabilities
[copier, cherries]
[Jar]

BeOS
Designed for multimedia performance
Symmetric multiprocessing
64-bit journaling filesystem
Very fast UI
[rollers, palette]

UNIX Variants (Non-Linux)
---

Solaris
Developed by Sun Microsystems (later Oracle Corporation)
Enterprise reliability
ZFS filesystem
DTrace performance tools
Solaris powered many internet servers in the 1990s and 2000s.
[fan, schoolbag]

FreeBSD
High-performance servers
Networking appliances
Parts of systems like PlayStation 4 system software
[brain, toolbox]

Palm OS
Designed for PDAs (personal digital assistants)
Stylus-based input
Graffiti handwriting system
was the dominant handheld computing platform before modern smartphones.
//pallette //notepad // // LOWER LEFT PAINTBRUSH, U+1F58C

Plan 9 from Bell Labs
Plan 9 assumed you might have multiple machines working together.
machines could be mounted into the same filesystem tree
[ollie, ruler, knot]

Inferno
give programs that create their own other programs
*/

const Debugger : OS = {
    name: 'Debugger',
    unicode: 'U+1F41B',
    money: 50,
    memory: 10,
    adminSlots: 6,
    blueprints: [aegis, superKnife, testhybrid, testPiece],
    items: [new Genie, new Pandora, new Update2, new Dupe, new Headphones],
    admins: [new Crystal],
    lives: 9,
    description: 'FOR TESTING'
}


export const allOSes = [Window95, Steam, Window, Apple, Penguin, Temple, Fortran, Cobol, Debugger];