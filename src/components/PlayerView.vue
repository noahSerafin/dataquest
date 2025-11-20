<script setup lang="ts">
    import { computed, ref } from "vue";
    import type { Player } from "../Player";
    import type { Coordinate, PieceBlueprint } from "../types";
    import { Item } from "../Items";
    import ItemView from "./ItemView.vue";
    import PieceController from "./PieceController.vue";
    import BlueprintView from "./BlueprintView.vue";

    const props = defineProps<{
        player: Player,
        //activePieces: InstanceType<typeof Piece>[]
    }>();
    
    const emit = defineEmits<{//move to controller???
        (e: 'highlightPlacements', blueprint: PieceBlueprint): void;
        (e: 'use-item', item: Item): void;
        (e: 'sellPiece', id:string):void;
        (e: 'sellItem', id:string):void;
    }>();

    const selectedPiece = ref<PieceBlueprint | null>(null)
    
    function openInventoryController(piece: PieceBlueprint) {///TODO SORT OUT IMPORTS
        selectedPiece.value = piece;
    }

    // Reactive toggles
    const showInventory = ref(true);

    // Derived/computed properties
    const memoryUsage = computed(() => 
        `${props.player.usedMemory}/${props.player.memory}`
    );

    function handlePlace(piece: PieceBlueprint) {
        emit('highlightPlacements', piece)
        selectedPiece.value = null
    }

     const handleSellPiece = (blueprint: PieceBlueprint) => {
        emit('sellPiece', blueprint.id);
        selectedPiece.value = null
    }

    //progams can be placed on board, greying them out in inventory, use a similar popup to pieceController but with place/sell buttons
    //items can be used on programs, confirmation window to execute their function
</script>

<template>
    <div class="player p-4 border rounded-lg bg-gray-100 shadow-md w-64">
        <div class="flex full-width">
            <!-- Money -->
            <p><strong>Money:</strong> {{ props.player.money }}</p>
            
            <ul class="admins">
                <ItemView 
                    v-for="(item in props.player.admins"
                    class="p-1 border rounded mb-1 flex justify-between items-center"
                    :item="item"
                    type="admin"
                    cssclass="inventory"
                    :tileSize="60"
                    :canBuy= "false"
                    @sell="$emit('sellItem', item.id)"
                />
            </ul>

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
        <!-- Memory -->
        <p><strong>Memory:</strong> {{ memoryUsage }}</p>
        <h3 class="font-semibold">Programs</h3>
        <div v-if="props.player.programs.length === 0">No programs</div>
        <ul class="inventory-relative">
            <BlueprintView
            v-for="pieceBlueprint in player.programs"
            :key="pieceBlueprint.id"
            :blueprint="pieceBlueprint"
            :tileSize="60"
            cssclass="inventory"
            :class="'placed-'+pieceBlueprint.isPlaced"
            @select="openInventoryController"
            />
        </ul>

        <h3 class="font-semibold mt-2">Items</h3>
        <div v-if="props.player.items.length === 0">No items</div>
        <ul class="inventory-relative">
            <ItemView 
                v-for="(item in props.player.items"
                class="p-1 border rounded mb-1 flex justify-between items-center"
                :item="item"
                type="consumable"
                cssclass="inventory"
                :tileSize="60"
                :canBuy= "false"
                @sell="$emit('sellItem', item.id)"
            />
        </ul>
        <PieceController
        v-if="selectedPiece"
        :piece="selectedPiece"
        mode="inventory"
        @highlightPlacements="handlePlace(selectedPiece)"
        @sell="handleSellPiece(selectedPiece)"
        />
    </div>
</template>

<style scoped>
    .player {
        position: fixed;
        top: 10px;
        left: 20%;
        margin: auto;
        width: 50%;
        display: flex;
        justify-content: space-between;
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
        top: 1rem;
        right: 1rem;
        width: 15%;
        background: #222;
        color: #fff;
        padding: 1rem;
    }
    .admins, .inventory-relative{
        padding: 0 20px 0 20px;
        position: relative;
        display: flex;
        gap: 5px;
    }
</style>