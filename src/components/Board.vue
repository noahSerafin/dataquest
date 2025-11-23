<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
import PieceView from "./PieceView.vue";
import PieceController from "./PieceController.vue";
import { Piece } from "../Pieces"

interface Props{
  tiles : Coordinate[]//Set<string>
  pieces: Piece[]
  placementHighlights: Coordinate[]
  placementMode: boolean
  isFirstTurn: boolean
  hasFinishedTurn: boolean
}
const props = defineProps<Props>()
//console.log('pm: ', props.placementMode)
//console.log('in board: ', props.placementHighlights.length);

const emit = defineEmits<{
  (e: 'place-on-board', coord: Coordinate): void
}>()
function handlePlaceClick(tile: Coordinate) {
  if (!props.placementMode) return
  if (!props.placementHighlights.some(h => h.x === tile.x && h.y === tile.y)) return
  emit('place-on-board', tile)
}

// Make a Set for fast lookup
//will need to be ref if you have a bitman
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
  vw.value = window.innerWidth * 0.7
  vh.value = window.innerHeight * 0.7
}
onMounted(() => window.addEventListener("resize", updateSize));
onBeforeUnmount(() => window.removeEventListener("resize", updateSize));

// Compute tile size
const tileSize = computed(() => {
  if (cols.value === 0 || rows.value === 0) return 0
  return Math.min(vw.value / cols.value, vh.value / rows.value)
})

// Board dimensions
const boardWidth = computed(() => tileSize.value * cols.value)
const boardHeight = computed(() => tileSize.value * rows.value)



// Fast lookup: "x,y" → piece reference
const pieceMap = computed(() => {
  const map = new Map<string, InstanceType<typeof Piece>>()
  props.pieces.forEach(piece => {
    piece.tiles.forEach(tile => {
      map.set(`${tile.x},${tile.y}`, piece)
    })
  })
  //console.log('piecemap:', map)
  return map
});

const isOccupied = (x: number, y: number) => pieceMap.value.has(`${x},${y}`);

const selectedPiece = ref<Piece | null>(null)
function handlePieceSelect(piece: Piece) {//handleselect
  selectedPiece.value = piece
  //highlight range
  if(piece.team === 'enemy'){
    highlightTargets(piece);
  } else {
    highlightMoves(piece);
  }
}

//cleanup
const moveButtons = ref<Array<{ x: number; y: number; direction: string }>>([]);
const moveHighlights = ref<Coordinate[]>([]);
const inRangeHighlights = ref<Coordinate[]>([]);
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
    const key = `${pos.x},${pos.y}`
    return tileSet.has(key) && !pieceMap.has(key)
  })
}

function highlightMoveRange(piece: InstanceType<typeof Piece>){
 //console.log('movesquares:', moveHighlights);
}

const highlightMoves = (piece: InstanceType<typeof Piece>) => {
  clearHighlights();
  moveHighlights.value = getTilesInRange(piece.headPosition, piece.movesRemaining, tileSet.value)
  moveButtons.value = getAvailableMoves(piece, tileSet.value, pieceMap.value);
}

const clearHighlights = () => {
  moveHighlights.value = [];
  inRangeHighlights.value = [];
  moveButtons.value = [];
}

