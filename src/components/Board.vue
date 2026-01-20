<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import type { Coordinate, PieceBlueprint } from "../types"
import PieceView from "./PieceView.vue";
import { Piece } from "../Pieces"
import { Player } from "../Player";

interface Props{
  tiles : Coordinate[]//Set<string>
  pieces: Piece[]
  selectedPiece: InstanceType<typeof Piece> | null
  placementHighlights: Coordinate[]
  placementMode: boolean
  isFirstTurn: boolean
  hasFinishedTurn: boolean
  player: Player
  showFastControls: boolean
  isDraggingPlacement: boolean
  pieceToPlace: PieceBlueprint | null
}
const props = defineProps<Props>()

//console.log('pm: ', props.placementMode)
//console.log('in board: ', props.placementHighlights.length);

const emit = defineEmits<{
  (e: 'placeOnBoard', coord: Coordinate): void
  (e: 'handlePieceSelect', piece: Piece): void
  (e: 'deselect'): void
  (e: 'movePiece', coord: Coordinate): void
  (e: 'damagePieceAt', coord: Coordinate): void
  (e: 'specialActionAt', coord: Coordinate): void
  (e: 'placeAt', coord: Coordinate): void
  (e: 'hoverPlacement', coord: Coordinate): void
}>()
  
function handlePlaceClick(tile: Coordinate) {
  if (!props.placementMode) return
  if (!props.placementHighlights.some(h => h.x === tile.x && h.y === tile.y)) return
  emit('placeOnBoard', tile)
}

const boardEl = ref<HTMLDivElement | null>(null);
const mousePos = ref<{ x: number; y: number } | null>(null);
const snapPos = ref<{ x: number; y: number } | null>(null);
const snapCoord = ref<Coordinate | null>(null);

function onMouseMove(e: MouseEvent) {
  if (!props.isDraggingPlacement || !boardEl.value) return
  const rect = boardEl.value.getBoundingClientRect()
  mousePos.value = {//too far to thr right? element too wide??
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  // 2. snap if hovering a placement tile
  const hovered = findHoveredPlacement(e, rect)
  if (hovered) {
    snapCoord.value = hovered.coord
    snapPos.value = hovered.px
  } else {
    snapCoord.value = null
    snapPos.value = null
  }
}

function findHoveredPlacement(
  e: MouseEvent,
  boardRect: DOMRect
): { coord: Coordinate; px: { x: number; y: number } } | null {

  const el = document.elementFromPoint(e.clientX, e.clientY)
    ?.closest<HTMLElement>('.placement-tile')

  if (!el) return null

  const x = Number(el.dataset.x)
  const y = Number(el.dataset.y)

  if (Number.isNaN(x) || Number.isNaN(y)) return null

  // snap to CENTER of tile
  const tileRect = el.getBoundingClientRect()

  return {
    coord: { x, y },
    px: {
      x: tileRect.left + 8 - boardRect.left,
      y: tileRect.top + 8 - boardRect.top
    }
  }
}

const ghostStyle = computed(() => {
   if (!mousePos.value) return { display: 'none' }

  if (snapPos.value) {
    return {
      left: snapPos.value.x + 'px',
      top: snapPos.value.y + 'px',
      height: (tileSize.value - 16) + 'px',
      width: (tileSize.value - 16) + 'px',
      border: '1px solid outset',
      fontSize: (tileSize.value * 0.6) + 'px',
      lineHeight: (tileSize.value -24) + 'px',
      backgroundColor: props.pieceToPlace?.color,
      }
  }

  return {
    left: mousePos.value.x + 'px',
    top: mousePos.value.y + 'px',
    transform: 'translate(-50%, -50%)',
    height: tileSize + 'px',//theses styles aren't making it to render
    width: tileSize + 'px',
    border: '1px solid outset',
  }
})

function onMouseUp() {
  if (!props.isDraggingPlacement) return

  if (snapCoord.value) {
    emit('placeAt', snapCoord.value)
  }

  snapCoord.value = null
  mousePos.value = null
}


// Make a Set for fast lookup
const tileSet = computed(() => new Set(props.tiles.map(t => `${t.x},${t.y}`)))

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
  if(boardEl.value){
    vw.value = boardEl.value?.clientWidth
    vh.value = boardEl.value?.clientHeight
  }
}
onMounted(() => window.addEventListener("resize", updateSize));
onBeforeUnmount(() => window.removeEventListener("resize", updateSize));

