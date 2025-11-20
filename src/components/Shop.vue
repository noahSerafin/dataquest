<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { PieceBlueprint } from "../types"
import { Piece } from "../Pieces.ts"
import { Player } from "../Player.ts";
import BlueprintView from "./BlueprintView.vue";
import { allPieces } from "../Pieces"
import PieceController from "./PieceController.vue";
import { Item, allItems } from "../Items.ts";
import ItemView from "./ItemView.vue";
import { Admin } from "../AdminPrograms.ts";

const emit = defineEmits<{
  (e: 'buy-blueprint', blueprint: PieceBlueprint): void;
  (e: 'buy-item', item: Item): void;
  (e: 'buy-admin', admin: Admin): void;
  (e: 'refresh-shop'): void;
}>();

const props = defineProps<{
  shopBlueprints: PieceBlueprint[];
  shopItems: InstanceType<typeof Item>[];
  rerollCost: number;
  player: Player;
}>();

//const shopBlueprints = ref<PieceBlueprint[]>([]);
//const shopItems = ref<Item[]>([]);
const selectedPiece = ref<PieceBlueprint | null>(null)

function openShopController(piece: PieceBlueprint) {///TODO SORT OUT IMPORTS
  selectedPiece.value = piece;
}

function handleBuyBlueprint(blueprint: PieceBlueprint) {
  emit("buy-blueprint", blueprint);
}
function handleBuyItem(item: Item) {
  emit("buy-item", item);
}
function handleBuyAdmin(admin: Admin) {
  emit("buy-admin", admin);
}
//        @select="openItemController"

//canAfford???

const canReroll = computed(() => props.player.money >= props.rerollCost);

const canBuyItem = ((item: Item) => {
  //check if item {
  return (props.player.money >= item.cost && props.player.programs.length + props.player.items.length < props. player.memory);
  //} then must check for admin slots if admin
});
</script>

<template>
  <div class="shop-container">
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
      />
    </div>
    <div class="item-row">
      Items:
      <ItemView 
        v-for="item in props.shopItems"
        :item="item"
        type="consumable"
        cssclass="shop"
        :tileSize="60"
        :canBuy= "canBuyItem(item)"
        @buy="handleBuyItem"
      />
    </div>
    <PieceController
        v-if="selectedPiece"
        :piece="selectedPiece"
        mode="shop"
        @buy="handleBuyBlueprint"
        />
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
</style>