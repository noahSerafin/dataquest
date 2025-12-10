<script setup lang="ts">
    import { computed } from 'vue';
    import type { OS } from '../types';
    import { allOSes } from '../Operators';

    const emit = defineEmits<{
        (e: 'createNewPlayer', os: OS): void;
    }>();

    function returnUnicode(unicode: String){
        return  String.fromCodePoint(parseInt(unicode.replace('U+', ''), 16));
    }
</script>

<template>
    <h1>Welcome</h1>
    <h2>Choose your Operator:</h2>
    <div class="oses">
        <div class="os"
        v-for="os in allOSes">
            <h3>{{ os.name }}</h3>
            <div class="logo">
                {{ returnUnicode(os.unicode) }}
            </div>
            <p>
                {{ os.description }}
            </p>
            <div class="stats">
                <span>M:{{os.memory }}</span>
                <span>A:{{os.adminSlots }}</span>
                <span>$:{{os.money }}</span>
            </div>
        <h5>Starts with:</h5>
        <div class="bps">
            <div class="logo" 
                v-for="bp in os.blueprints">
                {{ returnUnicode(bp.unicode) }}
            </div>
        </div>
        <button @click="emit('createNewPlayer', os)">Choose</button>
        </div>
    </div>
</template>

<style scoped>
    .oses{
        position: absolute;
        z-index: 9999;
        width: 50%;
        max-width: 1280px;
        padding: 2rem;
        background-color: black;
        color: white;
        display: flex;
        overflow-x: scroll;
        gap: 2rem;
    }
    .os{
        border: 1px solid white;
        padding: 1rem;
        border-radius: 10px;
        min-width: 200px;
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
        margin-bottom: 1rem;
    }
</style>