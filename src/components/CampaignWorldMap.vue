<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import MiniMap from "./MiniMap.vue";
import { Admin } from "../AdminPrograms";
import { Item, Box, Genie, Gift, Pinata, Pandora, Voucher, Jar, Update2, Update3, Floppy, Life, Cake, Wand, Hourglass, Dupe } from "../Items";
import { allBosses } from "../Bosses";
import { reapplyTutorialTooltips, showTutorialTip } from "../tutorial";
import { Player } from "../Player";
import type { WorldMap, WorldNode } from "../worldBuilder";
import type { Company, Level, PieceBlueprint, SkipReward } from "../types";
import { allPieces } from "../Pieces";
import { allAdmins } from "../AdminPrograms";
import { allOSes } from "../Operators";
import { companies, shopCompany, bossCompany, playerCompany } from "../companies";
import { level1Levels } from "../level1Levels";
import { level2Levels } from "../level2Levels";
import { level3Levels } from "../level3Levels";
import { level4Levels } from "../level4Levels";
import { level5Levels } from "../level5Levels";
import { level6Levels } from "../level6Levels";
import { makeBlueprint, pickWeightedRandom, pickWeightedRandomItem, getSpriteStyle } from "../helperFunctions";
import BlueprintView from "./BlueprintView.vue";
import ItemView from "./ItemView.vue";
import BlueprintController from "./BlueprintController.vue";
import { StorageManager } from "../StorageManager";
import { Random } from "../Random";
import FormattedDescription from "./FormattedDescription.vue";
import type { Coordinate } from "../types";

const props = defineProps<{
    player: Player;
    cssclass: 'visible' | 'collapsed';
    staticWorld: WorldMap; 
    clearedNodes: string[]; 
}>();

const emit = defineEmits<{
    (e: "selectLevel", level: Level, company: Company, difficultyMod: number, reward: number, playerSpawns?: Coordinate[]): void;
    (e: "openShop", node: WorldNode): void;
    (e: "openDisabledShop"): void;
    (e: "openAltar"): void;
    (e: "openDuplicator"): void;
    (e: "openWorkbench"): void;
    (e: "openCompiler"): void;
    (e: "addBoss", admin: Admin): void;
    (e: "incrementProgress"): void;
    (e: "clearNode", nodeId: string): void;
}>();

const worldNodes = computed(() => Object.values(props.staticWorld.nodes));
const clearedSet = computed(() => new Set(props.clearedNodes));

const selectedPreviewNode = ref<WorldNode | null>(null);

function isNodeCleared(nodeId: string): boolean {
    return clearedSet.value.has(nodeId);
}

const reachableNodes = computed(() => {
    const reachable = new Set<string>();
    if (clearedSet.value.size === 0) {
        reachable.add(props.staticWorld.startNode);
    } else {
        for (const clearedId of clearedSet.value) {
            reachable.add(clearedId);
            const node = props.staticWorld.nodes[clearedId];
            if (node) {
                for (const nextId of node.next) {
                    reachable.add(nextId);
                }
            }
        }
    }
    return reachable;
});

function canClick(node: WorldNode): boolean {
    if (!reachableNodes.value.has(node.id)) return false;
    
    if (isNodeCleared(node.id)) {
        if (node.type === 'shop') return true;
        if (node.type === 'skip' && node.skipReward) return true; // keep skip reward if not claimed
        return false;
    }
    
    return true;
}

