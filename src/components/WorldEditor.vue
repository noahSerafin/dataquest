<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getSpriteStyle } from "../helperFunctions";
import { companies, shopCompany, bossCompany, playerCompany } from '../companies';
import { allBosses } from '../Bosses';
import type { Company } from '../types';

type NodeType = "start" | "level" | "skip" | "shop" | "boss" | "hybrid compiler" | "sacrificial altar" | "duplicator" | "workbench";

interface EditorNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  next: string[];
  pathOffsets?: Record<string, any>;
  difficultyMod: number;
  reward: number;
  levelName?: string;
  shopContents?: string; // IDs or names of blueprints/items
  skipContents?: string; // IDs or names for skip rewards
  bossName?: string; // name of the selected boss
  drops?: string[]; // predefined drops for levels
  company?: Company;
}

const nodes = ref<Record<string, EditorNode>>({});
const startNodeId = ref<string>('');

const isDragging = ref(false);
const dragNodeId = ref<string | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

const isLinking = ref(false);
const linkStartNode = ref<string | null>(null);
const linkEndPos = ref({ x: 0, y: 0 });

const isDraggingPath = ref(false);
const dragPathSource = ref<string | null>(null);
const dragPathTarget = ref<string | null>(null);
const dragPathType = ref<'x' | 'y1' | 'y2' | 'y' | 'x1' | 'x2' | null>(null);
const dragPathStartPos = ref(0);
const dragPathStartOffset = ref(0);

const selectedNodeId = ref<string | null>(null);
const selectedNode = computed(() => selectedNodeId.value ? nodes.value[selectedNodeId.value] : null);

const nodeTypes: NodeType[] = [
  "start", "level", "skip", "shop", "boss", "hybrid compiler", "sacrificial altar", "duplicator", "workbench"
];

// Generates a simple ID
function generateId() {
  return 'node_' + Math.random().toString(36).substr(2, 9);
}

function addNode() {
  const id = generateId();
  const type = Object.keys(nodes.value).length === 0 ? 'start' : 'level';
  nodes.value[id] = {
    id,
    type,
    position: { x: 100, y: 100 },
    next: [],
    difficultyMod: 0,
    reward: 0,
    company: type === 'level' ? companies[0] : undefined
  };
  if (!startNodeId.value) startNodeId.value = id;
}

function removeNode(id: string) {
  delete nodes.value[id];
  // Remove links to this node
  Object.values(nodes.value).forEach(node => {
    node.next = node.next.filter(nId => nId !== id);
  });
  if (startNodeId.value === id) startNodeId.value = '';
  if (selectedNodeId.value === id) selectedNodeId.value = null;
}

function selectNode(id: string) {
  selectedNodeId.value = id;
}

