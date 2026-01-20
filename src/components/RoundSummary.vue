<script setup lang="ts">
    import { Player } from '../Player';
    import { Admin } from '../AdminPrograms';
import { computed } from 'vue';

    interface Props{
        hasWonRound: boolean,
        player: Player,
        bosses: Admin[]
    }
    const props = defineProps<Props>()

    const emit = defineEmits<{
        (e: 'proceedFromEndOfRound'): void;
        (e: 'reloadLevel'): void;
        (e: 'mainMenu'): void;
    }>();
   
    props.player.calcInterest(); //await?? for html

    const bonus = computed(() => 
        props.player.hasAdmin('Pot of Gold') && props.bosses.length > 0 ? 10 : 0
    )

    function collectAndProceed(){
        props.player.collectMoney(bonus.value);
        emit('proceedFromEndOfRound');
        props.player.resetInterestAndReward();
    }

    //duplicate admins later??
</script>

<template>
    <div class="container round-summary">
        <div class="if-won" v-if="hasWonRound">
            <h3 v-if="player.difficulty >= 6">
                You win!
            </h3>
            <h3>
                Node complete
            </h3>
            <div class="interest-summary">
                Interest earned: ${{ player.nextInterest }}
                <span class="bonus"
                 v-if="player.bonusInterest > 0">
                    + Bonus interest ${{ player.bonusInterest }}
                </span>
                <span class="inheritance" v-if="player.hasAdmin('inheritance')">
                + Inheritance ${{ (player.nextInterest + player.bonusInterest) * 2 }}
                </span>
            </div>
            <div class="reward-summary">
                Reward: ${{ player.nextReward }}
                <span v-if="player.hasAdmin('Chedda')">+ Chedda $1</span>
                <span v-if="player.hasAdmin('Miner')">+ Miner $2</span>
                <span v-if="player.hasAdmin('Abacus')">+ Abacus ${{ Math.floor(3/player.difficulty) }}</span>
                <span v-if="player.hasAdmin('Loot')">+ Loot $4</span>
                <span v-if="player.hasAdmin('Tithe')">+ Tithe $5</span>
                <span v-if="player.hasAdmin('Pot of Gold') && bosses.length > 0">+ Pot of Gold $10</span>

            </div>
            <button @click="collectAndProceed">Collect and proceed</button>
        </div>
        <div class="if-lost" v-if="!hasWonRound && player.lives > 0">
            <h3>
                Round Over
            </h3>
            <button @click="emit('reloadLevel')">Retry</button>
        </div>
        <div class="if-lost" v-if="!hasWonRound && player.lives <= 0">
            <h3>
                Game Over
            </h3>
            <button @click="emit('mainMenu')">Main Menu</button>

        </div>
    </div>
</template>

<style scoped>
    .round-summary{
        position: absolute;
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .interest-summary{
        margin-bottom: 2rem;
    }
    .if-won, .if-lost{
        padding: 8rem;
        background-color: black;
        border-radius: 15px;
    }
</style>