<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue"
import type { PieceBlueprint } from "../types"
import { Player } from "../Player";
import BlueprintView from "./BlueprintView.vue";
import { Item } from "../Items";
import ItemView from "./ItemView.vue";
import { Admin } from "../AdminPrograms";
import BlueprintController from "./BlueprintController.vue";

const isMobile = ref(false);
const updateSize = () => {
  isMobile.value = window.innerWidth < 500;
};

onMounted(() => {
  updateSize();
  window.addEventListener('resize', updateSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSize);
});

const currentTileSize = computed(() => {
  return isMobile.value ? 52 : 76;
});

const emit = defineEmits<{
  (e: 'buy-blueprint', blueprint: PieceBlueprint): void;
  (e: 'buy-item', item: Item): void;
  (e: 'selectTarget', target: Item | PieceBlueprint | null): void;
  (e: 'clearTarget'): void;
  (e: 'closeShop'): void;
}>();

const props = defineProps<{
  cssclass: string;
  campaignBlueprints: PieceBlueprint[];
  campaignItems: InstanceType<typeof Item>[];
  campaignAdmins: InstanceType<typeof Admin>[];
  player: Player;
  target: Item | PieceBlueprint | null;
  shopDisabled: boolean;
  canProceed: boolean;
  hasStolen: boolean;
}>();

function openShopController(target: Item | PieceBlueprint | null) {
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

// In Campaign, we disable stealing for simplicity unless we want to add infinite steal logic? 
// The user just said "programs can be purchased infinitely". Let's assume standard steal limits if any.
// To keep it safe and focus on core mechanics, I'll allow steal but it functions like buy.
const canStealGeneral = computed(() => props.player.hasAdmin('Five Finger Discount') && !props.hasStolen && !props.shopDisabled);

const hasItemSpace = (item: Item) => {
  if (item.compressed) return true;
  if (item instanceof Admin) {
    return props.player.usedAdminSlots < props.player.adminSlots;
  }
  const hasSchoolbag = props.player.hasAdmin('Schoolbag');
  return hasSchoolbag ? props.player.usedMemory <= props.player.memory - 0.5 : props.player.usedMemory <= props.player.memory - 1;
};

const hasPieceSpace = () => {
  const hasToolbox = props.player.hasAdmin('Toolbox');
  return hasToolbox ? props.player.usedMemory <= props.player.memory - 0.5 : props.player.usedMemory <= props.player.memory - 1;
};

const canBuyItem = ((item: Item) => {
  if(props.shopDisabled) return false;
  return (props.player.effectiveMoney >= item.cost || canStealGeneral.value) && hasItemSpace(item);
});

const canStealItem = ((item: Item) => {
  return canStealGeneral.value && hasItemSpace(item);
});

const canBuyTargetPiece = ((blueprint: PieceBlueprint) => {
  if(props.shopDisabled) return false;
  return (props.player.effectiveMoney >= blueprint.cost || canStealGeneral.value) && hasPieceSpace();
});

const canStealTargetPiece = (() => {
  return canStealGeneral.value && hasPieceSpace();
});

const type = ((item: Item) => {
  return ((item instanceof Admin) ? "admin" : "consumable")
});
</script>

<template>
  <div class="container shop-container"
    :class="props.cssclass">
    <div class="shop-top">
      <h2>Campaign Shop</h2>
    </div>
    <div class="blueprint-row">
      <div class="programs-header">
        Programs:
      </div>
      <BlueprintView
        v-for="bp in props.campaignBlueprints"
        :key="bp.id"
        :blueprint="bp"
        :tileSize="currentTileSize"
        cssclass="shop"
        :class="'placed-'+bp.isPlaced"
        @select="openShopController"
        @deselect="deselect"
      />
    </div>
    <div class="item-row">
      <div class="items-header">
        <div>Items:</div>
      </div>
      <li 
      v-for="item in props.campaignItems"
      :class="{ 'z-top': target === item }">
        <ItemView 
          :item="item"
          :type="type(item)"
          cssclass="shop"
          :tileSize="currentTileSize"
          :canBuy= "canBuyItem(item)"
          :showController="(props.target === item)"
          :canSteal="canStealItem(item)"
          @buy="handleBuyItem"
          @steal="handleBuyItem" 
          @select="openShopController"
          @deselect="deselect"
        />
      </li>
    </div>
    <div class="admin-row">
      <div class="items-header">
        <div>Admins:</div>
      </div>
      <li 
      v-for="admin in props.campaignAdmins"
      :class="{ 'z-top': target === admin }">
        <ItemView 
          :item="admin"
          :type="type(admin)"
          cssclass="shop"
          :tileSize="currentTileSize"
          :canBuy= "canBuyItem(admin)"
          :showController="(props.target === admin)"
          :canSteal="canStealItem(admin)"
          @buy="handleBuyItem"
          @steal="handleBuyItem" 
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
      :canSteal="canStealTargetPiece()"
      @buy="handleBuyBlueprint"
      @steal="handleBuyBlueprint" 
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
  height: 85%;
  bottom: 1.5rem;
}
.shop-top{
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.blueprint-row, .item-row, .admin-row {
  display: flex;
  justify-content: space-around;
  position: relative;
  left: 0;
  width: 80%;
  margin-bottom: 1.5rem;
}
.tile{
  background-color: gainsboro;
  border: 2px solid black;
  width: 100%;
  height: 100%;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-container-centered{
  left: 0;
  position: absolute;
  bottom: 1.5rem;
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

@media (max-width: 500px) {
  .blueprint-row, .item-row, .admin-row {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }
  .shop-container {
    height: 90%;
    bottom: 0.5rem;
    width: 98%;
  }
  .item-row, .admin-row {
    padding-right: 100px;
  }
}
</style>
