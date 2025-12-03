<script setup lang="ts">
import { Piece } from "../Pieces"

const props = defineProps<{
  piece: InstanceType<typeof Piece>
  canMove?: boolean
  canAction?: boolean
}>()

defineEmits([
  "highlightMoves",
  "highlightTargets",
  "special",
  "close"
])
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

    <div class="stats">
      <p>Size: {{ piece.tiles.length }}</p>
      <p>Max Size: {{ piece.getStat('maxSize') }}</p>
      <p>Moves: {{ piece.getStat('moves') }}</p>
      <p>Moves Left: {{ piece.movesRemaining }}</p>
      <p>Range: {{ piece.getStat('range') }}</p>
      <p>Attack: {{ piece.getStat('attack') }}</p>
      <p>Defence: {{ piece.getStat('defence') }}</p>
      <p>Actions: {{ piece.getStat('actions') }}</p>
    </div>

    <div class="actions">
      <button
        :disabled="!canMove" 
        v-if="piece.team === 'player'" @click="$emit('highlightMoves', piece)">
        Move
      </button>
      <button
        :disabled="!canAction"
        v-if="piece.team === 'player' && piece.actions > 0"
        @click="$emit('highlightTargets', piece)">
        Attack
      </button>
      <button
        :disabled="!canAction"
        v-if="piece.team === 'player'"
        @click="$emit('special', piece)">
        Special
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
</style>