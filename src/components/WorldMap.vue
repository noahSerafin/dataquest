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
import type { Company, Level, PieceBlueprint, SkipReward } from "../types";
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
import { Random } from "../Random";
import FormattedDescription from "./FormattedDescription.vue";
import type { Coordinate } from "../types";

const props = defineProps<{
    player: Player;
    allLevels: Level[];
    seed: string | number;
    cssclass: 'visible' | 'collapsed';
    bosses: Admin[]
}>();

const emit = defineEmits<{
    (e: "selectLevel", level: Level, company: Company, difficultyMod: number, reward: number, playerSpawns?: Coordinate[]): void;
    (e: "openShop"): void;
    (e: "openDisabledShop"): void;
    (e: "openAltar"): void;
    (e: "openDuplicator"): void;
    (e: "openWorkbench"): void;
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
    if (props.player.difficulty > 6) {
        return [...level1Levels, ...level2Levels, ...level3Levels, ...level4Levels, ...level5Levels, ...level6Levels]
    }
    const tierIndex = Math.min(
        props.player.difficulty - 1
    );
    return levelTiers[tierIndex];
});
const skipsThisLevel = ref<number>(0);

// Explicitly seed the PRNG before any map generation starts to ensure reproducibility
Random.setSeed(props.seed);

const world = ref<WorldMap>(generateWorld(levelPool.value, props.player.difficulty, props.player.stake));//should be called again with after boss after increase difficulty
assignSkipRewards(world.value);

const currentNodeId = ref(world.value.startNode);
const previousNodeId = ref<string | null>(null);
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
    const SelectedBoss = Random.pick(filteredPool);
    return new SelectedBoss();
}
function newBoss() {
    boss.value = returnNewBoss();
}
const rerollBossCost = ref<number>(props.player.hasAdmin('Wheel of Dharma') ? 0 : 5);
function rerollBosses() {
    const newBosses = []
    for (let index = 0; index < props.bosses.length; index++) {
        newBosses.push(returnNewBoss());
    }
    if (props.player.stake <= 1 && props.player.difficulty >= 6) {
        emit('replaceBosses', newBosses);
    } else {
        for (const boss of newBosses) {
            emit('addBoss', boss);
        }
    }
    props.player.spend(rerollBossCost.value);
    rerollBossCost.value = rerollBossCost.value * 2;
}

defineExpose({
    world,
    currentNodeId,
    previousNodeId,
    boss,
    skipsThisLevel,
    rollbackNode
});

const worldNodes = computed(() =>
    Object.values(world.value.nodes)
);

