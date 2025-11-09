<script setup lang="ts">
  import { ref, onMounted, watch } from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { level1 } from './levels';
  import { Player } from "./Player";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn } from './Pieces';
  import { Allpieces } from "./Pieces"
  import type { Coordinate } from "./types";

  //import { Map } from "./components/Map.vue";

  //testing fields
  import { Sword, Shield } from "./Pieces"; // adjust import path
  // Instantiate real piece objects
  const testSword = new Sword({x: 0, y: 0});
  const testShield = new Shield({x: 0, y: 0});
  ///
  //placePiece = (id) => {
   //move to board
   
  //}
  
  const player = ref(new Player(
    20, // starting money
    5,  // memory limit
    3, //admin slots
    [], // no items yet
    [testSword, testShield] // starting programs
  ));

  const level = ref(level1);
  const displayEditor = ref(true);

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }

  function processSpawnPoints(pieces: Piece[]) {
    const processed: Piece[] = [];
    placementHighlights.value = []

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

        // Player spawn → record placement highlight coordinates
        if (piece.team === 'player') {
          placementHighlights.value.push(piece.headPosition);
          // Do *not* add Spawn to active pieces — it is a marker, not a unit
          continue;
        }
      }

      processed.push(piece);
    }

    return processed;
  }

  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);

  function rehydratePieces(rawPieces: any[]): InstanceType<typeof Piece>[] {
    const pieceClasses = [...Allpieces];
    pieceClasses.unshift(Spawn);
    return rawPieces.map(p => {
      const PieceClass = pieceClasses.find(cls => cls.name === p.name)
      return PieceClass ? Object.assign(new PieceClass(p.headPosition), p) : p
    })
  }

  onMounted(() => {
    let initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces);
    //activePieces.value = rehydratePieces(level.value.pieces);//adding removing to test
  })

  function handlePlace(piece: Piece) {
    // remove from player inventory
    const index = player.value.programs.findIndex(p => p.id === piece.id)
    if (index !== -1) {
      player.value.programs.splice(index, 1)
    }

    // hand off to board for placement
 
    //remove the spawn piece
    
    //add a coord to piece based on click event
    activePieces.value.push(piece);
  }

  const placementHighlights = ref<Coordinate[]>([])

  function highlightPlacements(){
    //placementHighlights =
  }

  function handleSell(piece: Piece) {
    console.log('sell clicked');
    //player.value.sell(piece)
  }

  // When editor exports a new level
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
  <PlayerView v-if="!displayEditor" :player="player" @highlight-placements="highlightPlacements"/>
  <Board v-if="!displayEditor" :tiles="level.tiles" :pieces="activePieces" :highlights="placementHighlights"/> <!-- todo: set up  levels with array of pieces and tiles (map)-->
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
