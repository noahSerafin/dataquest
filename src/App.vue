<script setup lang="ts">
import { ref } from "vue";
import Board from './components/Board.vue';
import Leveleditor from './components/Leveleditor.vue';
import type { Coordinate } from "./types";
import { level1 } from './levels';

const level = ref(level1);

const occupiedTiles: Coordinate[] = [
  { x: 1, y: 0 },
  { x: 2, y: 2 },
  { x: 0, y: 3 }
]
//<Board :tiles="occupiedTiles"/>
</script>

<template>
  <!--
    <Leveleditor />
  -->
  <Board :tiles="level" />
</template>

<style scoped>
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