function trySelect(node: WorldNode) {
    if (node.type === 'shop') {
        if (!canClick(node)) {
            if (props.player.hasAdmin('Crystal Ball')) {
                selectedPreviewNode.value = node;
                return;
            } else {
                return;
            }
        }
    } else {
        if (!canClick(node) && !props.player.hasAdmin('World Map')) return;
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
    emit('clearNode', node.id);
    if (!props.player.hasAdmin('Leg Up')) {
        props.player.spend(5)
    }
    emit('incrementProgress');
}

function enterNode(node: WorldNode) {
    const isReachable = canClick(node);
    selectedPreviewNode.value = null;
    
    if (node.type === 'shop' && !isReachable) {
        emit('openDisabledShop');
        return;
    }
    
    if (node.type === 'shop') {
        emit('clearNode', node.id);
        emit('openShop', node);
    } else if (node.type === 'sacrificial altar') {
        emit('openAltar');
        emit('clearNode', node.id);
    } else if (node.type === 'duplicator') {
        emit('openDuplicator');
        emit('clearNode', node.id);
    } else if (node.type === 'workbench') {
        emit('openWorkbench');
        emit('clearNode', node.id);
    } else if (node.type === 'hybrid compiler') {
        emit('openCompiler');
        emit('clearNode', node.id);
    } else if (node.type === 'boss') {
        const BossClass = allBosses.find(b => b.name === node.bossName);
        if (BossClass) {
            emit("addBoss", new BossClass());
        }
        if (node.level) {
            emit("selectLevel", node.level, node.company, node.difficultyMod, (node.reward + props.player.bonusReward));
        }
    } else if (node.level) {
        showTutorialTip('board');
        emit("selectLevel", node.level, node.company, node.difficultyMod, (node.reward + props.player.bonusReward));
    }
}

// Hydrate the static map and generate skip rewards synchronously before initial render
const allCompanyOptions = [shopCompany, bossCompany, playerCompany, ...companies];
const allGameLevels = [...level1Levels, ...level2Levels, ...level3Levels, ...level4Levels, ...level5Levels, ...level6Levels];

for (const node of Object.values(props.staticWorld.nodes)) {
    if (node.company && typeof node.company === 'string') {
        node.company = allCompanyOptions.find(c => c.name === node.company) || node.company;
    }
    if (node.levelName) {
        node.level = allGameLevels.find(l => l.name === node.levelName);
    }

    if (node.type === 'skip' && !node.skipReward) {
        node.skipReward = generateSkipReward();
    }
}

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

const canReroll = ref<boolean>(true);
function rerollSkipReward(node: WorldNode) {
    node.skipReward = generateSkipReward();
    canReroll.value = false;
}

function takeSkipReward(node: WorldNode) {
    if (!node.skipReward) return;
    switch (node.skipReward.kind) {
        case "blueprint":
            props.player.addProgram(node.skipReward.value);
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
    
    // Clear reward to prevent retaking
    node.skipReward = undefined;
    emit('clearNode', node.id);
    selectedPreviewNode.value = null;
    canReroll.value = true;
    emit('incrementProgress');
    if (props.player.hasAdmin('Clippy')) {
        reapplyTutorialTooltips(200);
    }
}

const skipTarget = ref<PieceBlueprint | Item | null>(null);
function checkTargetMatch(target: SkipReward) {
    return target.value === skipTarget.value;
}
function select(target: SkipReward) {
    skipTarget.value = target.value;
}
function deselect() {
    skipTarget.value = null;
}

function displayIcon(node: WorldNode) {
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
        case "level": return node.company ? String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16), 0xFE0F) : "";
        case "boss": {
             const BossClass = allBosses.find(b => b.name === node.bossName);
             if (BossClass) {
                 const bossInstance = new BossClass();
                 return String.fromCodePoint(parseInt(bossInstance.unicode.replace('U+', ''), 16), 0xFE0F);
             }
             return "?";
        }
        case "skip": return "";
    }
}

function getIconStyle(node: WorldNode, size: number = 24): Record<string, any> {
    let iconID: number | undefined;

    if (node.type === 'skip' && node.skipReward) {
        iconID = node.skipReward.value.iconID;
    } else if (node.type === 'level' && node.company) {
        iconID = node.company.iconID;
    } else if (node.type === 'boss') {
        const BossClass = allBosses.find(b => b.name === node.bossName);
        if (BossClass) {
            const bossInstance = new BossClass();
            iconID = bossInstance.iconID;
        }
    } else if (node.type === 'shop'){
        iconID = 474;
    } else if(node.type === "sacrificial altar"){
        iconID = 475;
    } else if(node.type === 'duplicator'){
        iconID = 476;
    } else if(node.type === 'workbench'){
        iconID = 477;
    } else if(node.type === 'hybrid compiler'){
        iconID = 478;
    } else if (node.type === 'start') {
        const os = allOSes.find(o => o.unicode === props.player.osunicode);
        iconID = os?.iconID;
    }

    if (iconID !== undefined && iconID >= 0) {
        return {
            ...getSpriteStyle(iconID),
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-block',
            color: 'transparent'
        };
    }
    return {};
}

function getCenter(node: WorldNode) {
    if (node.type === 'level') return { x: node.position.x + 20, y: node.position.y + 35 };
    return { x: node.position.x + 18, y: node.position.y + 18 };
}

