<script setup lang="ts">
    import { ref, computed, onMounted, watchEffect } from 'vue';
    import type { OS } from '../types';
    import { allOSes } from '../Operators';
    import { StorageManager } from '../StorageManager';
    import FormattedDescription from './FormattedDescription.vue';
    import { STATUS_COLORS } from '../statuses';
    import { getSpriteStyle } from '../helperFunctions';

    const props = defineProps<{
        debugMode: boolean;
        stake: number;
    }>();

    const emit = defineEmits<{
        (e: 'createNewPlayer', payload: { os: OS, seed: string, stake?: number }): void;
        (e: 'resumeGame'): void;
        (e: 'increaseStake'): void;
        (e: 'decreaseStake'): void;
    }>();

    function decreaseStake() {
        emit('decreaseStake');
    }

    function increaseStake() {
        emit('increaseStake');
    }

    const seedInput = ref<string>('');
    const selectedIndex = ref<number>(0);

    const leftIndex = computed(() => (selectedIndex.value - 1 + allOSes.length) % allOSes.length);
    const rightIndex = computed(() => (selectedIndex.value + 1) % allOSes.length);

    const visibleOSes = computed(() => {
        return [
            { os: allOSes[leftIndex.value], position: 'left' },
            { os: allOSes[selectedIndex.value], position: 'center' },
            { os: allOSes[rightIndex.value], position: 'right' }
        ];
    });

    function nextOS() {
        selectedIndex.value = rightIndex.value;
    }

    function prevOS() {
        selectedIndex.value = leftIndex.value;
    }

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
        if (osName === 'Steam' || osName === 'Window' || osName === 'Apple') {
            if (!props.debugMode && !hasPlayedOnce.value) return "Play at least one game to unlock";
        }
        if (osName === 'Debugger') {
            if (!props.debugMode) return "For debugging";
        }
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
            if (!props.debugMode && !StorageManager.hasStakeWin(4)) return "Win with at least 3 infamy with two different operators";
        }
        if (osName === 'Explorer') {
            if (!props.debugMode && StorageManager.getUniqueWinsCount() < 6) return "Win with at least 6 different operators";
        }
        if (osName === 'Satoshi') {
            if (!props.debugMode && !StorageManager.hasStakeWin(5)) return "Win with at least 3 infamy with 3 different operators";
        }
        //Explorer, Satoshi, Debugger
        return null;
    }

    const hasSave = ref<boolean>(false);
    const hasPlayedOnce = ref<boolean>(false);

    function getWinsForOS(unicode: string): number[] {
        return StorageManager.getWinningStakesForOS(unicode);
    }

    function getStakeSymbol(stake: number): string {
        const symbols = ['♺', '♳', '♴', '♵'];
        return symbols[stake] || `[${stake}]`;
    }

    const maxStakeForSelectedOS = computed(() => {
        if (props.debugMode) return 99;
        const currentOS = allOSes[selectedIndex.value];
        const wins = getWinsForOS(currentOS.unicode);
        if (!wins || wins.length === 0) return 0;
        return Math.max(...wins) + 1;
    });

    watchEffect(() => {
        if (props.stake > maxStakeForSelectedOS.value) {
            emit('decreaseStake');
        }
    });

    const stakeColor = computed(() => {
        const symbol = getStakeSymbol(props.stake);
        return STATUS_COLORS[symbol] || '#ffffff';
    });
 
    onMounted(() => {
        hasSave.value = StorageManager.hasSaveGame();
        hasPlayedOnce.value = StorageManager.getHasPlayedOnce();
    });
</script>

