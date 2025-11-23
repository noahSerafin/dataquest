<script setup lang="ts">
    //show node map in style of motherboard/circuitry
    //hovering over/clicking nodes shows their tile layout and spawn points
    //+confirmation box
    //confirming switches to Board.vue with that level

    import { computed } from "vue";

    interface Coord {
        x: number;
        y: number;
    }

    interface Piece {
        id: string;
        name: string;
        team: "enemy" | "player";
        headPosition: Coord;
        tiles: Coord[];
    }

    interface Level {
        tiles: Coord[];
        pieces: any[];
    }

    const props = defineProps<{
        levels: Level[];
        cssclass: 'visible' | 'collapsed';
    }>();

    const emit = defineEmits<{
        (e: "select-level", level: Level): void;
    }>();

    // Build preview info for each level
    const previews = computed(() => {
        return props.levels.map(level => {
            const maxX = Math.max(...level.tiles.map(t => t.x));
            const maxY = Math.max(...level.tiles.map(t => t.y));

            // Build quick lookup for tile → color
            const enemyTiles = new Set(level.pieces
            .filter(p => p.team === "enemy")
            .flatMap(p => p.tiles.map(t => `${t.x},${t.y}`))
            );

            const playerTiles = new Set(level.pieces
            .filter(p => p.team === "player")
            .flatMap(p => p.tiles.map(t => `${t.x},${t.y}`))
            );

            const tileData = level.tiles.map(tile => {
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
            level,
            width: maxX + 1,
            height: maxY + 1,
            tileData
            };
        });
    });
//:key="preview.level"
</script>

<template>
    <div class="map-grid"
        :class="props.cssclass"
    >
        <div
        v-for="preview in previews"
        class="map-wrapper"
        @click="emit('select-level', preview.level)"
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
    </div>
</template>

<style scoped>
    .map-grid {
        position: absolute;
        z-index: 99;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5px;
        gap: 12px;
        width: 48%;
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
    }

    .map-wrapper:hover {
        transform: scale(1.05);
    }

    .mini-map {
        position: relative;
    }

    .mini-tile {
        position: absolute;
        width: 8px;
        height: 8px;
        outline: 1px solid black;
    }

    .visible {
        transform: translateY(0);
    }

    .collapsed {
        transform: translateY(500%);
    }
</style>
