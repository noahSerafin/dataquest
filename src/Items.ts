export abstract class Item {
  id: string
  static name : string
  static description : string
  static unicode : string
  static color : string
  name : string
  description : string
  unicode : string
  color : string
  cost: number
  rarity: number

  constructor(
    name : string, 
    description : string,
    unicode : string,
    color : string,
    cost: number,
    rarity: number
  ) {
    this.id = crypto.randomUUID()
    this.name = name
    this.description = description
    this.unicode = unicode
    this.color = color
    this.cost = cost
    this.rarity = rarity
    }

  getItemInfo(): string {
    return `${this.name} | Size: ${this.cost}`
  }

  //method to alter a Pieces stats, possibly in subclasses
  //or players stats
}

export class Whetstone extends Item {
    static name = "Whetstone";
    static description = "increases a pieces attack by 1";
    static unicode = "U+1FAA8";
    static color = "#ff2222ff";
    constructor(){
        super(Whetstone.name, Whetstone.description, Whetstone.unicode, Whetstone.color, 3, 1)
        //name desc utf || maxsize moves range atk def
    }
    
    //increases a pieces atk by 1
}
//WEIGHT LIFTER, U+1F3CB
// FENCER, U+1F93A

export class Iron extends Item {
    static name = "Iron";
    static description = "increases a pieces defence by 1";
    static unicode = "U+1F96C"
    static color = "#54a4ffff"
    constructor(){
        super(Iron.name, Iron.description, Iron.unicode, Iron.color, 3, 1)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces def by 1
}
//"U+1F356" //meat
 //??"U+26E8";

export class Blueberry extends Item {
    static name = "Blueberry";
    static description = "increases a pieces max size by 1";
    static unicode = "U+1FAD0";
    static color = "#1cff42ff";
    constructor(){
        super(Blueberry.name, Blueberry.description, Blueberry.unicode, Blueberry.color, 3, 1)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces maxSize by 1
}

export class Carrot extends Item {
    static name = "Carrot";
    static description = "increases a pieces range by 1";
    static unicode = "U+1F955"//scope "U+1F52D";
    static color = "#fff12bff";
    constructor(){
        super(Carrot.name, Carrot.description, Carrot.unicode, Carrot.color, 3, 1)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}

export class Lightning extends Item {
    static name = "Lightning";
    static description = "increases a pieces moves by 1";
    static unicode = "U+26A1";
    static color = "#dc00e4ff";
    constructor(){
        super(Lightning.name, Lightning.description, Lightning.unicode, Lightning.color, 3, 1)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}
//ATHLETIC SHOE, U+1F45F

export class Blessing extends Item {
    static name = "Blessing";
    static description = "increases all a program's stats by 1";
    static unicode = "U+1F389";
    static color = "#a9ffffff";
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, Blessing.color, 9, 5)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}

export class Supplement extends Item {
    static name = "Supplement";
    static description = "increases all a program's stats by 1 for one round";
    static unicode = "U+1F48A";
    static color = "#6e0c8bff";
    constructor(){
        super(Supplement.name, Supplement.description, Supplement.unicode, Supplement.color, 5, 5)
        //name desc utf || maxsize moves range atk def
    }
    //increases player memory by 1
}//FISH, U+1F41F

export class Juice extends Item {
    static name = "Juice";
    static description = "increases a program's moves by 1 for one round";
    static unicode = "U+1F9C3";
    static color = "#fcff47ff";
    constructor(){
        super(Juice.name, Juice.description, Juice.unicode, Juice.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class Roids extends Item {
    static name = "Roids";
    static description = "increases all a program's stats by 1 for one round";
    static unicode = "U+1F489";
    static color = "#00e4b3ff";
    constructor(){
        super(Roids.name, Roids.description, Roids.unicode, Roids.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class Formula extends Item {
    static name = "Formula";
    static description = "increases a program's max size by 1 for one round";
    static unicode = "U+1F37C";
    static color = "#27f743ff";
    constructor(){
        super(Formula.name, Formula.description, Formula.unicode, Formula.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class Garlic extends Item {
    static name = "Garlic";
    static description = "increases a program's defence by 1 for one round";
    static unicode = "U+1F9C4";
    static color = "#26d0faff";
    constructor(){
        super(Garlic.name, Garlic.description, Garlic.unicode, Garlic.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class RedMeat extends Item {
    static name = "Red Meat";
    static description = "increases a program's attack by 1 for one round";
    static unicode = "U+1F356";
    static color = "#ff3737ff";
    constructor(){
        super(RedMeat.name, RedMeat.description, RedMeat.unicode, RedMeat.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class Coffee extends Item {
    static name = "Coffee";
    static description = "increases a program's moves by 1 for one round";
    static unicode = "U+2615";
    static color = "#e346f1ff";
    constructor(){
        super(Coffee.name, Coffee.description, Coffee.unicode, Coffee.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}


export class Bandage extends Item {
    static name = "Bandage";
    static description = "Removes 1 harmful status effect from a program";
    static unicode = "U+1FA79";
    static color = "#5659ebff";
    constructor(){
        super(Bandage.name, Bandage.description, Bandage.unicode, Bandage.color, 1, 2)
        //name desc utf || maxsize moves range atk def
    }
}

export class Soap extends Item {
    static name = "Soap";
    static description = "Removes all harmful status effects from a program";
    static unicode = "U+1F9FC";
    static color = "#821391ff";
    constructor(){
        super(Soap.name, Soap.description, Soap.unicode, Soap.color, 3, 4)
        //name desc utf || maxsize moves range atk def
    }
}

export class Voucher extends Item {
    static name = "Voucher";
    static description = "Makes one item in the shop free";
    static unicode = "U+1F9FE";
    constructor(){
        super(Voucher.name, Voucher.description, Voucher.unicode, Voucher.color, 3, 4)
        //name desc utf || maxsize moves range atk def
    }
}

export class Mushroom extends Item {
    static name = "Beserker Mushroom";
    static description = "Replenish a programs moves and actions";
    static unicode = "U+1F344";
    static color = "#5c0000ff";
    constructor(){
        super(Mushroom.name, Mushroom.description, Mushroom.unicode, Mushroom.color, 3, 4)
        //name desc utf || maxsize moves range atk def
    }
}

export class Rations extends Item {
    static name = "Rations";
    static description = "Replenish a programs moves";
    static unicode = "U+1F96B";
    static color = "#f7eb45ff";
    constructor(){
        super(Rations.name, Rations.description, Rations.unicode, Rations.color, 2, 3)
        //name desc utf || maxsize moves range atk def
    }
}

export class Beans extends Item {
    static name = "Beans";
    static description = "Replenish a programs actions";
    static unicode = "U+1FAD8";
    static color = "#f03030ff";
    constructor(){
        super(Beans.name, Beans.description, Beans.unicode, Beans.color, 2, 3)
        //name desc utf || maxsize moves range atk def
    }
}

export class Box extends Item {
    static name = "Box";
    static description = "Grants a random item";
    static unicode = "U+1F4E6";
    static color = "#926439ff";
    constructor(){
        super(Box.name, Box.description, Box.unicode, Box.color, 3, 3)
        //name desc utf || maxsize moves range atk def
    }
}

export class Wand extends Item {
  static name = "Magic Wand";
  static description = "Undo a turn";
  static unicode = " U+1FA84";
  static color = "#440975ff";
  constructor() {
    super(Wand.name, Wand.description, Wand.unicode, Wand.color, 7, 5)
  }
  //
}

class Genie extends Item {
  static name = "Genie";
  static description = "Can create any 3 programs once";
  static unicode = "U+1F9DE";
  static color = "#0dbaffff";
  constructor() {
   super(Genie.name, Genie.description, Genie.unicode, Genie.color, 10, 5)
  }

  //create any program, keep track of uses
  //after 3 destroy genie
}

export const allItems = [Whetstone, Iron, Blueberry, Carrot, Lightning, Blessing, Supplement, Juice, Roids, Formula, Garlic, RedMeat, Coffee, Bandage, Soap, Voucher, Mushroom, Rations, Beans, Box, Wand, Genie]

// PINATA, U+1FA85

// IZAKAYA LANTERN, U+1F3EE range

// / HOT PEPPER, U+1F336

 //GINGER ROOT, U+1FADA

 // U+1F47A

 // TOOLBOX, U+1F9F0

// / RING, U+1F48D

//BOXING GLOVE, U+1F94A

//RECEIPT, U+1F9FE

//POSTAL HORN, U+1F4EF

//PACKAGE, U+1F4E6

//BLACK HEART SUIT, U+2665

//statuses
//status symbols
//burning, poisoned/diseased, slowed
//OVERHEATED FACE, U+1F975
//NAUSEATED FACE, U+1F922
//FACE WITH OPEN MOUTH VOMITING, U+1F92E
//FACE WITH OPEN MOUTH AND COLD SWEAT, U+1F630
// SNEEZING FACE, U+1F927
// FACE WITH HEAD-BANDAGE, U+1F915
//FREEZING FACE, U+
//FACE WITH FINGER COVERING CLOSED LIPS, U+1F92B hidden
//HEART WITH ARROW, U+1F498 charmed