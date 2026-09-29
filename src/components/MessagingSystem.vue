<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { DialogueTree, DialogueNode, DialogueChoice } from '../types';
import { characters } from '../Characters';

const props = defineProps<{
    dialogueTree?: DialogueTree | null;
    activeMapEvent?: string | null; // e.g. "preview:node_123"
}>();

const emit = defineEmits<{
    (e: 'complete'): void;
}>();

const currentNodeId = ref<string | null>(null);
const isMinimized = ref(false);

const currentNode = computed<DialogueNode | null>(() => {
    if (!props.dialogueTree || !currentNodeId.value) return null;
    return props.dialogueTree.nodes[currentNodeId.value] || null;
});

const speakerCharacter = computed(() => {
    if (!currentNode.value) return null;
    return characters[currentNode.value.speaker] || null;
});

const isOpen = computed(() => currentNode.value !== null);

// Start dialogue when tree is provided
watch(() => props.dialogueTree, (newTree) => {
    if (newTree && newTree.startNode) {
        currentNodeId.value = newTree.startNode;
        isMinimized.value = false;
        checkNodeTriggers(props.activeMapEvent);
    } else {
        currentNodeId.value = null;
    }
}, { immediate: true });

// Check if we are waiting for a map node
const waitingForMapNode = computed(() => {
    return currentNode.value?.nodeID ? currentNode.value.nodeID !== props.activeMapEvent : false;
});

watch(() => props.activeMapEvent, (newEvent) => {
    checkNodeTriggers(newEvent);
});

function checkNodeTriggers(eventStr?: string | null) {
    if (!props.dialogueTree || !eventStr) return;

    if (currentNode.value?.nodeID === eventStr) {
        // We were waiting for this node, now un-minimize / show
        isMinimized.value = false;
        return;
    }

    // Search the whole tree to see if a node triggers on this event
    for (const [id, node] of Object.entries(props.dialogueTree.nodes)) {
        if (node.nodeID === eventStr) {
            currentNodeId.value = id;
            isMinimized.value = false;
            return;
        }
    }
}

// Overlay logic
const overlayRect = ref({ top: 0, bottom: 0, left: 0, right: 0 });
let overlayInterval: number;

function updateOverlay() {
    if (isOpen.value && !isMinimized.value && !waitingForMapNode.value && currentNode.value?.elementID) {
        const el = document.getElementById(currentNode.value.elementID);
        if (el) {
            const rect = el.getBoundingClientRect();
            const p = 4; // padding
            overlayRect.value = {
                left: Math.max(0, rect.left - p),
                top: Math.max(0, rect.top - p),
                right: Math.min(window.innerWidth, rect.right + p),
                bottom: Math.min(window.innerHeight, rect.bottom + p)
            };
        } else {
            overlayRect.value = { top: 0, bottom: 0, left: 0, right: 0 };
        }
    } else {
        overlayRect.value = { top: 0, bottom: 0, left: 0, right: 0 };
    }
}

watch([isOpen, isMinimized, waitingForMapNode, currentNode], () => {
    setTimeout(updateOverlay, 50); // small delay to let DOM update
});

onMounted(() => {
    overlayInterval = window.setInterval(updateOverlay, 50); // Continuously track element in case of scrolling/dragging
});

onUnmounted(() => {
    clearInterval(overlayInterval);
});

function selectChoice(choice: DialogueChoice) {
    if (choice.nextNode && props.dialogueTree?.nodes[choice.nextNode]) {
        currentNodeId.value = choice.nextNode;
        isMinimized.value = false;
    } else {
        closeDialogue();
    }
}

function closeDialogue() {
    isMinimized.value = true;
}

</script>

<template>
    <!-- Tutorial Overlay Blocker -->
    <template v-if="isOpen && !isMinimized && !waitingForMapNode && currentNode?.elementID && overlayRect.right > 0">
        <!-- Top -->
        <div class="tutorial-overlay" :style="{ top: 0, left: 0, right: 0, height: overlayRect.top + 'px' }"></div>
        <!-- Bottom -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.bottom + 'px', left: 0, right: 0, bottom: 0 }"></div>
        <!-- Left -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.top + 'px', height: (overlayRect.bottom - overlayRect.top) + 'px', left: 0, width: overlayRect.left + 'px' }"></div>
        <!-- Right -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.top + 'px', height: (overlayRect.bottom - overlayRect.top) + 'px', left: overlayRect.right + 'px', right: 0 }"></div>
    </template>

    <div v-if="isOpen" class="messaging-system" :class="{ minimized: isMinimized, hidden: waitingForMapNode }">
        <!-- Minimized View -->
        <div v-if="isMinimized" class="minimized-icon" @click="isMinimized = false">
            ✉️
        </div>

        <!-- Expanded View -->
        <div v-else class="messaging-window">
            <div class="header">
                <div class="character-info" v-if="speakerCharacter">
                    <span class="icon">{{ String.fromCodePoint(parseInt(speakerCharacter.unicode.replace('U+', ''), 16), 0xFE0F) }}</span>
                    <span class="name">{{ speakerCharacter.name }}</span>
                </div>
                <div class="character-info" v-else>
                    <span class="name">{{ currentNode?.speaker || 'Unknown' }}</span>
                </div>
                <button class="minimize-btn" @click="isMinimized = true">_</button>
            </div>

            <div class="message-body">
                <p>{{ currentNode?.text }}</p>
            </div>

            <div class="choices" v-if="currentNode?.choices && currentNode.choices.length > 0">
                <button 
                    v-for="(choice, index) in currentNode.choices" 
                    :key="index"
                    class="choice-btn"
                    @click="selectChoice(choice)"
                >
                    {{ choice.text }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tutorial-overlay {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9999998;
    pointer-events: auto;
}

.messaging-system {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999999;
    font-family: 'Courier New', Courier, monospace;
}

.messaging-system.hidden {
    display: none;
}

.minimized-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #34ffff;
    color: #141414;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    transition: transform 0.2s;
}

.minimized-icon:hover {
    transform: scale(1.1);
}

.messaging-window {
    width: 350px;
    background-color: #1a1a1a;
    border: 2px solid #34ffff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    overflow: hidden;
}

.header {
    background-color: #2a2a2a;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #34ffff;
}

.character-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.character-info .icon {
    font-size: 24px;
}

.character-info .name {
    font-weight: bold;
    color: #34ffff;
    font-size: 16px;
}

.minimize-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    padding: 0 5px;
    line-height: 1;
}

.minimize-btn:hover {
    color: #34ffff;
}

.message-body {
    padding: 20px;
    color: #fff;
    font-size: 15px;
    line-height: 1.4;
    min-height: 80px;
    max-height: 300px;
    overflow-y: auto;
}

.choices {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: #222;
    border-top: 1px solid #333;
}

.choice-btn {
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #fff;
    padding: 10px 15px;
    border-radius: 4px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.choice-btn:hover {
    background-color: #34ffff;
    color: #000;
    border-color: #34ffff;
}

.continue-btn {
    text-align: center;
    background-color: #1a4a4a;
    border-color: #34ffff;
}
</style>
