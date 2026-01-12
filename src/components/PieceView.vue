<script setup lang="ts">
import { ref, computed } from "vue";
import type { Coordinate } from "../types";
import { Piece } from "../Pieces";
import { STATUS_ICONS } from "../statuses";

//construction-------------

// Props
const props = defineProps<{
  piece: InstanceType<typeof Piece>
  selectedPiece: InstanceType<typeof Piece> | null
  tileSize: number//provided by board.vue
  mapTiles?: Coordinate[] // optional when in inventory
  cssclass: string
  showFastControls: boolean
}>();


//local state
const showController = ref(false);//todo change to selected piece

//emits
const emit = defineEmits<{
  (e: 'select', piece: Piece): void,
  (e: "highlightTargets", piece: Piece): void,
  (e: "highlightSpecials", piece: Piece): void,
  (e: "deselect"): void
}>()

const actionToEmit = ref<string>(props.piece.canAttack? 'A' : 'S');

function cycleAction(){
  //console.log(actionToEmit.value)
  emit('select', props.piece)
  if(actionToEmit.value === 'A') {
    emit('highlightTargets', props.piece);
    if(props.piece.specialName) {
      actionToEmit.value = 'S';
    }
  }
  else if(actionToEmit.value === 'S') {
    emit('highlightSpecials', props.piece);
    if(props.piece.canAttack){
      actionToEmit.value = 'A';
    }
  }
}

//computed
const unicodeSymbol = computed(() =>
  props.piece
    ? String.fromCodePoint(parseInt(props.piece.unicode.replace('U+', ''), 16))
    : ''
)
const ExtraUnicodeSymbol = computed(() =>
  props.piece.extraUnicode
    ? String.fromCodePoint(parseInt(props.piece.extraUnicode.replace('U+', ''), 16))
    : ''
)

// --- reactive properties derived from the piece instance ---

// All non-head tiles
//TODO handle a situation where bodyTiles is empty
const bodyTiles = computed(() => 
  {
    if (!props.piece?.tiles?.length || !props.piece?.headPosition || props.piece.tiles[0] == undefined) {
      return []
    } else {
      console.log(props.piece.name, ' tiles: ', props.piece.tiles)
      return props.piece.tiles.filter(
        (p) => p.x !== props.piece.headPosition.x || p.y !== props.piece.headPosition.y
      )
    }
  }
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
  let styles = {
    left: (props.piece.headPosition.x * props.tileSize)+6 + 'px',
    top: (props.piece.headPosition.y * props.tileSize)+6 + 'px',
    width: props.tileSize-16 + 'px',
    height: props.tileSize-16 + 'px',
    fontSize: props.tileSize * 0.6 + 'px',
    lineHeight: props.tileSize -24 + 'px',
    backgroundColor: props.piece.color,
    '--piece-color': props.piece.color,
    'z-index': 2,
    position: 'unset'
  }
  if (props.cssclass === 'inventory'){
    styles.left = 'unset'
    styles.top = 'unset'
    styles.position =  'relative';
  } else {
    styles.position = 'absolute'
  }
  return styles;
})

const getTileStyle = (tile: Coordinate) => ({
  left: tile.x * props.tileSize+6 + "px",
  top: tile.y * props.tileSize+6 + "px",
})

function handleSelect() {
  showController.value = !showController.value;
  if (props.piece)       emit('select', props.piece)
}

const activeStatuses = computed((): [string, boolean][] => {
  // Object.entries returns (string | boolean)[], so we assert/carefully filter
  return Object.entries(props.piece.statuses)
    .map(([k, v]) => [k, Boolean(v)] as [string, boolean]) // normalize to boolean
    .filter(([, active]) => active);
});

</script>

<template>
  <div
  :class="`piece ${piece.headPosition.x}-${piece.headPosition.y} ${cssclass}-piece ${props.piece.extraUnicode ? 'hybrid' : ''} team-${piece.team} taking-damage-${piece.isTakingDamage} hidden-${piece.statuses.hidden} tiles:(${piece.tiles.toString()})`"
    :name="piece?.name"
    :id="piece?.id"
    :style="pieceStyle"
    @click="handleSelect"
  >
      <span v-if="piece.extraUnicode" class="extra-unicode">{{ ExtraUnicodeSymbol }}</span><span class="primary-unicode">{{ unicodeSymbol }}</span>
    <button v-if="showFastControls && selectedPiece === piece" class="deselect-btn"
    @click.stop = "$emit('deselect')"
    >x
    </button>
    <button v-if="showFastControls && selectedPiece === piece && ((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed))" class="action-btn"
    @click.stop = "cycleAction"
    >{{ actionToEmit }}
    </button>
    <div class="status-icons">
      <span
        v-for="([key]) in activeStatuses"
        :key="key"
        class="status-icon"
        title="key"          
      >
        {{ STATUS_ICONS[key] ?? '?' }}
      </span>
    </div>
  </div>
  <div
    v-for="(tile, index) in bodyTiles"
    :key="index"
    :class="`piece-tile ${tile.x}-${tile.y} ${getDirectionClass(tile, index+1)} team-${props.piece.team} hidden-${piece.statuses.hidden}`"
    :style="{
      ...pieceStyle,
      ...getTileStyle(tile),
    }"
  />
</template>

<style scoped>
.editor-piece{
  pointer-events: none;
}
.piece, .board-piece, .piece-tile{
  text-align: center;
  transition: all 0.2s ease;
  border: outset;
}
.team-enemy{
  border: outset red;
}
.piece:hover{
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
  z-index: 2;
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
.status-icons {
  position: absolute;
  display: flex;
  flex-direction: row;
  gap: 2px;
  font-size: 0.3em;
  height: 0.3em;
  margin-left: 0.2rem;
  top: -40%;
}
.action-btn, .deselect-btn{
  position: absolute;
  font-size: 10px;
  padding: 2px 5px 2px 5px;
  background-color: black;
  border: 1px solid white;
  color: white;
  right: 0;
  border-radius: 0;
  z-index: 2;
}
.action-btn{
  bottom: 0;
}
.deselect-btn{
  top: 0;
  color: red;
  font-weight: bold;
  line-height: 12px;
}
@keyframes shake {
  0% { transform: translate(0,0); }
  25% { transform: translate(-3px, 1px); }
  50% { transform: translate(3px, -2px); }
  75% { transform: translate(-2px, 2px); }
  100% { transform: translate(0,0); }
}
.taking-damage-true::after{
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: red;
  opacity: 60%;
  top: 0%;
  left: 0%;
  animation: shake 0.25s ease;
}
.team-enemy.hidden-true{
  opacity: 0;
}
.editor{
  .team-enemy.hidden-true{
     opacity: 1;
  }
}
.hybrid .primary-unicode{
  position: absolute;
  left: 5%;
  z-index: 1;
}
.hybrid .extra-unicode{
  position: absolute;
  left: 10%;
  top: 5%;
  z-index: 0;
}
</style>