<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { Coordinate } from "../types"
import PieceView from "./PieceView.vue";
import PieceController from "./PieceController.vue";
import type { Piece } from "../Pieces"
import { Allpieces } from "../Pieces"

interface Props{
  tiles : Coordinate[]
  pieces: Piece[]
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

// Make a Set for fast lookup
//will need to be ref if you have a bitman
const tileSet = computed(() => new Set(props.tiles.map(t => `${t.x},${t.y}`)))

//pieceMap to track occupied spaces
const activePieces = ref<InstanceType<typeof Piece>[]>([]);

function rehydratePieces(rawPieces: any[]): InstanceType<typeof Piece>[] {
  return rawPieces.map(p => {
    const PieceClass = Allpieces.find(cls => cls.name === p.name)
    return PieceClass ? Object.assign(new PieceClass(p.headPosition), p) : p
  })
}

onMounted(() => {
  activePieces.value = rehydratePieces(props.pieces);
})

// Fast lookup: "x,y" → piece reference
const pieceMap = computed(() => {
  const map = new Map<string, InstanceType<typeof Piece>>()
  activePieces.value.forEach(piece => {
    piece.tiles.forEach(tile => {
      map.set(`${tile.x},${tile.y}`, piece)
    })
  })
  console.log('piecemap:', map)
  return map
});

const isOccupied = (x: number, y: number) => pieceMap.value.has(`${x},${y}`);

const selectedPiece = ref<Piece | null>(null)

function handlePieceSelect(piece: Piece) {
  selectedPiece.value = piece
}

//change to one move at a time
function getAvailableMoves(
  piece: Piece,
  tileSet: Set<string>, // the valid board tiles like "x,y"
  pieceMap: Map<string, Piece> // all occupied tiles by other pieces
): Coordinate[] {
  if (piece.movesRemaining <= 0) return [] // no moves left

  const { x, y } = piece.headPosition
  const potentialMoves: Coordinate[] = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 }
  ]

  return potentialMoves.filter(pos => {
    const key = `${pos.x},${pos.y}`
    return tileSet.has(key) && !pieceMap.has(key)
  })
}

const moveHighlights = ref<Coordinate[]>([])

const highlightMoves = (piece: InstanceType<typeof Piece>) => {
  moveHighlights.value = getAvailableMoves(piece, tileSet.value, pieceMap.value);
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
      v-for="piece in activePieces"
      class="piece-layer"
      :key="piece.id"
    >
      <PieceView :name="piece.name"
      :team="piece.team"
      :tileSize=tileSize
      :headPosition="piece.headPosition"
      :pieceTiles="piece.tiles"
      :mapTiles = props.tiles
      @highlightMoves="highlightMoves"
      />
    </div>
    <!-- Highlights -->
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
    <!--&& selectedPiece.team === 'player'"-->
    <PieceController
      v-if="selectedPiece"
      :piece="selectedPiece"
      @highlightMoves="highlightMoves"
      />
      <!--
        @attack="onAttack"
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
  pointer-events: none;
}
</style>