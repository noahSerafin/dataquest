<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { DialogueTree, DialogueNode, DialogueChoice } from '../types';
import { characters } from '../Characters';

const props = defineProps<{
    dialogueTree?: DialogueTree | null;
    activeMapEvent?: string | null;
}>();

const emit = defineEmits<{
    (e: 'complete'): void;
}>();

interface MessageEntry {
    id: string;
    text: string;
    playerResponse?: string;
}

const seenNodes = ref<Set<string>>(new Set());
const chatHistories = ref<Record<string, MessageEntry[]>>({});

const currentNodeId = ref<string | null>(null);
const isMinimized = ref(true);
const viewState = ref<'overview' | 'chat'>('overview');
const selectedContact = ref<string | null>(null);
const messageBodyRef = ref<HTMLElement | null>(null);

const currentNode = computed<DialogueNode | null>(() => {
    if (!props.dialogueTree || !currentNodeId.value) return null;
    return props.dialogueTree.nodes[currentNodeId.value] || null;
});

const isVisible = computed(() => {
    return !!props.dialogueTree || Object.keys(chatHistories.value).length > 0;
});

// Check if we are waiting for a map node
const waitingForMapNode = computed(() => {
    return currentNode.value?.nodeID ? currentNode.value.nodeID !== props.activeMapEvent : false;
});

function getCharacterIcon(speakerId: string) {
    const char = characters[speakerId];
    if (char && char.unicode) {
        return String.fromCodePoint(parseInt(char.unicode.replace('U+', ''), 16), 0xFE0F);
    }
    return '👤';
}

function getCharacterName(speakerId: string) {
    const char = characters[speakerId];
    return char ? char.name : (speakerId || 'Unknown');
}

function getSpeakerName(node: DialogueNode | null) {
    return node?.speaker || 'Unknown';
}

function scrollToBottom() {
    nextTick(() => {
        if (messageBodyRef.value) {
            messageBodyRef.value.scrollTop = messageBodyRef.value.scrollHeight;
        }
    });
}

function tryTriggerNode(id: string) {
    if (seenNodes.value.has(id)) return;
    
    const node = props.dialogueTree?.nodes[id];
    if (!node) return;

    currentNodeId.value = id;
    seenNodes.value.add(id);
    
    const speaker = node.speaker || 'Unknown';
    if (!chatHistories.value[speaker]) {
        chatHistories.value[speaker] = [];
    }
    
    chatHistories.value[speaker].push({
        id: id,
        text: node.text
    });
    
    selectedContact.value = speaker;
    viewState.value = 'chat';
    isMinimized.value = false;
    scrollToBottom();
}

// Start dialogue when tree is provided
watch(() => props.dialogueTree, (newTree) => {
    if (newTree && newTree.startNode) {
        tryTriggerNode(newTree.startNode);
        checkNodeTriggers(props.activeMapEvent);
    } else {
        currentNodeId.value = null;
    }
}, { immediate: true });

watch(() => props.activeMapEvent, (newEvent) => {
    checkNodeTriggers(newEvent);
});

function checkNodeTriggers(eventStr?: string | null) {
    if (!props.dialogueTree || !eventStr) return;

    if (currentNode.value?.nodeID === eventStr) {
        isMinimized.value = false;
        return;
    }

    for (const [id, node] of Object.entries(props.dialogueTree.nodes)) {
        if (node.nodeID === eventStr) {
            tryTriggerNode(id);
            return;
        }
    }
}

function triggerNodeCleared(nodeId: string) {
    checkNodeTriggers(`clear:${nodeId}`);
}

defineExpose({
    triggerNodeCleared
});

// Overlay logic
const overlayRect = ref({ top: 0, bottom: 0, left: 0, right: 0 });
let overlayInterval: number;

