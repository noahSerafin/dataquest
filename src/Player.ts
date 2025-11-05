import type { Coordinate } from "./types";
import { Piece, type Allpieces } from "./Pieces";
import { Item } from "./Items";

export class Player {
    money: number
    memory: number
    // /InstanceType typeof 
    items: Item[]
    programs: Piece[]
    //admins: Admin[]
    constructor(
        money = 5,
        memory = 3,
        items: Item[] = [],
        programs: Piece[] = []
    ) {
        this.money = money;
        this.memory = memory;
        this.items = items;
        this.programs = programs;
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
  addProgram(program: Piece): boolean {
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
  removeProgram(program: Piece): void {
    this.programs = this.programs.filter(p => p !== program);
  }

  /** Dynamically increase/decrease memory (e.g., via upgrades or debuffs) */
  modifyMemory(delta: number): void {
    this.memory = Math.max(0, this.memory + delta);
  }
}