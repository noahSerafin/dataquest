<script setup lang="ts">
import {computed, watchEffect} from "vue"
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
  (e: 'closeShop'): void;
  //close shop, open map
}>();

const props = defineProps<{
  cssclass: string;
  shopBlueprints: PieceBlueprint[];
  shopItems: InstanceType<typeof Item>[];
  rerollCost: number;
  player: Player;
  target: Item | PieceBlueprint | null;
  shopDisabled: boolean;//not updating with shop???
  canProceed: boolean;
  hasStolen: boolean;
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

const canReroll = computed(() => props.player.effectiveMoney >= props.rerollCost && !props.shopDisabled);
const canSteal = computed(() => props.player.hasAdmin('Five Finger Discount') && !props.hasStolen && !props.shopDisabled);

const canBuyItem = ((item: Item) => {
  if(props.shopDisabled) return false;
  if (item instanceof Admin) {
    return (props.player.effectiveMoney >= item.cost || canSteal.value ) && props.player.admins.length < props.player.adminSlots;
  }
  const hasSchoolbag = props.player.hasAdmin('Schoolbag');
  const hasSpace = hasSchoolbag ? props.player.usedMemory <= props.player.memory-0.5 : props.player.usedMemory <= props.player.memory-1;
  
  return (props.player.effectiveMoney >= item.cost || canSteal.value ) && hasSpace;
});

const canBuyTargetPiece = ((blueprint: PieceBlueprint) => {//wrong??? not being recalculated after purchase
  //if (!props.target) return false;
  //if (props.target instanceof Item) return false;
  if(props.shopDisabled) return false;
  const hasToolbox = props.player.hasAdmin('Toolbox');
  const hasSpace = hasToolbox ? props.player.usedMemory <= props.player.memory-0.5 : props.player.usedMemory <= props.player.memory-1;

  return (props.player.effectiveMoney >= blueprint.cost || canSteal.value ) && hasSpace;
});

watchEffect(() => {
  //console.log("canBuyTargetPiece:", canBuyTargetPiece.value);
});

const type = ((item: Item) => {
  return ((item instanceof Admin) ? "admin" : "consumable")
});
</script>

<template>
  <div class="container shop-container"
    :class="props.cssclass">
    <div class="shop-top">
      <h2>Shop</h2>
      <button class="shop-reroll-btn"
      :disabled="!canReroll"
      @click="emit('refresh-shop')">
      Reroll {{ props.rerollCost }}
    </button>
  </div>
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
      Items/Admins:
      <li 
      v-for="item in props.shopItems"
      :class="{ 'z-top': target === item }">
        <ItemView 
          :item="item"
          :type="type(item)"
          cssclass="shop"
          :tileSize="60"
          :canBuy= "canBuyItem(item)"
          :showController="(props.target === item)"
          :canSteal = canSteal
          @buy="handleBuyItem"
          @select="openShopController"
          @deselect="deselect"
        />
      </li>
    </div>
    <BlueprintController
      v-if="props.target && !(props.target instanceof Item)"
      :piece="props.target"
      mode="shop"
      :canBuy= "canBuyTargetPiece(props.target)"
      :defaultPosition="{ x: 0, y: 0 }"
      :canSteal = "canSteal"
      @buy="handleBuyBlueprint"
      @close="deselect"
    />
    <div class="btn-container-centered">
      <button v-if="canProceed"
      class="proceed-btn"
      @click="emit('closeShop')">
        Proceed
      </button>
      <button v-if="!canProceed"
      class="proceed-btn"
      @click="emit('closeShop')">
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.shop-container{
  background-color: black;
  border: 1px dashed white;
  position: absolute;
  transition: transform 0.3s ease;
  z-index: 9;
  width: 96%;
}
.shop-top{
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.blueprint-row, .item-row {
  display: flex;
  justify-content: space-around;
  position: relative;
  top: 10%;
  left: 0;
  width: 80%;
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
.z-top {
  position: relative;
  z-index: 1000;
}
</style>