// DRAG & DROP
function onMouseDownNode(event: MouseEvent, id: string) {
  if (event.button === 2 || event.shiftKey) {
    // Start linking (Right click or Shift+Left click)
    isLinking.value = true;
    linkStartNode.value = id;
    linkEndPos.value = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  } else {
    // Start dragging
    isDragging.value = true;
    dragNodeId.value = id;
    const node = nodes.value[id];
    // Need to adjust for parent container offset ideally, but simplistic logic:
    const canvasRect = (event.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    dragOffset.value = { 
      x: event.clientX - canvasRect.left - node.position.x, 
      y: event.clientY - canvasRect.top - node.position.y 
    };
    selectNode(id);
  }
}

function onMouseMove(event: MouseEvent) {
  const canvasElement = document.querySelector('.editor-canvas') as HTMLElement;
  if (!canvasElement) return;
  const canvasRect = canvasElement.getBoundingClientRect();

  if (isDragging.value && dragNodeId.value) {
    const node = nodes.value[dragNodeId.value];
    node.position.x = event.clientX - canvasRect.left - dragOffset.value.x;
    node.position.y = event.clientY - canvasRect.top - dragOffset.value.y;
    // Snap to grid
    node.position.x = Math.round(node.position.x / 20) * 20;
    node.position.y = Math.round(node.position.y / 20) * 20;
  } else if (isLinking.value && linkStartNode.value) {
    linkEndPos.value = { x: event.clientX, y: event.clientY };
  } else if (isDraggingPath.value && dragPathSource.value && dragPathTarget.value && dragPathType.value) {
    const sourceNode = nodes.value[dragPathSource.value];
    const targetNode = nodes.value[dragPathTarget.value];
    if (sourceNode && targetNode) {
      if (!sourceNode.pathOffsets) sourceNode.pathOffsets = {};
      const current = sourceNode.pathOffsets[dragPathTarget.value];
      let offsets = { x: 0, y1: 0, y2: 0 };
      if (typeof current === 'number') {
        offsets.x = current;
      } else if (current) {
        offsets = { ...current };
      }
      
      if (dragPathType.value === 'x') {
        const delta = event.clientX - dragPathStartPos.value;
        offsets.x = dragPathStartOffset.value + delta;
      } else if (dragPathType.value === 'y1') {
        const delta = event.clientY - dragPathStartPos.value;
        let newOffset = dragPathStartOffset.value + delta;
        const limit = sourceNode.type === 'level' || sourceNode.type === 'boss' ? 30 : 15;
        offsets.y1 = Math.max(-limit, Math.min(limit, newOffset));
      } else if (dragPathType.value === 'y2') {
        const delta = event.clientY - dragPathStartPos.value;
        let newOffset = dragPathStartOffset.value + delta;
        const limit = targetNode.type === 'level' || targetNode.type === 'boss' ? 30 : 15;
        offsets.y2 = Math.max(-limit, Math.min(limit, newOffset));
      } else if (dragPathType.value === 'y') {
        const delta = event.clientY - dragPathStartPos.value;
        offsets.y = dragPathStartOffset.value + delta;
      } else if (dragPathType.value === 'x1') {
        const delta = event.clientX - dragPathStartPos.value;
        let newOffset = dragPathStartOffset.value + delta;
        const limit = sourceNode.type === 'level' || sourceNode.type === 'boss' ? 30 : 15;
        offsets.x1 = Math.max(-limit, Math.min(limit, newOffset));
      } else if (dragPathType.value === 'x2') {
        const delta = event.clientX - dragPathStartPos.value;
        let newOffset = dragPathStartOffset.value + delta;
        const limit = targetNode.type === 'level' || targetNode.type === 'boss' ? 30 : 15;
        offsets.x2 = Math.max(-limit, Math.min(limit, newOffset));
      }
      sourceNode.pathOffsets[dragPathTarget.value] = offsets;
    }
  }
}

function onMouseUp(event: MouseEvent) {
  if (isLinking.value && linkStartNode.value) {
    const canvasElement = document.querySelector('.editor-canvas') as HTMLElement;
    const canvasRect = canvasElement.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    // Find node under mouse
    const targetNodeId = Object.keys(nodes.value).find(id => {
      const node = nodes.value[id];
      const dx = mouseX - node.position.x;
      const dy = mouseY - node.position.y;
      return dx >= -10 && dx <= 50 && dy >= -10 && dy <= 80; // Approx node size
    });

    if (targetNodeId && targetNodeId !== linkStartNode.value) {
      const source = nodes.value[linkStartNode.value];
      if (!source.next.includes(targetNodeId)) {
        source.next.push(targetNodeId);
      }
    }
  }

  isDragging.value = false;
  dragNodeId.value = null;
  isLinking.value = false;
  linkStartNode.value = null;
  
  isDraggingPath.value = false;
  dragPathSource.value = null;
  dragPathTarget.value = null;
  dragPathType.value = null;
}

function onMouseDownPathHandle(event: MouseEvent, sourceId: string, targetId: string, type: 'x'|'y1'|'y2'|'y'|'x1'|'x2', currentOffset: number) {
  event.stopPropagation();
  isDraggingPath.value = true;
  dragPathSource.value = sourceId;
  dragPathTarget.value = targetId;
  dragPathType.value = type;
  dragPathStartPos.value = type === 'x' ? event.clientX : event.clientY;
  dragPathStartOffset.value = currentOffset;
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  // Prevent context menu on canvas for right click link
  document.querySelector('.editor-canvas')?.addEventListener('contextmenu', e => e.preventDefault());
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});

