<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import type { OS } from '../types';
    import { allOSes } from '../Operators';
    import { StorageManager } from '../StorageManager';

    const props = defineProps<{
        debugMode: boolean;
    }>();

    const emit = defineEmits<{
        (e: 'createNewPlayer', payload: { os: OS, seed: string, stake?: number }): void;
    }>();

    const seedInput = ref<string>('');

    function startWithSeed() {
        if (!seedInput.value) return;
        
        const input = seedInput.value.trim();
        const prefix = input.charAt(0);
        let rawSeed = input.substring(1);
        let parsedStake: number | undefined = undefined;

        // New seeds have the stake as the second character (e.g. S0, S1)
        const possibleStake = parseInt(input.charAt(1), 10);
        if (!isNaN(possibleStake)) {
            parsedStake = possibleStake;
            rawSeed = input.substring(2);
        }
        
        // Find OS by prefix
        const os = allOSes.find(o => o.prefix === prefix) || allOSes[0];
        
        emit('createNewPlayer', { os, seed: rawSeed, stake: parsedStake });
    }

    function returnUnicode(unicode: String){
        return  String.fromCodePoint(parseInt(unicode.replace('U+', ''), 16), 0xFE0F);
    }

    function getUnlockRule(osName: string): string | null {
        if (osName === 'Penguin') {
            if (!props.debugMode && !StorageManager.hasAnyWin()) return "Win with any operator";
        }
        if (osName === 'Temple') {
            if (!props.debugMode && StorageManager.getUniqueWinsCount() < 3) return "Win with 3 different operators";
        }
        if (osName === 'Fortran') {
            if (!props.debugMode && !StorageManager.hasStakeWin(1)) return "Win with at least 1 infamy";
        }
        if (osName === 'Cobol') {
            if (!props.debugMode && StorageManager.getUniqueWinsCount() < 4) return "Win with 4 different operators";
        }
        if (osName === 'Arch') {
            if (!props.debugMode && !StorageManager.hasStakeWin(2)) return "Win with at least 2 infamy";
        }
        if (osName === 'GNU') {
            if (!props.debugMode && StorageManager.getUniqueWinsCount() < 5) return "Win with at least 5 different operators";
        }
        if (osName === 'Amiga') {
            if (!props.debugMode && !StorageManager.hasStakeWin(3)) return "Win with at least 3 infamy";
        }
        if (osName === 'BeOS') {
            if (!props.debugMode && !StorageManager.hasStakeWin(4)) return "Win with at least 4 infamy";
        }
        if (osName === 'Explorer') {
            if (!props.debugMode && StorageManager.getUniqueWinsCount(6) < 6) return "Win with at least 6 different operators";
        }
        if (osName === 'Satoshi') {
            if (!props.debugMode && StorageManager.hasStakeWin(5)) return "Win with at least 5 infamy";
        }
        //Explorer, Satoshi, Debugger
        return null;
    }

 
    onMounted(() => {
        const el = document.querySelector('.oses') as HTMLElement | null;
        if (!el) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const down = (e: MouseEvent | TouchEvent) => {
            isDown = true;
            el.classList.add("dragging");
            const pageX =
                e instanceof MouseEvent
                    ? e.pageX
                    : e.touches[0].pageX;

            startX = pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const leave = () => {
            isDown = false;
            el.classList.remove("dragging");
        };

        const up = leave;

        const move = (e: MouseEvent | TouchEvent) => {
            if (!isDown) return;
            e.preventDefault();

            const pageX =
                e instanceof MouseEvent
                    ? e.pageX
                    : e.touches[0].pageX;

            const x = pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // scroll speed factor
            el.scrollLeft = scrollLeft - walk;
        };

        el.addEventListener("mousedown", down);
        el.addEventListener("touchstart", down);

        el.addEventListener("mouseleave", leave);
        el.addEventListener("mouseup", up);
        el.addEventListener("touchend", up);

        el.addEventListener("mousemove", move);
        el.addEventListener("touchmove", move);
    });
</script>

<template>
    <div class="container">
        <h2 class="mm-heading2">Choose your OS:</h2>

        <div class="oses" ref="oses">
            <div class="os"
            v-for="os in allOSes"
            :class="{ locked: getUnlockRule(os.name) }">
                <h3>{{ os.name }}</h3>
                <div class="logo">
                    {{ returnUnicode(os.unicode) }}
                </div>
                
                <template v-if="!getUnlockRule(os.name)">
                    <p>
                        {{ os.description }}
                    </p>
                    <div class="stats">
                        <span>M:{{os.memory }}</span>
                        <span>A:{{os.adminSlots }}</span>
                        <span>$:{{os.money }}</span>
                        <span>{{returnUnicode("U+1FA77")}}:{{os.lives }}</span>
                    </div>
                    <h5>Starts with:</h5>
                    <div class="bps">
                        <div class="logo" 
                            v-for="bp in os.blueprints">
                            {{ returnUnicode(bp.unicode) }}
                        </div>
                    </div>
                    <div class="bps">
                        <div class="logo" 
                            v-for="bp in os.items">
                            {{ returnUnicode(bp.unicode) }}
                        </div>
                    </div>
                    <div class="bps">
                        <div class="logo" 
                            v-for="bp in os.admins">
                            {{ returnUnicode(bp.unicode) }}
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="unlock-rule">
                        <p>LOCKED</p>
                        <p>{{ getUnlockRule(os.name) }}</p>
                    </div>
                </template>

                <button :disabled="!!getUnlockRule(os.name)" @click="emit('createNewPlayer', { os, seed: seedInput })">
                    {{ getUnlockRule(os.name) ? 'Locked' : 'Choose' }}
                </button>
            </div>
        </div>
        <div class="seed-section flex">
            <label for="seed-input">Seed (optional):</label>
            <input 
                id="seed-input"
                type="text" 
                v-model="seedInput" 
                placeholder="Enter seed..."
                class="seed-input"
            />
            <button class="play-btn" :disabled="!seedInput" @click="startWithSeed">
                Play
            </button>
        </div>
    </div>
</template>

<style scoped>
    h1, h2{
        margin: 0;
        text-align: center;
    }
    h2{
        margin: 0.2rem;
    }
    .oses{
        z-index: 9999;
        padding: 1rem;
        background-color: black;
        color: white;
        display: flex;
        overflow-x: scroll;
        gap: 2rem;
        overflow-x: auto;
        overflow-y: hidden;
        cursor: grab;
        user-select: none;
        border: 1px solid white;
        border-radius: 10px;
        width: 90%;
    }
    @media only screen and (max-width: 760px) {
        .oses{
            left: 0;
            width: 90%;
        }
    }
    .os{
        border: 1px solid white;
        padding: 1rem;
        border-radius: 10px;
        min-width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
    }
    .logo{
        font-size: 36px;
    }
    .stats span{
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
    .bps{
        display: flex;
        justify-content: center;
        margin-bottom: 0.5rem;
    }
    @media (max-width: 500px) {
        .mm-heading, .mm-heading2{
            display: none;
        }
        .oses, .os{
            padding: 0.5rem;
            gap: 0.5rem;
            h3, p{
                margin: 0;
            }
        }
    }

    .os.locked {
        opacity: 0.6;
        filter: grayscale(0.8);
        border-color: #444;
    }
    .unlock-rule {
        text-align: center;
        margin: 1rem 0;
        font-weight: bold;
        color: #ff4444;
    }
    .os.locked button {
        cursor: not-allowed;
        background-color: #333;
        color: #777;
    }

    .seed-section {
        margin: 1rem 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
    }

    .seed-input {
        background: #111;
        border: 1px solid #444;
        color: #4CAF50;
        padding: 0.5rem;
        border-radius: 4px;
        font-family: monospace;
        text-align: center;
        width: 200px;
    }

    .seed-input:focus {
        outline: none;
        border-color: #4CAF50;
    }

    .play-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s, transform 0.1s;
    }

    .play-btn:hover:not(:disabled) {
        background-color: #45a049;
        transform: scale(1.05);
    }

    .play-btn:disabled {
        background-color: #333;
        color: #777;
        cursor: not-allowed;
    }
</style>