<script setup lang="ts">
    import { computed, ref, onMounted } from "vue";
    import MiniMap from "./MiniMap.vue";
    import { Admin } from "../AdminPrograms";
    import { Item } from "../Items";
    import { allBosses } from "../Bosses";
    import { watch } from "vue";
    import { Player } from "../Player";
    import type { WorldMap, WorldNode } from "../worldBuilder";
    import { generateWorld } from "../worldBuilder";
    import type { Level, PieceBlueprint, SkipReward } from "../types";
    import { castled, cave, level1Levels, penopticon, ringed } from "../level1Levels";
    import { level2Levels } from "../level2Levels";
    import { level3Levels } from "../level3Levels";
    import { level4Levels } from "../level4Levels";
    import { allPieces } from "../Pieces";
    import { allAdmins } from "../AdminPrograms";
    import { makeBlueprint, pickWeightedRandom, pickWeightedRandomItem } from "../helperFunctions";
    import { Box, Genie, Gift, Pinata } from "../Items";
    import BlueprintView from "./BlueprintView.vue";
    import ItemView from "./ItemView.vue";
import BlueprintController from "./BlueprintController.vue";

    const props = defineProps<{
        player: Player;
        allLevels: Level[];
        seed: number;
        cssclass: 'visible' | 'collapsed';
    }>();

    const emit = defineEmits<{
        (e: "select-level", level: Level, difficultyMod: number, reward: number): void;
        (e: "openShop"): void;
        (e: "addBoss", admin: Admin): void;
        (e: "increaseDifficulty"): void;
    }>();

    const levelTiers = [
        level1Levels,
        level2Levels,
        level3Levels,
        level4Levels,//add some alarm pieces
        [castled, penopticon, cave, ringed, ...level4Levels],
        [castled, penopticon, cave, ringed, ...level3Levels, ...level4Levels]
    ]

    const levelPool = computed(() => {
        const tierIndex = Math.min(
            props.player.difficulty -1
        );
        return levelTiers[tierIndex];
    });
    
    const world = ref<WorldMap>(generateWorld(levelPool.value, props.player.difficulty));//should be called again with after boss after increase difficulty
    assignSkipRewards(world.value);

    const currentNodeId = ref(world.value.startNode);
    const selectedPreviewNode = ref<WorldNode | null>(null);
    const boss = ref<Admin>(new allBosses[Math.floor(Math.random() * allBosses.length)])

    function newBoss() {
        const bossPool = allBosses.filter(
            boss => boss.rarity <= props.player.difficulty
        );
        const pool = bossPool.length > 0 ? bossPool : allBosses;
        boss.value = new pool[Math.floor(Math.random() * pool.length)]; 
    }


    const worldNodes = computed(() =>
        Object.values(world.value.nodes)
    );

    function canClick(node: WorldNode): boolean {
        if (node.id === currentNodeId.value) return false;
        if(props.player.admins.some(a => a.name === 'Off Roader')){
            const current = world.value.nodes[currentNodeId.value];
            const sameRow = node.position.y === current.position.y;
            if (sameRow && node.type !== 'boss' && node.type !== 'start') {
                return true;
            }
        }
        
        const next = world.value.nodes[currentNodeId.value].next;
        return next.includes(node.id);
    }

    function trySelect(node: WorldNode) {
        if(!props.player.admins.some(a => a.name === 'World Map') && node.type !== 'shop' || (!props.player.admins.some(a => a.name === 'Crystal Ball') && node.type === 'shop')){
            if (!canClick(node)) return;
        }
        selectedPreviewNode.value = node;
    }

    function canSkip(node: WorldNode){
        if(props.player.admins.some(a => a.name === 'Golden Ticket') && !(node.type==='boss')){
            if(props.player.money >= 5 || (props.player.admins.some(a => a.name === 'Golden Ticket') && props.player.money >= -15 )){
                return true;
            } else return false;
        } else return false;
    }
    function skipNode(node: WorldNode){
        selectedPreviewNode.value = null;
        currentNodeId.value = node.id;
        props.player.spend(5)
    }

    function enterNode(node: WorldNode) {
        selectedPreviewNode.value = null;

        currentNodeId.value = node.id;

        if(node.type == 'shop'){
            emit('openShop')
        }
        if(node.type === 'boss'){
            emit("addBoss", boss.value);
        }
        if (node.level) {
            console.log(node.level)
            emit("select-level", node.level, node.difficultyMod, (node.reward + props.player.bonusReward));
        }
    }

    function displayIcon(node: WorldNode) {
         if (node.type === 'skip' && node.skipReward) {
            return String.fromCodePoint(
            parseInt(node.skipReward.value.unicode.replace('U+', ''), 16)
            );
        }
        switch (node.type) {
            case "start": return "⬤";
            case "shop": return "🛒";
            case "level": return String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16));
            case "boss": return  String.fromCodePoint(parseInt(boss.value.unicode.replace('U+', ''), 16));
            case "skip": return 
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

    const visibleNodeIds = computed(() => {
        const visible = new Set<string>();

        for (const node of Object.values(world.value.nodes)) {
            // not hidden at all
            if (!node.hiddenUntilVisited || props.player.admins.some(a => a.name === 'Compass')) {
            visible.add(node.id);
            continue;
            }

            // becomes visible once prerequisite is current or passed
            if (node.hiddenUntilVisited === currentNodeId.value) {
            visible.add(node.id);
            }
        }
        return visible;
    });

    function generateSkipReward(node: WorldNode): SkipReward{
        const roll = Math.random();
        if (roll < 0.4) {
            return {
                kind: 'blueprint',
                value: makeBlueprint(pickWeightedRandom(allPieces, props.player))
            }
        }
        if (roll < 0.7) {
            return {
            kind: "admin",
            value: pickWeightedRandomItem(allAdmins, props.player),
            };
        }
        return {
            kind: "item",
            value: pickWeightedRandomItem([Box, Gift, Genie, Pinata], props.player),
        };
    }

    function assignSkipRewards(world: WorldMap) {
        for (const node of Object.values(world.nodes)) {
            if (node.type === 'skip' && !node.skipReward) {
                node.skipReward = generateSkipReward(node);
                node.skipReward.value.cost = 0;
            }
        }
    }

    function takeSkipReward(node: WorldNode){//ask about this next
        //app has buy blueprint/item functions, could use those???
        if (!node.skipReward) return;
        switch (node.skipReward.kind) {
            case "blueprint":
            props.player.addProgram(node.skipReward.value); //player functions return false if there is not enough inventory space, could use these to prevent proceeding?
            break;

            case "admin":
            props.player.addAdmin(node.skipReward.value, props.player);
            break;

            case "item":
            props.player.addItem(node.skipReward.value);
            break;
        }
        if(selectedPreviewNode.value?.next){
            currentNodeId.value = selectedPreviewNode.value.next[0]
            selectedPreviewNode.value = null;
        }
    }

    const skipTarget = ref<PieceBlueprint | Item | null>(null);
    function checkTargetMatch(target: SkipReward){
        if(target.value === skipTarget.value){
            return true;
        }
        return false;
    }
    function select(target: SkipReward){
        skipTarget.value = target.value;
    }
    function deselect(){
        skipTarget.value = null;
    }

    watch(
        () => props.seed,
        () => {
            // rebuild world graph
            world.value = generateWorld(levelPool.value, props.player.difficulty);
            assignSkipRewards(world.value);
            currentNodeId.value = world.value.startNode;
            // generate new boss
            newBoss();
        }
    );
