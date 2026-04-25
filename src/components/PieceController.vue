<script setup lang="ts">
import { Piece } from "../Pieces"
import { ref, computed } from "vue";
import { STATUS_ICONS, STATUS_INFO } from "../statuses";

const props = defineProps<{
  piece: InstanceType<typeof Piece>
  canMove?: boolean
  canAction?: boolean
  defaultPosition?: {
    x: number
    y: number
  }
}>()

const position = ref({
  x: props.defaultPosition?.x ?? 20,
  y: props.defaultPosition?.y ?? 20
});

let dragging = false
let startX = 0
let startY = 0

function startDrag(e: MouseEvent | TouchEvent) {
  dragging = true

  const point = 'touches' in e ? e.touches[0] : e
  startX = point.clientX - position.value.x
  startY = point.clientY - position.value.y

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', stopDrag)
}

function onMove(e: MouseEvent | TouchEvent) {
  if (!dragging) return
  e.preventDefault()

  const point = 'touches' in e ? e.touches[0] : e

  position.value.x = point.clientX - startX
  position.value.y = point.clientY - startY
}

function stopDrag() {
  dragging = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', stopDrag)
}

defineEmits([
  "highlightMoves",
  "highlightTargets",
  "highlightSpecials",
  "close"
])

const activeStatuses = computed((): [string, boolean][] => {
  // Object.entries returns (string | boolean)[], so we assert/carefully filter
  return Object.entries(props.piece.statuses)
    .map(([k, v]) => [k, Boolean(v)] as [string, boolean]) // normalize to boolean
    .filter(([, active]) => active);
});

const activeImmunities = computed((): [string, boolean][] => {
  // Object.entries returns (string | boolean)[], so we assert/carefully filter
  return Object.entries(props.piece.immunities)
    .map(([k, v]) => [k, Boolean(v)] as [string, boolean]) // normalize to boolean
    .filter(([, active]) => active);
});


const openTooltip = ref<string|null>(null);
function toggleTooltip(key: string) {
  // If clicking the already-open one, close it
  if (openTooltip.value === key) {
    openTooltip.value = null;
    return;
  }
  // Otherwise open the new one (AND close all others automatically)
  openTooltip.value = key;
}
</script>

<template>
  <div :class="`piece-controller instance v_${piece.variantName} redacted-${piece.redacted}`" :style="{
    transform: `translate(${position.x}px, ${position.y}px)`
  }">
    <div :class="`header ${piece.variantName ? ('variant-header v_'+piece.variantName) : ''}`" @mousedown="startDrag" @touchstart="startDrag">
      <div class="symbol-container">
        <span class="symbol">
          {{ String.fromCodePoint(parseInt(piece.unicode.replace("U+", ""), 16), 0xFE0F) }}
        </span>
        <span class="extra-symbol">
          {{ piece.extraUnicode ? String.fromCodePoint(parseInt(piece.extraUnicode.replace("U+", ""), 16), 0xFE0F) : '' }}
        </span>
      </div>
      <span v-if="piece.variantName" class="variant">{{ piece.variantName }}</span>
      <span class="name">{{ piece.hybridName ? piece.hybridName : piece.name }}</span>
      <button class="close" @click="$emit('close', piece)">X</button>
    </div>

    <p class="desc">{{ piece.description }}</p>

    <div class="controller-status-list">
      <span
        v-for="([key]) in activeStatuses"
        :key="key"
        class="status-icon"
        title="key"  
        @click="toggleTooltip(key)"        
      >
        {{ STATUS_ICONS[key] ?? '?' }}
         <!-- Tooltip -->
        <div
          v-if="openTooltip === key"
          class="tooltip-popup"
        >
          <strong>{{ key }}:</strong> {{ STATUS_INFO[key] }}
        </div>
      </span>
    </div>

    <div class="stats">
      <p class="stat stat-maxsize text-green">Max Size: <span class='stat'>{{ piece.getStat('maxSize') }}</span> Current: {{ piece.tiles.length }}</p>
      <p class="stat stat-moves text-blue">Moves: <span class='stat'>{{ piece.getStat('moves') }}</span> <span>Left: <span class='stat'>{{ piece.movesRemaining }}</span></span></p>
      <p class="stat stat-range text-orange">Range: <span class='stat'>{{ piece.getStat('range') }}</span></p>
      <p class="stat stat-attack text-red">Attack: <span class='stat'>{{ piece.getStat('attack') }}</span><span v-if="piece.damageMult > 1"> x{{ piece.damageMult }}</span></p>
      <p class="stat stat-defence text-cyan">Defence: <span class='stat'>{{ piece.getStat('defence') }}</span> <span>Left: <span class="stat">{{ Math.max(0, piece.defenceRemaining) }}</span></span></p>
      <p class="stat stat-actions text-yellow">Actions: <span class='stat'>{{ piece.getStat('actions') }}</span></p>
      <p class="immunities" v-if="activeImmunities.length > 0">Immune to:
        <span
        v-for="([key]) in activeImmunities"
        :key="key"
        class="status-icon"
        title="key"  
        @click="toggleTooltip(key)"        
        >{{ STATUS_ICONS[key] ?? '?' }}
        </span>
      </p>
    </div>

    <div class="actions">
      <button
        class="mv-btn"
        :disabled="!canMove || piece.moves <= 0" 
        v-if="((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed))" @click="$emit('highlightMoves', piece)">
        Move
      </button>
      <button
        class="atk-btn"
        :disabled="!canAction || piece.actions <= 0"
        v-if="((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed)) && piece.canAttack"
        @click="$emit('highlightTargets', piece)">
        Attack
      </button>
      <button
        class="special-btn"
        v-if="piece.specialName && ((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed))"
        :disabled="!canAction || piece.actions <= 0"
        @click="$emit('highlightSpecials', piece)">
        {{ piece.specialName }}
      </button>

      <button
        class="atk-btn"
        v-if="piece.team === 'enemy'"
        @click="$emit('highlightTargets', piece)">
        Show Range
      </button>
    </div>
  </div>