function canClick(node: WorldNode): boolean {
    if (node.id === currentNodeId.value) return false;
    if (props.player.hasAdmin('Off Roader') && !node.visited) { //need to disable nodes after they are visited
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
    const isHidden = node.hiddenUntilVisited && !node.visible && !props.player.hasAdmin('Compass');

    if (node.type === 'shop') {
        if (!canClick(node)) {
            if (props.player.hasAdmin('Crystal Ball') && !isHidden) {
                //emit('openDisabledShop');
                selectedPreviewNode.value = node;
                return;
            } else {
                return;
            }
        }
    } else {
        if (isHidden && !canClick(node)) return;
        if (!props.player.hasAdmin('World Map') && !canClick(node)) return;
    }

    selectedPreviewNode.value = node;
    if (props.player.hasAdmin('Clippy')) {
        reapplyTutorialTooltips(200);
    }
}

function canSkip(node: WorldNode) {
    if (node.type === 'shop') return false;
    if (props.player.hasAdmin('Leg Up') && (node.type !== 'boss')) {
        return true;
    }
    if (props.player.hasAdmin('Golden Ticket') && !(node.type === 'boss')) {
        if (props.player.effectiveMoney >= 5) {
            return true;
        } else return false;
    } else return false;
}
function skipNode(node: WorldNode) {
    selectedPreviewNode.value = null;
    world.value.nodes[currentNodeId.value].visited = true;
    currentNodeId.value = node.id;
    if (!props.player.hasAdmin('Leg Up') || skipsThisLevel.value !== 0) {
        props.player.spend(5)
    } else {
        skipsThisLevel.value += 1;
    }
    //node.visible = true;
    previousNodeId.value = currentNodeId.value;
    currentNodeId.value = node.id;
    emit('incrementProgress')
}

function enterNode(node: WorldNode) {
    const current = world.value.nodes[currentNodeId.value];
    const isReachable = canClick(node);
    selectedPreviewNode.value = null;
    if (node.type === 'shop' && !isReachable) {
        emit('openDisabledShop')
    } else {
        previousNodeId.value = currentNodeId.value;
        current.visited = true;
        currentNodeId.value = node.id;
        node.visible = true;
    }
    if (node.type === 'shop' && isReachable) {
        emit('openShop')
    }
    if (node.type === 'sacrificial altar') {
        emit('openAltar')
    }
    if (node.type === 'duplicator') {
        emit('openDuplicator')
    }
    if (node.type === 'workbench') {
        emit('openWorkbench')
    }
    if (node.type === 'hybrid compiler') {
        emit('openCompiler')
    }
    if (node.type === 'boss') {
        emit("addBoss", boss.value);
    }
    if (node.level) {
        showTutorialTip('board');
        //just pass the compamy for extra visual styling?
        emit("selectLevel", node.level, node.company, node.difficultyMod, (node.reward + props.player.bonusReward));
    }
}

const revealedNodeIds = computed(() => {
    const revealed = new Set<string>();
    const currentNode = world.value.nodes[currentNodeId.value];

    for (const node of Object.values(world.value.nodes)) {
        if (!node.hiddenUntilVisited || node.visible || props.player.hasAdmin('Compass')) {
            revealed.add(node.id);
        }
        // Reveal if it's a "next" node for the current position
        if (node.hiddenUntilVisited && currentNode?.next.includes(node.id)) {
            node.visible = true;
            revealed.add(node.id);
        }
    }
    return revealed;
});

const nodeDisplayPositions = computed(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const node of worldNodes.value) {
        let x = node.position.x;
        let y = node.position.y;
        // Offset x if it's an intermediate/hidden node to ensure circuitboard connections
        if (node.hiddenUntilVisited) {
            // Use a deterministic offset based on the node ID
            const offset = node.id.includes('_0_') ? 40 : (node.id.includes('_2_') ? -40 : 25);
            x += offset;
        }
        positions[node.id] = { x, y };
    }
    return positions;
});

function displayIcon(node: WorldNode) {
    if (!revealedNodeIds.value.has(node.id)) {
        return "\u2754"; // ❔ White Question Mark Ornament
    }
    if (node.id === currentNodeId.value) {
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
        case "sacrificial altar": return String.fromCodePoint(parseInt("U+1FAA6".replace('U+', ''), 16), 0xFE0F);
        case "duplicator": return String.fromCodePoint(parseInt("U+1F46F".replace('U+', ''), 16), 0xFE0F);
        case "workbench": return String.fromCodePoint(parseInt("U+2699".replace('U+', ''), 16), 0xFE0F);
        case "hybrid compiler": return String.fromCodePoint(parseInt("U+1F9EC".replace('U+', ''), 16), 0xFE0F);
        case "level": return String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16), 0xFE0F);
        case "boss": return String.fromCodePoint(parseInt(boss.value.unicode.replace('U+', ''), 16), 0xFE0F);
        case "skip": return "";
    }
}