// Import/Export
function exportData() {
  const exportPayload = {
    nodes: Object.fromEntries(Object.entries(nodes.value).map(([k, v]) => [k, { ...v, company: v.company?.name }])),
    startNode: startNodeId.value,
  };
  const data = JSON.stringify(exportPayload, null, 2);
  navigator.clipboard.writeText(data).then(() => {
    alert('World graph exported to clipboard!');
  }).catch(_err => {
    alert('Failed to copy to clipboard');
  });
}

function importData() {
  const jsonStr = prompt("Paste campaign world JSON here:");
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.nodes && parsed.startNode !== undefined) {
        const importedNodes = parsed.nodes;
        for (const key in importedNodes) {
           if (importedNodes[key].company && typeof importedNodes[key].company === 'string') {
               importedNodes[key].company = allCompanyOptions.find(c => c.name === importedNodes[key].company);
           }
        }
        nodes.value = importedNodes;
        startNodeId.value = parsed.startNode;
      } else {
        alert('Invalid JSON structure');
      }
    } catch (e) {
      alert('Failed to parse JSON');
    }
  }
}

const allCompanyOptions = [shopCompany, bossCompany, playerCompany, ...companies];

function getPathSettings(node: EditorNode, nextId: string) {
  if (!node.pathOffsets) return {};
  const val = node.pathOffsets[nextId];
  if (typeof val === 'number') return { x: val };
  return val || {};
}

function updatePathSetting(node: EditorNode, nextId: string, key: string, value: any) {
  if (!node.pathOffsets) node.pathOffsets = {};
  if (!node.pathOffsets[nextId] || typeof node.pathOffsets[nextId] === 'number') {
    node.pathOffsets[nextId] = { x: typeof node.pathOffsets[nextId] === 'number' ? node.pathOffsets[nextId] : 0 };
  }
  if (value === 0 && (key === 'ds1' || key === 'ds2')) {
     delete node.pathOffsets[nextId][key];
  } else {
     node.pathOffsets[nextId][key] = value;
  }
}

function updateNextNodeId(node: EditorNode, index: number, newId: string) {
  const oldId = node.next[index];
  if (oldId === newId) return;
  node.next[index] = newId;
  if (node.pathOffsets && node.pathOffsets[oldId]) {
    node.pathOffsets[newId] = node.pathOffsets[oldId];
    delete node.pathOffsets[oldId];
  }
}

function addNextNode(node: EditorNode) {
  node.next.push('');
}

function removeNextNode(node: EditorNode, index: number) {
  const oldId = node.next[index];
  node.next.splice(index, 1);
  if (node.pathOffsets && node.pathOffsets[oldId]) {
    delete node.pathOffsets[oldId];
  }
}

function displayIcon(node: EditorNode) {
    if (node.type === 'skip') return "";
    switch (node.type) {
        case "start": return "⬤";
        case "shop": return "🛒";
        case "sacrificial altar": return String.fromCodePoint(parseInt("U+1FAA6".replace('U+', ''), 16), 0xFE0F);
        case "duplicator": return String.fromCodePoint(parseInt("U+1F46F".replace('U+', ''), 16), 0xFE0F);
        case "workbench": return String.fromCodePoint(parseInt("U+2699".replace('U+', ''), 16), 0xFE0F);
        case "hybrid compiler": return String.fromCodePoint(parseInt("U+1F9EC".replace('U+', ''), 16), 0xFE0F);
        case "level": return node.company ? String.fromCodePoint(parseInt(node.company.unicode.replace('U+', ''), 16), 0xFE0F) : "";
        case "boss": return node.bossName ? "" : "?";
        default: return "";
    }
}

