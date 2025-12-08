<script setup lang="ts">
    import { computed, ref, onMounted } from "vue";
    import type { Company } from "../types";
    import MiniMap from "./MiniMap.vue";
    import { Admin } from "../AdminPrograms";
    import { allBosses } from "../Bosses";

    const companies: Company[] = [
        { name: 'Nightbridge Corp', unicode: "U+1F309" },
        { name: 'Meridian Security Inc', unicode: "U+1F310" },
        { name: 'Longhouse Web Services', unicode: "U+1F6D6" },
        { name: 'Tsukimi Group', unicode: "U+1F391" },
        { name: 'Zenith Ltd.', unicode: "U+1F304" },
        { name: 'Starlane Tech', unicode: "U+1F30C" },
        { name: 'Sunrise Associates', unicode: "U+1F305" },
        { name: 'Saturn Solutions', unicode: "U+1FA90" },
        { name: 'Flyby Surveilance', unicode: "U+1FAB0" },
        { name: 'Monarch Media', unicode: "U+1F98B" },
        { name: 'Red Sky Dynamics', unicode: "U+1F3B4" },
        { name: 'Whiteflower Global', unicode: "U+1F4AE" },
        { name: 'Cook.io', unicode: "U+1F36A" },
        { name: 'Sakura Robotics', unicode: "U+1F338"}
    ]

    //world graph structure
    interface WorldNode {
        id: string;                // "node_1"
        type: "start" | "level" | "rewardLevel" | "shop" | "boss";
        level?: Level;             // Only for type: level
        next: string[];            // IDs of next nodes
        position: { x: number; y: number }; // For layout on screen
        difficultyMod: number;
        reward: number;
    }

    interface WorldMap {
        nodes: Record<string, WorldNode>;
        startNode: string;
    }

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
        difficulty: number;
        allLevels: Level[];
        cssclass: 'visible' | 'collapsed';
    }>();

    const emit = defineEmits<{
        (e: "select-level", level: Level, difficultyMod: number): void;
        (e: "openShop"): void;
        (e: "addBoss", admin: Admin): void;
        (e: "increaseDifficulty"): void;
    }>();

    function generateWorld(levelPool: Level[]): WorldMap {
        const pick = () => levelPool[Math.floor(Math.random() * levelPool.length)];

        const start = "start";
        const a1 = "pathA_1";
        const a2 = "pathA_2";
        const b1 = "pathB_1";
        const b2 = "pathB_2";
        const merge = "shop";
        const final = "boss";

        return {
            startNode: start,
            nodes: {
            [start]: {//have a shop at start?
                id: start,
                type: "level",
                next: [a1, b1],
                position: { x: 200, y: 400 },
                difficultyMod: 0,
                reward: 1
            },
            [a1]: {
                id: a1,
                type: "shop",
                next: [a2],
                position: { x: 100, y: 250 },
                difficultyMod: 0,
                reward: 0
            },
            [a2]: {
                id: a2,
                level: pick(),
                type: "level",
                next: [merge],
                position: { x: 100, y: 100 },
                difficultyMod: 1,
                reward: 2
            },
            [b1]: {
                id: b1,
                type: "level",
                level: pick(),
                next: [b2],
                position: { x: 300, y: 250 },
                difficultyMod: 0,
                reward: 3
            },
            [b2]: {
                id: b2,
                type: "level",
                level: pick(),
                next: [merge],
                position: { x: 300, y: 100 },
                difficultyMod: 0,
                reward: 5
            },
            [merge]: {
                id: merge,
                type: "shop",
                next: [final],
                position: { x: 200, y: 50 },
                difficultyMod: 0,
                reward: 0
            },
            [final]: {
                id: final,
                type: "boss",
                level: pick(),
                next: [],
                position: { x: 200, y: 0 },
                difficultyMod: 0,
                reward: 2
            }
            }
        };
    }

    const world = ref<WorldMap>(generateWorld(props.allLevels));//should be called again with after boss after increase difficulty
    const currentNodeId = ref(world.value.startNode);
    const selectedPreviewNode = ref<WorldNode | null>(null);

    const worldNodes = computed(() =>
        Object.values(world.value.nodes)
    );

    function canClick(node: WorldNode): boolean {
        if (node.id === currentNodeId.value) return false;

        const next = world.value.nodes[currentNodeId.value].next;
        return next.includes(node.id);
    }

    function trySelect(node: WorldNode) {
        if (!canClick(node)) return;
        selectedPreviewNode.value = node;
    }

    function enterNode(node: WorldNode) {
        selectedPreviewNode.value = null;
        currentNodeId.value = node.id;

        if(node.type == 'shop'){
            emit('openShop')
        }
        if(node.type === 'boss'){
            const boss = allBosses[Math.floor(Math.random() * allBosses.length)];
            emit("addBoss", new boss);
        }
        if (node.level) {
            console.log(node.level)
            emit("select-level", node.level, node.difficultyMod);
        }
    }

    function displayIcon(node: WorldNode) {
        switch (node.type) {
            case "start": return "⬤";
            case "shop": return "🛒";
            case "level": return "■";
            case "boss": return "👑";
        }
    }

    const connections = computed(() => {
    const list: { x1: number; y1: number; x2: number; y2: number }[] = [];

    const nodes = world.value.nodes;

    for (const node of Object.values(nodes)) {
        // Node → all its next connections
        for (const nextId of node.next) {
        const nextNode = nodes[nextId];
        if (!nextNode) continue;

        // Center the line on the node "dot"
        const x1 = node.position.x + 12; // adjust if your node size changes
        const y1 = node.position.y + 12;
        const x2 = nextNode.position.x + 12;
        const y2 = nextNode.position.y + 12;

        list.push({ x1, y1, x2, y2 });
        }
    }
    return list;
    });
