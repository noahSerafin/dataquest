<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from "vue";
import type { Coordinate } from "../types";
//import PieceView from "./PieceView.vue";
import type { Piece } from "../Pieces";
import {Allpieces} from "../Pieces";

//const pieceClasses: Array<typeof Piece>
const pieceClasses = [...Allpieces];//switch to object for fast lookup when there are "dozens" of pieces

const size = ref(9);
const width = ref(9);
const height = ref(9);


type DropperMode = 'tile' | 'piece' | 'extend';

interface DropperState {
  mode: DropperMode
  tileType?: string           // used when mode === 'tile'
  pieceName?: string          // used when mode === 'piece' or 'extend'
  team?: 'player' | 'enemy'   // used when placing pieces
  extending?: boolean         // convenience flag for UI
  pieceToExtend?: string      // pieceId (uuid or similar)
};

const dropper = ref<DropperState>({
  mode: 'tile',
  tileType: '',
});

const setDropper = (newDropper: DropperState) => {
  if(newDropper.pieceName == dropper.value.pieceName){
    //switch that dropper button from player to enemy
    newDropper.team = dropper.value.team == 'player' ? 'enemy' : 'player';
  }
  dropper.value = newDropper // + player or enemy
  console.log(dropper.value)
}

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

const piecesToExport = ref<InstanceType<typeof Piece>[]>([]);

function placePiece(coord: Coordinate) {
  const pieceClass = Allpieces.find(p => p.name === dropper.value.pieceName)
  if (!pieceClass) return

  const newPiece = new pieceClass(coord)
  newPiece.team = dropper.value.team ?? 'enemy'

  piecesToExport.value.push(newPiece)
}

function extendPiece(pieceID: string, coord: Coordinate) {
  const pieceToExtend = piecesToExport.value.find(p => p.id === pieceID)
  if (!pieceToExtend) return

  pieceToExtend.addTile(coord.x, coord.y); //not a . value, its a function
}

// Handle mouse down
function handleMouseDown(x: number, y: number) {
  if (dropper.value.mode === "tile") {
    //todo: check coord isn't occupied before removing a tile
    isDragging.value = true
    dragMode.value = isActive(x, y) ? "deactivate" : "activate"
    applyDrag(x, y)
  } else if (dropper.value.mode == 'extend' && dropper.value.pieceToExtend){
    extendPiece(dropper.value.pieceToExtend, {x, y});  
  } else if (dropper.value.mode == 'piece'){
    placePiece({x, y});
      // piece placement mode
     /*
     const Piece = pieces[dropper.value as keyof typeof pieces]
      if (Piece) {
        const newPiece = new Piece({ x, y })
        pieces.value.push(newPiece)
      }
      */
  }
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

const emit = defineEmits<{
  (e: "export-level", tiles: Coordinate[]): void
}>()
// export active tiles to clipboard
const exportTiles = async () => {
  const coords: Coordinate[] = Array.from(activeTiles.value).map(key => {
    const [x, y] = key.split(",").map(Number)
    return { x, y }
  })
  const json = JSON.stringify(coords, null, 2);
  await navigator.clipboard.writeText(json);
  alert("Copied " + coords.length + " tiles to clipboard.");
  emit("export-level", coords) // send data to App.vue
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
  <!-- Place Pieces -->
   <div class="droppers">
     <div class="piece-selector">
      <!-- todo set new buttons to dropperState equivalents
       mode: DropperMode
      tileType?: string           // used when mode === 'tile'
      pieceName?: string          // used when mode === 'piece' or 'extend'
      team?: 'player' | 'enemy'   // used when placing pieces
      extending?: boolean         // convenience flag for UI
      pieceToExtend?: string 
      -->
          <button @click="setDropper('', null)">X</button>
          <button @click="setDropper('Player_Spawn', "U+2BD0")">{{ String.fromCodePoint(parseInt("U+2BD0".replace('U+', ''), 16)) }}</button>
          <button @click="setDropper('Enemy_Spawn', "U+2B1A")">{{ String.fromCodePoint(parseInt("U+2B1A".replace('U+', ''), 16)) }}</button>
          <button @click="setDropper('Extender', "U+2B1A")">{{ String.fromCodePoint(parseInt("U+25FC".replace('U+', ''), 16)) }}</button>
          <button
            v-for="p in pieceClasses"
            :key="p.name"
            class="piece-button for-player"
            :id="p.name+'-dropper-btn'"
            @click="setDropper(p.name, p.unicode)"
          >
            {{ String.fromCodePoint(parseInt(p.unicode.replace('U+', ''), 16)) }} {{ p.name }}
          </button>
        </div>
    </div>
    <div class="grid-container">
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
.grid-container{
  position: relative;
}
.grid {
  border: 3px solid white;
  display: grid;
  margin: auto; /* center horizontally */
  position: relative;
  top: 0;
  left: 0;
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
.droppers{
  position: absolute;
  left: 2%;
  top: 10%;
  overflow-y: scroll;
  height: 80%;
  button{
    display: block;
  }
}
</style>