const connections = computed(() => {
    const paths: { points: string }[] = [];
    const nodes = world.value.nodes;
    const positions = nodeDisplayPositions.value;

    for (const node of Object.values(nodes)) {
        for (const nextId of node.next) {
            const nextNode = nodes[nextId];
            if (!nextNode) continue;

            const p1 = positions[node.id];
            const p2 = positions[nextId];
            if (!p1 || !p2) continue;

            // Center the line on the node "dot"
            const x1 = p1.x + 12;
            const y1 = p1.y + 12;
            const x2 = p2.x + 12;
            const y2 = p2.y + 12;

            const dxTotal = x2 - x1;
            const dyTotal = y2 - y1;
            const absDx = Math.abs(dxTotal);
            const absDy = Math.abs(dyTotal);
            const sx = Math.sign(dxTotal);
            const sy = Math.sign(dyTotal);

            let points = "";

            // Detect split paths (connections between different path indices)
            const isSplitPath = node.id.startsWith('path_') && nextId.startsWith('path_') &&
                node.id.split('_')[1] !== nextId.split('_')[1];

            // 1. V-D-V Strategy for unrevealed/offset nodes and final shop-to-boss connection
            // But NOT for split paths (those should use H-D-V-D-H)
            if (!isSplitPath && (node.hiddenUntilVisited || nextNode.hiddenUntilVisited || (node.id === 'shop' && nextId === 'boss'))) {
                const diagSize = absDx;
                const verticalPadding = (absDy - diagSize) / 2;
                const ya = y1 + sy * verticalPadding;
                const yb = ya + sy * diagSize;
                points = `${x1},${y1} ${x1},${ya} ${x2},${yb} ${x2},${y2}`;
            }
            // 2. V-D-H Strategy for final shop (enters from sides)
            else if (nextNode.id === 'shop') {
                const diagSize = Math.min(absDx, absDy) * 0.7;
                const ya = y2 - sy * diagSize;
                const xb = x1 + sx * diagSize;
                points = `${x1},${y1} ${x1},${ya} ${xb},${y2} ${x2},${y2}`;
            }
            // 3. H-D-V-D-H Strategy for split paths (enters from sides, preserves 45 deg)
            else if (isSplitPath) {
                const ds = Math.min(absDx, absDy) * 0.1;
                // Vertical segment is at xb. It must not be within 25px of any other node's center.
                // The nodes we care about are those between y1 and y2.
                let xb = x1 + dxTotal / 2;

                const otherNodes = Object.keys(positions).filter(id => id !== node.id && id !== nextId);
                const minY = Math.min(y1, y2);
                const maxY = Math.max(y1, y2);

                // We only care about nodes that are vertically "in the way" of the vertical line
                const nodesInWay = otherNodes.filter(id => {
                    const pos = positions[id];
                    const nodeY = pos.y + 20; // center y 
                    return nodeY > minY && nodeY < maxY;
                });

                // Function to check if xb is safe
                const isSafe = (x: number) => {
                    for (const id of nodesInWay) {
                        const nodeX = positions[id].x + 20; // center x
                        if (Math.abs(x - nodeX) < 42) return false;
                    }
                    return true;
                };

                if (!isSafe(xb)) {
                    // Try shifting xb. We must keep xb at least ds away from x1 and x2.
                    const minXLimit = Math.min(x1, x2) + ds;
                    const maxXLimit = Math.max(x1, x2) - ds;

                    // Try shifting in increments of 5px
                    for (let offset = 5; offset < absDx / 2; offset += 5) {
                        if (xb + offset <= maxXLimit && isSafe(xb + offset)) {
                            xb += offset;
                            break;
                        }
                        if (xb - offset >= minXLimit && isSafe(xb - offset)) {
                            xb -= offset;
                            break;
                        }
                    }
                }

                const xa = xb - sx * ds;
                const xc = xb + sx * ds;
                const yc = y1 + sy * ds;
                const yd = y2 - sy * ds;
                points = `${x1},${y1} ${xa},${y1} ${xb},${yc} ${xb},${yd} ${xc},${y2} ${x2},${y2}`;
            }
            // 4. H-D-V Strategy for default levels (enters from bottom)
            else {
                const diagSize = Math.min(absDx, absDy) * 0.3;
                const xa = x1 + (dxTotal - sx * diagSize);
                const yb = y1 + sy * diagSize;
                points = `${x1},${y1} ${xa},${y1} ${x2},${yb} ${x2},${y2}`;
            }

            paths.push({
                points: points
            });
        }
    }
    return paths;
});

