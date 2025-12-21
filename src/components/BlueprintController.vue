<script setup lang="ts">
import { computed } from "vue"
import type { PieceBlueprint } from "../types"

const props = defineProps<{
  piece: PieceBlueprint
  mode: "shop" | "inventory"
  canBuy?: boolean
  canPlace?: boolean
}>()

function showRarity(rarity: number) {
  switch (rarity) {
    case 1:
      return { text: "Common", color: "lightgreen" };

    case 2:
      return { text: "Uncommon", color: "orangered" };

    case 3:
      return { text: "Rare", color: "red" };

    case 4:
      return { text: "Very Rare", color: "#9052f3ff" };

    case 5:
      return { text: "Black Market", color: "#ff0df3ff" };

    case 6:
      return { text: "Legendary", color: "gold" };

    default:
      return { text: "Unknown", color: "grey" };
  }
}

const rarityInfo = computed(() => showRarity(props.piece.rarity));

defineEmits(["buy", "sell", "highlightPlacements", "close"])
</script>

<template>
  <div :class="`piece-controller ${props.mode}-controller blueprint`">
    <div class="left">
      <div class="header">
        <span class="symbol">
          {{ String.fromCodePoint(parseInt(piece.unicode.replace("U+", ""), 16)) }}
        </span>
        <span class="name">{{ piece.name }}</span>
        <button class="close" @click="$emit('close', piece)">X</button>
      </div>
      <div :style="{ color: rarityInfo.color }">
        {{ rarityInfo.text }}
      </div>
      <p class="desc">{{ piece.description }}</p>
    </div>
    <div class="right">
      <div class="stats">
        <p>Max Size: {{ piece.maxSize }}</p>
        <p>Moves: {{ piece.moves }}</p>
        <p>Range: {{ piece.range }}</p>
        <p>Attack: {{ piece.attack }}</p>
        <p>Defence: {{ piece.defence }}</p>
      </div>

      <div class="actions">
        <template v-if="mode === 'shop'">
          <button :disabled="!canBuy" @click="$emit('buy', piece)">
            Buy (${{ piece.cost }})
          </button>
        </template>

        <template v-if="mode === 'inventory'" class="action-btns">
          <button :disabled="!canPlace" @click="$emit('highlightPlacements', piece)" style="margin-right: 0.2rem;">Place</button>
          <button @click="$emit('sell', piece)">Sell (${{ piece.rarity }})</button>
        </template>
      </div>
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
  width: 20%;
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
@media only screen and (min-width: 420px) {
  .inventory-controller{
    display: flex;
    flex-direction: row;
    width: 40%;
    padding-right: 2.5rem;
  }
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
.action-btns button{
  width: 50%;
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
.shop-controller{
  bottom: unset;
  top: 1rem;
}
</style>
