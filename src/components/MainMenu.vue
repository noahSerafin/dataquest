<script setup lang="ts">
    import { computed, onMounted } from 'vue';
    import type { OS } from '../types';
    import { allOSes } from '../Operators';

    const emit = defineEmits<{
        (e: 'createNewPlayer', os: OS): void;
    }>();

    function returnUnicode(unicode: String){
        return  String.fromCodePoint(parseInt(unicode.replace('U+', ''), 16));
    }

 
    onMounted(() => {
        const el = document.querySelector('.oses');
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
        <h1>Welcome</h1>
        <h2>Choose your OS:</h2>
        <div class="oses" ref="oses">
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
        padding: 2rem;
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
        margin-bottom: 1rem;
    }
</style>