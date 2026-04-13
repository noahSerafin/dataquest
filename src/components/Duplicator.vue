<script setup lang="ts">
    import { ref } from 'vue';
    import type { PieceBlueprint } from '../types';
    import { Player } from '../Player';
    import { Item } from '../Items';
    import BlueprintView from './BlueprintView.vue';
    import BlueprintController from './BlueprintController.vue';
    import ItemView from './ItemView.vue';
    //WOMAN WITH BUNNY EARS, U+1F46F
    const props = defineProps<{
        player: Player;
        pieceToPlace: PieceBlueprint | null;
        isDraggingPlacement: boolean
    }>();

    const emit = defineEmits<{
        (e: "openDuplicator"): void;
        (e: "close"): void;
        (e: "toggleDuplicator"): void;
        (e: "clear-drag"): void;
    }>();

    function removePrimary() {
        if (primaryBP.value) {
            primaryBP.value.isPlaced = false
            primaryBP.value = null
        }
        if (primaryItem.value) {
            props.player.addItem(primaryItem.value);
            primaryItem.value = null;
        }
        resultBP.value = null
    }


    const primaryBP = ref<PieceBlueprint | null>(null)
    const primaryItem = ref<Item | null>(null)
    const resultBP = ref<PieceBlueprint | null>(null)
    const selectedBP = ref<PieceBlueprint | null>(null)
    const selectedItem = ref<Item | null>(null)

    function duplicate() {
        const isBlueprint = !!primaryBP.value;
        const isItem = !!primaryItem.value;
        if (!isBlueprint && !isItem) return;

        const costToDupe = isBlueprint 
            ? (props.player.hasAdmin('Toolbox') ? 0.5 : 1) 
            : (props.player.hasAdmin('Schoolbag') ? 0.5 : 1);

        if (props.player.freeMemory < costToDupe) return;

        if (isBlueprint && primaryBP.value) {
            primaryBP.value.isPlaced = false;
            resultBP.value = {
                id: crypto.randomUUID(),
                name: primaryBP.value.name,
                description: primaryBP.value.description,
                unicode: primaryBP.value.unicode,
                maxSize: primaryBP.value.maxSize,
                moves: primaryBP.value.moves,
                range: primaryBP.value.range,
                attack: primaryBP.value.attack,
                defence: primaryBP.value.defence,
                rarity: primaryBP.value.rarity,
                color: primaryBP.value.color,
                // blueprint-only fields:
                isPlaced: false,
                cost: primaryBP.value.cost,
                immunities: primaryBP.value.immunities
            }
            if(primaryBP.value.variantName){
                resultBP.value.variantName = primaryBP.value.variantName;
            }
            if(primaryBP.value.hybridName){
                resultBP.value.hybridName = primaryBP.value.hybridName;
                resultBP.value.extraUnicode = primaryBP.value.extraUnicode;
            }
            props.player.addProgram(resultBP.value);
            primaryBP.value = null;
            resultBP.value = null;
            emit('close');
        } else if (isItem && primaryItem.value) {
            // Clone the item twice (effectively one original and one copy)
            const item1 = Object.assign(Object.create(Object.getPrototypeOf(primaryItem.value)), primaryItem.value);
            item1.id = crypto.randomUUID();
            const item2 = Object.assign(Object.create(Object.getPrototypeOf(primaryItem.value)), primaryItem.value);
            item2.id = crypto.randomUUID();
            
            props.player.addItem(item1);
            props.player.addItem(item2);
            
            primaryItem.value = null;
            emit('close');
        }
    }


    function cancel() {
        if (primaryBP.value) primaryBP.value.isPlaced = false
        if (primaryItem.value) props.player.addItem(primaryItem.value)

        primaryBP.value = null
        primaryItem.value = null
        resultBP.value = null
    }

    function skip(){
        emit('close')
    }
    function select(bp: PieceBlueprint){
        selectedBP.value = bp
    }
    function deselect(){
        selectedBP.value = null;
    }

    function tryAssignPrimary() {
        if (!props.isDraggingPlacement) return
        if (!props.pieceToPlace) return
        if (primaryItem.value) return

        primaryBP.value = props.pieceToPlace
        primaryBP.value.isPlaced = true

        emit('clear-drag')
    }

    function assignItem(item: Item) {
        if (primaryBP.value || primaryItem.value) return;
        props.player.removeItem(item);
        primaryItem.value = item;
    }

    function deselectItem() {
        selectedItem.value = null;
    }

