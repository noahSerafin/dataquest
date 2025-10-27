<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import type { Coordinate } from "../types"
import type { Piece } from "../Pieces"

defineProps<{ piece: InstanceType<typeof Piece> | null }>()
defineEmits(['move', 'attack', 'special'])

/*
 <button
          v-if="typeof piece.special === 'function'"
          @click="$emit('special', piece)"
        >
          Special
        </button>
*/
</script>

<template>
  <transition name="fade">
    <div v-if="piece" class="piece-controller">
      <div class="header">
        <span class="symbol">
          {{ String.fromCodePoint(parseInt(piece.unicode.replace('U+', ''), 16)) }}
        </span>
        <span class="name">{{ piece.name }}</span>
      </div>

      <p class="desc">{{ piece.description }}</p>

      <div class="stats">
        <p>Max Size: {{ piece.maxSize }}</p>
        <p>Moves: {{ piece.moves }}</p>
        <p>Range: {{ piece.range }}</p>
        <p>Attack: {{ piece.attack }}</p>
        <p>Defence: {{ piece.defence }}</p>
      </div>

      <div class="actions">
        <button @click="$emit('move', piece)">Move</button>
        <button @click="$emit('attack', piece)">Attack</button>
       
      </div>
    </div>
  </transition>
</template>

<style scoped>
.piece-controller {
  text-align: left;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 15%;
  background: #222;
  color: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>