function generateSkipReward(): SkipReward {
    const roll = Random.next();
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
function rerollSkipReward(node: WorldNode) {
    node.skipReward = generateSkipReward();
    canReroll.value = false;
}

function takeSkipReward(node: WorldNode) {//ask about this next
    //app has buy blueprint/item functions, could use those???
    if (!node.skipReward) return;
    switch (node.skipReward.kind) {
        case "blueprint":
            props.player.addProgram(node.skipReward.value); //player functions return false if there is not enough inventory space, could use these to prevent proceeding?
            StorageManager.unlockPiece(node.skipReward.value.name);
            StorageManager.recordUsage('programs', node.skipReward.value.name);
            break;

        case "admin":
            props.player.addAdmin(node.skipReward.value);
            StorageManager.unlockAdmin(node.skipReward.value.name);
            StorageManager.recordUsage('admins', node.skipReward.value.name);
            if (node.skipReward.value.triggerType === 'other' && node.skipReward.value.targetType === 'player') {
                node.skipReward.value.apply({ player: props.player });
            }
            break;

        case "item":
            props.player.addItem(node.skipReward.value);
            StorageManager.unlockItem(node.skipReward.value.name);
            StorageManager.recordUsage('items', node.skipReward.value.name);
            break;
    }
    world.value.nodes[currentNodeId.value].visited = true;
    currentNodeId.value = node.id
    selectedPreviewNode.value = null;
    canReroll.value = true;
    node.visible = true;
    emit('incrementProgress');
    if (props.player.hasAdmin('Clippy')) {
        reapplyTutorialTooltips(200);
    }
}

function rollbackNode() {
    if (previousNodeId.value) {
        // The node we are moving BACK to was marked visited when we entered the current one
        world.value.nodes[previousNodeId.value].visited = false;
        currentNodeId.value = previousNodeId.value;
        // previousNodeId.value = null; // optional: clear it so we can't rollback twice? 
        // the user said "returning could take the player back to their last visited node", 
        // so maybe we only allow one rollback.
    }
}

const skipTarget = ref<PieceBlueprint | Item | null>(null);
function checkTargetMatch(target: SkipReward) {
    if (target.value === skipTarget.value) {
        return true;
    }
    return false;
}
function select(target: SkipReward) {
    skipTarget.value = target.value;
}
function deselect() {
    skipTarget.value = null;
}

watch(
    () => props.seed,
    () => {
        // rebuild world graph using the same deterministic sequence
        console.log('rebuilding deterministic map');
        Random.setSeed(props.seed);

        world.value = generateWorld(levelPool.value, props.player.difficulty, props.player.stake);
        assignSkipRewards(world.value);
        currentNodeId.value = world.value.startNode;
        // generate new boss
        newBoss();
    }
);
</script>

<template>
    <div class="container world-map" :class="props.cssclass">
        <div class="node-map">
            <!-- Nodes -->
            <div v-for="node in worldNodes" :key="node.id" class="node " :class="{
                clickable: canClick(node),
                current: node.id === currentNodeId,
                unrevealed: !revealedNodeIds.has(node.id),
                visible: true,
                bossNode: node.type === 'boss',
                startNode: node.type === 'start',
                shopNode: node.type === 'shop',
                skipNode: node.type === 'skip',
                levelNode: node.type === 'level',
                visited: node.visited
            }" :style="{
                left: nodeDisplayPositions[node.id].x - 8 + 'px',
                top: nodeDisplayPositions[node.id].y + 'px'
            }" @click="trySelect(node)">
                <div class="pins">
                    <div class="pins-top"></div>
                    <div class="pins-bottom"></div>
                    <div class="pins-left"></div>
                    <div class="pins-right"></div>
                </div>
                <div class="node-inner">
                    <div class="node-inner-content" v-if="!(node.type === 'start' && node.visited)">
                        <div v-if="!node.visited && (node.type == 'level' && node.id !== currentNodeId)"
                            class='text-gold'>
                            ${{ node.reward }}
                        </div>
                        <div class="icon">
                            {{ displayIcon(node) }}
                        </div>
                        <div v-if="!node.visited && (node.type == 'level' && node.id !== currentNodeId)">
                            {{ String.fromCodePoint(parseInt("U+1F512".replace('U+', ''), 16), 0xFE0F) }}{{
                                node.difficultyMod + player.difficulty }}
                        </div>
                        <div v-if="node.type === 'boss'" class="boss-info">
                            <strong>
                                {{ boss.name }}:
                            </strong>
                            <span>
                                <FormattedDescription :description="boss.description" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <svg class="map-lines"
                style="position: absolute; inset: 0; width: 100vw; height: 100vh; pointer-events: none;">
                <polyline v-for="(path, i) in connections" :key="i" :points="path.points" fill="none" stroke="#9CC954"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

        <!-- Preview modal -->
        <div v-if="selectedPreviewNode" :class="`preview-modal ${selectedPreviewNode.company.abbr}`"
            :style="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level' ? { backgroundColor: `${selectedPreviewNode.company.tileColor}`, border: `2px solid ${selectedPreviewNode.company.edgeColor}` } : {}">
            <h3>{{ selectedPreviewNode.type.toUpperCase() }}</h3>
            <h6 v-if="selectedPreviewNode.type === 'boss'"></h6>
            <button :disabled="player.effectiveMoney >= rerollBossCost"
                v-if="selectedPreviewNode?.type === 'skip' && player.hasAdmin('Roulette Wheel')"
                @click="rerollBosses()">
                Reroll
            </button>
            <h6 v-if="selectedPreviewNode.type === 'workbench'">Tinker with up to 5 of a program's stats</h6>
            <h6 v-if="selectedPreviewNode.type === 'sacrificial altar'">Sacrifice a program for x3 it's sell value</h6>
            <h6 v-if="selectedPreviewNode.type === 'duplicator'">Copy one of your programs (must have room)</h6>
            <h6 v-if="selectedPreviewNode.type === 'hybrid compiler'">Combine two programs stats into one. Keep the
                primary's special move.</h6>
            <h6 v-if="selectedPreviewNode.type === 'skip'">(Must have room)</h6>
            <h4 v-if="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level'">{{
                selectedPreviewNode.company.name }}</h4>
            <div v-if="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level'">
                {{ String.fromCodePoint(parseInt(selectedPreviewNode.company.unicode.replace('U+', ''), 16), 0xFE0F) }}
            </div>
            <h5 v-if="selectedPreviewNode.type === 'boss' || selectedPreviewNode.type === 'level'">Security Level 🔒: {{
                player.difficulty + selectedPreviewNode.difficultyMod }}</h5>
            <h5 v-if="selectedPreviewNode.type === 'boss' || selectedPreviewNode.type === 'level'" class="text-gold">
                Reward: ${{ selectedPreviewNode.reward }}</h5>
            <MiniMap v-if="selectedPreviewNode && selectedPreviewNode.level" :level="selectedPreviewNode.level"
                :company="selectedPreviewNode.company" />
            <template v-if="selectedPreviewNode?.type === 'skip'">
                <BlueprintView v-if="selectedPreviewNode.skipReward?.kind === 'blueprint'"
                    :blueprint="selectedPreviewNode.skipReward.value" :tileSize="70" cssclass="skipReward"
                    @select="select(selectedPreviewNode.skipReward)" @deselect="deselect" />
                <BlueprintController v-if="selectedPreviewNode.skipReward?.kind === 'blueprint'"
                    :piece="selectedPreviewNode.skipReward.value" mode="skipReward" :canBuy="false"
                    :defaultPosition="{ x: 0, y: 0 }" @select="select(selectedPreviewNode.skipReward)"
                    @close="deselect" />

                <ItemView v-if="selectedPreviewNode.skipReward?.kind === 'admin'" type="admin"
                    :item="selectedPreviewNode.skipReward.value" :tileSize="70" :canBuy="false" cssclass="shop"
                    :showController="checkTargetMatch(selectedPreviewNode.skipReward)"
                    @select="select(selectedPreviewNode.skipReward)" @deselect="deselect" />

                <ItemView v-if="selectedPreviewNode.skipReward?.kind === 'item'" type="consumable"
                    :item="selectedPreviewNode.skipReward.value" :tileSize="70" :canBuy="false" cssclass="shop"
                    :showController="checkTargetMatch(selectedPreviewNode.skipReward)"
                    @select="select(selectedPreviewNode.skipReward)" @deselect="deselect" />
            </template>
            <div class="btns">
                <button
                    v-if="selectedPreviewNode?.type === 'skip' && (selectedPreviewNode.skipReward?.kind === 'blueprint' || selectedPreviewNode.skipReward?.kind === 'item')"
                    :disabled="!player.hasMemorySpace" @click="takeSkipReward(selectedPreviewNode)">
                    Accept Reward
                </button>
                <button
                    v-if="selectedPreviewNode?.type === 'skip' && (selectedPreviewNode.skipReward?.kind === 'admin')"
                    :disabled="!player.hasAdminSpace" @click="takeSkipReward(selectedPreviewNode)">
                    Accept Reward
                </button>
                <button v-if="selectedPreviewNode?.type === 'skip' && player.hasAdmin('High Roller')"
                    :disabled="!canReroll" @click="rerollSkipReward(selectedPreviewNode)">
                    Reroll
                </button>
                <button v-if="selectedPreviewNode && selectedPreviewNode?.type !== 'skip'"
                    :disabled="!canClick(selectedPreviewNode) && selectedPreviewNode.type !== 'shop'"
                    @click="enterNode(selectedPreviewNode)">Enter</button>
                <!--
                <button 
                v-if="selectedPreviewNode && selectedPreviewNode?.type !== 'skip' && player.hasAdmin('Ferris Wheel')"
                @click="rerollNode(selectedPreviewNode)"
                >Reroll</button>
            -->
                <button v-if="selectedPreviewNode" @click="selectedPreviewNode = null">Close</button>
                <button v-if="canSkip(selectedPreviewNode)" @click="skipNode(selectedPreviewNode)">Skip <span
                        v-if="!props.player.hasAdmin('Leg Up') || (props.player.hasAdmin('Leg Up') && skipsThisLevel > 0)">$5</span></button>
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

