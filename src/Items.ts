export abstract class Item {
  id: string
  static name: string
  static description : string
  static unicode: string
  name: string
  description : string
  unicode: string
  cost: number

  constructor(
    name: string, 
    description: string,
    unicode: string,
    cost: number, 
  ) {
    this.id = crypto.randomUUID()
    this.name = name
    this.description = description
    this.unicode = unicode
    this.cost = cost
  }

//name desc unicode || cost
  getItemInfo(): string {
    return `${this.name} | Size: ${this.cost}`
  }

  // Example method
  introduce(): string {
    return `${this.name}: ${this.description}`
  }

}

export class Whetstone extends Item {
    static name: "Whetstone";
    static description: "increases a pieces attack by 1";
    static unicode: "U+1FAA8";
    constructor(){
        super(Whetstone.name, Whetstone.description, Whetstone.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    
      //increases a pieces atk by 1
      //charge(target: Piece): void {
        
      //}
    
}
//WEIGHT LIFTER, U+1F3CB
// FENCER, U+1F93A

export class Iron extends Item {
    static name: "Iron";
    static description: "increases a pieces defence by 1";
    static unicode: "U+1F96C"
    constructor(){
        super(Iron.name, Iron.description, Iron.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces def by 1
}
//"U+1F356" //meat
 //??"U+26E8";

export class Blueberry extends Item {
    static name: "Blueberry";
    static description: "increases a pieces max size by 1";
    static unicode: "U+1FAD0";
    constructor(){
        super(Blueberry.name, Blueberry.description, Blueberry.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces maxSize by 1
}

export class Carrot extends Item {
    static name: "Carrot";
    static description: "increases a pieces range by 1";
    static unicode: "U+1F955"//scope "U+1F52D";
    constructor(){
        super(Carrot.name, Carrot.description, Carrot.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}

export class Lightning extends Item {
    static name: "Lightning";
    static description: "increases a pieces moves by 1";
    static unicode: "U+26A1";
    constructor(){
        super(Lightning.name, Lightning.description, Lightning.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}
//ATHLETIC SHOE, U+1F45F

export class Blessing extends Item {
    static name: "Blessing";
    static description: "increases all a programs stats by 1";
    static unicode: "U+1F389";
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, 9)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}

export class Supplement extends Item {
    static name: "Supplement";
    static description: "increases all a programs stats by 1";
    static unicode: "U+1F48A";
    constructor(){
        super(Supplement.name, Supplement.description, Supplement.unicode, 9)
        //name desc utf || maxsize moves range atk def
    }
    //increases player memory by 1
}//FISH, U+1F41F

// / RING, U+1F48D

// BEETLE, U+1FAB2

//BOXING GLOVE, U+1F94A

// GARLIC, U+1F9C4