function getIconStyle(node: EditorNode, size: number = 24): Record<string, any> {
    let iconID: number | undefined;
    if (node.type === 'level' && node.company) {
        iconID = node.company.iconID;
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
    } else if (node.type === 'boss' && node.bossName) {
        const boss = allBosses.find(b => b.name === node.bossName);
        if (boss) iconID = boss.iconID;
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

function getCenter(node: EditorNode) {
    if (node.type === 'level') return { x: node.position.x + 20, y: node.position.y + 35 };
    return { x: node.position.x + 18, y: node.position.y + 18 };
}

// Lines drawing
const linksList = computed(() => {
  const links: { sourceId: string, targetId: string, d: string, type: string, midHandle?: any, h1Handle?: any, h2Handle?: any, v1Handle?: any, v2Handle?: any }[] = [];
  Object.values(nodes.value).forEach(node => {
    node.next.forEach(nextId => {
      const target = nodes.value[nextId];
      if (target) {
        const c1 = getCenter(node);
        const c2 = getCenter(target);
        const x1 = c1.x;
        const y1 = c1.y;
        const x2 = c2.x;
        const y2 = c2.y;
        
        const settings = node.pathOffsets && node.pathOffsets[nextId] !== undefined ? node.pathOffsets[nextId] : {};
        const isObj = typeof settings === 'object';
        const type = isObj ? (settings.type || 'HDVDH') : 'HDVDH';
        
        const dxRaw = x2 - x1;
        const dyRaw = y2 - y1;
        const dsDefault = Math.min(Math.abs(dxRaw), Math.abs(dyRaw)) * 0.1;
        
        let ds1 = isObj && settings.ds1 !== undefined ? settings.ds1 : dsDefault;
        let ds2 = isObj && settings.ds2 !== undefined ? settings.ds2 : dsDefault;
        
        if (type === 'HDVDH') {
          const offsetX = isObj ? (settings.x || 0) : (typeof settings === 'number' ? settings : 0);
          const offsetY1 = isObj ? (settings.y1 || 0) : 0;
          const offsetY2 = isObj ? (settings.y2 || 0) : 0;
          
          const y1Adj = y1 + offsetY1;
          const y2Adj = y2 + offsetY2;
          
          const dxTotal = x2 - x1;
          const dyTotal = y2Adj - y1Adj;
          const sx = Math.sign(dxTotal) || 1;
          const sy = Math.sign(dyTotal) || 1;
          
          const xb = x1 + dxTotal / 2 + offsetX;
          const xa = xb - sx * ds1;
          const xc = xb + sx * ds2;
          const yc = y1Adj + sy * ds1;
          const yd = y2Adj - sy * ds2;
          
          const points = `${x1},${y1Adj} ${xa},${y1Adj} ${xb},${yc} ${xb},${yd} ${xc},${y2Adj} ${x2},${y2Adj}`;
          const d = "M " + points.replace(/ /g, " L ");
          
          links.push({
            sourceId: node.id,
            targetId: nextId,
            d,
            type: 'HDVDH',
            midHandle: { x: xb, yTop: Math.min(yc, yd), yBottom: Math.max(yc, yd), offset: offsetX },
            h1Handle: { y: y1Adj, xLeft: Math.min(x1, xa), xRight: Math.max(x1, xa), offset: offsetY1 },
            h2Handle: { y: y2Adj, xLeft: Math.min(xc, x2), xRight: Math.max(xc, x2), offset: offsetY2 }
          });
        } else {
          const offsetY = isObj ? (settings.y || 0) : 0;
          const offsetX1 = isObj ? (settings.x1 || 0) : 0;
          const offsetX2 = isObj ? (settings.x2 || 0) : 0;
          
          const x1Adj = x1 + offsetX1;
          const x2Adj = x2 + offsetX2;
          
          const dxTotal = x2Adj - x1Adj;
          const dyTotal = y2 - y1;
          const sx = Math.sign(dxTotal) || 1;
          const sy = Math.sign(dyTotal) || 1;
          
          const yb = y1 + dyTotal / 2 + offsetY;
          const ya = yb - sy * ds1;
          const yd = yb + sy * ds2;
          const xb = x1Adj + sx * ds1;
          const xc = x2Adj - sx * ds2;
          
          const points = `${x1Adj},${y1} ${x1Adj},${ya} ${xb},${yb} ${xc},${yb} ${x2Adj},${yd} ${x2Adj},${y2}`;
          const d = "M " + points.replace(/ /g, " L ");
          
          links.push({
            sourceId: node.id,
            targetId: nextId,
            d,
            type: 'VDHDV',
            midHandle: { y: yb, xLeft: Math.min(xb, xc), xRight: Math.max(xb, xc), offset: offsetY },
            v1Handle: { x: x1Adj, yTop: Math.min(y1, ya), yBottom: Math.max(y1, ya), offset: offsetX1 },
            v2Handle: { x: x2Adj, yTop: Math.min(y2, yd), yBottom: Math.max(y2, yd), offset: offsetX2 }
          });
        }
      }
    });
  });
  return links;
});

function canvasOffsetX(x: number) {
  const canvasElement = document.querySelector('.editor-canvas');
  if (canvasElement) {
    return x - canvasElement.getBoundingClientRect().left;
  }
  return x;
}

function canvasOffsetY(y: number) {
  const canvasElement = document.querySelector('.editor-canvas');
  if (canvasElement) {
    return y - canvasElement.getBoundingClientRect().top;
  }
  return y;
}
</script>

<template>
  <div class="world-editor">
    <div class="editor-header">
      <h2>Campaign World Editor</h2>
      <button @click="addNode">Add Node</button>
      <button @click="exportData">Export to Clipboard</button>
      <button @click="importData">Import</button>
      <div style="flex-grow: 1"></div>
      <p style="font-size: 0.8rem; color: #888;">Right-click and drag between nodes to link them.</p>
    </div>
    
    <div class="editor-main">
      <div class="editor-canvas">
        <svg class="links-layer">
          <!-- Render saved links -->
          <g v-for="(link, idx) in linksList" :key="idx">
            <path :d="link.d" 
                  stroke="#2fc5eb" fill="none" stroke-width="3" stroke-dasharray="5,5" />
                  
            <!-- HDVDH Handles -->
            <template v-if="link.type === 'HDVDH' && selectedNodeId === link.sourceId">
              <line v-if="link.midHandle" :x1="link.midHandle.x" :y1="link.midHandle.yTop" :x2="link.midHandle.x" :y2="link.midHandle.yBottom"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-v"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'x', link.midHandle.offset)" />
              <line v-if="link.midHandle" :x1="link.midHandle.x" :y1="link.midHandle.yTop" :x2="link.midHandle.x" :y2="link.midHandle.yBottom"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
                    
              <line v-if="link.h1Handle" :x1="link.h1Handle.xLeft" :y1="link.h1Handle.y" :x2="link.h1Handle.xRight" :y2="link.h1Handle.y"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-h"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'y1', link.h1Handle.offset)" />
              <line v-if="link.h1Handle" :x1="link.h1Handle.xLeft" :y1="link.h1Handle.y" :x2="link.h1Handle.xRight" :y2="link.h1Handle.y"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
                    
              <line v-if="link.h2Handle" :x1="link.h2Handle.xLeft" :y1="link.h2Handle.y" :x2="link.h2Handle.xRight" :y2="link.h2Handle.y"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-h"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'y2', link.h2Handle.offset)" />
              <line v-if="link.h2Handle" :x1="link.h2Handle.xLeft" :y1="link.h2Handle.y" :x2="link.h2Handle.xRight" :y2="link.h2Handle.y"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
            </template>
            
            <!-- VDHDV Handles -->
            <template v-if="link.type === 'VDHDV' && selectedNodeId === link.sourceId">
              <line v-if="link.midHandle" :x1="link.midHandle.xLeft" :y1="link.midHandle.y" :x2="link.midHandle.xRight" :y2="link.midHandle.y"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-h"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'y', link.midHandle.offset)" />
              <line v-if="link.midHandle" :x1="link.midHandle.xLeft" :y1="link.midHandle.y" :x2="link.midHandle.xRight" :y2="link.midHandle.y"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
                    
              <line v-if="link.v1Handle" :x1="link.v1Handle.x" :y1="link.v1Handle.yTop" :x2="link.v1Handle.x" :y2="link.v1Handle.yBottom"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-v"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'x1', link.v1Handle.offset)" />
              <line v-if="link.v1Handle" :x1="link.v1Handle.x" :y1="link.v1Handle.yTop" :x2="link.v1Handle.x" :y2="link.v1Handle.yBottom"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
                    
              <line v-if="link.v2Handle" :x1="link.v2Handle.x" :y1="link.v2Handle.yTop" :x2="link.v2Handle.x" :y2="link.v2Handle.yBottom"
                    stroke="rgba(255, 255, 255, 0.5)" stroke-width="12" class="path-drag-handle-v"
                    @mousedown.stop="onMouseDownPathHandle($event, link.sourceId, link.targetId, 'x2', link.v2Handle.offset)" />
              <line v-if="link.v2Handle" :x1="link.v2Handle.x" :y1="link.v2Handle.yTop" :x2="link.v2Handle.x" :y2="link.v2Handle.yBottom"
                    stroke="#fff" stroke-width="3" pointer-events="none" />
            </template>
          </g>
                
          <!-- Render active dragging link -->
          <line v-if="isLinking && linkStartNode" 
                :x1="getCenter(nodes[linkStartNode]).x" 
                :y1="getCenter(nodes[linkStartNode]).y" 
                :x2="canvasOffsetX(linkEndPos.x)" 
                :y2="canvasOffsetY(linkEndPos.y)" 
                stroke="#2fc5eb" stroke-width="3" />
        </svg>

        <div v-for="node in nodes" :key="node.id"
             class="editor-node node"
             :class="{ 
               selected: selectedNodeId === node.id, 
               isStart: startNodeId === node.id,
               bossNode: node.type === 'boss',
               startNode: node.type === 'start',
               shopNode: node.type === 'shop',
               skipNode: node.type === 'skip',
               levelNode: node.type === 'level'
             }"
             :style="{ 
               left: node.position.x + 'px', 
               top: node.position.y + 'px',
               backgroundColor: node.type === 'level' && node.company ? node.company.tileColor : undefined,
               borderColor: node.type === 'level' && node.company ? node.company.edgeColor : undefined
             }"
             @mousedown.stop="onMouseDownNode($event, node.id)">
             
          <div class="pins">
              <div class="pins-top"></div>
              <div class="pins-bottom"></div>
              <div class="pins-left"></div>
              <div class="pins-right"></div>
          </div>
          
          <div class="node-inner">
              <div class="node-inner-content" v-if="node.type !== 'start'">
                  <div v-if="node.type == 'level'" class='text-gold'>
                      ${{ node.reward }}
                  </div>
                  <div class="icon" :style="getIconStyle(node, 24)">
                      <template v-if="!getIconStyle(node).backgroundImage">
                          {{ displayIcon(node) }}
                      </template>
                  </div>
                  <div v-if="node.type == 'level'">
                      {{ String.fromCodePoint(parseInt("U+1F512".replace('U+', ''), 16), 0xFE0F) }}{{
                          node.difficultyMod }}
                  </div>
              </div>
          </div>
        </div>
      </div>

      <div class="properties-panel" v-if="selectedNode">
        <h3>Node Properties</h3>
        
        <div class="prop-group">
          <label>ID</label>
          <input type="text" v-model="selectedNode.id" disabled />
        </div>

        <div class="prop-group">
          <label>Next Nodes</label>
          <div class="next-nodes-list">
            <div v-for="(nextId, index) in selectedNode.next" :key="index" class="next-node-card">
              <div class="next-node-header">
                <input type="text" :value="nextId" @change="updateNextNodeId(selectedNode, index, $event.target.value)" placeholder="Target Node ID" />
                <button class="remove-btn" @click="removeNextNode(selectedNode, index)">X</button>
              </div>
              <div class="path-settings">
                <label>Path Type:</label>
                <select :value="getPathSettings(selectedNode, nextId).type || 'HDVDH'" @change="updatePathSetting(selectedNode, nextId, 'type', $event.target.value)">
                  <option value="HDVDH">HDVDH</option>
                  <option value="VDHDV">VDHDV</option>
                </select>
                
                <label>Diag 1 Length ({{ getPathSettings(selectedNode, nextId).ds1 ?? 'auto' }})</label>
                <input type="range" min="0" max="200" 
                       :value="getPathSettings(selectedNode, nextId).ds1 || 0" 
                       @input="updatePathSetting(selectedNode, nextId, 'ds1', parseInt($event.target.value))" />
                       
                <label>Diag 2 Length ({{ getPathSettings(selectedNode, nextId).ds2 ?? 'auto' }})</label>
                <input type="range" min="0" max="200" 
                       :value="getPathSettings(selectedNode, nextId).ds2 || 0" 
                       @input="updatePathSetting(selectedNode, nextId, 'ds2', parseInt($event.target.value))" />
              </div>
            </div>
          </div>
          <button style="margin-top:0.5rem;" @click="addNextNode(selectedNode)">+ Add Next Node</button>
        </div>

        <div class="prop-group">
          <label>Type</label>
          <select v-model="selectedNode.type">
            <option v-for="type in nodeTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div class="prop-group">
          <label>Company</label>
          <select v-model="selectedNode.company">
            <option :value="undefined">None</option>
            <option v-for="c in allCompanyOptions" :key="c.name" :value="c">{{ c.name }}</option>
          </select>
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'start'">
          <label>Start Node?</label>
          <button @click="startNodeId = selectedNode.id">Set as Start Node</button>
        </div>

        <div class="prop-group">
          <label>Difficulty Modifier</label>
          <input type="number" v-model.number="selectedNode.difficultyMod" />
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'level' || selectedNode.type === 'boss'">
          <label>Reward / Money</label>
          <input type="number" v-model.number="selectedNode.reward" />
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'boss'">
          <label>Boss</label>
          <select v-model="selectedNode.bossName">
            <option :value="undefined">Random Boss</option>
            <option v-for="boss in allBosses" :key="boss.name" :value="boss.name">{{ boss.name }}</option>
          </select>
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'level'">
          <label>Level Name</label>
          <input type="text" v-model="selectedNode.levelName" placeholder="e.g. castled" />
          <small>Matches a level exported from the Level Editor</small>
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'shop'">
          <label>Shop Contents (comma-separated Blueprint/Item names)</label>
          <textarea v-model="selectedNode.shopContents" placeholder="Knife, Shield, Voucher..."></textarea>
        </div>

        <div class="prop-group" v-if="selectedNode.type === 'skip'">
          <label>Skip Contents (comma-separated Blueprint/Item/Admin names)</label>
          <textarea v-model="selectedNode.skipContents" placeholder="Knife, Shield, Voucher..."></textarea>
        </div>

        <button class="danger-btn" @click="removeNode(selectedNode.id)">Delete Node</button>
      </div>
      <div class="properties-panel empty" v-else>
        Select a node to edit properties.
      </div>
    </div>
  </div>
