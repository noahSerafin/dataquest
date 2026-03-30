<script setup lang="ts">
    import { computed, ref } from "vue";
    import MiniMap from "./MiniMap.vue";
    import { Admin } from "../AdminPrograms";
    import { Item, Box, Genie, Gift, Pinata, Pandora, Voucher, Jar, Update2, Update3, Floppy, Life, Cake, Wand, Hourglass, Dupe } from "../Items";
    import { allBosses, nonStackableBosses } from "../Bosses";
    import { watch } from "vue";
    import { reapplyTutorialTooltips, showTutorialTip } from "../tutorial";
    import { Player } from "../Player";
    import type { WorldMap, WorldNode } from "../worldBuilder";
    import { generateWorld } from "../worldBuilder";
    import type { Level, PieceBlueprint, SkipReward } from "../types";
    import { level1Levels } from "../level1Levels";
    import { level2Levels } from "../level2Levels";
    import { level3Levels } from "../level3Levels";
    import { level4Levels } from "../level4Levels";
    import { level5Levels } from "../level5Levels";
    import { allPieces } from "../Pieces";
    import { allAdmins } from "../AdminPrograms";
    import { makeBlueprint, pickWeightedRandom, pickWeightedRandomItem } from "../helperFunctions";
    import BlueprintView from "./BlueprintView.vue";
    import ItemView from "./ItemView.vue";
    import BlueprintController from "./BlueprintController.vue";
    import { level6Levels } from "../level6Levels";
    import { StorageManager } from "../StorageManager";

    const props = defineProps<{
        player: Player;
        allLevels: Level[];
        seed: number;
        cssclass: 'visible' | 'collapsed';
        bosses: Admin[]
    }>();

    const emit = defineEmits<{
        (e: "select-level", level: Level, difficultyMod: number, reward: number): void;
        (e: "openShop"): void;
        (e: "openDisabledShop"): void;
        (e: "openCompiler"): void;
        (e: "addBoss", admin: Admin): void;
        (e: "replaceBosses", admins: Admin[]): void;
        (e: "increaseDifficulty"): void;
        (e: "incrementProgress"): void;
    }>();

    const levelTiers = [
        level1Levels,
        level2Levels,
        level3Levels,
        level4Levels,//add some alarm pieces
        level5Levels,
        level6Levels
    ]

    const levelPool = computed(() => {
        if(props.player.difficulty > 6){
            return [...level1Levels, ...level2Levels, ...level3Levels, ...level4Levels, ...level5Levels, ...level6Levels]
        }
        const tierIndex = Math.min(
            props.player.difficulty -1
        );
        return levelTiers[tierIndex];
    });
    const skipsThisLevel = ref<number>(0);

    const world = ref<WorldMap>(generateWorld(levelPool.value, props.player.difficulty));//should be called again with after boss after increase difficulty
    assignSkipRewards(world.value);

    const currentNodeId = ref(world.value.startNode);
    const selectedPreviewNode = ref<WorldNode | null>(null);
    const boss = ref<Admin>(returnNewBoss());

    function returnNewBoss() {
        skipsThisLevel.value = 0;
        const bossPool = props.player.difficulty > 6 ? allBosses : allBosses.filter(
            boss => boss.rarity <= props.player.difficulty && boss.rarity >= props.player.difficulty - 1
        );
        const pool = bossPool.length > 0 ? bossPool : allBosses;

        //don't add bosses whose effects don't stack
        const duplicatesToRemove = nonStackableBosses.filter(boss => 
            props.bosses.some(playerBoss => playerBoss.name === boss.name)
        );
        const duplicateNames = new Set(duplicatesToRemove.map(b => b.name));
        const filteredPool = pool.filter(boss => !duplicateNames.has(boss.name));

        console.log('allbosses', allBosses.length)
        //console.log('pool', pool.length)
        return new filteredPool[Math.floor(Math.random() * filteredPool.length)];
    }
    function newBoss() {
        boss.value = returnNewBoss();
    }
    const rerollBossCost = ref<number>(props.player.hasAdmin('Wheel of Dharma') ? 0 : 5);
    function rerollBosses(){
        const newBosses = []
        for (let index = 0; index < props.bosses.length; index++) {
            newBosses.push(returnNewBoss());
        }        
        emit('replaceBosses', newBosses);
        props.player.spend(rerollBossCost.value);
        rerollBossCost.value = rerollBossCost.value*2;
    }

    const worldNodes = computed(() =>
        Object.values(world.value.nodes)
    );

    function canClick(node: WorldNode): boolean {
        if (node.id === currentNodeId.value) return false;
        if(props.player.hasAdmin('Off Roader') && !node.visited){ //need to disable nodes after they are visited
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
        if(!props.player.hasAdmin('World Map') && node.type !== 'shop' || (!props.player.hasAdmin('Crystal Ball') && node.type === 'shop')){
            if (!canClick(node)) return;
        }
        if(props.player.hasAdmin('Crystal Ball') && node.type === 'shop' && (selectedPreviewNode.value && node.next.includes(selectedPreviewNode.value.id))){//
            emit('openDisabledShop')
        } else {    
            selectedPreviewNode.value = node;
            if(props.player.hasAdmin('Clippy')){
                reapplyTutorialTooltips(200);
            }
        }
    }

    function canSkip(node: WorldNode){
        if(node.type === 'shop') return false;
        if(props.player.hasAdmin('Leg Up') && (node.type!=='boss')){
            return true;
        }
        if(props.player.hasAdmin('Golden Ticket') && !(node.type==='boss')){
            if(props.player.effectiveMoney >= 5){
                return true;
            } else return false;
        } else return false;
    }
    function skipNode(node: WorldNode){
        selectedPreviewNode.value = null;
        world.value.nodes[currentNodeId.value].visited = true;
        currentNodeId.value = node.id;
        if(!props.player.hasAdmin('Leg Up') || skipsThisLevel.value !== 0){
            props.player.spend(5)
        } else{
            skipsThisLevel.value += 1;
        }
        //node.visible = true;
        emit('incrementProgress')
    }

    function enterNode(node: WorldNode) {
        const current = world.value.nodes[currentNodeId.value];
        const shopisNext = node.id === current.next[0];
        selectedPreviewNode.value = null;
        if(node.type === 'shop' && !shopisNext){
            emit('openDisabledShop')
        } else {
            current.visited = true;
            currentNodeId.value = node.id;
            node.visible = true;
        }
        if(node.type === 'shop' && shopisNext){
            emit('openShop')
        }
        if(node.type === 'hybrid compiler'){
            emit('openCompiler')
        }
        if(node.type === 'boss'){
            emit("addBoss", boss.value);
        }
        if (node.level) {
            showTutorialTip('board');
            //console.log(node.level)
            emit("select-level", node.level, node.difficultyMod, (node.reward + props.player.bonusReward));
        }
    }

    function displayIcon(node: WorldNode) {
        if(node.id === currentNodeId.value){
            return String.fromCodePoint(parseInt(props.player.osunicode.replace('U+', ''), 16), 0xFE0F);
        }
        if (node.type === 'skip' && node.skipReward) {
            return String.fromCodePoint(
                parseInt(node.skipReward.value.unicode.replace('U+', ''), 16), 0xFE0F
            );
        }
        switch (node.type) {
            case "start": return "⬤";
            case "shop": return "🛒";
            case "hybrid compiler": return String.fromCodePoint(parseInt("U+1F9EC".replace('U+', ''), 16), 0xFE0F);
            case "level": return String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16), 0xFE0F);
            case "boss": return  String.fromCodePoint(parseInt(boss.value.unicode.replace('U+', ''), 16), 0xFE0F);
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
            //
            if (!node.hiddenUntilVisited || node.visible || props.player.hasAdmin('Compass')) {
                visible.add(node.id);
            }
            if (node.hiddenUntilVisited === currentNodeId.value) {
                node.visible = true;
                visible.add(node.id);
            }
        }
        return visible;
    });

    function generateSkipReward(): SkipReward{
        const roll = Math.random();
        if (roll < 0.4) {
            const random = pickWeightedRandom(allPieces, props.player)
            return {
                kind: 'blueprint',
                value: makeBlueprint(random.class, random.variant ?? undefined)
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
            value: pickWeightedRandomItem([Voucher, Box, Gift, Jar, Pinata, Cake, Wand, Dupe, Genie, Pandora, Floppy, Update2, Update3, Hourglass, Life], props.player),
        };
    }

    function assignSkipRewards(world: WorldMap) {
        for (const node of Object.values(world.nodes)) {
            if (node.type === 'skip' && !node.skipReward) {
                node.skipReward = generateSkipReward();
                //node.skipReward.value.cost = 0;
            }
        }
    }

    const canReroll = ref<boolean>(true);
    function rerollSkipReward(node: WorldNode){
        node.skipReward = generateSkipReward();
        canReroll.value = false;
    }

    function takeSkipReward(node: WorldNode){//ask about this next
        //app has buy blueprint/item functions, could use those???
        if (!node.skipReward) return;
        switch (node.skipReward.kind) {
            case "blueprint":
            props.player.addProgram(node.skipReward.value); //player functions return false if there is not enough inventory space, could use these to prevent proceeding?
            StorageManager.unlockPiece(node.skipReward.value.name);
            break;

            case "admin":
            props.player.addAdmin(node.skipReward.value);
            StorageManager.unlockAdmin(node.skipReward.value.name);
            if(node.skipReward.value.triggerType === 'other' && node.skipReward.value.targetType==='player'){
                node.skipReward.value.apply({player: props.player});
            }
            break;

            case "item":
            props.player.addItem(node.skipReward.value);
            StorageManager.unlockItem(node.skipReward.value.name);
            break;
        }
        world.value.nodes[currentNodeId.value].visited = true;
        currentNodeId.value = node.id
        selectedPreviewNode.value = null;
        canReroll.value = true;
        node.visible = true;
        emit('incrementProgress');
        if(props.player.hasAdmin('Clippy')){
            reapplyTutorialTooltips(200);
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
            console.log('building map')
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
                bossNode: node.type === 'boss',
                shopNode: node.type === 'shop',
                skipNode: node.type === 'skip',
                levelNode: node.type === 'level' && node.id !== currentNodeId && !node.visited,
                visited: node.visited
            }"
            :style="{
                left: node.position.x + 'px',
                top: node.position.y + 'px'
            }"
            @click="trySelect(node)"
        >
        <div class="pins">
            <div class="pins-top"></div>
            <div class="pins-bottom"></div>
            <div class="pins-left"></div>
            <div class="pins-right"></div>
        </div>
        <div class="node-inner">
        <div v-if="node.type=='boss' || node.type=='level' && node.id !== currentNodeId  && node.id !=='start'" class="company-info">
            <div>
                {{ node.company.abbr }}
            </div>
            <div>
                {{ String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16), 0xFE0F) }}
            </div>
            <div>
                $ {{ node.reward }}
            </div>
            <div>
                {{ String.fromCodePoint(parseInt("U+1F512".replace('U+', ''), 16), 0xFE0F) }} : {{ node.difficultyMod + player.difficulty }}
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
        </div>
        <svg class="map-lines" style="position: absolute; inset: 0; width: 100vw; height: 100vh; pointer-events: none;">
            <line
            v-for="(conn, i) in connections"
            :key="i"
            :x1="conn.x1"
            :y1="conn.y1"
            :x2="conn.x2"
            :y2="conn.y2"
            stroke="#9CC954"
            stroke-width="2"
            stroke-linecap="round"
            />
        </svg>
    </div>

    <!-- Preview modal -->
    <div v-if="selectedPreviewNode" class="preview-modal">
      <h3>{{ selectedPreviewNode.type.toUpperCase() }}</h3>
       <h6 v-if="selectedPreviewNode.type==='boss'"></h6>
        <button :disabled="player.effectiveMoney >= rerollBossCost"
            v-if="selectedPreviewNode?.type === 'skip' && player.hasAdmin('Roulette Wheel')"
            @click="rerollBosses()"
        >
            Reroll
    </button>
      <h6 v-if="selectedPreviewNode.type==='hybrid compiler'">Combine two programs stats into one (rounded up). Keep the primary's special move.</h6>
      <h6 v-if="selectedPreviewNode.type==='skip'">(Must have room)</h6>
      <h4 v-if="selectedPreviewNode.type==='boss' || selectedPreviewNode.type==='level'">{{ selectedPreviewNode.company.name}}</h4>
      <h5 v-if="selectedPreviewNode.type==='boss' || selectedPreviewNode.type==='level'">Security Level: {{ player.difficulty + selectedPreviewNode.difficultyMod}}</h5>
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
            <BlueprintController
                v-if="selectedPreviewNode.skipReward?.kind === 'blueprint'"
                :piece="selectedPreviewNode.skipReward.value"
                mode="skipReward"
                :canBuy= "false"
                :defaultPosition="{ x: 0, y: 0 }"
                @select="select(selectedPreviewNode.skipReward)"
                @close="deselect"
            />

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
            <button
                v-if="selectedPreviewNode?.type === 'skip' && (selectedPreviewNode.skipReward?.kind === 'admin')"
                :disabled="!player.hasAdminSpace"
                @click="takeSkipReward(selectedPreviewNode)"
                >
                Accept Reward
            </button>
            <button
                v-if="selectedPreviewNode?.type === 'skip' && player.hasAdmin('High Roller')"
                :disabled="!canReroll"
                @click="rerollSkipReward(selectedPreviewNode)"
                >
                Reroll
            </button>
            <button 
            v-if="selectedPreviewNode && selectedPreviewNode?.type !== 'skip'"
            :disabled="!canClick(selectedPreviewNode) && selectedPreviewNode.type !== 'shop'"
            @click="enterNode(selectedPreviewNode)"
            >Enter</button>
            <!--
                <button 
                v-if="selectedPreviewNode && selectedPreviewNode?.type !== 'skip' && player.hasAdmin('Ferris Wheel')"
                @click="rerollNode(selectedPreviewNode)"
                >Reroll</button>
            -->
            <button v-if="selectedPreviewNode" @click="selectedPreviewNode = null">Close</button>
            <button v-if="canSkip(selectedPreviewNode)" @click="skipNode(selectedPreviewNode)">Skip <span v-if="!props.player.hasAdmin('Leg Up') || (props.player.hasAdmin('Leg Up') && skipsThisLevel>0)">$5</span></button>
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
        background-color: rgb(8, 47, 0);
        z-index: 3;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .node-map{
        position: relative;
        width: 60%;
        height: 80%;
        left: -26px;
    }
    .map-lines{
        z-index: -1;
    }
    .node {
        position: absolute;
        width: 32px;
        height: 42px;
        opacity: 0.4;
    }
    .bossNode, .shopNode, .current{
        width: 32px;
        height: 32px;
    }
    .node-inner{
        height: 100%;        
        background: #141414;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
    }
    .bossNode{
        border-left: none;
        border-right: none;    
    }
    .bossNode.node-inner{
        width: 100%;
        height: 100%;
    }
    .pins{
        position: absolute;
        z-index: -1;
        width: 80%;
        height: 80%;
    }
    .pins-left, .pins-right, .pins-bottom, .pins-top{
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .shopNode .pins, .current .pins{
        display: none;
    }
    .pins-top{
        left: 10%;
        top: -10%;
        /*border-top: 3px dashed white;*/
    }
    .pins-left{
        top: 10%;
        left: -10%;
        border-left: 3px dashed white;
    }
    .pins-bottom{
        left: 10%;
        top: 22%;
        /*border-bottom: 3px dashed white;*/
    }
    .pins-right{
        border-right: 3px dashed white;
        left: 24%;
        top: 10%;
    }
    .bossNode .pins-left, .bossNode .pins-right, .bossNode .pins-top, .bossNode .pins-bottom{
        top: 5%;
        border-top: 2px dotted white;
        border-bottom: 2px dotted white;
        border-right: 2px dotted white;
        border-left: 2px dotted white;
    }
    .bossNode .pins-top{
        left: 5%;
        top: -10%;
    }
    .bossNode .pins-bottom{
        top: 20%;
    }
    .bossNode .pins-right{
        left: 20%;
    }
    .shopNode{
        border: 3px inset white;
        /*outline: 3px dashed white;*/
    }
    /*.skipNode{

    }*/
    .node.clickable {
        opacity: 1;
        cursor: pointer;
        border-color: yellow;
    }
    .node.current {
        border: 2px outset cyan;
    }
    .preview-modal {
        position: absolute;
        left: 10%;
        top: 16%;
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
        width: 100px;
        left: 120%;
        border: 1px solid white;
        border-radius: 5px;
        padding: 0.2rem;
    }
    .company-info{
        right: 100%;
        left: -65px;
        width: 50px;
        text-align: center;
        top: 0;
    }
    .boss-info, .bossNode .company-info{
        top: -30px;
    }
    .boss-info{
        height: fit-content;
        top: -35px;
        left: 175%;
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
    .node.visited::after {
        content: '';
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 5;
    }
</style>