<script setup lang="ts">
import {computed} from "vue"
import type { PieceBlueprint } from "../types"
import { Player } from "../Player.ts";
import BlueprintView from "./BlueprintView.vue";
import { Item } from "../Items.ts";
import ItemView from "./ItemView.vue";
import { Admin } from "../AdminPrograms.ts";
import BlueprintController from "./BlueprintController.vue";

const emit = defineEmits<{
  (e: 'buy-blueprint', blueprint: PieceBlueprint): void;
  (e: 'buy-item', item: Item): void;
  (e: 'refresh-shop'): void;
  (e: 'selectTarget', target: Item | PieceBlueprint | null): void;
  (e: 'clearTarget'): void;
  (e: 'toggleShop'): void;
  //close shop, open map
}>();

const props = defineProps<{
  cssclass: string;
  shopBlueprints: PieceBlueprint[];
  shopItems: InstanceType<typeof Item>[];
  rerollCost: number;
  player: Player;
  target: Item | PieceBlueprint | null;
}>();

function openShopController(target: Item | PieceBlueprint | null) {///TODO SORT OUT IMPORTS
  //selectedPiece.value = piece;
  emit('selectTarget', target)
}
function deselect() {
  emit('clearTarget')
}

function handleBuyBlueprint(blueprint: PieceBlueprint) {
  emit("buy-blueprint", blueprint);
}
function handleBuyItem(item: Item) {
  emit("buy-item", item);
}
//        @select="openItemController"

//canAfford???
const effectiveMoney = computed(() => (props.player.admins.some(a => a.name === 'CreditCard')? props.player.money + 20 : props.player.money));

const canReroll = computed(() => props.player.money >= props.rerollCost);

const canBuyItem = ((item: Item) => {
  if (item instanceof Admin) {
    return effectiveMoney.value >= item.cost && props.player.admins.length < props.player.adminSlots;
  }

  const hasToolbox = props.player.admins.some(a => a.name === 'Toolbox');
  const hasTrolley = props.player.admins.some(a => a.name === 'Trolley');

  const effectivePrograms = props.player.programs.length * (hasTrolley ? 0.5 : 1);
  const effectiveItems    = props.player.items.length    * (hasToolbox ? 0.5 : 1);

  const memoryUsed = effectivePrograms + effectiveItems;

  return effectiveMoney.value >= item.cost && memoryUsed < props.player.memory;
});

const canBuyPiece = ((piece: PieceBlueprint) => {
  const hasToolbox = props.player.admins.some(a => a.name === 'Toolbox');
  const hasTrolley = props.player.admins.some(a => a.name === 'Trolley');

  const effectivePrograms = props.player.programs.length * (hasTrolley ? 0.5 : 1);
  const effectiveItems    = props.player.items.length    * (hasToolbox ? 0.5 : 1);

  const memoryUsed = effectivePrograms + effectiveItems;

  return effectiveMoney.value >= piece.cost && memoryUsed < props.player.memory;
});

const type = ((item: Item) => {
  console.log(item instanceof Admin)
  return ((item instanceof Admin) ? "admin" : "consumable")
});
</script>

<template>
  <div class="container shop-container"
    :class="props.cssclass">
    <h2>Shop</h2>
    <button
      :disabled="!canReroll"
      @click="emit('refresh-shop')">
      Reroll {{ props.rerollCost }}
    </button>
    <div class="blueprint-row">
      Programs:
      <BlueprintView
        v-for="bp in props.shopBlueprints"
        :key="bp.id"
        :blueprint="bp"
        :tileSize="60"
        cssclass="shop"
        :class="'placed-'+bp.isPlaced"
        @select="openShopController"
        @deselect="deselect"
      />
    </div>
    <div class="item-row">
      Items:
      <ItemView 
        v-for="item in props.shopItems"
        :item="item"
        :type="type(item)"
        cssclass="shop"
        :tileSize="60"
        :canBuy= "canBuyItem(item)"
        :showController="(props.target === item)"
        @buy="handleBuyItem"
        @select="openShopController"
        @deselect="deselect"
      />
    </div>
    <BlueprintController
      v-if="props.target && !(props.target instanceof Item)"
      :piece="props.target"
      mode="shop"
      :canBuy= "canBuyPiece(props.target)"
      @buy="handleBuyBlueprint"
      @close="deselect"
    />
    <div class="btn-container-centered">
      <button
      class="proceed-btn"
      @click="emit('toggleShop')">
        Proceed
      </button>
    </div>
  </div>
</template>

<style scoped>
.shop-container{
  background-color: black;
  border: 1px dashed white;
  position: absolute;
  z-index: 10;
  width: 54%;
  height: 60%;
  transition: transform 0.3s ease;
  top: 20%;
  z-index: 99;
}
.blueprint-row, .item-row {
  display: flex;
  justify-content: space-around;
  margin: auto; /* center horizontally */
  position: relative;
  top: 10%;
  left: 0;
}
.item-row{
  top: 20%;
} 
.tile{
  background-color: gainsboro;
  border: 2px solid black;
  width: 100%;
  height: 100%;
}
.tile-empty{
  background-color: black;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-container-centered{
  left: 0;
  position: absolute;
  bottom: 3rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
.visible {
  transform: translateY(0);
}
.collapsed {
  transform: translateY(500%);
}
</style>