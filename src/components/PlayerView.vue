<script setup lang="ts">
    import { computed, ref } from "vue";
    import type { Player } from "../Player";
    import type { PieceBlueprint } from "../types";
    import { Item } from "../Items";
    import { Admin } from "../AdminPrograms";
    import ItemView from "./ItemView.vue";
    import BlueprintView from "./BlueprintView.vue";
    import BlueprintController from "./BlueprintController.vue";

    const props = defineProps<{
        player: Player,
        //activePieces: InstanceType<typeof Piece>[]
        showInventory: boolean
    }>();
    
    const emit = defineEmits<{
        (e: 'highlightPlacements', blueprint: PieceBlueprint): void;
        (e: 'startPlacementDrag', blueprint: PieceBlueprint): void;
        (e: 'sellBlueprint', id:string):void;
        (e: 'sellItem', id:string):void;
        (e: 'applyItem', payload: {item: Item, id:string}):void;
        (e: 'sellAdmin', id:string):void;//TODO
        (e: 'reorderAdmins', admins: Admin[]):void;
        (e: 'closeInventory'):void;
    }>();

    const selectedPiece = ref<PieceBlueprint | null>(null)
    const selectedItem = ref<Item | null>(null)
    
    function openInventoryController(piece: PieceBlueprint) {///TODO SORT OUT IMPORTS
        selectedPiece.value = piece;
    }

    // Derived/computed properties
    const memoryUsage = computed(() => 
        `${props.player.usedMemory}/${props.player.memory}`
    );

    function handlePlace() {
        if(selectedPiece.value){
            emit("highlightPlacements", selectedPiece.value);
            selectedPiece.value = null
        }
    }

    function handleSellBlueprint() {
        if(selectedPiece.value){
            emit('sellBlueprint', selectedPiece.value.id);
            selectedPiece.value = null
        }
    }

    function onUseItem(item: Item) {
        if(selectedPiece.value && item.targetType === 'blueprint'){
            console.log('using: ', item.name, ' on ', selectedPiece.value?.name)
            emit("applyItem", { item, id: selectedPiece.value.id })  
        } else {//not for a blueprint so no id needed
            console.log('using: ', item.name)
            emit("applyItem", { item, id: '' })  
        }
    }

    function onUseAdmin(admin: Admin) {//admin: Admin ???
        //emit("applyAdmin", admin: Admin);
    }

    function handleClose() {
        selectedPiece.value = null
        return;
    }
    function selectItem(item: Item){
        selectedItem.value = item;
        return;
    }
    function deselectItem(){
        selectedItem.value = null;
        return;
    }

    const dragIndex = ref<number | null>(null);

    function onDragStart(index: number) {
        console.log('dragging');
    dragIndex.value = index;
    }

    function onDrop(dropIndex: number) {
        console.log('dropping');
        if (dragIndex.value === null) return;

        const newOrder = [...props.player.admins];
        const moved = newOrder.splice(dragIndex.value, 1)[0];
        newOrder.splice(dropIndex, 0, moved);

        dragIndex.value = null;

        // Tell parent to update player.admins
        emit("reorderAdmins", newOrder);
    }

    function startPlacementDrag(bp: PieceBlueprint) {
        emit("highlightPlacements", bp)
        emit("startPlacementDrag", bp)
    }
</script>

<template>
    <div class="player p-4 border rounded-lg bg-gray-100 shadow-md w-64">
        <div class="flex full-width">
            <!-- Money -->
            <div class="player-info">
                <span class="os">
                    {{ String.fromCodePoint(parseInt(player.osunicode.replace('U+', ''), 16)) }}
                </span>
                <span style="text-align: left;"><strong>$:</strong> {{ props.player.money }}</span>
                <p>
                    <span v-for="lives in player.lives">
                       {{ String.fromCodePoint(0x1FA77) }}
                    </span>
                </p>
            </div>
            <div>
                <p><strong>Admins:</strong> {{ props.player.admins.length }}/{{ props.player.adminSlots }}</p>
                <ul class="admins">
                    <li v-for="(item, index) in props.player.admins"
                        :key="item.id"
                        draggable="true"
                        @dragstart="onDragStart(index)"
                        @dragover.prevent
                        @drop="onDrop(index)"
                        class="p-1 border rounded mb-1 flex justify-between items-center">
                        <ItemView 
                            :item="item"
                            type="admin"
                            cssclass="inventory"
                            :tileSize="60"
                            :canBuy="false"
                            :showController="(selectedItem === item)"
                            @sell="$emit('sellAdmin', item.id)"
                            @triggerAdmin="onUseAdmin"
                            @select="selectItem"
                            @deselect="deselectItem"
                        />
                    </li>
                </ul>
            </div>
        </div>

    </div>
    <!-- Inventory Popup -->
    <div v-if="showInventory" class="inventory mt-3 border-t pt-2">
        <!-- Memory -->
        <p><strong>Memory:</strong> {{ memoryUsage }}</p>
        <button class="top-right" @click="$emit('closeInventory')">X</button>
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
            @mousedown="startPlacementDrag(pieceBlueprint)"
            />
        </ul>

        <h3 class="font-semibold mt-2">Items</h3>
        <div v-if="props.player.items.length === 0">No items</div>
        <ul class="inventory-relative">
            <ItemView 
                v-for="item in props.player.items"
                class="p-1 border rounded mb-1 flex justify-between items-center"
                :item="item"
                type="consumable"
                cssclass="inventory"
                :tileSize="60"
                :canBuy= "false"
                :showController="(selectedItem === item)"
                @sell="$emit('sellItem', item.id)"
                @use="onUseItem"
                @select="selectItem"
                @deselect="deselectItem"
            />
        </ul>
        <BlueprintController
        v-if="selectedPiece"
        :piece="selectedPiece"
        mode="inventory"
        :canBuy="false"
        :canPlace="player.canPlace"
        @highlightPlacements="handlePlace"
        @sell="handleSellBlueprint"
        @close="handleClose"
        />
    </div>
</template>

<style scoped>
    .player, .inventory {
        background-color: black;
        width: 100%;
        display: flex;
        justify-content: space-between;
        max-width: 1280px;
        border: 2px solid #ccc;
        border-radius: 0.75rem;
        padding: 10px;
        z-index: 50;
        .flex{
            display: flex;
            width: 100%;
            justify-content: space-between;
        }
    }
    .full-width{
        align-items: center;
    }
    .player-info{
        line-height: 0.5;
    }
    .os{
        font-size: 24px;
        margin: 0;
        text-align: left;
    }
    .inventory{
        text-align: left;
        background: #222;
        color: #fff;
        padding: 1rem;
        margin: 0;
        display: block;
        bottom: 0;
        height: 200%;
        width: 100%;
        z-index: 99999;
        margin: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(4px);
        .top-right{
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }
        h3, p, button, strong{
            text-align: left;
            margin: 6px;
            font-size: 14px;
        }
        
    }
    .admins, .inventory-relative{
        margin: 0;
        padding: 0 12px 0 12px;
        position: relative;
        display: flex;
        gap: 5px;
    }
    .inventory-relative{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
</style>