// Compute tile size
/*
const tileSize = computed(() => {
  if (cols.value === 0 || rows.value === 0) return 0
  return Math.min(vw.value / cols.value, vh.value / rows.value)
})
  */
const tileSize = ref(0)

function recomputeTileSize() {
  if (!boardEl.value) return

  const rect = boardEl.value.parentElement!.getBoundingClientRect()

  const maxTileWidth = rect.width / cols.value
  const maxTileHeight = rect.height / rows.value

  tileSize.value = Math.floor(Math.min(maxTileWidth, maxTileHeight))
}

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!boardEl.value) return;

  observer = new ResizeObserver(() => {
    recomputeTileSize()
  })

  observer.observe(boardEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(
  () => [rows.value, cols.value],
  async () => {
    await nextTick() // wait for grid DOM to update
    recomputeTileSize()
  },
  { immediate: true }
)

// Fast lookup: "x,y" → piece reference
const pieceMap = computed(() => {
  const map = new Map<string, InstanceType<typeof Piece>>()
  props.pieces.forEach(piece => {
    if(!piece.statuses.negative){
      piece.tiles.forEach(tile => {
        map.set(`${tile.x},${tile.y}`, piece)
      })
    }
  })
  //console.log('piecemap:', map)
  return map
});

//cleanup
const moveButtons = ref<Array<{ x: number; y: number; direction: string }>>([]);
const moveHighlights = ref<Coordinate[]>([]);
const inRangeHighlights = ref<Coordinate[]>([]);
const specialHighlights = ref<Coordinate[]>([]);
//const placeHighlights = ref<Coordinate[]>([])

//change to one move at a time
function getAvailableMoves(
  piece: Piece,
  tileSet: Set<string>, // the valid board tiles like "x,y"
  pieceMap: Map<string, Piece> // all occupied tiles by other pieces
): Array<{ x: number; y: number; direction: string }> {
  if (piece.movesRemaining <= 0) return [] // no moves left

  const { x, y } = piece.headPosition
  const potentialMoves = [
    { x: x + 1, y, direction: "right" },
    { x: x - 1, y, direction: "left" },
    { x, y: y + 1, direction: "down" },
    { x, y: y - 1, direction: "up" },
  ]

  return potentialMoves.filter(pos => {
    const key = `${pos.x},${pos.y}`;

    if (!tileSet.has(key)) return false;

    if (piece.statuses.negative) return true;

    const occupyingPiece = pieceMap.get(key);

    if (!occupyingPiece) return true;

    // Knot rule: can move into own tiles
    return props.player.hasAdmin('Knot') && occupyingPiece === piece;
  })
}

function getReachableTiles(
  piece: Piece,
  tileSet: Set<string>,
  pieceMap: Map<string, Piece>
): Array<{ x: number; y: number }> {

  const maxSteps = piece.movesRemaining;
  if (maxSteps <= 0) return [];

  const start = piece.headPosition;
  const visited = new Set<string>();
  const reachable: Array<{ x: number; y: number }> = [];

  const queue: Array<{ x: number; y: number; steps: number }> = [
    { x: start.x, y: start.y, steps: 0 }
  ];

  const isNegative = !!piece.statuses?.negative;

  while (queue.length > 0) {
    const { x, y, steps } = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // Don't include the starting tile (where the piece already is)
    if (!(x === start.x && y === start.y)) {
      reachable.push({ x, y });
    }

    // Stop if we've reached max steps
    if (steps >= maxSteps) continue;

    // Expand neighbors
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const n of neighbors) {
      const nKey = `${n.x},${n.y}`;

      // Must be a valid board tile
      if (!tileSet.has(nKey)) continue;

      // If NOT negative, cannot go through occupied tiles
      //if (!isNegative && pieceMap.has(nKey)) continue; //old method
      const occupyingPiece = pieceMap.get(nKey);

      if (!isNegative && occupyingPiece) {
        const canPassThroughOwn = occupyingPiece === piece && piece.team === 'player' && props.player.hasAdmin('Knot'); // pass this in or close over it
        if (!canPassThroughOwn) continue;
      }

      // Add to queue
      queue.push({ x: n.x, y: n.y, steps: steps + 1 });
    }
  }

  return reachable;
}

const highlightMoves = (piece: InstanceType<typeof Piece>) => {
  clearHighlights();
  moveHighlights.value = getReachableTiles(piece, tileSet.value, pieceMap.value)//actually get in range and not blocked or occupied
  moveButtons.value = getAvailableMoves(piece, tileSet.value, pieceMap.value);
}

