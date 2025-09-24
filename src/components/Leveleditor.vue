<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from "vue";
import type { Coordinate } from "../types";

const size = ref(9);
const width = ref(9);
const height = ref(9);

const isDragging = ref(false)
const dragMode = ref<"activate" | "deactivate" | null>(null)

const key = (x: number, y: number) => `${x},${y}`
const isActive = (x: number, y: number) => activeTiles.value.has(key(x, y))

// Apply toggle based on mode
function applyDrag(x: number, y: number) {
  const k = key(x, y)
  if (dragMode.value === "activate") activeTiles.value.add(k)
  else if (dragMode.value === "deactivate") activeTiles.value.delete(k)
}

// Handle mouse down
function handleMouseDown(x: number, y: number) {
  isDragging.value = true
  dragMode.value = isActive(x, y) ? "deactivate" : "activate"
  applyDrag(x, y)
}

// Handle mouse enter while dragging
function handleMouseEnter(x: number, y: number) {
  if (!isDragging.value) return
  applyDrag(x, y)
}

// Stop drag on mouseup anywhere
function handleMouseUp() {
  isDragging.value = false
  dragMode.value = null
}

onMounted(() => {
  window.addEventListener("mouseup", handleMouseUp)
})
onBeforeUnmount(() => {
  window.removeEventListener("mouseup", handleMouseUp)
})

// Track clicked tiles
const activeTiles = ref<Set<string>>(new Set());
//reactive(new Set<string>());

const fillGrid = () => {
  activeTiles.value.clear()
  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      activeTiles.value.add(`${x},${y}`)
    }
  }
}
fillGrid()

// If "size" slider changes, sync width & height
const updateSize = () => {
  width.value = size.value
  height.value = size.value
  fillGrid(); // create a blank board
}

// Toggle tile state
/*const toggleTile = (x: number, y: number) => {
  const key = `${x},${y}`
  if (activeTiles.value.has(key)) {
    activeTiles.value.delete(key)
  } else {
    activeTiles.value.add(key)
  }
  
  // Check if a tile is active
  const isActive = (x: number, y: number) => activeTiles.value.has(`${x},${y}`)
  }*/

// export active tiles to clipboard
const exportTiles = async () => {
  const coords: Coordinate[] = Array.from(activeTiles.value).map(key => {
    const [x, y] = key.split(",").map(Number)
    return { x, y }
  })
  const json = JSON.stringify(coords, null, 2);
  await navigator.clipboard.writeText(json);
  alert("Copied " + coords.length + " tiles to clipboard.");
}


// Track screen size
const vw = ref(window.innerWidth * 0.7)
const vh = ref(window.innerHeight * 0.7)


// Update on resize
const updateGridSize = () => {
  vw.value = window.innerWidth * 0.7;
  vh.value = window.innerHeight * 0.7;
}
onMounted(() => window.addEventListener("resize", updateGridSize))
onBeforeUnmount(() => window.removeEventListener("resize", updateGridSize))

// Compute tile size
const tileSize = computed(() => {
  if (width.value === 0 || height.value === 0) return 0
  return Math.min(vw.value / width.value, vh.value / height.value)
})

// Board dimensions
const boardWidth = computed(() => tileSize.value * width.value)
const boardHeight = computed(() => tileSize.value * height.value)

// Make a Set for fast lookup
//const tileSet = computed(() => new Set(props.tiles.map(t => `${t.x},${t.y}`)))*/
</script>


<template>
  <div class="editor">
    <!-- Sliders -->
    <div class="controls">
      <label>
        Size: {{ size }}
        <input type="range" min="5" max="48" v-model.number="size" @input="updateSize" />
      </label>
      <label>
        Width: {{ width }}
        <input type="range" min="5" max="48" v-model.number="width" @input="fillGrid"/>
      </label>
      <label>
        Height: {{ height }}
        <input type="range" min="5" max="48" v-model.number="height" @input="fillGrid"/>
      </label>
  </div>
  <div
    class="grid"
    :style="{
      width: boardWidth + 'px',
      height: boardHeight + 'px',
      gridTemplateColumns: `repeat(${width}, 1fr)`,
      gridTemplateRows: `repeat(${height}, 1fr)`
    }"
  >
    <template v-for="r in height" :key="r">
        <template v-for="c in width" :key="`${c-1}-${r-1}`">
          <div
            :class="isActive(c-1, r-1) ? 'tile' : 'tile-empty'"
            @mousedown.prevent="handleMouseDown(c-1, r-1)"
            @mouseenter="handleMouseEnter(c-1, r-1)"
          />
      </template>
    </template>

  </div>
  <!-- Export button -->
    <button @click="exportTiles" class="export-btn">Export Tiles</button>
  </div>
</template>

<style scoped>
.controls{
  position: absolute;
  top: 5vh;
  left: 0;
  width: 100%;
}
.export-btn{
  position: absolute;
  bottom: 5vh;
}
.grid {
  border: 3px solid white;
  display: grid;
  margin: auto; /* center horizontally */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* center vertically too */
}
.tile{
  background-color: gainsboro;
  border: 1px solid black;
  box-sizing: border-box; /* border counts inside the width/height */
  width: 100%;
  height: 100%;
}
.tile-empty{
  background-color: #202020;
}
</style>