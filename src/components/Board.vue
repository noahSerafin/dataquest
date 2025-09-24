<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
//import Piece from "./Piece.vue"
//import type { Piece } from "../Pieces"


interface Props{
  tiles : Coordinate[]
  //pieces: Piece[]
}
const props = defineProps<Props>()

// Get cols/rows from tiles
const cols = computed(() =>
  props.tiles.length ? Math.max(...props.tiles.map(t => t.x)) + 1 : 0
)
const rows = computed(() =>
  props.tiles.length ? Math.max(...props.tiles.map(t => t.y)) + 1 : 0
)

// Track screen size
const vw = ref(window.innerWidth * 0.7)
const vh = ref(window.innerHeight * 0.7)

// Update on resize
const updateSize = () => {
  vw.value = window.innerWidth * 0.7
  vh.value = window.innerHeight * 0.7
}
onMounted(() => window.addEventListener("resize", updateSize))
onBeforeUnmount(() => window.removeEventListener("resize", updateSize))

// Compute tile size
const tileSize = computed(() => {
  if (cols.value === 0 || rows.value === 0) return 0
  return Math.min(vw.value / cols.value, vh.value / rows.value)
})

// Board dimensions
const boardWidth = computed(() => tileSize.value * cols.value)
const boardHeight = computed(() => tileSize.value * rows.value)

// Make a Set for fast lookup
const tileSet = computed(() => new Set(props.tiles.map(t => `${t.x},${t.y}`)))
</script>


<template>
  <div
    v-if="cols > 0 && rows > 0"
    class="grid board"
    :style="{
      width: boardWidth + 'px',
      height: boardHeight + 'px',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    }"
  >
    <template v-for="row in rows" :key="row">
      <template v-for="col in cols" :key="`${col},${row}`">
        <div
          class="border border-black"
          :class="tileSet.has(`${col-1},${row-1}`) ? 'tile' : 'tile-empty'"
        />
      </template>
    </template>
  </div>
  <!-- Render pieces -->
  <Piece v-for="p in pieces" :key="p.name" :piece="p" :tileSize="tileSize" />
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