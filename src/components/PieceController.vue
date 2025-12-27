<script setup lang="ts">
import { Piece } from "../Pieces"
import { ref, computed } from "vue";
import { STATUS_ICONS, STATUS_INFO } from "../statuses";

const props = defineProps<{
  piece: InstanceType<typeof Piece>
  canMove?: boolean
  canAction?: boolean
}>()

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
  <div class="piece-controller instance">
    <div class="header">
      <span class="symbol">
        {{ String.fromCodePoint(parseInt(piece.unicode.replace("U+", ""), 16)) }}
      </span>
      <span class="name">{{ piece.name }}</span>
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
          <strong>{{ key }}:</strong>{{ STATUS_INFO[key] }}
        </div>
      </span>
    </div>

    <div class="stats">
      <p class="">Size: {{ piece.tiles.length }}</p>
      <p class="text-green">Max Size: {{ piece.getStat('maxSize') }}</p>
      <p class="text-blue">Moves: {{ piece.getStat('moves') }}</p>
      <p class="text-blue">Moves Left: {{ piece.movesRemaining }}</p>
      <p class="text-orange">Range: {{ piece.getStat('range') }}</p>
      <p class="text-red">Attack: {{ piece.getStat('attack') }}</p>
      <p class="text-cyan">Defence: {{ piece.getStat('defence') }}</p>
      <p class="text-yellow">Actions: {{ piece.getStat('actions') }}</p>
    </div>

    <div class="actions">
      <button
        :disabled="!canMove || piece.moves <= 0" 
        v-if="((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed))" @click="$emit('highlightMoves', piece)">
        Move
      </button>
      <button
        :disabled="!canAction || piece.actions <= 0"
        v-if="((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed)) && piece.canAttack"
        @click="$emit('highlightTargets', piece)">
        Attack
      </button>
      <button
        v-if="piece.specialName && ((piece.team === 'player' && !piece.statuses.charmed) || (piece.team === 'enemy' && piece.statuses.charmed))"
        :disabled="!canAction || piece.actions <= 0"
        @click="$emit('highlightSpecials', piece)">
        {{ piece.specialName }}
      </button>

      <button
        v-if="piece.team === 'enemy'"
        @click="$emit('highlightTargets', piece)">
        Show Range
      </button>
    </div>
  </div>
</template>
<style scoped>
.close{
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
}
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
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.inventory-controller{
 left: unset;
 right: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.symbol {
  font-size: 1.8rem;
}

.name {
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
</style>