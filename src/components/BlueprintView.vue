<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Coordinate, PieceBlueprint } from "../types";
import { Piece } from "../Pieces";

//construction-------------

// Props
const props = defineProps<{
  //activePieces: InstanceType<typeof Piece>[]
  blueprint: PieceBlueprint
  tileSize: number//provided by board.vue
  mapTiles?: Coordinate[] // optional when in inventory
  cssclass: string
}>();


//local state
const showController = ref(false);//todo change to selected piece

//emits
const emit = defineEmits<{ 
  select:[piece:PieceBlueprint],
  sell:[piece:PieceBlueprint]
}>()

//computed
const unicodeSymbol = computed(() =>
  props.blueprint
    ? String.fromCodePoint(parseInt(props.blueprint.unicode.replace('U+', ''), 16))
    : ''
)

// --- reactive properties derived from the piece instance ---
function showRarity(rarity: number) {
  switch (rarity) {
    case 1:
      return "green";

    case 2:
      return "orange";

    case 3:
      return "red";

    case 4:
      return  "#9052f3ff";
      
    case 5:
      return "#ff0df3ff";

    case 6:
      return "gold";

    default:
      return "grey";
  }
}

const pieceStyle = computed(() => {
  if (!props.blueprint) return {}
  let styles = {
    position: 'relative',
    width: props.tileSize-16 + 'px',
    height: props.tileSize-16 + 'px',
    fontSize: props.tileSize * 0.6 + 'px',
    lineHeight: props.tileSize -24 + 'px',
    backgroundColor: props.blueprint.color,
    '--piece-color': props.blueprint.color,
    'border-color': showRarity(props.blueprint.rarity)
  }
  return styles;
})

const getTileStyle = (tile: Coordinate) => ({
  left: tile.x * props.tileSize+6 + "px",
  top: tile.y * props.tileSize+6 + "px",
})

function handleSelect() {
  if(props.cssclass == 'placing') return
  showController.value = !showController.value;
  if (props.blueprint) emit('select', props.blueprint)
}

//buy button must check for money
//must check for memory
</script>

<template>
  <div
  :class="`blueprint ${props.cssclass}-piece`"
    :name="props.blueprint?.name"
    :id="props.blueprint?.id"
    :style="pieceStyle"
    @click="handleSelect"
    @sell="$emit('sell', props.blueprint)"
  >
  <p class='top-left' v-if="cssclass==='shop'" :style="`top: -${(props.tileSize-10)/2}px`">P</p>
    {{ unicodeSymbol }}
  </div>
</template>

<style scoped>
.inventory-piece, .shop-piece{
  position: relative;
}
.blueprint, .piece, .blueprint-tile{
  text-align: center;
  transition: all 0.2s ease;
  border: outset;
}
.team-enemy{
  border: outset red;
}
.blueprint:hover{
  cursor: pointer;
}
.blueprint-tile::before {
  content: '';
  position: absolute;
  width: 25%;
  height: 25%;
  background-color: var(--piece-color);
}
.placed-true {
  opacity: 0.4;
  pointer-events: none;
}

/* directional placement */
.blueprint-tile.from-left::before {
  left: -12.5%;
  top: 37.5%;
}
.blueprint-tile.from-right::before {
  right: -12.5%;
  top: 37.5%;
}
.blueprint-tile.from-top::before {
  top: -12.5%;
  left: 37.5%;
}
.blueprint-tile.from-bottom::before {
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
.top-left{
  font-weight: bold;
  font-size: 12px;
  position: absolute;
  top: 1px;
  left: 1px;
}
</style>