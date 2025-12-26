<script setup lang="ts">
    import { Player } from '../Player';

    interface Props{
        hasWonRound: boolean,
        player: Player
    }
    const props = defineProps<Props>()

    const emit = defineEmits<{
        (e: 'proceedFromEndOfRound'): void;
        (e: 'reloadLevel'): void;
        (e: 'mainMenu'): void;
    }>();
   
    props.player.calcInterest(); //await?? for html

    function collectAndProceed(){
        props.player.collectMoney();
        emit('proceedFromEndOfRound');
        props.player.resetInterestAndReward();
    }
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
                Total interest earned: ${{ player.nextInterest }}
                <span class="bonus"
                 v-if="player.bonusInterest > 0">
                    + bonus ${{ player.bonusInterest }}
                </span>
                <span class="inheritance"
                    v-if="player.admins.some(a => a.name === 'inheritance')"
                >
                + inheritance ${{ player.nextInterest }}
                </span>
            </div>
            <div class="reward-summary">
                Reward: ${{ player.nextReward }}
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