<template>
    <div class="container">
        <h2 class="mm-heading2">Choose your OS:</h2>

        <div class="carousel-container">
            <TransitionGroup name="os-slide" tag="div" class="oses">
                <button class="nav-btn left-btn" @click="prevOS" key="left-btn">
                    <svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" style="transform: scaleX(-1);">
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" fill="#404040"/>
                        <path d="M11 15L13.7158 12.2842V12.2842C13.8728 12.1272 13.8728 11.8728 13.7158 11.7158V11.7158L11 9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff" stroke-width="2"/>
                    </svg>
                </button>
                <div class="os"
                v-for="item in visibleOSes"
                :key="item.os.name"
                :class="[
                    item.position === 'center' ? 'center-os' : 'side-os',
                    { locked: getUnlockRule(item.os.name) }
                ]"
                @click="item.position === 'left' ? prevOS() : (item.position === 'right' ? nextOS() : null)">
                    <div class="usb-connector"></div>
                    <div class="os-content">
                        <h3 class="mb-0">{{ item.os.name }}</h3>
                        <div class="logo" :style="getSpriteStyle(item.os.iconID)">
                        </div>

                        <div class="os-wins" v-if="getWinsForOS(item.os.unicode).length > 0">
                            <FormattedDescription v-for="winStake in getWinsForOS(item.os.unicode)" :key="winStake" :description="getStakeSymbol(winStake)" />
                        </div>
                        
                        <template v-if="!getUnlockRule(item.os.name)">
                            <p class="os-description">
                                <FormattedDescription :description="item.os.description" />
                            </p>
                            <div class="stats">
                                <span>M:{{item.os.memory }}</span>
                                <span>A:{{item.os.adminSlots }}</span>
                                <span>$:{{item.os.money }}</span>
                                <span>{{returnUnicode("U+1FA77")}}:{{item.os.lives }}</span>
                            </div>
                            <h5 class="mb-0">Starts with:</h5>
                            <div class="bps">
                                <div class="logo" 
                                    v-for="bp in item.os.blueprints" :style="getSpriteStyle(bp.iconID)">
                                </div>
                            </div>
                            <div class="bps">
                                <div class="logo" 
                                    v-for="bp in item.os.items" :style="getSpriteStyle(bp.iconID)">
                                </div>
                            </div>
                            <div class="bps">
                                <div class="logo" 
                                    v-for="bp in item.os.admins" :style="getSpriteStyle(bp.iconID)">
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="unlock-rule">
                                <p>LOCKED</p>
                                <p>{{ getUnlockRule(item.os.name) }}</p>
                            </div>
                        </template>

                        <button v-if="item.position === 'center'" :disabled="!!getUnlockRule(item.os.name)" @click.stop="emit('createNewPlayer', { os: item.os, seed: seedInput })">
                            {{ getUnlockRule(item.os.name) ? 'Locked' : 'Choose' }}
                        </button>
                    </div>
                </div>
                <button class="nav-btn right-btn" @click="nextOS" key="right-btn">
                    <svg width="60px" height="60px" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" fill="#404040"/>
                        <path d="M11 15L13.7158 12.2842V12.2842C13.8728 12.1272 13.8728 11.8728 13.7158 11.7158V11.7158L11 9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff" stroke-width="2"/>
                    </svg>
                </button>
            </TransitionGroup>
        </div>
        <div class="flex m-auto" v-if="hasPlayedOnce || debugMode">
            <div class="stake-btn-container">
                <button @mousedown="decreaseStake()" v-if="stake > 0">
                    -
                </button>
            </div>
            <strong :style="{ color: stakeColor }">Infamy: {{ stake }}</strong>
            <div class="stake-btn-container">
                <button @mousedown="increaseStake()" v-if="stake < maxStakeForSelectedOS">
                +
                </button>
            </div>
        </div>    
        <div class="load-section">
            <div class="seed-section">
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
            <div class="resume-section" v-if="hasSave">
                <span>OR </span>
                <button class="resume-btn" @click="emit('resumeGame')">
                    Resume Game
                </button>
            </div>
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
    .carousel-container {
        display: flex;
        justify-content: center;
        width: 100%;
        margin: 1rem 0;
    }
    .oses {
        position: relative;
        z-index: 9999;
        padding: 3rem 1rem 2rem;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        user-select: none;
        width: 90%;
        max-width: 1000px;
        overflow: visible;
    }
    .os {
        width: 240px;
        height: 520px;
        flex-shrink: 0;
        position: relative;
        margin-top: 30px;
        margin-bottom: 10px;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
        cursor: pointer;
    }
    .os-content {
        border: 2px solid #555;
        background: linear-gradient(145deg, #222, #111);
        padding: 1.5rem 0.5rem 1rem;
        border-radius: 22px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        position: relative;
        z-index: 2;
        box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1);
        box-sizing: border-box;
    }
    .usb-connector {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 70px;
        height: 40px;
        background: linear-gradient(to right, #999, #eee 20%, #bbb 80%, #999);
        border: 2px solid #555;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        z-index: 1;
    }
    .usb-connector::after {
        content: '';
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 34px;
        height: 8px;
        border-left: 6px solid rgba(0,0,0,0.8);
        border-right: 6px solid rgba(0,0,0,0.8);
        background: transparent;
    }
    .os.center-os {
        transform: scale(1.05);
        opacity: 1;
        z-index: 2;
    }
    .os.center-os .os-content {
        border-color: #888;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), inset 0 2px 0 rgba(255,255,255,0.2);
    }
    .os.center-os:hover {
        transform: scale(1.08);
    }
    .os.side-os {
        transform: scale(0.85);
        opacity: 0.4;
        cursor: pointer;
        z-index: 1;
    }
    .os.side-os .os-content {
        filter: grayscale(0.3);
    }
    .os.side-os:hover {
        opacity: 0.7;
    }
    .os.side-os:hover .os-content {
        filter: grayscale(0.1);
    }
    .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.2s;      padding: 0;
    }
    .nav-btn:hover {
        opacity: 1;
        transform: translateY(-50%) scale(1.1);
    }
    .left-btn {
        left: 10px;
    }
    .right-btn {
        right: 10px;
    }
    
    /* Carousel Slide Animations */
    .os-slide-move {
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .os-slide-enter-active {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .os-slide-enter-from {
        opacity: 0;
        transform: scale(0.5);
    }
    .os-slide-leave-active {
        display: none; /* Instantly remove to let FLIP handle the slide */
    }
    .logo{
        font-size: 36px;
        width: 36px;
        height: 36px;
        display: inline-block;
    }
    .stats span{
        font-weight: bold;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
    .bps{
        display: flex;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .os-wins {
        position: absolute;
        top: 22px;
        right: 15px;
        display: flex;
        gap: 4px;
        font-size: 1.2rem;
        flex-direction: column;
    }

    .os.locked {
        opacity: 0.6;
        filter: grayscale(0.8);
    }
    .os.locked .os-content {
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
    .load-section{
        margin: 0.5rem 0;
    }
    .load-section, .seed-section {
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
    .flex{
        margin: auto;
        display: flex;
        justify-content: space-around;
        width: 60%;
    }
    .mb-0{
        margin-bottom: 0;
    }

    @media (max-width: 500px) {
        .mm-heading, .mm-heading2{
            font-size: 1rem;
        }
        .oses, .os{
            padding: 0.5rem;
            gap: 0.5rem;
            h3, p{
                margin: 0;
            }
        }
        .oses{
            width: 95vw;
            margin: 0 auto;
        }
        .os {
            width: 60vw;
        }
        .load-section{
            width: 90vw;
            display: block;
        }
    }
    .os-description{
        padding: 5px;
        text-align: center;
    }
</style>