const movePiece = (coord : Coordinate) => {//todo moves piece, but does not add more tiles visually
  if(!selectedPiece.value) return;
  if (selectedPiece.value.team !== 'player') return;
    moveButtons.value = []
    selectedPiece.value?.moveTo(coord);
  if(selectedPiece.value.movesRemaining > 0){
    highlightMoves(selectedPiece.value);
  }else {
    clearHighlights();
  }
  //console.log('tiles: ', selectedPiece.value.tiles);
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

function checkTileIsOccupied(coord:Coordinate): Piece | undefined{
  return pieceMap.value.get(`${coord.x},${coord.y}`);
}

//(damageReceiver: InstanceType<typeof Piece>) => {

const damagePieceAt = (coord:Coordinate) => {
  //console.log('props pieces:', props.pieces.map(p => p.tiles))
  //console.log('selected:', selectedPiece.value)
  if (!selectedPiece.value) return
  if (selectedPiece.value.team !== 'player') return
  //console.log('looking at ', coord, 'in ', props.pieces)
  const damageReceiver = props.pieces.find(piece =>
    piece.tiles.some(t => t.x === coord.x && t.y === coord.y)
  );
  //console.log('receiver: ', damageReceiver?.name)
  if (!damageReceiver || damageReceiver.team === selectedPiece.value.team) return;
  const damage = selectedPiece.value.attack;
  //console.log("Damage call:", coord, damage)
  damageReceiver.takeDamage(damage);
  selectedPiece.value.actions --
  //console.log(damageReceiver?.name, ' tiles afterdmg: ', damageReceiver.tiles)
  clearHighlights();
}

const highlightTargets = (piece: InstanceType<typeof Piece>) => {
  clearHighlights();
  inRangeHighlights.value = getTilesInRange(
    piece.headPosition,
    piece.range,
    tileSet.value,
  ); 
}

//attackHighlights.value = getTilesInRange(piece, tileSet.value, pieceMap.value);

defineExpose({
  highlightMoves,
  highlightTargets,
  clearHighlights
});

const deselect = () => {
  selectedPiece.value = null;
  clearHighlights();
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
    <div
      v-for="piece in pieces"
      class="piece-layer"
      :key="piece.id"
    >
      <PieceView :piece="piece"
      :tileSize=tileSize
      :mapTiles = props.tiles
      cssclass = "board"
      @select="handlePieceSelect"
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
        left: tile.x * tileSize + 'px',
        top: tile.y * tileSize + 'px',
        width: tileSize + 'px',
        height: tileSize + 'px',
      }"
    />
    <div
      v-for="(tile, index) in moveButtons"
      :key="index"
      class="highlight-tile"
      :class="['move-button', `move-button-${tile.direction}`]"
      v-on:click="movePiece(tile)"
      :style="{
        left: tile.x * tileSize + 'px',
        top: tile.y * tileSize + 'px',
        width: tileSize + 'px',
        height: tileSize + 'px',
      }"
    />
    <div
    v-for="(tile, index) in inRangeHighlights"
    :key="index"
    :id="`atk-${tile.x}-${tile.y}`"
      class="highlight-tile red"
      v-on:click="damagePieceAt(tile)"
      :style="{
        left: tile.x * tileSize + 'px',
        top: tile.y * tileSize + 'px',
        width: tileSize + 'px',
        height: tileSize + 'px',
      }"
    />
    <div
      v-if="props.placementMode || props.isFirstTurn" v-for="(tile, index) in props.placementHighlights"
      :key="index"
      class="highlight-tile yellow"
      v-on:click="handlePlaceClick(tile)"
      :style="{
        left: tile.x * tileSize + 'px',
        top: tile.y * tileSize + 'px',
        width: tileSize + 'px',
        height: tileSize + 'px',
      }"
    />
    <!--&& selectedPiece.team === 'player'"-->
    <PieceController
      v-if="selectedPiece && !hasFinishedTurn"
      :piece="selectedPiece"
      mode="action"
      :hasFinishedTurn="hasFinishedTurn"
      :canBuy="false"
      @highlightMoves="highlightMoves"
      @highlightTargets="highlightTargets"
      @close="deselect"
      />
      <!--
        @special="console.log('Special', $event)"
      -->
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
.highlight-tile {
  position: absolute;
  background-color: rgba(0, 200, 255, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.5);
  cursor: pointer;
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
.yellow{
  background-color: rgba(255, 251, 0, 0.432);
  z-index: 1;
}
.red{
  background-color: rgba(255, 0, 0, 0.432);
  z-index: 3;
}
</style>