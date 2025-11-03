<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Coordinate } from "../types";
import { Piece, Allpieces } from "../Pieces";
import PieceController from "./PieceController.vue";

//construction-------------

// Props
const props = defineProps<{
  piece: InstanceType<typeof Piece>
  //name: string
  //team: string
  //headPosition: Coordinate
  //pieceTiles: Coordinate[]
  tileSize: number//provided by board.vue
  mapTiles: Coordinate[]//provided by board.vue
}>();


//local state
const showController = ref(false);//todo change to selected piece

//emits
const emit = defineEmits<{ 
  select:[piece:Piece],
}>()

//computed
const unicodeSymbol = computed(() =>
  props.piece
    ? String.fromCodePoint(parseInt(props.piece.unicode.replace('U+', ''), 16))
    : ''
)

// --- reactive properties derived from the piece instance ---

// All non-head tiles
const bodyTiles = computed(() =>
  props.piece.tiles.filter(
    (p) => p.x !== props.piece.headPosition.x || p.y !== props.piece.headPosition.y
  )
)

const getDirectionClass = (tile: Coordinate, index: number) => {
  const prev = props.piece.tiles[index - 1]
  if (!prev) return ''

  const dx = prev.x - tile.x
  const dy = prev.y - tile.y

  if (dx === 1) return 'from-right'
  if (dx === -1) return 'from-left'
  if (dy === 1) return 'from-bottom'
  if (dy === -1) return 'from-top'

  return ''
}

const pieceStyle = computed(() => {
  if (!props.piece) return {}
  return {
    left: (props.piece.headPosition.x * props.tileSize)+6 + 'px',
    top: (props.piece.headPosition.y * props.tileSize)+6 + 'px',
    position: 'absolute',
    width: props.tileSize-16 + 'px',
    height: props.tileSize-16 + 'px',
    fontSize: props.tileSize * 0.8 + 'px',
    lineHeight: props.tileSize -24 + 'px',
    backgroundColor: props.piece.color,
    '--piece-color': props.piece.color,
  }
})

const getTileStyle = (tile: Coordinate) => ({
  left: tile.x * props.tileSize+6 + "px",
  top: tile.y * props.tileSize+6 + "px",
})

function handleSelect() {
  showController.value = !showController.value;
  if (props.piece) emit('select', props.piece)
}

//controller------------
const handlePieceMoveClick = () => {
  if (props.piece) {
   // emit('highlightMoves', props.piece)
  }
}

const onAttack = (piece : Piece) => {
 // emit('attack', piece)
}

</script>

<template>
  <div
    class="board-piece"
    :class="'team-'+props.piece.team"
    :name="piece?.name"
    :id="piece?.id"
    :style="pieceStyle"
    @click="handleSelect"
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