</template>
<style scoped>
.piece-controller {
  text-align: left;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 17%;
  min-width: 180px;
  background: #222;
  color: #fff;
  padding: 1rem;
  padding-top: 0;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: fit-content;
}
.inventory-controller{
 left: unset;
 right: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
 cursor: grab;
}
.header::before{
  content: '';
  background-color: #363636;
  border-radius: 12px;
  width: 100%;
  height: 50px;
  left: 0;
  top: 0;
  z-index: -1;
  position: absolute;
}
.close{
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border: 1px solid white;
  cursor: pointer;
}

.symbol {
  font-size: 1.8rem;
}

.variant, .name {
  font-weight: bold;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

button {
  background: #555;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
button:hover {
  background: #777;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
p{
  margin-top: 5px;
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid white;
}
.desc{
  border-bottom: none;
}

.status-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.status-icon {
  position: relative;
  font-size: 24px;
  cursor: pointer;
}
.tooltip {
  position: absolute;
  top: 32px;
  left: 0;
  padding: 8px;
  background: #222;
  color: white;
  border-radius: 6px;
  width: 180px;
  font-size: 24px;
  z-index: 100;
  box-shadow: 0 2px 8px #0005;
}
.tooltip-popup{
  font-size: 0.5em;
}
#overlay-root.piece-controller{
  width: 100%;
}
@media (max-width: 500px) {
  .piece-controller, .inventory-controller{
    position: fixed;
    top: 85vh;
    width: fit-content;
    z-index: 999;
    padding: 0.5rem;
    left: 0.5rem;
    p{
      font-size: 0.7rem;
      margin: 0;
    }
  }
}
.symbol, .variant, .name, .desc, .stat{
  position: relative;
}

.redacted-true .symbol::after, .redacted-true .variant::after, .redacted-true .name::after, .redacted-true .desc::after, .redacted-true .stat::after, .immunities::after{
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 3;
  top: 0;
  left: 0;
}
.mv-btn{
  border-color: rgb(0, 162, 255);
}
.atk-btn{
  border-color: #f32d2d;
}
.special-btn{
  border-color: rgb(235, 190, 45);
}
.symbol-container{
  position: relative;
}
.extra-symbol{
  position: absolute;
  left: 20%;
  top: 10%;
  z-index: 0;
}
.stat{
  position: relative;
}
</style>
