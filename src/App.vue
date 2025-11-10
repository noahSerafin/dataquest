<script setup lang="ts">
  import { ref, onMounted, computed} from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { level1 } from './levels';
  import { Player } from "./Player";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn } from './Pieces';
  import { Allpieces } from "./Pieces"
  import type { Coordinate, PieceBlueprint } from "./types";

  //import { Map } from "./components/Map.vue";

  //testing fields
  import { Sword, Shield } from "./Pieces"; // adjust import path
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

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }

  // Player's build blueprint pieces (never mutated by game actions)
  const inventoryPieces = ref<PieceBlueprint[]>([])
  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);
  
  const player = ref(new Player(
    20, // starting money
    5,  // memory limit
    3, //admin slots
    [], // no items yet
    [testSword]//, testShield] // starting programs
  ));

  const level = ref(level1);
  const displayEditor = ref(false);

  const playerSpawns = ref<Coordinate[]>([]);
  const pieceToPlace = ref<PieceBlueprint | null>(null);
  const isPlacing = ref(false);
  const newPlacementHighlights = computed<Coordinate[]>(() => {//board should only show these if isPlacing
    const highlights: Coordinate[] = [];

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
  });

  function processSpawnPoints(pieces: Piece[]) {
    const processed: Piece[] = [];
    playerSpawns.value = []

    console.log("processSpawnPoints called with:", pieces);

    for (const piece of pieces) {
      if (piece instanceof Spawn) {

        // Enemy spawn → replace with random enemy piece
        if (piece.team === 'enemy') {
          const EnemyClass = Allpieces[Math.floor(Math.random() * Allpieces.length)];//base this off rarity/difficulty later
          const enemyInstance = new EnemyClass(piece.headPosition);
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
      return PieceClass ? Object.assign(new PieceClass(p.headPosition), p) : p
    })
  }

  
  onMounted(() => {
    const initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces); // sets placementHighlights internally
  });

  function highlightPlacements(pieceBlueprint: PieceBlueprint) {
    pieceToPlace.value = pieceBlueprint;
    isPlacing.value = true;
  }

  function placePieceOnBoardAt(coord: Coordinate) {
    if (!pieceToPlace.value) return

    const bp = pieceToPlace.value

    const PieceClass = Allpieces.find(p => p.name === bp.name)
    if (!PieceClass) return

    const instance = new PieceClass(coord)   // now real placement!
    instance.team = 'player'

    activePieces.value.push(instance)

    // Mark blueprint as placed so it greys in inventory
    bp.isPlaced = true

    // Reset placement state
    pieceToPlace.value = null
    isPlacing.value = false
  }

  function handleSell(piece: Piece) {
    console.log('sell clicked');
    //player.value.sell(piece)
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

  const endTurn = () => {
    activePieces.value.forEach(piece => {
      piece.movesRemaining = piece.moves;
    });
  }
</script>

<template>
  <button class="swap-display" @mousedown="swapDisplay()">
    {{ displayEditor ? "Show Board" : "Show Editor" }}
  </button>
  <div v-if="isPlacing">placing {{ pieceToPlace?.name }}</div>
  <PlayerView v-if="!displayEditor" :player="player" @highlightPlacements="highlightPlacements"/>
  <Board v-if="!displayEditor" :tiles="level.tiles" :pieces="activePieces" :placementHighlights="playerSpawns" :placementMode="isPlacing" @place-on-board="placePieceOnBoardAt"/>
  <Leveleditor v-else @export-level="handleExport"/>
  <button v-if="!displayEditor" class="end-turn" v-on:click="endTurn()">End Turn</button>
</template>

<style scoped>
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
