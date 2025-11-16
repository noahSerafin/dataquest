<script setup lang="ts">
  import { ref, onMounted, computed} from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { castled } from './levels';
  import { Player } from "./Player";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn } from './Pieces';
  import { Allpieces } from "./Pieces"
  import type { Coordinate, PieceBlueprint } from "./types";
  import { takeEnemyTurn } from "./Enemy";

  //import { Map } from "./components/Map.vue";

  //testing fields 
  import BlueprintView from "./components/BlueprintView.vue";

  // Instantiate real piece objects
  
  const testSword = {
    id: "274ec329-8c17-4265-8c12-e9a28bcf0833",
    name: "Sword",
    description: "A basic attack piece",
    unicode: "U+1F5E1",
    maxSize: 3,
    moves: 2,
    range: 1,
    attack: 2,
    defence: 0,
    color: "#dddcd7",
    isPlaced: false
  }
  const testSword2 = {
    id: "274ec329-8c17-4265-8c12-e9a28bcf0111",
    name: "Sword",
    description: "A basic attack piece",
    unicode: "U+1F5E1",
    maxSize: 3,
    moves: 2,
    range: 1,
    attack: 2,
    defence: 0,
    color: "#dddcd7",
    isPlaced: false
  }

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }

  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);
  
  const player = ref(new Player(
    20, // starting money
    5,  // memory limit
    3, //admin slots
    [], // no items yet
    [testSword, testSword2]//, testShield] // starting pieces
  ));
  const level = ref(castled);
  const displayEditor = ref(false);
  const isPlacing = ref(false);
  const hasFinishedTurn = ref(false);
  const isFirstTurn = ref(true);

  const pieceToPlace = ref<PieceBlueprint | null>(null);
  const playerSpawns = ref<Coordinate[]>([]);
  
  const newPlacementHighlights = () => {//board should only show these if isPlacing
    const highlights: Coordinate[] = [];
    const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

    activePieces.value.forEach(piece => {
      if (piece.team === 'player') {
        // For each tile of the piece, check the 4 orthogonal neighbors
        piece.tiles.forEach(tile => {
          const neighbors = [
            { x: tile.x + 1, y: tile.y },
            { x: tile.x - 1, y: tile.y },
            { x: tile.x, y: tile.y + 1 },
            { x: tile.x, y: tile.y - 1 },
          ];

          neighbors.forEach(n => {
            // Skip tiles not on the board
            if (!tileSet.has(`${n.x},${n.y}`)) return;
            // Skip if tile is already occupied
            const isOccupied = activePieces.value.some(p =>
              p.tiles.some(t => t.x === n.x && t.y === n.y)
            );

            if (!isOccupied) highlights.push(n);
          });
        });
      }
    });
    // Optional: remove duplicates
    const uniqueHighlights = Array.from(
      new Map(highlights.map(h => [`${h.x},${h.y}`, h])).values()
    );
    return uniqueHighlights;
  };

  function processSpawnPoints(pieces: Piece[]) {
    const processed: Piece[] = [];
    playerSpawns.value = []

    console.log("processSpawnPoints called with:", pieces);

    for (const piece of pieces) {
      if (piece instanceof Spawn) {

        // Enemy spawn → replace with random enemy piece
        if (piece.team === 'enemy') {
          const EnemyClass = Allpieces[Math.floor(Math.random() * Allpieces.length)];//base this off rarity/difficulty later
          const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          enemyInstance.team = 'enemy'
          processed.push(enemyInstance);
          continue;
        }

        //if player has backdoor{
        //all unnoccupied tiles are placementHighlights
        //} else if
        // Player spawn → record placement highlight coordinates
        if (piece.team === 'player') {
          console.log("FOUND SPAWN:", piece);
          //placementHighlights.value.push(piece.headPosition);
          playerSpawns.value = [//for reactivity
            ...playerSpawns.value,
            piece.headPosition
          ];
          // Do *not* add Spawn to active pieces — it is a marker, not a unit
          continue;
        }
      }
      console.log("placementHighlights after:", playerSpawns.value);
      processed.push(piece);
    }

    return processed;
  }

  function rehydratePieces(rawPieces: any[]): InstanceType<typeof Piece>[] {
    const pieceClasses = [...Allpieces];
    pieceClasses.unshift(Spawn);
    return rawPieces.map(p => {
      const PieceClass = pieceClasses.find(cls => cls.name === p.name)
      return PieceClass ? Object.assign(new PieceClass(p.headPosition, p.team, removePiece), p) : p
    })
  }
  
  onMounted(() => {
    const initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces); // sets placementHighlights internally
  });

  function highlightPlacements(pieceBlueprint: PieceBlueprint) {
    if(!isFirstTurn){
      playerSpawns.value = newPlacementHighlights();
    }
    pieceToPlace.value = pieceBlueprint;
    isPlacing.value = true;
  }

  function removePiece(piece: Piece) {
    activePieces.value = activePieces.value.filter(p => p.id !== piece.id);
  }
  //graveyard?

  function placePieceOnBoardAt(coord: Coordinate) {
    if (!pieceToPlace.value) return

    const bp = pieceToPlace.value

    const PieceClass = Allpieces.find(p => p.name === bp.name)
    if (!PieceClass) return

    const instance = new PieceClass(coord, 'player', removePiece, bp.id);   // now real placement!

    activePieces.value.push(instance)

    // Mark blueprint as placed so it greys in inventory
    bp.isPlaced = true

    // Reset placement state
    pieceToPlace.value = null;
    //playerSpawns.value = newPlacementHighlights();
    isPlacing.value = false;
    if(isFirstTurn){
      isFirstTurn.value = false;
    }
    endTurn();
  }  

  function handleSell(piece: Piece) {
    console.log('sell clicked');
    //player.value.sell(piece)
  }

  const boardRef = ref();

  async function enemyTurn() {
    const enemyPieces = activePieces.value.filter(p => p.team === 'enemy');
    const playerPieces = activePieces.value.filter(p => p.team === 'player');
    const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

    await takeEnemyTurn(
      enemyPieces,
      playerPieces,
      activePieces.value,
      removePiece, // callback to remove dead pieces
      boardRef.value.highlightMoves,
      boardRef.value.highlightTargets,
      boardRef.value.clearHighlights,
      tileSet
    );

    // Reset enemy actions/moves after their turn if needed
    enemyPieces.forEach(p => {
      p.actions = 1;
      p.movesRemaining = p.moves;
    });
    hasFinishedTurn.value = false;
  }

  const endTurn = () => {
    hasFinishedTurn.value = true;
    activePieces.value.forEach(piece => {
      piece.movesRemaining = piece.moves;
      piece.actions = 1;
    });
    enemyTurn();  
  }

  
  // When editor exports a new level, shouldn't be needed in final
  const handleExport = (levelData: any) => {
    level.value.tiles = levelData.tiles;
    level.value.pieces = levelData.pieces;
    // Hydrate pieces once
    const initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces);

    displayEditor.value = false; // swap to board view
  };
