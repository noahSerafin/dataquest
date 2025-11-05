<script setup lang="ts">
  import { ref } from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { level1 } from './levels';
  import { Player } from "./Player";
  import PlayerView from "./components/PlayerView.vue";
  //import { Map } from "./components/Map.vue";

  //testing fields
  import { Sword, Shield } from "./Pieces"; // adjust import path
  // Instantiate real piece objects
  const testSword = new Sword();
  const testShield = new Shield();
  
  const player = ref(new Player(
    20, // starting money
    5,  // memory limit
    [], // no items yet
    [testSword, testShield] // starting programs
  ));
  const level = ref(level1);
  const displayEditor = ref(true);
  const selectedPiece = ref<Piece | null>(null)

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;
  }

  // When editor exports a new level
  const handleExport = (levelData: any) => {
    level.value.map = levelData.map;
    level.value.pieces = levelData.pieces;
    displayEditor.value = false; // swap to board view
  };
</script>

<template>
  <button @mousedown="swapDisplay()">
    {{ displayEditor ? "Show Board" : "Show Editor" }}
  </button>
  <PlayerView v-if="!displayEditor" :player="player" :selectedPiece="selectedPiece"/>
  <Board v-if="!displayEditor" :tiles="level.map" :pieces="level.pieces" :selectedPiece="selectedPiece"/> <!-- todo: set up  levels with array of pieces and tiles (map)-->
  <Leveleditor v-else @export-level="handleExport"/>
</template>

<style scoped>
button{
  position: absolute;
  top: 2%;
  left: 2%;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 2px 4px;
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
