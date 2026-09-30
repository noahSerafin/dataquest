export abstract class Character {
    //name string, iconId number, unicode string, role string
    name: string;
    iconId: number;
    unicode: string;
    role: string;

    constructor(name: string, iconId: number, unicode: string, role: string) {
        this.name = name;
        this.iconId = iconId;
        this.unicode = unicode;
        this.role = role;
    }
}
export class GameCharacter extends Character {
    constructor(name: string, iconId: number, unicode: string, role: string) {
        super(name, iconId, unicode, role);
    }
}

export const characters: Record<string, Character> = {
    "Rick": new GameCharacter("Rick", 497, "U+1F6FA", "Shopkeeper"),
    "Sue": new GameCharacter("Sue", 498, "U+1F9F5", "Shopkeeper"),
    "Buster": new GameCharacter("Buster", 499, "U+1FA97", ""),
    "Pumba": new GameCharacter("Pumba", 500, "U+1F417", ""),
    "Bill": new GameCharacter("Bill", 501, "U+1F3B1", "Shopkeeper"),
    "Hamuel": new GameCharacter("Hamuel", 502, "U+1F439", "Shopkeeper"),
    "Kim": new GameCharacter("Kim", 503, "U+1F458", ""),
    "Al": new GameCharacter("Al", 504, "U+132CF", "Guide"),
    //"The Goat": new GameCharacter("goated", 505, "U+1F410", ""),
    "Piero": new GameCharacter("Piero", 506, "U+1F95F", ""),
    "Tracy": new GameCharacter("Tracy", 507, "U+1F99D", ""),
    "Party Pete": new GameCharacter("Party Pete", 508, "U+1F973", "Shopkeeper"),
    "Dodo": new GameCharacter("Dodo", 509, "U+1F9A4", "Shopkeeper"),
    "Shiela": new GameCharacter("Shiela", 510, "U+1F428", ""),
    "Hal": new GameCharacter("Hal", 470, "U+1F5B2", ""),
    "Jim": new GameCharacter("Jim", 514, "U+1F3C3", "Shopkeeper"),
    "Homer": new GameCharacter("Homer", 515, "U+1F37F", ""),
    "Candy": new GameCharacter("Candy", 516, "U+1F37F", ""),
};

//icon ids for player: 511, 512, 513, 517, 473, 459, 460, 461, 462, 463, 464, 505, 468