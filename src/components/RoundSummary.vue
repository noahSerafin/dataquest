<script setup lang="ts">
    import { Player } from '../Player';
    import { Admin } from '../AdminPrograms';
    import { computed, onMounted, ref } from 'vue';
    import { reapplyTutorialTooltips } from '../tutorial';
    import cashOutSound from '../../sfx/cash.ogg';
    import { playSoundFx, preloadSound } from '../helperFunctions';

    preloadSound(cashOutSound);

    interface Props{
        hasWonRound: boolean,
        player: Player,
        bosses: Admin[],
        roundHasStarted: boolean,
        isCampaign?: boolean,
        currentSeed?: string
    }
    const props = defineProps<Props>()

    const seedCopied = ref(false);

    function copySeed() {
        if (props.currentSeed) {
            navigator.clipboard.writeText(props.currentSeed);
            seedCopied.value = true;
        }
    }

    const emit = defineEmits<{
        (e: 'proceedFromEndOfRound'): void;
        (e: 'reloadLevel'): void;
        (e: 'mainMenu'): void;
        (e: 'returnToMap'): void;
    }>();
   
    if(!props.isCampaign){
        props.player.calcInterest(); //await?? for html
    }

    onMounted(() => {
        if(props.player.hasAdmin('Clippy')){
            reapplyTutorialTooltips(200);
        }
    });

    const bonus = computed(() => 
        props.player.hasAdmin('Pot of Gold') && props.player.mapProgress >= 2 ? 10 * props.player.adminCount('Pot of Gold') : 0
    )

    function collectAndProceed(){
        props.player.collectMoney(bonus.value);
        emit('proceedFromEndOfRound');
        props.player.resetInterestAndReward();
        playSoundFx(cashOutSound, 1.0);
    }

    //duplicate admins later??
</script>

<template>
    <div class="container round-summary">
        <div class="if-won" v-if="hasWonRound">
            <h1 v-if="player.hasWonGame && player.difficulty < 7">
                You win!
            </h1>
            <h3>
                Node complete
            </h3>
            <div v-if="!isCampaign" class="interest-summary">Interest earned: 
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
                        ${{ 1 * player.adminCount('Chedda') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Miner')">+ Miner 
                    <span class="text-yellow">
                        ${{ 2 * player.adminCount('Miner') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Abacus')">+ Abacus 
                    <span class="text-yellow">
                        ${{ Math.floor(6/player.difficulty) * player.adminCount('Abacus') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Punching')">+ Punching
                    <span class="text-yellow">
                        ${{ 5 * player.adminCount('Punching') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Loot')">+ Loot 
                    <span class="text-yellow">
                        ${{ 4 * player.adminCount('Loot') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Tithe')">+ Tithe 
                    <span class="text-yellow">
                        ${{ 5 * player.adminCount('Tithe') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Booty') && bosses.length > 0">+ Booty 
                    <span class="text-yellow">
                        ${{ 6 * player.adminCount('Booty') }}
                    </span>
                </span>
                <span v-if="player.hasAdmin('Pot of Gold') && player.mapProgress >= 2">+ Pot of Gold 
                    <span class="text-yellow">
                        ${{ 10 * player.adminCount('Pot of Gold') }}
                    </span>
                </span>

            </div>
            <button class="btn-grey" @click="collectAndProceed">Collect <span class="text-yellow">$</span> and proceed</button>
        </div>
        <div class="if-lost" v-if="!hasWonRound && isCampaign">
            <h3>
                Round Over
            </h3>
            <button @click="emit('returnToMap')" :disabled="roundHasStarted">Return to Map</button>
        </div>
        <div class="if-lost" v-else-if="!hasWonRound && player.lives > 0">
            <h3>
                Round Over
            </h3>
            <button @click="emit('reloadLevel')" :disabled="roundHasStarted">Retry</button>
            <button v-if="props.player.mapProgress < 2" @click="emit('returnToMap')" :disabled="roundHasStarted">Return to Map</button>
        </div>
        <div class="if-lost" v-else-if="!hasWonRound && player.lives <= 0">
            <H2>
                GAME OVER
            </h2>
            <div v-if="currentSeed" class="seed-display">
                <span class="seed-label">Seed:</span>
                <span class="seed-value">{{ currentSeed }}</span>
                <button class="copy-btn" @click="copySeed">Copy Seed</button>
                <span v-if="seedCopied">Seed copied!</span>
            </div>
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
        text-align: center;
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
    .btn-grey{
        background-color: #acacac;
        border: 1px solid white;
    }
    .seed-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        background: #2a2a2a;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        border: 1px solid #444;
        margin-bottom: 1rem;
    }
    .seed-label {
        font-weight: bold;
        color: #888;
    }
    .seed-value {
        font-family: monospace;
        font-size: 1.2rem;
        color: #4CAF50;
        letter-spacing: 1px;
    }
    .copy-btn {
        background: #444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.4rem 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    .copy-btn:hover {
        background: #555;
    }
</style>