.node-map {
    position: relative;
    width: 60%;
    height: 80%;
    left: -26px;
}

.map-lines {
    z-index: -1;
}

.node {
    position: absolute;
    width: 42px;
    height: 32px;
    opacity: 0.4;
}

.levelNode {
    width: 40px;
    height: 70px;
    font-size: 14px;
}

.bossNode,
.startNode {
    width: 36px;
    height: 36px;
}

.node-inner {
    text-align: center;
    height: 100%;
    background: #141414;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    user-select: none;
}

.bossNode,
.shopNode {
    border-left: none;
    border-right: none;
}

.bossNode.node-inner {
    width: 100%;
    height: 100%;
}

.pins {
    position: absolute;
    z-index: -1;
    width: 80%;
    height: 80%;
}

.pins-left,
.pins-right,
.pins-bottom,
.pins-top {
    position: absolute;
    width: 100%;
    height: 100%;
}

.pins-top {
    left: 10%;
    top: -10%;
    border-top: 3px dashed white;
}

.pins-left {
    top: 10%;
    left: -10%;
}

.pins-bottom {
    left: 10%;
    top: 22%;
    border-bottom: 3px dashed white;
}

.pins-right {
    left: 26%;
    top: 10%;
}

.levelNode .pins-top {
    display: none;
}