</script>

<template>
  <div class="container hybrid-compiler">
    <h4>DUPLICATOR {{ String.fromCodePoint(parseInt("U+1F46F".replace('U+', ''), 16), 0xFE0F) }}</h4>
    <p class="padded">Choose 1 program or item to duplicate (must have room)</p>
    <!-- Slots -->
    <div class="slots">
        <div class="slot-container">
            <h4>Program to copy:</h4>
            <!--<span>(keep special move)</span>-->
            <div
            label="Primary"
            class="slot primary"
            @mouseup="tryAssignPrimary"
            :bp="primaryBP"
            @remove="removePrimary"
            >
            <BlueprintView
            v-if="primaryBP"
            :key="primaryBP.id"
            :blueprint="primaryBP"
            :tileSize="60"
            cssclass="inventory"
            :class="'placed-'+primaryBP.isPlaced"
            @select="select(primaryBP)"
            />
            <ItemView
            v-else-if="primaryItem"
            :key="primaryItem.id"
            :item="primaryItem"
            type="consumable"
            :tileSize="60"
            cssclass="inventory"
            :canBuy="false"
            :showController="selectedItem?.id === primaryItem.id"
            @select="selectedItem = primaryItem"
            @deselect="deselectItem"
            />
            </div>
        </div>
        
            </div>

    <!-- Compile -->
    <button
      :disabled="(!primaryBP && !primaryItem) || (props.player.freeMemory < (primaryBP ? (props.player.hasAdmin('Toolbox') ? 0.5 : 1) : (props.player.hasAdmin('Schoolbag') ? 0.5 : 1)))"
      @click="duplicate"
    >
      Duplicate
    </button>

    <div class="item-selection" v-if="!primaryBP && !primaryItem">
        <h4>Or select an item from inventory:</h4>
        <div class="item-grid">
            <ItemView
                v-for="item in props.player.items"
                :key="item.id"
                :item="item"
                type="consumable"
                :tileSize="50"
                :canBuy="false"
                :showController="false"
                @select="assignItem(item)"
            />
        </div>
    </div>

    <!-- Result preview -->
    <BlueprintView
        v-if="resultBP"
        :key="resultBP.id"
        :blueprint="resultBP"
        :tileSize="60"
        cssclass="inventory"
        :class="'placed-'+resultBP.isPlaced"
        @select="select(resultBP)"
    />
    <BlueprintController
        v-if="selectedBP"
        :piece="selectedBP"
        mode="shop"
        :canBuy="false"
        :canPlace="false"
        :defaultPosition="{ x: 0, y: 0 }"
        @close="deselect"
    />

    <div class="btns">
        <button @click="cancel">Cancel</button>
        <button @click="skip">Skip</button>
    </div>

  </div>
</template>
<style scoped>
.hybrid-compiler{
    z-index: 3;
    width: 99%;
    height: 96%;
    background-color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    border: 1px solid white;
    border-radius: 8px;
}
.slots{
    display: flex;
    justify-content: space-between;
    gap: 6rem;
}
.slot{
    height: 80px;
    width: 80px;
    border: 1px solid white;
    display: flex;
    justify-content: center;
    align-items: center;
}
.btns{
    display: flex;
    justify-content: space-between;
    gap: 2rem;
}
.padded{
    padding: 20px;
    margin: 0;
}
.item-selection {
    margin-top: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.item-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
}
</style>