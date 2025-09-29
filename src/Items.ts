import { Piece } from "./Pieces";

export abstract class Item {
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
    static description: "increases a pieces atk by 1";
    static unicode: "";
    constructor(){
        super(Whetstone.name, Whetstone.description, Whetstone.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    
      //increases a pieces atk by 1
      //charge(target: Piece): void {
        
      //}
    
}

export class Plating extends Item {
    static name: "Plating";
    static description: "increases a pieces atk by 1";
    static unicode: "";
    constructor(){
        super(Plating.name, Plating.description, Plating.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces def by 1
}

export class Blueberry extends Item {
    static name: "Plating";
    static description: "increases a pieces atk by 1";
    static unicode: "";
    constructor(){
        super(Plating.name, Plating.description, Plating.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces maxSize by 1
}

export class Lightning extends Item {
    static name: "Lightning";
    static description: "increases a pieces atk by 1";
    static unicode: "";
    constructor(){
        super(Lightning.name, Lightning.description, Lightning.unicode, 3)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}

export class Blessing extends Item {
    static name: "Blessing";
    static description: "increases all a programs stats by 1";
    static unicode: "";
    constructor(){
        super(Blessing.name, Blessing.description, Blessing.unicode, 9)
        //name desc utf || maxsize moves range atk def
    }
    //increases a pieces moves by 1
}
