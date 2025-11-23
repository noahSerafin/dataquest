<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import type { Coordinate, PieceBlueprint } from "../types"
import { Piece } from "../Pieces"

const props = defineProps<{ 
  piece: InstanceType<typeof Piece> | PieceBlueprint
  mode: 'shop' | 'inventory' | 'action'
}>()

// Type guard: true if this is a real in-game instance
function isInstance(p: any): p is InstanceType<typeof Piece> {
  return p instanceof Piece
}

defineEmits(['highlightMoves', 'attack', 'special', 'highlightPlacements', 'highlightTargets', 'sell', 'buy'])//TODO place goes in board/player //sell goes in player

function showRarity(rarity: number) {
  switch (rarity) {
    case 1:
      return { text: "Common", color: "green" };

    case 2:
      return { text: "Uncommon", color: "orange" };

    case 3:
      return { text: "Rare", color: "red" };

    case 4:
      return { text: "Ultra Rare", color: "#9052f3ff" };

    case 5:
      return { text: "Black Market", color: "pink" };

    case 6:
      return { text: "Legendary", color: "gold" };

    default:
      return { text: "Unknown", color: "grey" };
  }
}

const rarityInfo = computed(() => showRarity(props.piece.rarity));
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
    <div v-if="piece" class="piece-controller" :class="mode+'-controller'">
      <div class="header">
        <span class="symbol">
          {{ String.fromCodePoint(parseInt(piece.unicode.replace('U+', ''), 16)) }}
        </span>
        <span class="name">{{ piece.name }}</span>
      </div>
      <div v-if="mode === 'shop'">- program -</div>

      <p class="desc">{{ piece.description }}</p>
      <div :style="{ color: rarityInfo.color }">
        {{ rarityInfo.text }}
      </div>
      <div class="stats">
        <p v-if="isInstance(piece)">Size: {{ piece.tiles.length }}</p>
        <p>Max Size: {{ piece.maxSize }}</p>
        <p>Moves: {{ piece.moves }}</p>
        <p v-if="isInstance(piece)">Moves left: {{ piece.movesRemaining }}</p>
        <p>Range: {{ piece.range }}</p>
        <p>Attack: {{ piece.attack }}</p>
        <p>Defence: {{ piece.defence }}</p>
        <p v-if="isInstance(piece)">Actions: {{ piece.actions }}</p>
      </div>

      <div class="actions">
        <template v-if="mode === 'shop'">
          <button @click="$emit('buy', piece)">Buy (${{ piece.rarity * 2 - 1 }})</button>
        </template>
        <template v-if="mode === 'inventory'">
          <button @click="$emit('highlightPlacements', piece)">Place</button>
          <button @click="$emit('sell', piece)">Sell (${{ piece.rarity}})</button>
        </template>
        <template v-else-if="isInstance(piece)">
          <button v-if="piece.team == 'player'" @click="$emit('highlightMoves', piece)">Move</button>
          <button v-if="piece.team == 'player' && piece.actions > 0" @click="$emit('highlightTargets', piece)">Attack</button>
          <button v-if="piece.team == 'enemy'" @click="$emit('highlightTargets', piece)">Show Range</button>
          <button v-if="piece.team == 'player'" @click="$emit('special', piece)">Special</button>
        </template>
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