</script>

<template>
  <button class="swap-display" @mousedown="swapDisplay()">
    {{ displayEditor ? "Show Board" : "Show Editor" }}
  </button>
  <div v-if="isPlacing && pieceToPlace">
    <p>Placing:</p>
  </div>
  <div v-if="isPlacing && pieceToPlace"
    class="info">
    <BlueprintView :blueprint="pieceToPlace"
    :tileSize="60"
    :cssclass="'placing'"
    />
  </div>
  <div v-if="!hasFinishedTurn && !isPlacing">Your turn</div>

  <PlayerView v-if="!displayEditor" :player="player" @highlightPlacements="highlightPlacements"/>
  <Board ref="boardRef" v-if="!displayEditor"
  :tiles="level.tiles"
  :pieces="activePieces"
  :placementHighlights="playerSpawns"
  :isFirstTurn="isFirstTurn"
  :placementMode="isPlacing"
  :hasFinishedTurn="hasFinishedTurn"
  @place-on-board="placePieceOnBoardAt"/>
  <Leveleditor v-else @export-level="handleExport"/>
  <button v-if="!displayEditor && !hasFinishedTurn" class="end-turn" v-on:click="endTurn()">End Turn</button>
</template>

<style scoped>
.info{
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
}
button{
  position: absolute;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 2px 4px;
}
.swap-display{
  top: 2%;
  left: 2%;
}
.end-turn{
  margin-top: 1rem;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
