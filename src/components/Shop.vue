<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import type { PieceBlueprint } from "../types"
import { Piece } from "../Pieces.ts"
import BlueprintView from "./BlueprintView.vue";
import { allPieces } from "../Pieces"
import PieceController from "./PieceController.vue";
import { Item, allItems } from "../Items.ts";
import ItemView from "./ItemView.vue";


function makeBlueprint(PieceClass: any) {
  const temp = new PieceClass({ x: -1, y: -1 }, "player");

  return {
    id: crypto.randomUUID(),
    name: PieceClass.name,
    description: PieceClass.description,
    unicode: PieceClass.unicode,
    maxSize: temp.maxSize,
    moves: temp.moves,
    range: temp.range,
    attack: temp.attack,
    defence: temp.defence,
    rarity: temp.rarity,
    color: PieceClass.color,
    isPlaced: false
  };
}

const shopBlueprints = ref<PieceBlueprint[]>([]);
const shopItems = ref<Item[]>([]);
const selectedPiece = ref<PieceBlueprint | null>(null)
const shopSeed = ref(0)

function pickWeightedRandom(PieceClasses: any[]) {
  const weighted: any[] = [];

  for (const PieceClass of PieceClasses) {
    const temp = new PieceClass({ x: -1, y: -1 }, "player"); 
    const weight = 7 - temp.rarity;

    for (let i = 0; i < weight; i++) {
      weighted.push(PieceClass);
    }
  }

  const idx = Math.floor(Math.random() * weighted.length);
  return weighted[idx];
}

function pickThreePieces(PieceClasses: any[]) {
  return [
    pickWeightedRandom(PieceClasses),
    pickWeightedRandom(PieceClasses),
    pickWeightedRandom(PieceClasses),
  ];
}

function pickWeightedRandomItem(itemClasses: any[]) {
  const weighted: any[] = [];

  for (const itemClass of itemClasses) {
    const rarity = itemClass.rarity ?? 1;   // fallback default
    const weight = 7 - rarity;

    for (let i = 0; i < weight; i++) {
      weighted.push(itemClass);
    }
  }

  const idx = Math.floor(Math.random() * weighted.length);
  console.log('idx: ', weighted[idx])
  const PickedClass = weighted[idx];

  return new PickedClass();  // RETURN INSTANCE
}

function pickThreeItems(itemClasses: any[]) {
  return [
    pickWeightedRandomItem(itemClasses),
    pickWeightedRandomItem(itemClasses),
    pickWeightedRandomItem(itemClasses),
  ];
}

function refreshShop() {
  const classes = pickThreePieces(allPieces);
  shopBlueprints.value = classes.map(c => makeBlueprint(c));
  shopItems.value = pickThreeItems(allItems);
  console.log('shopitems: ', shopItems);
}

onMounted(() => {
  refreshShop()
});
console.log("ALL PIECES:", allPieces)
console.log("Chosen:", pickThreePieces(allPieces))

function openShopController(piece: PieceBlueprint) {///TODO SORT OUT IMPORTS
  selectedPiece.value = piece;
}

function handleBuy() {
  //pass up to app so blueprint can be passed to player
}

function openItemController(piece: PieceBlueprint) {///TODO SORT OUT IMPORTS
  selectedPiece.value = null;
}

//        @select="openItemController"
</script>

<template>
  <div class="shop-container">
    <h2>Shop</h2>
    <button @click="refreshShop">Reroll</button>
    <div class="blueprint-row">
      Programs:
      <BlueprintView
        v-for="bp in shopBlueprints"
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
      <ItemView v-for="item in shopItems"
        :item="item"
        cssclass="shop"
        :tileSize="60"
      />
    </div>
    <PieceController
        v-if="selectedPiece"
        :piece="selectedPiece"
        mode="shop"
        @buy="handleBuy"
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
</style>