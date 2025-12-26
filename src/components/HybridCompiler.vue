<script setup lang="ts">
    import { ref } from 'vue';
    import type { PieceBlueprint } from '../types';
    import { Player } from '../Player';
    import BlueprintView from './BlueprintView.vue';
    import BlueprintController from './BlueprintController.vue';

    const props = defineProps<{
        player: Player;
        pieceToPlace: PieceBlueprint | null;
        isDraggingPlacement: boolean
    }>();

    const emit = defineEmits<{
        (e: "openCompiler"): void;
        (e: "close"): void;
        (e: "toggleCompiler"): void;
        (e: "clear-drag"): void;
    }>();

    function removePrimary() {
        if (!primaryBP.value) return
        primaryBP.value.isPlaced = false
        primaryBP.value = null
        resultBP.value = null
    }

    function removeSecondary() {
        if (!secondaryBP.value) return
        secondaryBP.value.isPlaced = false
        secondaryBP.value = null
        resultBP.value = null
    }

    const primaryBP = ref<PieceBlueprint | null>(null)
    const secondaryBP = ref<PieceBlueprint | null>(null)
    const resultBP = ref<PieceBlueprint | null>(null)
    const selectedBP = ref<PieceBlueprint | null>(null)

    function makeHybridName(primaryName: string, secondaryName: string): string {
        // Primary → first word
        const primaryWord = primaryName.trim().split(/\s+/)[0];

        // Secondary → last word OR last 3 letters
        const secondaryParts = secondaryName.trim().split(/\s+/);

        let secondaryPart: string;

        if (secondaryParts.length > 1) {
            // Multi-word → last word
            secondaryPart = secondaryParts[secondaryParts.length - 1];
            return `${primaryWord} ${secondaryPart}`;
        } else {
            // Single word → last 3 letters (or whole word if shorter)
            const word = secondaryParts[0];
            secondaryPart = word.slice(-4);
             return `${primaryWord}${secondaryPart}`;
        }
    }

    function createHybridBlueprint(
        primary: PieceBlueprint,
        secondary: PieceBlueprint
        ): PieceBlueprint {
        if(props.player.hasAdmin('ribbon')){
            return {
                id: crypto.randomUUID(),
                name: primary.name,//for finding the base class with special move
                description: 'A boosted hybrid, primary feature: '+primary.description,
                unicode: primary.unicode,
                // averaged stats (rounded down)
                maxSize: Math.ceil(primary.maxSize + secondary.maxSize),
                moves: Math.ceil(primary.moves + secondary.moves),
                range: Math.ceil(primary.range + secondary.range),
                attack: Math.ceil(primary.attack + secondary.attack),
                defence: Math.ceil(primary.defence + secondary.defence),
                rarity: Math.max(primary.rarity, secondary.rarity),
                color: primary.color,
                isPlaced: false,
                cost: primary.cost + secondary.cost,
                hybridName: makeHybridName(primary.name, secondary.name),
                extraUnicode: secondary.unicode
            }
        }
        return {
            id: crypto.randomUUID(),
            name: primary.name,//for finding the base class with special move
            description: 'A hybrid, primary feature: '+primary.description,
            unicode: primary.unicode,
            // averaged stats (rounded down)
            maxSize: Math.ceil((primary.maxSize + secondary.maxSize) / 2),
            moves: Math.ceil((primary.moves + secondary.moves) / 2),
            range: Math.ceil((primary.range + secondary.range) / 2),
            attack: Math.ceil((primary.attack + secondary.attack) / 2),
            defence: Math.ceil((primary.defence + secondary.defence) / 2),
            rarity: Math.max(primary.rarity, secondary.rarity),
            color: primary.color,
            isPlaced: false,
            cost: primary.cost + secondary.cost,
            hybridName: makeHybridName(primary.name, secondary.name),
            extraUnicode: secondary.unicode
        }
    };

    function compile() {
        if (!primaryBP.value || !secondaryBP.value) return

        resultBP.value = createHybridBlueprint(
            primaryBP.value,
            secondaryBP.value
        )
    }

    function collectHybrid() {
        if (!resultBP.value || !primaryBP.value || !secondaryBP.value) return

        // Remove originals
        props.player.removeProgram(primaryBP.value);
        props.player.removeProgram(secondaryBP.value);

        // Add hybrid
        props.player.addProgram(resultBP.value);

        // Clean up local state
        primaryBP.value = null
        secondaryBP.value = null
        resultBP.value = null

        emit('close')
    }

    function cancel() {
        if (primaryBP.value) primaryBP.value.isPlaced = false
        if (secondaryBP.value) secondaryBP.value.isPlaced = false

        primaryBP.value = null
        secondaryBP.value = null
        resultBP.value = null

        emit('close')//seperate for primary/secondary
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
        //if (primaryBP.value) return

        primaryBP.value = props.pieceToPlace
        primaryBP.value.isPlaced = true

        emit('clear-drag')
    }

    function tryAssignSecondary() {
        if (!props.isDraggingPlacement) return
        if (!props.pieceToPlace) return
        //if (secondaryBP.value) return

        secondaryBP.value = props.pieceToPlace
        secondaryBP.value.isPlaced = true

        emit('clear-drag')
    }

//NOT VISIBLE
</script>

<template>
  <div class="container hybrid-compiler">

    <!-- Slots -->
    <div class="slots">
        <div class="slot-container">
            <h4>Primary</h4>
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
            </div>
        </div>
        <div class="slot-container">
            <h4>Secondary</h4>
            <div
            label="Secondary"
            class="slot secondary"
            @mouseup="tryAssignSecondary"
            :bp="secondaryBP"
            @remove="removeSecondary"
            >
            <BlueprintView
                v-if="secondaryBP"
                :key="secondaryBP.id"
                :blueprint="secondaryBP"
                :tileSize="60"
                cssclass="inventory"
                :class="'placed-'+secondaryBP.isPlaced"
                @select="select(secondaryBP)"
            />
            </div>
        </div>
    </div>

    <!-- Compile -->
    <button
      :disabled="!primaryBP || !secondaryBP"
      @click="compile"
    >
      Compile
    </button>

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
        @close="deselect"
    />

    <button
      v-if="resultBP"
      @click="collectHybrid"
    >
      Collect
    </button>
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
</style>