<script setup lang="ts">
    import { computed } from 'vue';

    interface Coord {
        x: number;
        y: number;
    }

    interface Piece {
        id: string;
        name: string;
        team: string;
        headPosition: Coord;
        tiles: Coord[];
    }

    interface Level {
        name: string;
        tiles: Coord[];
        pieces: Piece[];
    }

    const props = defineProps<{
        level: Level
    }>();

    const emit = defineEmits<{
        (e: "selectLevel", level: Level): void;
        (e: "openShop"): void;
    }>();

    // Build preview info for each props.level
    const preview = computed(() => {
   
        const maxX = Math.max(...props.level.tiles.map(t => t.x));
        const maxY = Math.max(...props.level.tiles.map(t => t.y));

        // Build quick lookup for tile → color
        const enemyTiles = new Set(props.level.pieces
            .filter(p => p.team === "enemy")
            .flatMap(p => p.tiles.map(t => `${t.x},${t.y}`))
        );

        const playerTiles = new Set(props.level.pieces
            .filter(p => p.team === "player")
            .flatMap(p => p.tiles.map(t => `${t.x},${t.y}`))
        );

        const tileData = props.level.tiles.map(tile => {
        const key = `${tile.x},${tile.y}`;
        let color = "#888"; // neutral default
        if (enemyTiles.has(key)) color = "red";
        if (playerTiles.has(key)) color = "blue";
            return {
                ...tile,
                color
            };
        });

        return {
            level: props.level,
            width: maxX + 1,
            height: maxY + 1,
            tileData
        };
    });
</script>

<template>
    <h4>Node Structure: {{ preview.level.name }}</h4>
    <div
        class="map-wrapper"
        @click="emit('selectLevel', preview.level)"
    >
        <div
            class="mini-map"
            :style="{ 
            width: preview.width * 8 + 'px',
            height: preview.height * 8 + 'px'
            }"
        >
            <div
            v-for="tile in preview.tileData"
            :key="tile.x + '-' + tile.y"
            class="mini-tile"
            :style="{
                backgroundColor: tile.color,
                left: tile.x * 8 + 'px',
                top: tile.y * 8 + 'px'
            }"
            ></div>
        </div>
    </div>
</template>

<style scoped>
    .map-grid {
        position: absolute;
        z-index: 101;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5px;
        gap: 12px;
        width: 48%;
        height: 70%;
        background-color: beige;
        padding: 1rem;
    }

    .map-wrapper {
        cursor: pointer;
        border: 1px solid #666;
        padding: 6px;
        border-radius: 4px;
        background-color: black;
        transition: transform 0.1s;
        height: fit-content;
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        width: fit-content;
    }

    .mini-map {
        position: relative;
    }

    .mini-tile {
        position: absolute;
        width: 6px;
        height: 6px;
        outline: 1px solid black;
    }

    .visible {
        transform: translateY(0);
    }

    .collapsed {
        transform: translateY(500%);
    }
</style>