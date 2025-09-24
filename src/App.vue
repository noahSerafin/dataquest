<script setup lang="ts">
import { ref } from "vue";
import Board from './components/Board.vue';
import Leveleditor from './components/Leveleditor.vue';
import type { Coordinate } from "./types";
import { level1 } from './levels';

const level = ref(level1);
const displayEditor = ref(true);

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;
  }

  // When editor exports a new level
  const handleExport = (tiles: Coordinate[]) => {
    level.value = tiles; // update the Board's tiles
    displayEditor.value = false; // swap to board view
  };
</script>

<template>
  <button @mousedown="swapDisplay()">
    {{ displayEditor ? "Show Board" : "Show Editor" }}
  </button>
  <Board v-if="!displayEditor" :tiles="level" />
  <Leveleditor v-else @export-level="handleExport"/>
</template>

<style scoped>
button{
  position: absolute;
  top: 8%;
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
