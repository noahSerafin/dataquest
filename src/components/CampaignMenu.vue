<script setup lang="ts">
import { ref, onMounted } from 'vue';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'startCampaign', slotIndex: number): void;
}>();

// Simple save slots interface
interface SaveSlot {
  isEmpty: boolean;
  name?: string;
  progress?: number;
}

const slots = ref<SaveSlot[]>([
  { isEmpty: true },
  { isEmpty: true },
  { isEmpty: true }
]);

onMounted(() => {
  // Load slots state from localStorage or StorageManager later
  const savedSlots = localStorage.getItem('campaign_slots');
  if (savedSlots) {
    try {
      const parsed = JSON.parse(savedSlots);
      if (Array.isArray(parsed) && parsed.length === 3) {
        slots.value = parsed;
      }
    } catch (e) {
      console.error('Failed to parse campaign slots');
    }
  }
});

function selectSlot(index: number) {
  emit('startCampaign', index);
}

function goBack() {
  emit('back');
}
</script>

<template>
  <div class="campaign-menu">
    <h1 class="title">Campaign Mode</h1>
    
    <div class="slots-container">
      <button 
        v-for="(slot, index) in slots" 
        :key="index"
        class="slot-btn"
        @click="selectSlot(index)"
      >
        <div class="slot-content">
          <span class="slot-number">Slot {{ index + 1 }}</span>
          <h2 v-if="slot.isEmpty">New Game</h2>
          <div v-else>
            <h2>{{ slot.name || 'Campaign' }}</h2>
            <p>Progress: {{ slot.progress || 0 }}%</p>
          </div>
        </div>
      </button>
    </div>

    <button class="back-btn" @click="goBack">Back</button>
  </div>
</template>

<style scoped>
.campaign-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: transparent;
  color: white;
  font-family: 'Courier New', Courier, monospace;
}

.title {
  font-size: 3rem;
  margin-bottom: 3rem;
  text-shadow: 0 0 10px #2fc5eb;
}

.slots-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.slot-btn {
  background-color: #222;
  border: 2px solid #444;
  color: white;
  width: 250px;
  height: 350px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.slot-btn:hover {
  background-color: #333;
  border-color: #2fc5eb;
  transform: scale(1.05);
}

.slot-content {
  text-align: center;
}

.slot-number {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 1rem;
  display: block;
}

.slot-btn h2 {
  color: #2fc5eb;
  margin: 0.5rem 0;
}

.back-btn {
  background-color: transparent;
  border: 1px solid #aaa;
  color: #aaa;
  padding: 0.5rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
}

.back-btn:hover {
  background-color: #aaa;
  color: #111;
}
</style>