function updateOverlay() {
    if (currentNode.value !== null && !isMinimized.value && !waitingForMapNode.value && currentNode.value?.elementID) {
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

watch([() => currentNode.value, isMinimized, waitingForMapNode], () => {
    setTimeout(updateOverlay, 50);
});

onMounted(() => {
    overlayInterval = window.setInterval(updateOverlay, 50);
});

onUnmounted(() => {
    clearInterval(overlayInterval);
});

function selectChoice(choice: DialogueChoice) {
    const speaker = currentNode.value?.speaker || 'Unknown';
    const history = chatHistories.value[speaker];
    if (history && history.length > 0) {
        history[history.length - 1].playerResponse = choice.text;
    }
    
    currentNodeId.value = null; 
    scrollToBottom();
    
    if (choice.nextNode && props.dialogueTree?.nodes[choice.nextNode]) {
        tryTriggerNode(choice.nextNode);
    }
}

</script>

<template>
    <!-- Tutorial Overlay Blocker -->
    <template v-if="currentNode !== null && !isMinimized && !waitingForMapNode && currentNode?.elementID && overlayRect.right > 0">
        <!-- Top -->
        <div class="tutorial-overlay" :style="{ top: 0, left: 0, right: 0, height: overlayRect.top + 'px' }"></div>
        <!-- Bottom -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.bottom + 'px', left: 0, right: 0, bottom: 0 }"></div>
        <!-- Left -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.top + 'px', height: (overlayRect.bottom - overlayRect.top) + 'px', left: 0, width: overlayRect.left + 'px' }"></div>
        <!-- Right -->
        <div class="tutorial-overlay" :style="{ top: overlayRect.top + 'px', height: (overlayRect.bottom - overlayRect.top) + 'px', left: overlayRect.right + 'px', right: 0 }"></div>
    </template>

    <div v-if="isVisible" class="messaging-system" :class="{ minimized: isMinimized }">
        <!-- Minimized View -->
        <div v-if="isMinimized" class="minimized-icon" @click="isMinimized = false; scrollToBottom()">
            ✉️
            <div v-if="currentNode !== null" class="notification-dot"></div>
        </div>

        <!-- Expanded View -->
        <div v-else class="messaging-window">
            
            <!-- OVERVIEW MODE -->
            <template v-if="viewState === 'overview'">
                <div class="header">
                    <div class="title">Messages</div>
                    <button class="minimize-btn" @click="isMinimized = true">_</button>
                </div>
                <div class="contacts-list">
                    <div 
                        v-for="(messages, speaker) in chatHistories" 
                        :key="speaker"
                        class="contact-item"
                        @click="viewState = 'chat'; selectedContact = speaker; scrollToBottom()"
                    >
                        <span class="icon">{{ getCharacterIcon(speaker) }}</span>
                        <div class="contact-info">
                            <span class="name">{{ getCharacterName(speaker) }}</span>
                            <span class="last-msg">{{ messages[messages.length - 1]?.text }}</span>
                        </div>
                    </div>
                    <div v-if="Object.keys(chatHistories).length === 0" class="no-messages">
                        No messages yet.
                    </div>
                </div>
            </template>

            <!-- CHAT MODE -->
            <template v-else-if="viewState === 'chat' && selectedContact">
                <div class="header">
                    <button class="back-btn" @click="viewState = 'overview'">&#8592;</button>
                    <div class="character-info">
                        <span class="icon">{{ getCharacterIcon(selectedContact) }}</span>
                        <span class="name">{{ getCharacterName(selectedContact) }}</span>
                    </div>
                    <button class="minimize-btn" @click="isMinimized = true">_</button>
                </div>

                <div class="message-body" ref="messageBodyRef">
                    <div v-for="msg in chatHistories[selectedContact]" :key="msg.id" class="message-pair">
                        <div class="speaker-msg-container">
                            <div class="speaker-msg">
                                <p>{{ msg.text }}</p>
                            </div>
                        </div>
                        <div v-if="msg.playerResponse" class="player-msg-container">
                            <div class="player-msg">
                                <p>{{ msg.playerResponse }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="choices" v-if="currentNode && getSpeakerName(currentNode) === selectedContact && currentNode.choices?.length > 0">
                    <button 
                        v-for="(choice, index) in currentNode.choices" 
                        :key="index"
                        class="choice-btn"
                        @click="selectChoice(choice)"
                    >
                        {{ choice.text }}
                    </button>
                </div>
            </template>
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
    position: relative;
}

.minimized-icon:hover {
    transform: scale(1.1);
}

.notification-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 14px;
    height: 14px;
    background-color: #ff3333;
    border-radius: 50%;
    border: 2px solid #141414;
}

.messaging-window {
    width: 350px;
    height: 500px;
    background-color: #1a1a1a;
    border: 2px solid #34ffff;
    border-radius: 12px;
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
    min-height: 50px;
    box-sizing: border-box;
}

.header .title {
    color: #34ffff;
    font-weight: bold;
    font-size: 16px;
}

.back-btn {
    background: none;
    border: none;
    color: #34ffff;
    font-size: 20px;
    cursor: pointer;
    padding: 0 10px 0 0;
}

.back-btn:hover {
    color: #fff;
}

.character-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
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

.contacts-list {
    flex: 1;
    overflow-y: auto;
    background-color: #1a1a1a;
}

.contact-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #333;
    cursor: pointer;
    transition: background-color 0.2s;
    align-items: center;
}

.contact-item:hover {
    background-color: #2a2a2a;
}

.contact-item .icon {
    font-size: 32px;
    margin-right: 15px;
}

.contact-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
}

.contact-info .name {
    color: #34ffff;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
}

.contact-info .last-msg {
    color: #aaa;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-messages {
    padding: 20px;
    text-align: center;
    color: #666;
}

.message-body {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    background-color: #111;
}

.speaker-msg-container {
    display: flex;
    justify-content: flex-start;
}

.speaker-msg {
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #fff;
    padding: 10px 15px;
    border-radius: 12px 12px 12px 2px;
    max-width: 80%;
    font-size: 14px;
    line-height: 1.4;
}

.player-msg-container {
    display: flex;
    justify-content: flex-end;
}

.player-msg {
    background-color: #004d4d;
    border: 1px solid #34ffff;
    color: #fff;
    padding: 10px 15px;
    border-radius: 12px 12px 2px 12px;
    max-width: 80%;
    font-size: 14px;
    line-height: 1.4;
}

.player-msg p, .speaker-msg p {
    margin: 0;
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
</style>
