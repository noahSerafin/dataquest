<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { allPieces, Spawn } from "../Pieces";
import { allItems, Item } from "../Items";
import { allAdmins } from "../AdminPrograms";
import { allBosses } from "../Bosses";
import { StorageManager, type PlayerCollection, type PlayerStats } from "../StorageManager";
import BlueprintView from "./BlueprintView.vue";
import ItemView from "./ItemView.vue";
import { makeBlueprint } from "../helperFunctions";
import type { PieceBlueprint } from "../types";

const props = defineProps<{
  debugMode: boolean;
  currentSeed: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const collection = ref<PlayerCollection>({ pieces: [], admins: [], bosses: [], items: [] });
const stats = ref<PlayerStats>({ osStats: {} });
const selectedItem = ref<Item | null>(null);
const seedCopied = ref<boolean>(false);

function selectItem(item: Item){
  selectedItem.value = item;
  return;
}
function deselectItem(){
  selectedItem.value = null;
  return;
}

onMounted(() => {
  collection.value = StorageManager.getCollection();
  stats.value = StorageManager.getStats();
  console.log('Collection: ', collection.value)

  const handleCollectionUpdate = (e: Event) => {
    collection.value = (e as CustomEvent<PlayerCollection>).detail;
  };
  const handleStatsUpdate = (e: Event) => {
    stats.value = (e as CustomEvent<PlayerStats>).detail;
  };

  window.addEventListener('storageManagerCollection', handleCollectionUpdate);
  window.addEventListener('storageManagerStats', handleStatsUpdate);
});

// We only want to display actual playable pieces (not Spawn)
const playablePieces = computed(() => allPieces.filter(p => p.name !== Spawn.name));

function isPieceUnlocked(name: string): boolean {
  return props.debugMode ? true : collection.value.pieces.includes(name);
}

function isAdminUnlocked(name: string): boolean {
  return props.debugMode ? true : collection.value.admins.includes(name);
}

function isBossUnlocked(name: string): boolean {
  return props.debugMode ? true : collection.value.bosses.includes(name);
}

function isItemUnlocked(name: string): boolean {
  return props.debugMode ? true : collection.value.items.includes(name);
}

// Generate an instance just for display properties
function getPieceBlueprint(PieceClass: any): PieceBlueprint {
  return makeBlueprint(PieceClass);
}

function getItemInstance(ItemClass: any) {
  return new ItemClass();
}

const activeTab = ref<'pieces' | 'items' | 'admins' | 'bosses' | 'stats' | 'run'>(props.currentSeed ? 'run' : 'stats');

function copySeed() {
  navigator.clipboard.writeText(props.currentSeed);
  seedCopied.value = true;
}
</script>

<template>
  <div class="collection-overlay">
    <div class="collection-container">
      <div class="header">
        <h2>Collection & Stats</h2>
        <button class="close-btn" @click="emit('close')">X</button>
      </div>

      <div class="tabs">
        <button :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">Stats</button>
        <button v-if="currentSeed" :class="{ active: activeTab === 'run' }" @click="activeTab = 'run'">This Run</button>
        <button :class="{ active: activeTab === 'pieces' }" @click="activeTab = 'pieces'">Programs</button>
        <button :class="{ active: activeTab === 'items' }" @click="activeTab = 'items'">Items</button>
        <button :class="{ active: activeTab === 'admins' }" @click="activeTab = 'admins'">Admins</button>
        <button :class="{ active: activeTab === 'bosses' }" @click="activeTab = 'bosses'">Bosses</button>
      </div>

      <div class="content-area">
        <!-- PIECES TAB -->
        <div v-if="activeTab === 'pieces'" class="grid-layout">
          <div v-for="PieceClass in playablePieces" :key="PieceClass.name" class="slot-container">
            <template v-if="isPieceUnlocked(PieceClass.name)">
              <BlueprintView :blueprint="getPieceBlueprint(PieceClass)" :tileSize="60" cssclass="collection" />
              <div class="name-label">{{ PieceClass.name }}</div>
            </template>
            <div v-else class="locked-slot piece-slot">
              ?
            </div>
          </div>
        </div>

        <!-- ITEMS TAB -->
        <div v-if="activeTab === 'items'" class="grid-layout">
          <div v-for="ItemClass in allItems" :key="ItemClass.name" class="slot-container">
            <template v-if="isItemUnlocked(ItemClass.name)">
              <ItemView :item="getItemInstance(ItemClass)" type="consumable" cssclass="collection" :tileSize="60"
                :canBuy="false"
                :showController="(selectedItem?.name === ItemClass.name)"
                @select="selectItem"
                @deselect="deselectItem"
                :class="`selected-${selectedItem?.name === ItemClass.name}`"
                />
              <div class="name-label">{{ ItemClass.name }}</div>
            </template>
            <div v-else class="locked-slot item-slot">
              ?
            </div>
          </div>
        </div>

         <!-- ADMINS TAB -->
        <div v-if="activeTab === 'admins'" class="grid-layout">
          <div v-for="AdminClass in allAdmins" :key="AdminClass.name" class="slot-container">
            <template v-if="isAdminUnlocked(AdminClass.name)">
              <ItemView :item="getItemInstance(AdminClass)" type="admin" cssclass="collection" :tileSize="60"
                :canBuy="false" 
                :showController="(selectedItem?.name === AdminClass.name)"
                @select="selectItem"
                @deselect="deselectItem"
                :class="`selected-${selectedItem?.name === AdminClass.name}`"
                />
              <div class="name-label">{{ AdminClass.name }}</div>
            </template>
            <div v-else class="locked-slot item-slot">
              ?
            </div>
          </div>
        </div>
        
        <!-- BOSSES TAB -->
        <div v-if="activeTab === 'bosses'" class="grid-layout">
          <div v-for="AdminClass in allBosses" :key="AdminClass.name" class="slot-container">
            <template v-if="isBossUnlocked(AdminClass.name)">
              <ItemView :item="getItemInstance(AdminClass)" type="admin" cssclass="collection" :tileSize="60"
                :canBuy="false" 
                :showController="(selectedItem?.name === AdminClass.name)"
                @select="selectItem"
                @deselect="deselectItem"
                :class="`selected-${selectedItem?.name === AdminClass.name}`"
                />
              <div class="name-label">{{ AdminClass.name }}</div>
            </template>
            <div v-else class="locked-slot item-slot">
              ?
            </div>
          </div>
        </div>

        <!-- STATS TAB -->
        <div v-if="activeTab === 'stats'" class="stats-layout">
          <h3>Win History</h3>
          <div v-if="Object.keys(stats.osStats).length === 0" class="no-stats">
            No characters played yet. Keep playing!
          </div>
          <div v-else class="os-stats-list">
            <div v-for="(osData, osunicode) in stats.osStats" :key="osunicode" class="os-stat-card">
              <div class="os-icon">{{ String.fromCodePoint(parseInt(String(osunicode).replace('U+', ''), 16), 0xFE0F) }}</div>
              <div class="os-details">
                <div class="total-wins">Total Wins: {{ osData.totalWins }}</div>
                <div class="stake-wins" v-if="Object.keys(osData.winsByStake).length > 0">
                  <span v-for="(wins, stake) in osData.winsByStake" :key="stake" class="stake-pill">
                    Infamy {{ stake }}: {{ wins }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RUN TAB -->
        <div v-if="activeTab === 'run'" class="run-layout">
          <h3>Current Run Information</h3>
          <div class="seed-display">
            <span class="seed-label">Seed:</span>
            <span class="seed-value">{{ currentSeed }}</span>
            <button class="copy-btn" @click="copySeed">Copy Seed</button>
            <span v-if="seedCopied">Seed copied!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.collection-container {
  position: absolute;
  left: 0;
  background-color: #1a1a1a;
  border: 2px solid #444;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  height: 85%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
  color: #fff;
}

.close-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  font-weight: bold;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.tabs button {
  background: #333;
  color: #ccc;
  border: 1px solid #555;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.tabs button.active {
  background: #555;
  color: #fff;
  border-color: #777;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar for content area */
.content-area::-webkit-scrollbar {
  width: 8px;
}

.content-area::-webkit-scrollbar-track {
  background: #222;
}

.content-area::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.grid-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 1rem;
}

.slot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
}

.name-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #aaa;
  text-align: center;
  word-wrap: break-word;
}

.locked-slot {
  background-color: #222;
  border: 2px dashed #444;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555;
  font-size: 1.5rem;
  font-weight: bold;
}

.piece-slot {
  width: 44px;
  height: 44px;
}

.item-slot {
  width: 44px;
  height: 44px;
  /* Adjust according to ItemView size without adjusment */
}

/* Stats Styling */
.stats-layout {
  padding: 1rem;
  color: #ddd;
}

.no-stats {
  color: #888;
  font-style: italic;
  text-align: center;
  margin-top: 2rem;
}

.os-stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.os-stat-card {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.os-icon {
  font-size: 3rem;
  background: #111;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 2px solid #555;
}

.os-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-wins {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
}

.stake-wins {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stake-pill {
  background: #444;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.selected-true{
  z-index: 99!important;
}

.run-layout {
  padding: 1rem;
  color: #ddd;
}

.seed-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #444;
}

.seed-label {
  font-weight: bold;
  color: #888;
}

.seed-value {
  font-family: monospace;
  font-size: 1.2rem;
  color: #4CAF50;
  letter-spacing: 1px;
}

.copy-btn {
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #555;
}
</style>