// Drawing paths exactly as in WorldEditor
const connections = computed(() => {
  const paths: { d: string, isActive: boolean, length: number }[] = [];
  const nodes = props.staticWorld.nodes;

  Object.values(nodes).forEach(node => {
    node.next.forEach(nextId => {
      const target = nodes[nextId];
      if (target) {
        const c1 = getCenter(node);
        const c2 = getCenter(target);
        const x1 = c1.x;
        const y1 = c1.y;
        const x2 = c2.x;
        const y2 = c2.y;
        
        const settings = (node as any).pathOffsets && (node as any).pathOffsets[nextId] !== undefined ? (node as any).pathOffsets[nextId] : {};
        const isObj = typeof settings === 'object';
        const type = isObj ? (settings.type || 'HDVDH') : 'HDVDH';
        
        const dxRaw = x2 - x1;
        const dyRaw = y2 - y1;
        const dsDefault = Math.min(Math.abs(dxRaw), Math.abs(dyRaw)) * 0.1;
        
        let ds1 = isObj && settings.ds1 !== undefined ? settings.ds1 : dsDefault;
        let ds2 = isObj && settings.ds2 !== undefined ? settings.ds2 : dsDefault;
        
        let d = "";
        
        if (type === 'HDVDH') {
          const offsetX = isObj ? (settings.x || 0) : (typeof settings === 'number' ? settings : 0);
          const offsetY1 = isObj ? (settings.y1 || 0) : 0;
          const offsetY2 = isObj ? (settings.y2 || 0) : 0;
          
          const y1Adj = y1 + offsetY1;
          const y2Adj = y2 + offsetY2;
          
          const dxTotal = x2 - x1;
          const dyTotal = y2Adj - y1Adj;
          const sy = Math.sign(dyTotal) || 1;
          
          const xb = x1 + dxTotal / 2 + offsetX;
          const sx1 = Math.sign(xb - x1) || 1;
          const sx2 = Math.sign(x2 - xb) || 1;
          
          const xa = xb - sx1 * ds1;
          const xc = xb + sx2 * ds2;
          const yc = y1Adj + sy * ds1;
          const yd = y2Adj - sy * ds2;
          
          const points = `${x1},${y1Adj} ${xa},${y1Adj} ${xb},${yc} ${xb},${yd} ${xc},${y2Adj} ${x2},${y2Adj}`;
          d = "M " + points.replace(/ /g, " L ");
        } else {
          const offsetY = isObj ? (settings.y || 0) : 0;
          const offsetX1 = isObj ? (settings.x1 || 0) : 0;
          const offsetX2 = isObj ? (settings.x2 || 0) : 0;
          
          const x1Adj = x1 + offsetX1;
          const x2Adj = x2 + offsetX2;
          
          const dxTotal = x2Adj - x1Adj;
          const sx = Math.sign(dxTotal) || 1;
          
          const yb = y1 + (y2 - y1) / 2 + offsetY;
          const sy1 = Math.sign(yb - y1) || 1;
          const sy2 = Math.sign(y2 - yb) || 1;
          
          const ya = yb - sy1 * ds1;
          const yd = yb + sy2 * ds2;
          const xb = x1Adj + sx * ds1;
          const xc = x2Adj - sx * ds2;
          
          const points = `${x1Adj},${y1} ${x1Adj},${ya} ${xb},${yb} ${xc},${yb} ${x2Adj},${yd} ${x2Adj},${y2}`;
          d = "M " + points.replace(/ /g, " L ");
        }
        
        // Active if source is cleared and target is reachable or cleared
        const isActive = isNodeCleared(node.id) && (reachableNodes.value.has(nextId));
        
        // calculate approximate length for animation
        const pts = d.substring(2).split(" L ").map(p => {
             const [px, py] = p.split(',').map(Number);
             return {x: px, y: py};
        });
        let length = 0;
        for(let i=0; i<pts.length-1; i++){
             length += Math.hypot(pts[i+1].x - pts[i].x, pts[i+1].y - pts[i].y);
        }
        
        paths.push({
            d,
            isActive,
            length
        });
      }
    });
  });
  return paths;
});

const mapContainer = ref<HTMLDivElement | null>(null);
let isDraggingMap = false;
let startXMap = 0;
let startYMap = 0;

function handleMapMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;
  if ((e.target as HTMLElement).closest('.node') || (e.target as HTMLElement).closest('.btns') || (e.target as HTMLElement).closest('button')) {
    return;
  }
  isDraggingMap = true;
  startXMap = e.pageX + (mapContainer.value?.scrollLeft ?? 0);
  startYMap = e.pageY + (mapContainer.value?.scrollTop ?? 0);
}

function handleMapMouseMove(e: MouseEvent) {
  if (!isDraggingMap || !mapContainer.value) return;
  e.preventDefault();
  const x = startXMap - e.pageX;
  const y = startYMap - e.pageY;
  mapContainer.value.scrollLeft = x;
  mapContainer.value.scrollTop = y;
}

function handleMapMouseUpOrLeave() {
  isDraggingMap = false;
}

</script>

