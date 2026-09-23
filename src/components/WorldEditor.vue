<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

type NodeType = "start" | "level" | "skip" | "shop" | "boss" | "hybrid compiler" | "sacrificial altar" | "duplicator" | "workbench";

interface EditorNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  next: string[];
  difficultyMod: number;
  reward: number;
  levelName?: string;
  shopContents?: string[]; // IDs or names of blueprints/items
  drops?: string[]; // predefined drops for levels
}

const nodes = ref<Record<string, EditorNode>>({});
const startNodeId = ref<string>('');

const isDragging = ref(false);
const dragNodeId = ref<string | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

const isLinking = ref(false);
const linkStartNode = ref<string | null>(null);
const linkEndPos = ref({ x: 0, y: 0 });

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
  nodes.value[id] = {
    id,
    type: Object.keys(nodes.value).length === 0 ? 'start' : 'level',
    position: { x: 100, y: 100 },
    next: [],
    difficultyMod: 0,
    reward: 3,
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
      return dx >= 0 && dx <= 120 && dy >= 0 && dy <= 40; // Approx node size
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
    nodes: nodes.value,
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
        nodes.value = parsed.nodes;
        startNodeId.value = parsed.startNode;
      } else {
        alert('Invalid JSON structure');
      }
    } catch (e) {
      alert('Failed to parse JSON');
    }
  }
}

// Lines drawing
const linksList = computed(() => {
  const links: { x1: number, y1: number, x2: number, y2: number }[] = [];
  Object.values(nodes.value).forEach(node => {
    node.next.forEach(nextId => {
      const target = nodes.value[nextId];
      if (target) {
        links.push({
          x1: node.position.x + 60, // center x
          y1: node.position.y + 40, // bottom center y
          x2: target.position.x + 60,
          y2: target.position.y, // top center y
        });
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
          <line v-for="(link, idx) in linksList" :key="idx" 
                :x1="link.x1" :y1="link.y1" :x2="link.x2" :y2="link.y2" 
                stroke="#2fc5eb" stroke-width="3" stroke-dasharray="5,5" />
                
          <!-- Render active dragging link -->
          <line v-if="isLinking && linkStartNode" 
                :x1="nodes[linkStartNode].position.x + 60" 
                :y1="nodes[linkStartNode].position.y + 40" 
                :x2="canvasOffsetX(linkEndPos.x)" 
                :y2="canvasOffsetY(linkEndPos.y)" 
                stroke="#2fc5eb" stroke-width="3" />
        </svg>

        <div v-for="node in nodes" :key="node.id"
             class="editor-node"
             :class="{ selected: selectedNodeId === node.id, isStart: startNodeId === node.id }"
             :style="{ left: node.position.x + 'px', top: node.position.y + 'px' }"
             @mousedown.stop="onMouseDownNode($event, node.id)">
          <div class="node-title">{{ node.type }}</div>
          <div class="node-id">{{ node.id }}</div>
        </div>
      </div>

      <div class="properties-panel" v-if="selectedNode">
        <h3>Node Properties</h3>
        
        <div class="prop-group">
          <label>ID</label>
          <input type="text" v-model="selectedNode.id" disabled />
        </div>

        <div class="prop-group">
          <label>Type</label>
          <select v-model="selectedNode.type">
            <option v-for="type in nodeTypes" :key="type" :value="type">{{ type }}</option>
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

        <div class="prop-group">
          <label>Reward / Money</label>
          <input type="number" v-model.number="selectedNode.reward" />
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

.editor-node {
  position: absolute;
  width: 120px;
  background: #222;
  border: 2px solid #555;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  text-align: center;
  padding-bottom: 5px;
}
.editor-node:active {
  cursor: grabbing;
}
.editor-node.selected {
  border-color: #2fc5eb;
  box-shadow: 0 0 10px #2fc5eb;
}
.editor-node.isStart {
  border-color: #4CAF50;
  box-shadow: 0 0 10px #4CAF50;
}
.node-title {
  background: #333;
  padding: 5px;
  font-weight: bold;
  font-size: 0.9rem;
  border-bottom: 1px solid #555;
  border-radius: 4px 4px 0 0;
}
.node-id {
  font-size: 0.7rem;
  color: #888;
  padding: 5px;
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
