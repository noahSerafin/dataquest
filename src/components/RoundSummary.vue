<script setup lang="ts">
    import { computed } from 'vue';
    import { Player } from '../Player';

    interface Props{
        hasWonRound: boolean,
        player: Player,
        reward: number
    }
    const props = defineProps<Props>()

    const emit = defineEmits<{
        (e: 'proceedFromEndOfRound'): void;
        (e: 'reloadLevel'): void;
        (e: 'mainMenu'): void;
    }>();
   
    
    const interest = computed(() =>
        Math.floor((Math.max(0, props.player.money))/5)   // ← prevents negative interest
    )

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
                Total interest earned: {{ interest }}
                <span class="bonus"
                 v-if="player.bonusInterest > 0">
                    + bonus {{ player.bonusInterest }}
                </span>
                <span class="inheritance"
                    v-if="player.admins.some(a => a.name === 'inheritance')"
                >
                + inheritance {{ interest }}
                </span>
            </div>
            <div class="reward-summary">
                Reward: {{ reward }}
            </div>
            <button @click="emit('proceedFromEndOfRound')">Proceed</button>
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
        width: 50%;
        height: 50%;
        background-color: black;
    }
    .interest-summary{
        margin-bottom: 2rem;
    }
</style>