const clearHighlights = () => {
  moveHighlights.value = [];
  inRangeHighlights.value = [];
  specialHighlights.value = [];
  moveButtons.value = [];
}

function getTilesInRange(
  center: Coordinate,
  range: number,
  tileSet: Set<string>,       // valid board tiles like "x,y"
): Coordinate[] {
  const tiles: Coordinate[] = [];
  const { x, y } = center;
  const r = range;

  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      const dist = Math.abs(dx) + Math.abs(dy);

      // Only include tiles within Manhattan range
      if (dist > 0 && dist <= r) {
        const tx = x + dx;
        const ty = y + dy;
        const key = `${tx},${ty}`;

        // Only add if tile exists on board
        if (tileSet.has(key)) {
          tiles.push({ x: tx, y: ty });
        }
      }
    }
  }

  return tiles;
}

function getTilesInStraightLine(
  center: Coordinate,
  range: number,
  tileSet: Set<string>
): Coordinate[] {
  const tiles: Coordinate[] = [];
  const { x, y } = center;

  // Four cardinal directions
  const directions = [
    { dx: 1, dy: 0 },   // right
    { dx: -1, dy: 0 },  // left
    { dx: 0, dy: 1 },   // down
    { dx: 0, dy: -1 },  // up
  ];

  for (const { dx, dy } of directions) {
    for (let step = 1; step <= range; step++) {
      const tx = x + dx * step;
      const ty = y + dy * step;
      const key = `${tx},${ty}`;

      // Stop if tile isn’t on the board
      if (!tileSet.has(key)) break;

      tiles.push({ x: tx, y: ty });
    }
  }

  return tiles;
}

/*function checkTileIsOccupied(coord:Coordinate): Piece | undefined{
  return pieceMap.value.get(`${coord.x},${coord.y}`);
}*/

//(damageReceiver: InstanceType<typeof Piece>) => {

const highlightTargets = (piece: InstanceType<typeof Piece>) => {
  clearHighlights();
  if(piece.actions <= 0) return;
  inRangeHighlights.value = getTilesInRange(
    piece.headPosition,
    piece.getStat('range'),
    tileSet.value,
  ); 
}
const highlightSpecials = (piece: InstanceType<typeof Piece>) => {
  //console.log('specialtargets', piece.name)
  clearHighlights();
  if(piece.actions <= 0) return;
  if(piece.targetType === 'line'){
    specialHighlights.value = getTilesInStraightLine(
      piece.headPosition,
      piece.getStat('range'),
      tileSet.value,
    )
  } else if(piece.targetType === 'self'){
    specialHighlights.value = [piece.headPosition]
  } else {
    specialHighlights.value = getTilesInRange(
      piece.headPosition,
      piece.getStat('range'),
      tileSet.value,
    ); 
  }
}

defineExpose({
  highlightMoves,
  highlightTargets,
  clearHighlights
});

function resolveMove(
  chosenMove: { x: number; y: number; direction: string },
  allMoves: { x: number; y: number; direction: string }[]
) {
  // Not confused → behave normally
  if (!props.selectedPiece?.statuses.confused || allMoves.length <= 1) {
    emit('movePiece', {x: chosenMove.x, y: chosenMove.y});
  } else { 
    // Confused → random valid move
    const randomIndex = Math.floor(Math.random() * allMoves.length);
    emit('movePiece', {x: allMoves[randomIndex].x, y: allMoves[randomIndex].y});
  }
}
//onclick = "resolveMove(tile, moveButtons)""
//v-on:click="$emit('movePiece', tile);"

</script>


