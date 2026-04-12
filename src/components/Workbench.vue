<script setup lang="ts">
    import { ref, computed } from 'vue';
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

    const isModified = computed(() => {
        if (!workingBP.value || !originalStats.value) return false;
        return (
            workingBP.value.maxSize !== originalStats.value.maxSize ||
            workingBP.value.moves !== originalStats.value.moves ||
            workingBP.value.range !== originalStats.value.range ||
            workingBP.value.attack !== originalStats.value.attack ||
            workingBP.value.defence !== originalStats.value.defence
        );
    });

    function resetStats() {
        if (!originalStats.value || !workingBP.value) return;
        workingBP.value.maxSize = originalStats.value.maxSize;
        workingBP.value.moves = originalStats.value.moves;
        workingBP.value.range = originalStats.value.range;
        workingBP.value.attack = originalStats.value.attack;
        workingBP.value.defence = originalStats.value.defence;
        freePoints.value = 0;
    }

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
        resultBP.value.variantName = 'Modded';
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
    <p class="no-margin">Reassign up to 5 stat points of 1 program</p>
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
            </div>
            <button v-if="primaryBP" class="btn-cancel-slot" @click="removePrimary">Cancel</button>
        </div>    
    </div>
    <div v-if="workingBP" class="statMods">
        <div class="free-points">Free Points: <span class="text-yellow">{{ freePoints }}</span> / 5</div>
        <div class="stats-row">
            <div class="stat-control">
                <div class="stat-label">Size</div>
                <div class="stat-original" v-if="workingBP.maxSize !== originalStats?.maxSize">{{ originalStats?.maxSize }}</div>
                <div class="stat-value">{{ workingBP.maxSize }}</div>
                <div class="stat-btns">
                    <button class="small-btn" @click="tweakStats('maxSize', 1)">+</button>
                    <button class="small-btn" @click="tweakStats('maxSize', -1)">-</button>
                </div>
            </div>
            <div class="stat-control">
                <div class="stat-label">Moves</div>
                <div class="stat-original" v-if="workingBP.moves !== originalStats?.moves">{{ originalStats?.moves }}</div>
                <div class="stat-value">{{ workingBP.moves }}</div>
                <div class="stat-btns">
                    <button class="small-btn" @click="tweakStats('moves', 1)">+</button>
                    <button class="small-btn" @click="tweakStats('moves', -1)">-</button>
                </div>
            </div>
            <div class="stat-control">
                <div class="stat-label">Range</div>
                <div class="stat-original" v-if="workingBP.range !== originalStats?.range">{{ originalStats?.range }}</div>
                <div class="stat-value">{{ workingBP.range }}</div>
                <div class="stat-btns">
                    <button class="small-btn" @click="tweakStats('range', 1)">+</button>
                    <button class="small-btn" @click="tweakStats('range', -1)">-</button>
                </div>
            </div>
            <div class="stat-control">
                <div class="stat-label">Attack</div>
                <div class="stat-original" v-if="workingBP.attack !== originalStats?.attack">{{ originalStats?.attack }}</div>
                <div class="stat-value">{{ workingBP.attack }}</div>
                <div class="stat-btns">
                    <button class="small-btn" @click="tweakStats('attack', 1)">+</button>
                    <button class="small-btn" @click="tweakStats('attack', -1)">-</button>
                </div>
            </div>
            <div class="stat-control">
                <div class="stat-label">Defence</div>
                <div class="stat-original" v-if="workingBP.defence !== originalStats?.defence">{{ originalStats?.defence }}</div>
                <div class="stat-value">{{ workingBP.defence }}</div>
                <div class="stat-btns">
                    <button class="small-btn" @click="tweakStats('defence', 1)">+</button>
                    <button class="small-btn" @click="tweakStats('defence', -1)">-</button>
                </div>
            </div>
        </div>
        <button class="btn-reset" :disabled="!isModified" @click="resetStats">Reset Stats</button>
    </div>
    <!-- Compile -->
    <div class="btns">
        <button
        :disabled="!primaryBP || !isModified"
        @click="applyStatMods"
        >
        Apply
        </button>
        <button
        v-if="resultBP"
        @click="collect"
        >
        Collect
        </button>
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
.no-margin{
    margin: 0;
    padding-left: 15px;
    padding-right: 15px;
}
.statMods {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
}
.stats-row {
    display: flex;
    justify-content: center;
    gap: 2rem;
    width: 100%;
}
.stat-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    min-width: 60px;
}
.stat-label {
    font-size: 0.8rem;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.stat-original {
    font-size: 0.7rem;
    color: #666;
    height: 0.8rem;
}
.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
}
.stat-btns {
    display: flex;
    gap: 0.5rem;
}
.small-btn {
    padding: 2px 8px;
    font-size: 0.9rem;
}
.btn-reset {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    padding: 4px 12px;
}
.btn-cancel-slot {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    background-color: #331111;
    border-color: #662222;
}
.btn-cancel-slot:hover {
    background-color: #552222;
}
</style>