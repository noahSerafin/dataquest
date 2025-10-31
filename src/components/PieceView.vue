<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Coordinate } from "../types";
import { Piece, Allpieces } from "../Pieces";
import PieceController from "./PieceController.vue";

//construction-------------

const lookupPiece = (pieceName: string) => {
  return Allpieces.find(pieceClass => pieceClass.name === pieceName)
}

// Props
const props = defineProps<{
  name: string
  team: string
  tileSize: number//provided by board.vue
  headPosition: Coordinate
  pieceTiles: Coordinate[]
  mapTiles: Coordinate[]//provided by board.vue
}>();

//emits
const emit = defineEmits<{
  (e: 'highlightMoves', piece: Piece): void
  (e: 'attack', piece: Piece): void
  (e: 'special', piece: Piece): void
}>()

//local state
const piece = ref<InstanceType<typeof Piece> | null>(null);
const showController = ref(false);

// On mount, create the piece instance
onMounted(() => {
  const PieceClass = lookupPiece(props.name)
  if (!PieceClass) {
    console.error(`No piece found with name: ${props.name}`)
    return
  }
  piece.value = new PieceClass(
    props.headPosition
  )
})

// --- reactive properties derived from the piece instance ---
// Computed values

// Derived values
const unicodeSymbol = computed(() =>
  piece.value
    ? String.fromCodePoint(parseInt(piece.value.unicode.replace('U+', ''), 16))
    : ''
)

// All non-head tiles
const bodyTiles = computed(() =>
  props.pieceTiles.filter(
    (p) => p.x !== props.headPosition.x || p.y !== props.headPosition.y
  )
)

const getDirectionClass = (tile: Coordinate, index: number) => {
  if (index === 0) return '' // skip connector from head
  const prev = index === 0 ? props.headPosition : props.pieceTiles[index - 1]

  const dx = tile.x - prev.x
  const dy = tile.y - prev.y

  if (dx === 1) return 'from-left'
  if (dx === -1) return 'from-right'
  if (dy === 1) return 'from-top'
  if (dy === -1) return 'from-bottom'
  return ''
}

const pieceStyle = computed(() => {
  if (!piece.value) return {}
  return {
    left: (piece.value.headPosition.x * props.tileSize)+6 + 'px',
    top: (piece.value.headPosition.y * props.tileSize)+6 + 'px',
    position: 'absolute',
    width: props.tileSize-16 + 'px',
    height: props.tileSize-16 + 'px',
    fontSize: props.tileSize * 0.8 + 'px',
    lineHeight: props.tileSize -24 + 'px',
    backgroundColor: piece.value.color,
    '--piece-color': piece.value.color,
  }
})

const getTileStyle = (tile: Coordinate) => ({
  left: tile.x * props.tileSize+6 + "px",
  top: tile.y * props.tileSize+6 + "px",
})

//controller------------
const onHighlightMoves = (piece: Piece) => {
  emit('highlightMoves', piece) // 🔁 forward up to Board.vue

}
const handlePieceMoveClick = () => {
  if (piece.value) {
    emit('highlightMoves', piece.value)
  }
}

const onAttack = (piece) => {
  emit('attack', piece)
}

</script>

<template>
  <div
    class="board-piece"
    :class="'team-'+team"
    :name="piece?.name"
    :id="piece?.id"
    :style="pieceStyle"
    @click="showController = !showController"
  >
    {{ unicodeSymbol }}
    <button
      v-if="showController"
      class="move-btn"
      @click.stop="handlePieceMoveClick"
      title="Move this piece"
    >
      M
    </button>
  </div>
  <div
    v-for="(tile, index) in bodyTiles"
    :key="index"
    class="piece-tile"
    :class="getDirectionClass(tile, index+1)"
    :style="{
      ...pieceStyle,
      ...getTileStyle(tile),
    }"
  />
  <PieceController
    v-if="showController"
    :piece="piece"
    @highlightMoves="onHighlightMoves"
    @attack="onAttack"
    @special="console.log('Special', $event)"
  />
</template>

<style scoped>
.board-piece, .piece-tile{
  text-align: center;
  transition: all 0.2s ease;
  border: outset;
}
.board-piece:hover{
  cursor: pointer;
}
.piece-tile::before {
  content: '';
  position: absolute;
  width: 25%;
  height: 25%;
  background-color: var(--piece-color);
}

/* directional placement */
.piece-tile.from-left::before {
  left: -12.5%;
  top: 37.5%;
}
.piece-tile.from-right::before {
  right: -12.5%;
  top: 37.5%;
}
.piece-tile.from-top::before {
  top: -12.5%;
  left: 37.5%;
}
.piece-tile.from-bottom::before {
  bottom: -12.5%;
  left: 37.5%;
}
.move-btn {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  font-size: 10px;
  border: none;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  cursor: pointer;
  z-index: 5;
  transition: background 0.2s;
}
.move-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
</style>