</template>

<style scoped>
.world-editor {
  width: 100vw;
  height: 100vh;
  background: #111;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: 'Courier New', Courier, monospace;
}
.editor-header {
  background: #222;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  border-bottom: 2px solid #444;
}
.editor-header button {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.editor-header button:hover {
  background: #444;
  border-color: #2fc5eb;
}

.editor-main {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.editor-canvas {
  flex-grow: 1;
  position: relative;
  background-image: radial-gradient(#333 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: auto;
}

.links-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.path-drag-handle-v {
  cursor: ew-resize;
  pointer-events: auto;
}
.path-drag-handle-v:hover {
  stroke: rgba(255, 255, 255, 0.8);
}

.path-drag-handle-h {
  cursor: ns-resize;
  pointer-events: auto;
}
.path-drag-handle-h:hover {
  stroke: rgba(255, 255, 255, 0.8);
}

.editor-node {
  position: absolute;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  text-align: center;
}
.editor-node:active {
  cursor: grabbing;
}
.editor-node.levelNode.selected {
  border: 2px solid #2fc5eb !important;
  box-shadow: 0 0 10px #2fc5eb;
}
.editor-node.levelNode.isStart {
  border: 2px solid #4CAF50 !important;
  box-shadow: 0 0 10px #4CAF50;
}
.node-title {
  display: none;
}
.node-id {
  display: none;
}

.levelNode {
    width: 40px;
    height: 70px;
    font-size: 14px;
}

.bossNode {
  width: 72px;
  height: 72px;
}

.startNode,
.shopNode,
.skipNode {
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
    border-radius: 4px;
}

.bossNode .node-inner,
.shopNode .node-inner {
    border-left: none;
    border-right: none;
}

.bossNode .node-inner {
    width: 100%;
    height: 100%;
}

.pins {
    position: absolute;
    z-index: -1;
    width: 80%;
    height: 80%;
    left: 10%;
    top: 10%;
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

.bossNode .pins-top{
    left: 10%;
    top: -4%;
}
.startNode .pins-top {
    left: 4%;
    top: -9%;
}

.bossNode .pins-bottom{
    top: 21%;
}
.startNode .pins-bottom {
    top: 19%;
}

.bossNode .pins-right{
    left: 22%;
}
.startNode .pins-right {
    left: 19%;
}
.bossNode .pins-left{
    top: 10%;
    left: -4%;
}

.text-gold {
    color: gold;
}

.boss-info {
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

.properties-panel {
  width: 300px;
  background: #1a1a1a;
  border-left: 2px solid #444;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}
.properties-panel.empty {
  align-items: center;
  justify-content: center;
  color: #666;
}

.prop-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.prop-group label {
  font-size: 0.9rem;
  color: #ccc;
}
.prop-group input, .prop-group select, .prop-group textarea {
  background: #222;
  color: white;
  border: 1px solid #555;
  padding: 0.5rem;
  border-radius: 4px;
}
.prop-group textarea {
  resize: vertical;
  min-height: 80px;
}
.prop-group small {
  color: #888;
  font-size: 0.75rem;
}

.next-node-card {
  background: #2a2a2a;
  border: 1px solid #444;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.next-node-header {
  display: flex;
  gap: 0.5rem;
}
.next-node-header input {
  flex-grow: 1;
}
.remove-btn {
  background: #ff4444 !important;
  padding: 0 0.5rem !important;
}
.path-settings {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #aaa;
}
.path-settings input[type="range"] {
  width: 100%;
}
.next-nodes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.danger-btn {
  margin-top: 2rem;
  background: #5a1c1c;
  color: white;
  border: 1px solid #ff4444;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}
.danger-btn:hover {
  background: #7a1c1c;
}
</style>
