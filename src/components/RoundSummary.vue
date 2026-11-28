<script setup lang="ts">
    import { Player } from '../Player';
    import { Admin } from '../AdminPrograms';
    import { computed, onMounted, ref, watch } from 'vue';
    import { reapplyTutorialTooltips } from '../tutorial';

    interface Props{
        hasWonRound: boolean,
        player: Player,
        bosses: Admin[],
        roundHasStarted: boolean,
        isCampaign?: boolean,
        currentSeed?: string,
        nodeId?: string | null
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
        (e: 'retrySeed'): void;
    }>();

    // Recalculate interest reactively as the base reward and bonus reward admins add their money to the player
    watch(
        () => [props.player.money, props.player.bonusInterest] as const,
        () => {
            if (!props.isCampaign) {
                props.player.calcInterest(0);
            }
        },
        { immediate: true }
    );

    const rewardEvents = computed(() =>
        (props.player.roundSummaryEvents || []).filter(e => e.kind === 'reward')
    );

    const interestEvents = computed(() =>
        (props.player.roundSummaryEvents || []).filter(e => e.kind === 'interest')
    );

    onMounted(() => {
        if(props.player.hasAdmin('Clippy') && props.player.difficulty !== 0){
            reapplyTutorialTooltips(200);
        }
    });

    function collectAndProceed(){
        props.player.collectMoney(0);
        emit('proceedFromEndOfRound');
        props.player.resetInterestAndReward();
    }
</script>

<template>
    <div class="container round-summary">
        <div :id="props.nodeId ? `${props.nodeId}-summary` : 'round-summary'" class="if-won" v-if="hasWonRound">
            <h1 v-if="player.hasWonGame && player.difficulty < 7">
                You win!
            </h1>
            <h3>
                Node complete
            </h3>
            <div class="reward-summary">
                <div class="summary-line base-reward" :class="{ 'is-triggering': player.isBaseRewardTriggering }">
                    <span>Reward: <span class="text-yellow">${{ player.nextReward }}</span></span>
                </div>
                <TransitionGroup name="reward-pop" tag="div" class="reward-events-list">
                    <div
                        v-for="ev in rewardEvents"
                        :key="ev.id"
                        class="summary-event-chip"
                    >
                        + {{ ev.label }} <span class="text-yellow">${{ ev.amount }}</span>
                    </div>
                </TransitionGroup>
            </div>
            <div v-if="!isCampaign" class="interest-summary">
                <div class="summary-line">
                    Interest earned:
                    <span v-if="!player.isSummaryProcessing" class="text-yellow">
                        ${{ player.nextInterest }}
                    </span>
                </div>
                <TransitionGroup name="reward-pop" tag="div" class="reward-events-list">
                    <div
                        v-for="ev in interestEvents"
                        :key="ev.id"
                        class="summary-event-chip"
                        :class="{ 'is-loss': ev.isLoss }"
                    >
                        <template v-if="ev.isLoss">
                            {{ ev.label }}
                        </template>
                        <template v-else>
                            + {{ ev.label }} <span class="text-yellow">${{ ev.amount }}</span>
                        </template>
                    </div>
                    <div
                        v-if="player.hasAdmin('Inheritance') && (player.nextInterest + player.bonusInterest) > 0"
                        key="inheritance-bonus"
                        class="summary-event-chip inheritance"
                    >
                        + Inheritance <span class="text-yellow">${{ player.nextInterest + player.bonusInterest }}</span>
                    </div>
                </TransitionGroup>
            </div>
            <button class="btn-grey" :disabled="player.isSummaryProcessing" @click="collectAndProceed">Collect <span class="text-yellow bold">interest</span> and proceed</button>
        </div>
        <div :id="props.nodeId ? `${props.nodeId}-summary` : 'round-summary'" class="if-lost" v-if="!hasWonRound && isCampaign">
            <h3>
                Round Over
            </h3>
            <button @click="emit('returnToMap')" :disabled="roundHasStarted">Return to Map</button>
        </div>
        <div :id="props.nodeId ? `${props.nodeId}-summary` : 'round-summary'" class="if-lost" v-else-if="!hasWonRound && player.lives > 0">
            <h3>
                Round Over
            </h3>
            <button @click="emit('reloadLevel')" :disabled="roundHasStarted">Retry</button>
            <button v-if="props.player.mapProgress < 2" @click="emit('returnToMap')" :disabled="roundHasStarted">Return to Map</button>
        </div>
        <div :id="props.nodeId ? `${props.nodeId}-summary` : 'round-summary'" class="if-lost" v-else-if="!hasWonRound && player.lives <= 0">
            <H2>
                GAME OVER
            </h2>
            <div v-if="currentSeed" class="seed-display">
                <span class="seed-label">Seed:</span>
                <span class="seed-value">{{ currentSeed }}</span>
                <button class="copy-btn" @click="copySeed">Copy Seed</button>
                <button class="copy-btn" @click="emit('retrySeed')">Retry</button>
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
        margin-bottom: 14px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .base-reward {
        display: inline-block;
        transition: transform 0.2s ease;
    }
    .base-reward.is-triggering {
        animation: baseRewardPop 0.5s ease-in-out;
    }
    @keyframes baseRewardPop {
        0% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 0px yellow);
        }
        50% {
            transform: scale(1.3);
            filter: brightness(1.3) drop-shadow(0 0 12px yellow);
        }
        100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 0px yellow);
        }
    }
    .interest-summary{
        margin-bottom: 2rem;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .reward-events-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        max-width: 480px;
    }
    .summary-event-chip {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 215, 0, 0.45);
        border-radius: 6px;
        padding: 3px 9px;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    .summary-event-chip.is-loss {
        border-color: #ff5555;
        color: #ff5555;
    }
    .reward-pop-enter-active {
        animation: rewardPopIn 0.45s ease-out;
    }
    @keyframes rewardPopIn {
        0% {
            opacity: 0;
            transform: scale(0.6) translateY(8px);
            filter: brightness(1.5) drop-shadow(0 0 10px yellow);
        }
        60% {
            opacity: 1;
            transform: scale(1.18) translateY(0);
            filter: brightness(1.3) drop-shadow(0 0 12px yellow);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: brightness(1) drop-shadow(0 0 0px yellow);
        }
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
    .btn-grey:disabled {
        opacity: 0.45;
        cursor: not-allowed;
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
    .bold{
        font-weight: bold;
    }
</style>