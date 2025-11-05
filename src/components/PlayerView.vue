<script setup lang="ts">
    import { computed, ref } from "vue";
    import type { Player } from "../Player";
    import { Piece } from "../Pieces";
    import { Item } from "../Items";
    import PieceView from "./PieceView.vue";
    import PieceController from "./PieceController.vue";
import type { Coordinate } from "../types";

    const props = defineProps<{
        player: Player
    }>();

    const selectedPiece = ref<Piece | null>(null)

    const emit = defineEmits<{//move to controller???
        (e: 'place-program', program: Piece): void;
        (e: 'use-item', item: Item): void;
    }>();

    function openInventoryController(piece: Piece) {///TODO SORT OUT IMPORTS
        selectedPiece.value = piece;
    }

    // Reactive toggles
    const showInventory = ref(false);

    // Derived/computed properties
    const memoryUsage = computed(() => 
        `${props.player.usedMemory}/${props.player.memory}`
    );

    const handlePlace = (coord : Coordinate) => {
        //send id to app fo rehydration?
        //send instance to board and use moveTo?
        //leave a shallow copy here, or not? (could return all pieces from board later?)
    }

    const handleSell = () => {
        //do in player class
        //pieces/items need a sell value, tie it to rarity?
    }
    //progams can be placed on board, greying them out in inventory, use a similar popup to pieceController but with place/sell buttons
    //items can be used on programs, confirmation window to execute their function
</script>

<template>
    <div class="player p-4 border rounded-lg bg-gray-100 shadow-md w-64">
        <div class="flex">
            <!-- Money -->
            <p><strong>Money:</strong> {{ props.player.money }}</p>
            
            <!-- Memory -->
            <p><strong>Memory:</strong> {{ memoryUsage }}</p>
            
            <!-- Inventory Button -->
            <button 
            class="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            @click="showInventory = !showInventory"
            >
            {{ showInventory ? 'Hide Inventory' : 'Show Inventory' }}
        </button>
        </div>

    </div>
    <!-- Inventory Popup -->
    <div v-if="showInventory" class="inventory mt-3 border-t pt-2">
        <h3 class="font-semibold">Programs</h3>
        <div v-if="props.player.programs.length === 0">No programs</div>
        <ul>
            <PieceView
            v-for="piece in player.programs"
            :key="piece.id"
            :piece="piece"
            :tileSize="32"
            mode="inventory"
            @select="openInventoryController"
            />
        </ul>

        <h3 class="font-semibold mt-2">Items</h3>
        <div v-if="props.player.items.length === 0">No items</div>
        <ul>
            <li 
            v-for="(item, index) in props.player.items" 
            :key="'item-' + index"
            class="p-1 border rounded mb-1 flex justify-between items-center"
            >
            <span>{{ item.name }}</span>
            <button class="text-sm bg-purple-500 text-white px-2 rounded">Use</button>
            </li>
        </ul>
        <PieceController
        v-if="selectedPiece"
        :piece="selectedPiece"
        mode="inventory"
        @place="handlePlace"
        @sell="handleSell"
        />
    </div>
</template>

<style scoped>
.player {
  position: fixed;
  top: 10px;
  left: 20%;
  margin: auto;
  max-width: 1280px;
  border: 2px solid #ccc;
  border-radius: 0.75rem;
  padding: 10px;
  z-index: 50;
  .flex{
    display: flex;
  }
}
.inventory{
    text-align: left;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 15%;
  background: #222;
  color: #fff;
  padding: 1rem;
}
</style>