</script>

<template>
  <div class="container world-map"
    :class="props.cssclass"
    >
    <div class="node-map">
        <!-- Nodes -->
        <div
            v-for="node in worldNodes"
            :key="node.id"
            class="node "
            :class="{
                clickable: canClick(node),
                current: node.id === currentNodeId,
                hidden: !visibleNodeIds.has(node.id),
                visible: visibleNodeIds.has(node.id),
            }"
            :style="{
                left: node.position.x + 'px',
                top: node.position.y + 'px'
            }"
            @click="trySelect(node)"
        >
        <div v-if="node.type=='level' "class="company-info">
            <div>
                {{ node.company.abbr }}
            </div>
            <div>
                $ {{ node.reward }}
            </div>
            <div>
                {{ String.fromCodePoint(parseInt("U+1F512".replace('U+', ''), 16)) }} : {{ node.difficultyMod + player.difficulty }}
            </div>
        </div>
            {{ displayIcon(node) }}
        <div v-if="node.type==='boss'"
        class="boss-info"
        >
            <strong>
             {{ boss.name }}:
            </strong>
            <span>
                {{ boss.description }}
            </span>
        </div>
        </div>
        <svg class="map-lines" style="position: absolute; inset: 0; width: 100vw; height: 100vh; pointer-events: none;">
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
      <h6 v-if="selectedPreviewNode.type==='skip'">(Must have room)</h6>
      <h4 v-if="selectedPreviewNode.type==='boss' || selectedPreviewNode.type==='level'">{{ selectedPreviewNode.company.name}}</h4>
      <h6 v-if="selectedPreviewNode.type==='boss' || selectedPreviewNode.type==='level'">Reward: ${{ selectedPreviewNode.reward }}</h6>
      <MiniMap v-if="selectedPreviewNode && selectedPreviewNode.level"
        :level="selectedPreviewNode.level"
        :company="selectedPreviewNode.company"
        />
        <template v-if="selectedPreviewNode?.type === 'skip'">
            <BlueprintView
                v-if="selectedPreviewNode.skipReward?.kind === 'blueprint'"
                :blueprint="selectedPreviewNode.skipReward.value"
                :tileSize="60"
                cssclass="skipReward"
                @select="select(selectedPreviewNode.skipReward)"
                @deselect="deselect"
            />
            <!--<BlueprintController v-if="selectedPreviewNode.skipReward?.kind === 'blueprint'/>-->

            <ItemView
                v-if="selectedPreviewNode.skipReward?.kind === 'admin'"
                type = "admin"
                :item="selectedPreviewNode.skipReward.value"
                :tileSize="60"
                :canBuy="false"
                cssclass="shop"
                :showController="checkTargetMatch(selectedPreviewNode.skipReward)"
                @select="select(selectedPreviewNode.skipReward)"
                @deselect="deselect"
            />

            <ItemView
                v-if="selectedPreviewNode.skipReward?.kind === 'item'"
                type = "consumable"
                :item="selectedPreviewNode.skipReward.value"
                :tileSize="60"
                :canBuy="false"
                cssclass="shop"
                :showController="checkTargetMatch(selectedPreviewNode.skipReward)"
                @select="select(selectedPreviewNode.skipReward)"
                @deselect="deselect"
            />
        </template>
        <div class="btns">
            <button
                v-if="selectedPreviewNode?.type === 'skip' && (selectedPreviewNode.skipReward?.kind === 'blueprint' || selectedPreviewNode.skipReward?.kind === 'item')"
                :disabled="!player.hasMemorySpace"
                @click="takeSkipReward(selectedPreviewNode)"
                >
                Accept Reward
            </button>
            <button v-if="selectedPreviewNode && selectedPreviewNode?.type !== 'skip'" @click="enterNode(selectedPreviewNode)">Enter</button>
            <button v-if="selectedPreviewNode" @click="selectedPreviewNode = null">Close</button>
            <button v-if="canSkip(selectedPreviewNode)" @click="skipNode(selectedPreviewNode)">Skip $5</button>
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
        background-color: rgb(230, 218, 181);
        z-index: 98;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .node-map{
        position: relative;
        width: 50%;
        height: 80%;
    }
    .map-lines{
        z-index: -1;
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
        z-index: 0;
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
    .boss-info, .company-info{
        position: absolute;
        background-color: #111;
        font-size: 14px;
        opacity: 1;
        width: 260px;
        left: 120%;
        border: 1px solid white;
        border-radius: 5px;
        padding: 0.2rem;
    }
    .company-info{
        right: 100%;
        left: unset;
        width: 50px;
        text-align: center;
    }
    @media (max-width: 768px) {
        .world-map{
            justify-content: flex-start;
        }
    }
    .node.hidden {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
    }

    .node.visible {
    visibility: visible;
    opacity: 1;
    }
    h6{
        margin: 0.5rem;
    }
</style>