</script>

<template>
  <div class="world-map"
    :class="props.cssclass"
    >
    <div class="node-map">
        <!-- Nodes -->
        <div
            v-for="node in worldNodes"
            :key="node.id"
            class="node"
            :class="{
                clickable: canClick(node),
                current: node.id === currentNodeId
            }"
        :style="{
            left: node.position.x + 'px',
            top: node.position.y + 'px'
            }"
        @click="trySelect(node)"
        >
        {{ displayIcon(node) }}
        </div>
        <svg class="map-lines" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
            <line
            v-for="(conn, i) in connections"
            :key="i"
            :x1="conn.x1"
            :y1="conn.y1"
            :x2="conn.x2"
            :y2="conn.y2"
            stroke="#000"
            stroke-width="3"
            stroke-linecap="round"
            />
        </svg>
    </div>

    <!-- Preview modal -->
    <div v-if="selectedPreviewNode" class="preview-modal">
      <h3>{{ selectedPreviewNode.type.toUpperCase() }}</h3>

      <MiniMap v-if="selectedPreviewNode.level"
        :level="selectedPreviewNode.level"
      />
        <div class="btns">

            <button @click="enterNode(selectedPreviewNode)">Enter</button>
            <button @click="selectedPreviewNode = null">Close</button>
        </div>
    </div>
  </div>
</template>


<style scoped>
    .visible {
        transform: translateY(0);
    }
    .collapsed {
        transform: translateY(500%);
        top: 100%;
    }
    .world-map {
        position: absolute;
        width: 50vw;
        height: 90vh;
        background-color: rgb(230, 218, 181);
        z-index: 98;
        padding: 2rem;
        display: flex;
        justify-content: center;
    }
    .node-map{
        position: relative;
        width: 50%;
        height: 80%;
    }
    .map-lines{
        z-index: 0;
    }
    .node {
        position: absolute;
        width: 32px;
        height: 32px;
        border: 2px solid #444;
        background: #222;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        opacity: 0.4;
        z-index: 2;
    }
    .node.clickable {
        opacity: 1;
        cursor: pointer;
        border-color: yellow;
    }
    .node.current {
        border-color: cyan;
    }
    .preview-modal {
        position: absolute;
        left: 10%;
        top: 10%;
        width: 80%;
        height: auto;
        background: #111;
        padding: 16px;
        border: 2px solid #444;
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .btns{
        display: flex;
        justify-content: space-between;
        gap: 1rem;
    }
</style>
