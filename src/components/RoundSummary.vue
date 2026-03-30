<script setup lang="ts">
    import { Player } from '../Player';
    import { Admin } from '../AdminPrograms';
import { computed, onMounted } from 'vue';
import { reapplyTutorialTooltips } from '../tutorial';

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

    onMounted(() => {
        reapplyTutorialTooltips(200);
    });

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
            <h1 v-if="player.hasWonGame">
                You win!
            </h1>
            <h3>
                Node complete
            </h3>
            <div class="interest-summary">Interest earned: 
                <span class="text-yellow">
                    ${{ player.nextInterest }}
                </span>
                <span class="bonus"
                 v-if="player.bonusInterest > 0">+ Bonus interest
                    <span class="text-yellow">
                        ${{ player.bonusInterest }}
                    </span>
                </span>
                <span class="inheritance" v-if="player.hasAdmin('inheritance')">+ Inheritance 
                    <span class="text-yellow">
                        ${{ (player.nextInterest + player.bonusInterest) * 2 }}
                    </span>
                </span>
            </div>
            <div class="reward-summary">
                Reward: 
                <span class="text-yellow">
                    ${{ player.nextReward }}
                </span>
                <span v-if="player.hasAdmin('Chedda')">+ Chedda 
                    <span class="text-yellow">
                        $1
                    </span>
                </span>
                <span v-if="player.hasAdmin('Miner')">+ Miner 
                    <span class="text-yellow">
                        $2
                    </span>
                </span>
                <span v-if="player.hasAdmin('Abacus')">+ Abacus 
                    <span class="text-yellow">
                        ${{ Math.floor(3/player.difficulty) }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Punching')">+ Punching
                    <span class="text-yellow">
                        $5
                    </span>
                </span>
                <span v-if="player.hasAdmin('Loot')">+ Loot 
                    <span class="text-yellow">
                        $4
                    </span>
                </span>
                <span v-if="player.hasAdmin('Tithe')">+ Tithe 
                    <span class="text-yellow">
                        $5
                    </span>
                </span>
                <span v-if="player.hasAdmin('Pot of Gold') && bosses.length > 0">+ Pot of Gold 
                    <span class="text-yellow">
                        $10
                    </span>
                </span>

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
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .reward-summary{
        margin-bottom: 10px;
        position: relative;
    }
    .interest-summary{
        margin-bottom: 2rem;
        position: relative;
    }
    .if-won, .if-lost{
        padding: 8rem;
        background-color: black;
        border-radius: 15px;
        position: relative;
    }
</style>