<template>
    <div class="container world-map" :class="props.cssclass" ref="mapContainer"
        @mousedown="handleMapMouseDown"
        @mousemove="handleMapMouseMove"
        @mouseup="handleMapMouseUpOrLeave"
        @mouseleave="handleMapMouseUpOrLeave">
        <div class="node-map">
            <!-- Nodes -->
            <div v-for="node in worldNodes" :key="node.id" class="node " :class="{
                clickable: canClick(node),
                current: isNodeCleared(node.id) && node.type !== 'start',
                visible: true,
                bossNode: node.type === 'boss',
                startNode: node.type === 'start',
                shopNode: node.type === 'shop',
                skipNode: node.type === 'skip',
                levelNode: node.type === 'level',
                visited: isNodeCleared(node.id)
            }" :style="{
                left: node.position.x + 'px',
                top: node.position.y + 'px',
                backgroundColor: node.type === 'level' && node.company ? node.company.tileColor : undefined,
                borderColor: node.type === 'level' && node.company ? node.company.edgeColor : undefined
            }" @click="trySelect(node)">
                <div class="pins">
                    <div class="pins-top"></div>
                    <div class="pins-bottom"></div>
                    <div class="pins-left"></div>
                    <div class="pins-right"></div>
                </div>
                <div class="node-inner">
                    <div class="node-inner-content" v-if="!(node.type === 'start')">
                        <div v-if="!isNodeCleared(node.id) && node.type == 'level'" class='text-gold'>
                            ${{ node.reward }}
                        </div>
                        <div class="icon" :style="getIconStyle(node, 24)">
                            <template v-if="!getIconStyle(node).backgroundImage">
                                {{ displayIcon(node) }}
                            </template>
                        </div>
                        <div v-if="!isNodeCleared(node.id) && node.type == 'level'">
                            {{ String.fromCodePoint(parseInt("U+1F512".replace('U+', ''), 16), 0xFE0F) }}{{
                                node.difficultyMod + player.difficulty }}
                        </div>
                        <div v-if="node.type === 'boss'" class="boss-info">
                            <strong>{{ node.bossName }}:</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <svg class="map-lines" style="position: absolute; inset: 0; width: 100vw; height: 100vh; pointer-events: none;">
                <g v-for="(path, i) in connections" :key="i">
                    <path :d="path.d" fill="none" :stroke="path.isActive ? '#34ffff' : '#9CC954'"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path v-if="path.isActive" :d="path.d" fill="none" stroke="white"
                        stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                        :stroke-dasharray="`20 ${path.length + 20}`"
                        :style="{
                            '--dash-offset-to': `-${path.length + 20}px`,
                            animationDuration: `${(path.length + 20) / 170}s`
                        }"
                        class="active-band" />
                </g>
            </svg>
        </div>

        <!-- Preview modal -->
        <div v-if="selectedPreviewNode" :class="`preview-modal ${selectedPreviewNode.company?.abbr}`"
            :style="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level' && selectedPreviewNode.company ? { backgroundColor: `${selectedPreviewNode.company.tileColor}`, border: `2px solid ${selectedPreviewNode.company.edgeColor}` } : {}">
            <h3>{{ selectedPreviewNode.type.toUpperCase() }}</h3>
            
            <h6 v-if="selectedPreviewNode.type === 'workbench'">Tinker with up to 5 of a program's stats</h6>
            <h6 v-if="selectedPreviewNode.type === 'sacrificial altar'">Sacrifice a program for x3 it's sell value</h6>
            <h6 v-if="selectedPreviewNode.type === 'duplicator'">Copy one of your programs (must have room)</h6>
            <h6 v-if="selectedPreviewNode.type === 'hybrid compiler'">Combine two programs stats into one. Keep the primary's special move.</h6>
            <h6 v-if="selectedPreviewNode.type === 'skip'">(Must have room)</h6>
            
            <h4 v-if="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level' && selectedPreviewNode.company">{{ selectedPreviewNode.company.name }}</h4>
            <div v-if="selectedPreviewNode.type !== 'boss' && selectedPreviewNode.type === 'level'" :style="getIconStyle(selectedPreviewNode, 32)">
                <template v-if="!getIconStyle(selectedPreviewNode).backgroundImage && selectedPreviewNode.company">
                    {{ String.fromCodePoint(parseInt(selectedPreviewNode.company.unicode.replace('U+', ''), 16), 0xFE0F) }}
                </template>
            </div>
            
            <h5 v-if="selectedPreviewNode.type === 'boss' || selectedPreviewNode.type === 'level'">Security Level 🔒: {{ player.difficulty + selectedPreviewNode.difficultyMod }}</h5>
            <h5 v-if="selectedPreviewNode.type === 'boss' || selectedPreviewNode.type === 'level'" class="text-gold">Reward: ${{ selectedPreviewNode.reward }}</h5>
            
            <MiniMap v-if="selectedPreviewNode && selectedPreviewNode.level && selectedPreviewNode.company" :level="selectedPreviewNode.level" :company="selectedPreviewNode.company" />
            
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
                
                <button v-if="selectedPreviewNode" @click="selectedPreviewNode = null">Close</button>
                <button v-if="canSkip(selectedPreviewNode)" @click="skipNode(selectedPreviewNode)">Skip <span
                        v-if="!props.player.hasAdmin('Leg Up')">$5</span></button>
            </div>
        </div>
    </div>
</template>