.levelNode .pins-bottom {
    display: none;
}

.levelNode .pins-left {
    border-left: 3px dashed white;
}

.levelNode .pins-right {
    border-right: 3px dashed white;
}

.bossNode .pins-left,
.bossNode .pins-right,
.bossNode .pins-top,
.bossNode .pins-bottom,
.startNode .pins-left,
.startNode .pins-right,
.startNode .pins-top,
.startNode .pins-bottom {
    top: 4%;
    border-top: 2px dotted white;
    border-bottom: 2px dotted white;
    border-right: 2px dotted white;
    border-left: 2px dotted white;
}

.bossNode .pins-top,
.startNode .pins-top {
    left: 4%;
    top: -9%;
}

.bossNode .pins-bottom,
.startNode .pins-bottom {
    top: 19%;
}

.bossNode .pins-right,
.startNode .pins-right {
    left: 19%;
}

/*
    .shopNode{
        border: 3px inset white;
        outline: 3px dashed white;
    }
    */
.node.clickable {
    opacity: 1;
    cursor: pointer;
    border-color: yellow;
}

.text-gold {
    color: #fdbf13;
}

.preview-modal.ZEN .text-gold {
    color: #864800;
}


.current .icon{
    border: 2px outset white;
    background-color: rgb(46, 46, 46);
    width: 20px;
    height: 20px;
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

h5 {
    margin: 0.2rem;
}

.preview-modal.WFG {
    color: rgb(52, 12, 51);
}

.preview-modal.ZEN {
    color: rgb(16, 16, 16);
}

.btns {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.boss-info,
.company-info {
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

.company-info {
    right: 100%;
    left: -65px;
    width: 50px;
    text-align: center;
    top: 0;
}

.boss-info,
.bossNode .company-info {
    top: -30px;
}

.boss-info {
    top: -40px;
    width: 150px;
}

.node.unrevealed {
    opacity: 0.6;
}

.node.visible {
    visibility: visible;
    opacity: 1;
}

h6 {
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