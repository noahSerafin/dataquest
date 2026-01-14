<script setup lang="ts">
import { computed, ref } from "vue"
import type { PieceBlueprint } from "../types"

const props = defineProps<{
  piece: PieceBlueprint
  mode: "shop" | "inventory" | 'skipReward'
  canBuy?: boolean
  canPlace?: boolean
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

function showRarity(rarity: number) {
  switch (rarity) {
    case 1:
      return { text: "Common", color: "lightgreen" };

    case 2:
      return { text: "Uncommon", color: "orange" };

    case 3:
      return { text: "Rare", color: "orangered" };

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
  <div
  :class="`piece-controller ${props.mode}-controller blueprint`"
  :style="{
    transform: `translate(${position.x}px, ${position.y}px)`
  }">
    <div class="left">
      <div class="header" @mousedown="startDrag" @touchstart="startDrag">
        <span class="symbol">
          {{ String.fromCodePoint(parseInt(piece.unicode.replace("U+", ""), 16)) }}
        </span>
        <span v-if="piece.variantName" class="variant">"{{ piece.variantName }}"</span>
        <span class="name">{{ piece.hybridName ? piece.hybridName : piece.name }}</span>
        <button class="close" @click="$emit('close', piece)">X</button>
      </div>
      <div :style="{ color: rarityInfo.color }">
        {{ rarityInfo.text }}
      </div>
      <p class="desc">{{ piece.description }}</p>
    </div>
    <div class="right">
      <div class="stats">
        <p class="text-green">Max Size: {{ piece.maxSize }}</p>
        <p class="text-blue">Moves: {{ piece.moves }}</p>
        <p class="text-orange">Range: {{ piece.range }}</p>
        <p class="text-red">Attack: {{ piece.attack }}</p>
        <p class="text-cyan">Defence: {{ piece.defence }}</p>
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
.piece-controller {
  text-align: left;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 30%;
  background: #222;
  color: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0;
}
.inventory-controller{
  left: unset;
  right: 1rem;
}
.shop-controller{
  z-index: 99;
}
@media only screen and (min-width: 420px) {
  .inventory-controller{
    display: flex;
    flex-direction: row;
    width: 66%;
    padding-right: 2.5rem;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: grab;
}
.header::before{
  content: '';
  background-color: #616161;
  border-radius: 12px;
  width: 100%;
  height: 42px;
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
  font-size: 0.9rem;
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
@media (max-width: 380px) {
  .piece-controller, .inventory-controller, .skipReward-controller{
    width: 80%;
    bottom: 30%;
    z-index: 9999;
    font-size: 0.8rem;
    height: fit-content;
  }
  .skipReward-controller{
   top: 95vh;
   position: fixed;
  }
  .shop-controller p{
    margin: 0;
  }
  .shop-controller{
    width: 80%;
    top: 44vh;
  }
}
</style>
