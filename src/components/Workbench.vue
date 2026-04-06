<script setup lang="ts">
    import { ref } from 'vue';
    import type { PieceBlueprint, StatKey } from '../types';
    import { Player } from '../Player';
    import BlueprintView from './BlueprintView.vue';
    import BlueprintController from './BlueprintController.vue';
    // NUT AND BOLT, U+1F529 //GEAR, U+2699

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
        if (!primaryBP.value) return
        primaryBP.value.isPlaced = false
        primaryBP.value = null
        resultBP.value = null
    }


    const primaryBP = ref<PieceBlueprint | null>(null)
    const workingBP = ref<PieceBlueprint | null>(null)
    const resultBP = ref<PieceBlueprint | null>(null)
    const selectedBP = ref<PieceBlueprint | null>(null)
    const freePoints = ref(0);

    // Track original stats for the 5-point limit
    const originalStats = ref<Record<StatKey, number> | null>(null);

    function tweakStats(statToChange: StatKey, changeNum: number) {
        if (!workingBP.value || !originalStats.value) return;

        if (changeNum < 0) {
            // Decrement: Gain a free point, but only if the stat is > 0
            // AND we haven't already deducted 5 points in total
            if ((statToChange!== 'maxSize' && workingBP.value[statToChange] > 0) || (statToChange=== 'maxSize' && workingBP.value[statToChange] > 1)) {
                // Calculate current deductions
                const currentDeductions = Object.keys(originalStats.value).reduce((sum, key) => {
                    const k = key as StatKey;
                    return sum + Math.max(0, originalStats.value![k] - workingBP.value![k]);
                }, 0);

                if (currentDeductions < 5) {
                    (workingBP.value[statToChange] as number) -= 1;
                    freePoints.value += 1;
                }
            }
        } else {
            // Increment: Spend a free point
            if (freePoints.value > 0) {
                (workingBP.value[statToChange] as number) += 1;
                freePoints.value -= 1;
            }
        }
    }

    function applyStatMods() {
        if (!workingBP.value) return
        resultBP.value = {
            id: crypto.randomUUID(),
            name: workingBP.value.name,
            description: workingBP.value.description,
            unicode: workingBP.value.unicode,
            maxSize: workingBP.value.maxSize,
            moves: workingBP.value.moves,
            range: workingBP.value.range,
            attack: workingBP.value.attack,
            defence: workingBP.value.defence,
            rarity: workingBP.value.rarity,
            color: workingBP.value.color,
            // blueprint-only fields:
            isPlaced: false,
            cost: workingBP.value.cost,
            immunities: workingBP.value.immunities
        }
        if(workingBP.value.variantName){
            resultBP.value.variantName = 'Modded';
        }
        if(workingBP.value.hybridName){
            resultBP.value.hybridName = workingBP.value.hybridName;
            resultBP.value.extraUnicode = workingBP.value.extraUnicode;
        }
    }

    function cancel() {
        if (primaryBP.value) primaryBP.value.isPlaced = false
        primaryBP.value = null
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

        primaryBP.value = props.pieceToPlace
        primaryBP.value.isPlaced = true

        // Clone for drafting
        workingBP.value = JSON.parse(JSON.stringify(props.pieceToPlace));
        originalStats.value = {
            maxSize: workingBP.value!.maxSize,
            moves: workingBP.value!.moves,
            range: workingBP.value!.range,
            attack: workingBP.value!.attack,
            defence: workingBP.value!.defence,
        };
        freePoints.value = 0;

        emit('clear-drag')
    }
    function collect() {
        if (!resultBP.value || !primaryBP.value) return;
        props.player.removeProgram(primaryBP.value);
        props.player.addProgram(resultBP.value);
        primaryBP.value = null;
        resultBP.value = null;
        selectedBP.value = null;
        emit('close');
    }

</script>

<template>
  <div class="container workbench">
    <h4>WORKBENCH {{ String.fromCodePoint(parseInt("U+2699".replace('U+', ''), 16), 0xFE0F) }}</h4>
    <p class="padded">Reassign up to 5 stat points of 1 program</p>
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
    </div>
    <div v-if="workingBP" class="statMods">
        <div class="free-points">Free Points: {{ freePoints }} / 5</div>
        <div class="flex">
            <div class="maxSize">Max Size: {{ workingBP.maxSize }}
                <button @click="tweakStats('maxSize', 1)">+</button>
                <button @click="tweakStats('maxSize', -1)">-</button>
            </div>
            <div class="moves">Moves: {{ workingBP.moves }}
                <button @click="tweakStats('moves', 1)">+</button>
                <button @click="tweakStats('moves', -1)">-</button>
            </div>
            <div class="range">Range: {{ workingBP.range }}
                <button @click="tweakStats('range', 1)">+</button>
                <button @click="tweakStats('range', -1)">-</button>
            </div>
            <div class="attack">Attack: {{ workingBP.attack }}
                <button @click="tweakStats('attack', 1)">+</button>
                <button @click="tweakStats('attack', -1)">-</button>
            </div>
            <div class="defence">Defence: {{ workingBP.defence }}
                <button @click="tweakStats('defence', 1)">+</button>
                <button @click="tweakStats('defence', -1)">-</button>
            </div>
        </div>
    </div>

    <!-- Compile -->
    <button
      :disabled="!primaryBP"
      @click="applyStatMods"
    >
      Apply
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
        :defaultPosition="{ x: 0, y: 0 }"
        @close="deselect"
    />

    <button
      v-if="resultBP"
      @click="collect"
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
.workbench{
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
}
</style>