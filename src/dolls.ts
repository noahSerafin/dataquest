import { Piece } from "./Pieces";
import type { Coordinate } from "./types";

class Dolls extends Piece {
  static name = "Nesting Dolls";
  static description = "Replaced by a copy with -1 max size if destroyed";
  static unicode = "U+1FA86";
  static color = "#ff5a0dff";
  static rarity = 6;

  constructor(
    headPosition: Coordinate,
    team: string,
    removeCallback?: (piece: Piece) => void,
    id?: string
  ) {

    // We wrap the callback here:
    const wrappedRemove = (piece: Piece) => {
      // 1. Only trigger the splitting logic if THIS Dolls piece was removed
      if (piece === this) {
        if (this.getStat('maxSize') > 1) {
          // Create the smaller Dolls
          const newMaxSize = this.maxSize - 1;

          const SmallerDolls = new Dolls(
            this.headPosition,
            this.team,
            removeCallback, // give it a normal callback
            undefined        // new ID -- or you can reuse if desired
          );

          // Adjust stats BEFORE spawning
          SmallerDolls.maxSize = newMaxSize;
          SmallerDolls.tiles = [this.headPosition];

          // Insert into activePieces (the callback should handle this)
          removeCallback?.(SmallerDolls as any); 
        }
      }

      // 2. Always call the real remove callback at the end
      removeCallback?.(piece);
    };

    super(
      Dolls.name,
      Dolls.description,
      Dolls.unicode,
      3, 0, 1, 0, 0, Dolls.color,
      headPosition,
      [headPosition],
      team,
      Dolls.rarity,
      wrappedRemove,  // use the wrapped callback!
      id
    );
  }
}