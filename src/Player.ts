import type { Coordinate, PieceBlueprint, StatModifier } from "./types";
import { Item } from "./Items";
import { Admin } from "./AdminPrograms";

export class Player {
    money: number
    memory: number
    adminSlots: number
    // /InstanceType typeof 
    items: Item[]
    programs: PieceBlueprint[]
    admins: Admin[]
    lives: number
    interestCap: number
    bonusInterest: number
    hasTrolley: boolean
    hasToolbox: boolean
    canPlace: boolean = true;
    canMove: boolean = true;
    canAction: boolean = true;
    osunicode: string
    //adminModifiers: Record<string, StatModifier>
    constructor(
        osunicode = '',
        money = 5,
        memory = 4,
        adminSlots = 4,
        items: Item[] = [],
        programs: PieceBlueprint[] = [],
        admins: Admin[] = [],
        lives: number,
        interestCap: number,
        bonusInterest: number,
        hasTrolley: boolean,
        hasToolbox: boolean,
        //adminModifiers: Record<string, StatModifier> = {}
    ) {
        this.osunicode = osunicode
        this.money = money;
        this.memory = memory;
        this.adminSlots = adminSlots;
        this.items = items;
        this.programs = programs;
        this.admins = admins;
        this.lives = lives;
        this.interestCap = interestCap;
        this.bonusInterest = bonusInterest;
        this.hasTrolley = hasTrolley;
        this.hasToolbox = hasToolbox;
        //this.adminModifiers = adminModifiers;
    }

    /** Total "memory" usage from items + programs */
  get usedMemory(): number {
    const itemUsage = this.hasTrolley ? (this.items.length/2) : this.items.length 
    const bpUsage = this.hasToolbox ? (this.programs.length/2) : this.programs.length 
    return itemUsage + bpUsage;
  }

  /** Returns whether player can hold more items/programs */
  get hasMemorySpace(): boolean {
    return this.usedMemory < this.memory;
  }

  addAdmin(admin: Admin, target: Player ) {
    this.admins.push(admin)
    admin.apply(target);
  }

  removeAdmin(admin: Admin, target: Player ) {
    this.admins = this.admins.filter(a => a.id !== admin.id)
    const i = this.admins.indexOf(admin);
    if (i !== -1) this.admins.splice(i, 1);
    admin.remove(target);
  }

  /** Add an item if there's enough memory */
  addItem(item: Item): boolean {
    if (this.hasMemorySpace) {
      this.items.push(item);
      return true;
    }
    console.warn("Not enough memory to add item:", item);
    return false;
  }

  /** Add a program/piece if there's enough memory */
  addProgram(program: PieceBlueprint): boolean {
    if (this.hasMemorySpace) {
      this.programs.push(program);
      return true;
    }
    console.warn("Not enough memory to add program:", program);
    return false;
  }

    /** Remove an item by reference */
  removeItem(item: Item): void {
    this.items = this.items.filter(i => i !== item);
  }

  applyConsumableToBlueprint(){
    
  }
  
  applyConsumableToPiece(){
  
  }

  applyItemToPieceBlueprint(payload : {item: Item, id: string}) {
    //check item type
    //check target id's type
    //decide which function to use

    const item = payload.item;
    const pieceId = payload.id;
    console.log('using ', item.name, ' on ', pieceId);

    //if item is consumable and target type is blueprint{
    ///consumables on blueprints
    const piece = this.programs.find(p => p.id === pieceId);//will only find id in player blueprints
    if (!piece) return false;

    // Each item implements an apply(piece) method
    item.apply(piece);

    // Remove item from inventory
    this.removeItem(item);

    return true;
  }


  /** Remove a program by reference */
  removeProgram(program: PieceBlueprint): void {
    this.programs = this.programs.filter(p => p !== program);
  }

  /** Dynamically increase/decrease memory (e.g., via upgrades or debuffs) */
  modifyMemory(delta: number): void {
    this.memory = Math.max(0, this.memory + delta);
  }
}