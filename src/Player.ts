import type { Coordinate, PieceBlueprint } from "./types";
import { Piece, type Allpieces } from "./Pieces";
import { Item } from "./Items";

export class Player {
    money: number
    memory: number
    adminSlots: number
    // /InstanceType typeof 
    items: Item[]
    programs: PieceBlueprint[]
    //admins: Admin[]
    isPlacing: boolean
    hasFinishedTurn: boolean
    constructor(
        money = 5,
        memory = 3,
        adminSlots = 4,
        items: Item[] = [],
        programs: PieceBlueprint[] = [],
        isPlacing = false,
        hasFinishedTurn = false
    ) {
        this.money = money;
        this.memory = memory;
        this.adminSlots = adminSlots;
        this.items = items;
        this.programs = programs;
        this.isPlacing = isPlacing;
        this.hasFinishedTurn = hasFinishedTurn;
    }

    /** Total "memory" usage from items + programs */
  get usedMemory(): number {
    return this.items.length + this.programs.length;
  }

  /** Returns whether player can hold more items/programs */
  get hasMemorySpace(): boolean {
    return this.usedMemory < this.memory;
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

  /** Remove a program by reference */
  removeProgram(program: PieceBlueprint): void {
    this.programs = this.programs.filter(p => p !== program);
  }

  /** Dynamically increase/decrease memory (e.g., via upgrades or debuffs) */
  modifyMemory(delta: number): void {
    this.memory = Math.max(0, this.memory + delta);
  }
}