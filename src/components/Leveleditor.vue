<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { Coordinate } from "../types";
import PieceView from "./PieceView.vue";
import type { Piece } from "../Pieces";
import { Spawn } from '../Pieces';
import {allPieces} from "../Pieces";
import { generateNode } from "../nodeBuilder";

//const pieceClasses: Array<typeof Piece>
//switch to object for fast lookup when there are "dozens" of pieces
const pieceClasses = [...allPieces];
pieceClasses.unshift(Spawn);

const size = ref(9);
const width = ref(9);
const height = ref(9);


type DropperMode = 'tile' | 'piece' | 'extend';
//const editingPieceID: ref('');

interface DropperState {
  mode: DropperMode
  pieceName?: string          // used when mode === 'piece' or 'extend'
  team?: 'player' | 'enemy'   // used when placing pieces
  extending?: boolean         // convenience flag for UI
  pieceToExtend?: string      // pieceId (uuid or similar)
};

const dropper = ref<DropperState>({
  mode: 'tile',
  pieceName: '',
  team: 'enemy',
  extending: false,
  pieceToExtend: ''
});

const setDropper = (newDropper: DropperState) => {
 const current = dropper.value;

  // 1. If selecting same piece again → toggle team
  if (
    current.mode === 'piece' &&
    newDropper.mode === 'piece' &&
    current.pieceName === newDropper.pieceName
  ) {
    dropper.value = {
      ...current,
      team: current.team === 'player' ? 'enemy' : 'player'
    };
    return;
  }

  // 2. If switching to extend mode → keep existing team & pieceName
  if (newDropper.mode === 'extend') {//TODO finish extend function
    dropper.value = {
      ...current,
      mode: 'extend',
      pieceToExtend: current.pieceToExtend
    };
    return;
  }

  // 3. If switching to tile mode → reset piece fields
  if (newDropper.mode === 'tile') {
    dropper.value = {
      mode: 'tile',
      pieceName: '',
      team: 'enemy',
      extending: false,
      pieceToExtend: ''
    };
    return;
  }

  // 4. Normal switching into piece mode
  if (newDropper.mode === 'piece') {
    dropper.value = {
      mode: 'piece',
      pieceName: newDropper.pieceName,
      team: current.team, // keep last used team for player friendliness
      extending: false,
      pieceToExtend: ''
    };
    return;
  }
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

function findPieceAt(coord : Coordinate) {
  return piecesToExport.value.find(p =>
    p.tiles.some(t => t.x === coord.x && t.y === coord.y)
  );
}

function placePiece(coord: Coordinate) {
  const pieceClass = pieceClasses.find(p => p.name === dropper.value.pieceName)
  if (!pieceClass) return

  const newPiece = new pieceClass(coord, dropper.value.team ?? 'enemy');

  dropper.value.pieceToExtend = newPiece.id;
  piecesToExport.value.push(newPiece)
  console.log('piece placed')
}

function extendPiece(pieceID: string, coord: Coordinate) {
  const pieceToExtend = piecesToExport.value.find(p => p.id === pieceID)
  if (!pieceToExtend) return

  pieceToExtend.addTile(coord.x, coord.y); //todo not a . value, its a function
}

function removePieceById(id: string) {
  piecesToExport.value = piecesToExport.value.filter(piece => piece.id !== id);
}

// Handle mouse down
function handleMouseDown(x: number, y: number) {
  console.log('dropper mode: ', dropper.value.mode);
  const found = findPieceAt({x, y});
  if (dropper.value.mode === "tile") {
    //todo: check coord isn't occupied before removing a tile
    if(found){
      //remove piece??
      removePieceById(found.id)
    }
    isDragging.value = true
    dragMode.value = isActive(x, y) ? "deactivate" : "activate"
    applyDrag(x, y)
  } else if (dropper.value.mode == 'extend'){
    //tile is below piece
    console.log('lookingforpieceat', x, y, found)
    if(found){
      console.log('switching pieceToExtend to ', found?.name)
      dropper.value.pieceToExtend = found.id;
    } else if(dropper.value.pieceToExtend){
      console.log('dropper: ', dropper.value)
      extendPiece(dropper.value.pieceToExtend, {x, y});  
    }
  } else if (dropper.value.mode == 'piece' && !found){
    placePiece({x, y});
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

function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    return;
  }
  
  if (e.key === 'e' || e.key === 'E') {
    setDropper({ mode: 'extend' });
  } else if (e.key === 'x' || e.key === 'X') {
    setDropper({ mode: 'tile' });
  } else if (e.key === 's' || e.key === 'S') {
    setDropper({ mode: 'piece', pieceName: 'Spawn' });
  }
}

onMounted(() => {
  window.addEventListener("mouseup", handleMouseUp)
  window.addEventListener("keydown", handleKeyDown)
})
onBeforeUnmount(() => {
  window.removeEventListener("mouseup", handleMouseUp)
  window.removeEventListener("keydown", handleKeyDown)
})

// Track clicked tiles
const activeTiles = ref<Set<string>>(new Set());

const tileMap = computed<Coordinate[]>(() =>
  Array.from(activeTiles.value).map(tileStr => {
    const [x, y] = tileStr.split(',').map(Number)
    return { x, y }
  })
)
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

type LevelData = {
  name?: string;
  tiles: Coordinate[];
  pieces: any[];
};

const emit = defineEmits<{
  (e: 'export-level', payload: LevelData): void;
}>();

const showExportModal = ref(false);
const exportLevelName = ref("New Level");

const openExportModal = () => {
  exportLevelName.value = "New Level";
  showExportModal.value = true;
}

const confirmExport = async () => {
  if (!exportLevelName.value) return;

  const coords: Coordinate[] = Array.from(activeTiles.value).map(key => {
    const [x, y] = key.split(",").map(Number)
    return { x, y }
  })
 
  // Step 2: Extract the relevant data from each piece
  const exportedPieces = piecesToExport.value.map(p => ({
    id: p.id,
    name: p.name,
    team: p.team,
    headPosition: p.headPosition,
    tiles: p.tiles,
    rarity: p.rarity,
    /*maxSize: p.maxSize,
    moves: p.moves,
    range: p.range,
    attack: p.attack,
    defence: p.defence*/
  }))

  // Step 3: Build the final level object
  const exportingLevel = {
    name: exportLevelName.value,
    tiles: coords,
    pieces: exportedPieces,
  }

  // Step 4: Copy JSON to clipboard
  try {
    const json = JSON.stringify(exportingLevel, null, 2)
    await navigator.clipboard.writeText(json)
    alert('Copied level to clipboard.')
  } catch (err) {
    console.error('Failed to copy to clipboard', err)
    alert('Failed to copy level to clipboard.')
  }

  // Step 5: Emit for higher-level handling if needed
  emit('export-level', exportingLevel);
  
  showExportModal.value = false;
}

const loadLevelData = (parsed: any) => {
  if (!parsed || !parsed.tiles || !parsed.pieces) {
    alert("Invalid level data");
    return;
  }
  
  if (parsed.name) {
    console.log(`Importing level: ${parsed.name}`);
  }
  
  activeTiles.value.clear();
  piecesToExport.value = [];
  
  let maxX = 4;
  let maxY = 4;

  parsed.tiles.forEach((t: Coordinate) => {
    activeTiles.value.add(`${t.x},${t.y}`);
    if (t.x > maxX) maxX = t.x;
    if (t.y > maxY) maxY = t.y;
  });
  
  parsed.pieces.forEach((p: any) => {
    const pieceClass = pieceClasses.find(cls => cls.name === p.name);
    if (pieceClass) {
      const newPiece = new pieceClass(p.headPosition, p.team, undefined, p.id);
      newPiece.tiles = p.tiles;
      piecesToExport.value.push(newPiece);
      
      p.tiles.forEach((t: Coordinate) => {
        if (t.x > maxX) maxX = t.x;
        if (t.y > maxY) maxY = t.y;
      });
    } else {
      console.warn("Unknown piece name:", p.name);
    }
  });

  width.value = maxX + 1;
  height.value = maxY + 1;
  size.value = Math.max(width.value, height.value);
};

const importLevel = () => {
  const json = prompt("Paste level JSON here:");
  if (!json) return;
    
    let parsed;
    try {
      // First try strict JSON parsing
      parsed = JSON.parse(json);
    } catch (e) {
      // If it fails (e.g., unquoted keys from a .ts file), fallback to evaluating it as a JS object
      try {
        parsed = new Function("return " + json)();
      } catch (fallbackError) {
        alert("Failed to parse level data. Please ensure it is a valid object.");
        console.error(fallbackError);
        return;
      }
    }
    
    loadLevelData(parsed);
}

const generateDifficulty = ref(1);

const generateLevel = () => {
  const generatedLevel = generateNode(generateDifficulty.value, 0);
  
  generatedLevel.pieces.forEach((p: any) => {
    if (p.name === 'Spawn' && p.team === 'enemy') {
      const candidates = pieceClasses.filter((c: any) => {
        if (c.rarity !== p.rarity || c.name === 'Spawn') return false;
        try {
          const dummy = new c({x: -1, y: -1}, 'enemy');
          return dummy.maxSize >= (p.tiles?.length || 1);
        } catch (e) {
          return false;
        }
      });
      
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        p.name = chosen.name;
      }
    }
  });

  loadLevelData(generatedLevel);
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
    
    <div class="action-buttons">
      <div class="generate-controls">
        <label>
          Diff: {{ generateDifficulty }}
          <input type="number" min="1" max="50" v-model.number="generateDifficulty" class="diff-input"/>
        </label>
        <button @click="generateLevel">Generate</button>
      </div>
      <button @click="importLevel" class="import-btn">Import Level</button>
      <button @click="openExportModal" class="export-btn">Export Tiles</button>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="export-modal">
      <div class="modal-content">
        <h3>Enter a name for the level:</h3>
        <input v-model="exportLevelName" type="text" @keyup.enter="confirmExport" class="export-input" />
        <div class="modal-actions">
          <button @click="confirmExport">OK</button>
          <button @click="showExportModal = false">Cancel</button>
        </div>
      </div>
    </div>
  <!-- Place Pieces -->
   <div class="droppers">
     <label>
        team: {{ dropper.team }}
      </label>
     <div class="piece-selector">
      <!-- todo set new buttons, check dropperState is changing
       mode: DropperMode
      pieceName?: string          // used when mode === 'piece' or 'extend'
      team?: 'player' | 'enemy'   // used when placing pieces
      extending?: boolean         // convenience flag for UI
      pieceToExtend?: string 
      -->
          <button @click="setDropper({mode: 'tile'})">X</button>
          <button @click="setDropper({mode: 'extend'})">{{ String.fromCodePoint(parseInt("U+25FC".replace('U+', ''), 16), 0xFE0F) }}extend</button>
          <button
            v-for="p in pieceClasses"
            :key="p.name"
            class="piece-button for-player"
            :id="p.name+'-dropper-btn'"
            @click="setDropper({mode: 'piece', pieceName: p.name, })"          >
            {{ String.fromCodePoint(parseInt(p.unicode.replace('U+', ''), 16), 0xFE0F) }} {{ p.name }}
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
      <div
        v-for="piece in piecesToExport"
        class="piece-layer"
        :key="piece.id"
      >
        <PieceView
          cssclass="editor"
          :piece="piece"
          :selectedPiece="null"
          :tileSize="tileSize"
          :mapTiles="tileMap"
          :showFastControls="false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .editor{
    position: absolute;
    top: 100px;
    z-index: 99999;
  }
  .controls{
    position: fixed;
    z-index: 99999;
    top: 5vh;
    left: 20%;
    width: 100%;
}
.action-buttons {
  position: fixed;
  top: 5vh;
  right: 5%;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 99999;
}
.generate-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}
.diff-input {
  width: 40px;
}
.grid-container{
  position: relative;
}
.grid {
  border: 3px solid white;
  display: grid;
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
  position: fixed;
  right: 5%;
  top: 10%;
  height: 80%;
  button{
    display: block;
    z-index: 999999;
  }
  .piece-selector{
    height: 100%;
    overflow-y: scroll;
  }
}

.export-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.modal-content {
  background: #333;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.export-input {
  margin: 10px 0;
  padding: 5px;
  width: 80%;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
</style>