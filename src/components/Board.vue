<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
import PieceView from "./PieceView.vue";
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

//pieceMap to track occupied spaces
const activePieces = ref<InstanceType<typeof Piece>[]>([]);

// Fast lookup: "x,y" → piece reference
const pieceMap = computed(() => {
  const map = new Map<string, InstanceType<typeof Piece>>()
  activePieces.value.forEach(piece => {
    piece.tiles.forEach(tile => {
      map.set(`${tile.x},${tile.y}`, piece)
    })
  })
  return map
});

const isOccupied = (x: number, y: number) => pieceMap.value.has(`${x},${y}`);

const getAvailableMoves = (piece: InstanceType<typeof Piece>) => {
  const results: Coordinate[] = []
  const { x, y } = piece.headPosition

  for (let i = 1; i <= piece.moves; i++) {
    // check up
    if (!pieceMap.value.has(`${x},${y - i}`)) results.push({ x, y: y - i })
    else break
  }
  for (let i = 1; i <= piece.moves; i++) {
    // check down
    if (!pieceMap.value.has(`${x},${y + i}`)) results.push({ x, y: y + i })
    else break
  }
  for (let i = 1; i <= piece.moves; i++) {
    // check left
    if (!pieceMap.value.has(`${x - i},${y}`)) results.push({ x: x - i, y })
    else break
  }
  for (let i = 1; i <= piece.moves; i++) {
    // check right
    if (!pieceMap.value.has(`${x + i},${y}`)) results.push({ x: x + i, y })
    else break
  }

  return results
}

</script>


<template>
  <div class="grid-container">
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
          :id="col-1+', '+(row-1)"
        />
      </template>
    </template>
  </div>
  <!-- Render pieces -->
   <PieceView
   name="Shield"
   team="player"
   :tileSize=tileSize
   :headPosition="{x: 0, y: 0}"
   :pieceTiles="[{x:0, y:0}, {x:0, y:1}, {x:1, y:1}]"
   :mapTiles = props.tiles
   />
   </div>
</template>

<style scoped>
.grid-container{
  position: relative;
}
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