<template>
  <div class="container board-container"
    v-on:mousemove="onMouseMove"
    >
    <div
      ref="boardEl"
      v-if="cols > 0 && rows > 0"
      class="grid board"
      :style="{
        width: '100%',
        height: '100%',
        gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
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
    <div
      v-for="piece in pieces"
      class="piece-layer"
      :key="piece.id"
    >
      <PieceView
      :piece="piece"
      :selectedPiece="selectedPiece"
      :tileSize=tileSize
      :mapTiles = props.tiles
      cssclass = "board"
      :showFastControls = showFastControls
      @select="$emit('handlePieceSelect', piece)"
      @highlightTargets="highlightTargets"
      @highlightSpecials="highlightSpecials"
      @deselect="$emit('deselect')"
      />
    </div>
    <!-- 
      @highlightMoves="highlightMoves"
    Highlights -->
    <div
      v-for="(tile, index) in moveHighlights"
      :key="index"
      class="highlight-tile"
      :style="{
        left: (tile.x * tileSize) + 1 + 'px',
        top: (tile.y * tileSize) + 1 + 'px',
        width: (tileSize - 5) + 'px',
        height: (tileSize - 5) + 'px',
      }"
    />
    <div
      v-for="(tile, index) in moveButtons"
      v-if="(selectedPiece?.team === 'player' && !selectedPiece?.statuses.charmed) || (selectedPiece?.statuses.charmed && selectedPiece?.team === 'enemy')"
      :key="index"
      class="highlight-tile"
      :class="['move-button', `move-button-${tile.direction}`]"
      v-on:click="resolveMove(tile, moveButtons);"
      :style="{
        left: (tile.x * tileSize) + 1 + 'px',
        top: (tile.y * tileSize) + 1 + 'px',
        width: (tileSize - 5) + 'px',
        height: (tileSize - 5) + 'px',
      }"
    />
    <div
    v-for="(tile, index) in inRangeHighlights"
    :key="index"
    :id="`atk-${tile.x}-${tile.y}`"
      class="highlight-tile red"
      v-on:click="$emit('damagePieceAt', tile)"
      :style="{
        left: (tile.x * tileSize) + 1 + 'px',
        top: (tile.y * tileSize) + 1 + 'px',
        width: (tileSize - 5) + 'px',
        height: (tileSize - 5) + 'px',
      }"
    />
    <div
    v-for="(tile, index) in specialHighlights"
    :key="index"
    :id="`atk-${tile.x}-${tile.y}`"
      class="highlight-tile yellow"
      v-on:click="$emit('specialActionAt', tile)"
      :style="{
        left: (tile.x * tileSize) + 1 + 'px',
        top: (tile.y * tileSize) + 1 + 'px',
        width: (tileSize - 5) + 'px',
        height: (tileSize - 5) + 'px',
      }"
    />
    <div
      v-if="player.canPlace && (placementMode || props.isFirstTurn)" v-for="(tile, index) in placementHighlights"
      :key="index"
      class="highlight-tile green placement-tile"
      @mouseup="onMouseUp"
      v-on:click="handlePlaceClick(tile)"
      :data-x="tile.x"
      :data-y="tile.y"
      :style="{
        left: (tile.x * tileSize) + 1 + 'px',
        top: (tile.y * tileSize) + 1 + 'px',
        width: (tileSize - 5) + 'px',
        height: (tileSize - 5) + 'px',
      }"
    />
    <div
      v-if="pieceToPlace"
      class="ghost-piece"
      :style="ghostStyle"
    >
    {{ String.fromCodePoint(parseInt(pieceToPlace.unicode.replace("U+", ""), 16)) }}
    </div>
    </div>
</template>

<style scoped>
.board-container{
  position: relative;
}
.grid {
  display: grid;
  position: relative;
  top: 0;
  width: 100%;
}
.tile{
  background-color: gainsboro;
  border: 2px solid black;
  aspect-ratio: 1/1;
}
.tile-empty{
  background-color: black;
}
.highlight-tile {
  position: absolute;
  background-color: rgba(0, 200, 255, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.5);
  cursor: pointer;
  z-index: 999;
}
.move-button{

}
.move-button:before {
  position: absolute;
  content: '';
  background-color: aliceblue;
}
.move-button-up:before {
  left: 10%;
  bottom: 4%;
  width: 80%;
  height: 32%;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
.move-button-down:before {
  width: 80%;
  height: 32%;
  left: 10%;
  top: 4%;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
}
.move-button-right:before {
  left: 4%;
  top: 10%;
  width: 32%;
  height: 80%;
  clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
}
.move-button-left:before {
  right: 4%;
  top: 10%;
  width: 32%;
  height: 80%;
  clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
}
.move-button:after {
  right: 0;
}
.piece-layer.piece{
  z-index: 2;
}
.green{
  background-color: rgba(21, 255, 0, 0.432);
  z-index: 1;
}
.yellow{
  background-color: rgba(255, 251, 0, 0.432);
  z-index: 3;
}
.red{
  background-color: rgba(255, 0, 0, 0.432);
  z-index: 3;
}
.ghost-piece {
  position: absolute;
  opacity: 0.5;
  pointer-events: none;
  z-index: 10;
}
</style>