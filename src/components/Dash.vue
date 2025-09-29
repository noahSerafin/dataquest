<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
//import Piece from "./Piece.vue"
import type { Piece } from "../Pieces"


interface Props{
  tiles : Coordinate[]
  playerPieces: Piece[]
}
const props = defineProps<Props>()

</script>


<template>
  <h3>Your Programs</h3>
  <div
  >
  <!-- Render pieces -->
  <Piece v-for="p in playerPieces" :key="p.name" :piece="p" :tileSize="1" />
</div>
</template>

<style scoped>
.grid {
  display: grid;
  margin: auto; /* center horizontally */
  position: relative;
  top: 0;
  left: 0;
}
.tile{
  background-color: gainsboro;
  border: 2px solid black;
  width: 100%;
  height: 100%;
}
.tile-empty{
  background-color: black;
}
</style>