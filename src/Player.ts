import type { PieceBlueprint } from "./types";
import { Item } from "./Items";
import { Admin } from "./AdminPrograms";

export class Player {
    difficulty: number = 1;
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
    bonusReward: number
    hasTrolley: boolean
    hasToolbox: boolean
    canPlace: boolean = true;
    canMove: boolean = true;
    canAction: boolean = true;
    osunicode: string;
    nextInterest: number
    nextReward: number
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
        bonusReward: number,
        nextInterest: number,
        nextReward: number,
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
        this.bonusReward = bonusReward;
        this.nextInterest = nextInterest;
        this.nextReward = nextReward;
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

  get freeMemory(): number {
    return Math.max(0, this.memory - this.usedMemory);
  }

  /** Returns whether player can hold more items/programs */
  get hasMemorySpace(): boolean {
    return this.usedMemory < this.memory;
  }

  get hasAdminSpace(): boolean {
    return this.admins.length < this.adminSlots;
  }

  addAdmin(admin: Admin) {
    if(this.hasAdminSpace){
      this.admins.push(admin)
      if(admin.targetType === 'player' && admin.triggerType === 'other'){
        admin.apply(this);
      }
    }
  }

  removeAdmin(admin: Admin, target: Player ) {
    this.admins = this.admins.filter(a => a.id !== admin.id)
    const i = this.admins.indexOf(admin);
    if (i !== -1) this.admins.splice(i, 1);
    if(admin.targetType === 'player' && admin.triggerType === 'other'){
      admin.remove(target);
    }
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

  applyItemToPieceBlueprint(payload : {item: Item, id: string}, itemMult: number) {
    //check item type
    //check target id's type
    //decide which function to use

    const item = payload.item;
    const pieceId = payload.id;
    console.log('using ', item.name, ' on ', pieceId);

    //if item is consumable and target type is blueprint{
    ///consumables on blueprints
    const pieceBP = this.programs.find(p => p.id === pieceId);//will only find id in player blueprints
    if (!pieceBP) return false;

    // Each item implements an apply(piece) method
    item.apply(pieceBP, itemMult);

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

  spend(amount: number){
    if(this.hasAdmin('Coinpurse')){
      this.money -= (amount + 1);
    } else {
      this.money -= amount;
    }
  }

  hasAdmin(name: string){
    return this.admins.some(a => a.name === name);
  }

  calcInterest(){
    const baseMoney = Math.max(0, this.money);   // ← prevents negative interest
    const noOfFives = Math.floor(baseMoney / 5);
    if(noOfFives > this.interestCap){
      this.nextInterest += this.interestCap;
    } else {
      this.nextInterest += noOfFives;
    }
    //bubble
    this.nextInterest += this.bonusInterest;
    if(this.hasAdmin('Inheritance')){
      this.nextInterest = (this.nextInterest * 2)
    }
    this.nextReward += this.bonusReward;
  }

  collectMoney(bonus: number){
    console.log(this.nextInterest, this.nextReward)
    this.money += this.nextInterest + this.bonusInterest + this.nextReward + this.bonusReward + bonus;
  }

  resetInterestAndReward(){
    this.nextInterest = 0;
    this.nextReward = 0;
    this.bonusInterest = 0;
    this.bonusReward = 0;
  }
}