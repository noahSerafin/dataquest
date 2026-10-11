<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StorageManager } from '../StorageManager';
import { getSpriteStyle } from '../helperFunctions';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'startCampaign', slotIndex: number, iconID: number): void;
}>();

const slots = ref<any[]>([
  { isEmpty: true },
  { isEmpty: true },
  { isEmpty: true }
]);

const showIconPicker = ref(false);
const showDeletePrompt = ref(false);
const selectedSlotIndex = ref<number>(-1);
const slotToDelete = ref<number>(-1);
const availableIcons = [460, 461, 462, 463, 511, 512, 513, 517, 473, 459, 464, 505];

onMounted(() => {
  slots.value = StorageManager.getCampaignSlots();
});

function getSlotIconId(slot: any): number {
  return slot.state?.campaignPlayerIconID || slot.metadata?.iconID || 499;
}

function selectSlot(index: number) {
  if (slots.value[index].isEmpty) {
    selectedSlotIndex.value = index;
    showIconPicker.value = true;
  } else {
    emit('startCampaign', index, getSlotIconId(slots.value[index]));
  }
}

function selectIcon(iconID: number) {
  showIconPicker.value = false;
  emit('startCampaign', selectedSlotIndex.value, iconID);
}

function cancelIconPicker() {
  showIconPicker.value = false;
  selectedSlotIndex.value = -1;
}

function confirmDelete(index: number) {
  slotToDelete.value = index;
  showDeletePrompt.value = true;
}

function deleteSave() {
  if (slotToDelete.value >= 0) {
    StorageManager.clearCampaignSlot(slotToDelete.value);
    slots.value = StorageManager.getCampaignSlots();
    showDeletePrompt.value = false;
    slotToDelete.value = -1;
  }
}

function goBack() {
  emit('back');
}
</script>

<template>
  <div class="campaign-menu">
    <h1 class="title">Campaign Mode</h1>
    
    <div class="slots-container">
      <div v-for="(slot, index) in slots" :key="index" class="slot-wrapper">
        <button 
          class="slot-btn"
          @click="selectSlot(index)"
        >
          <div class="slot-content">
            <span class="slot-number">Slot {{ index + 1 }}</span>
            <h2 v-if="slot.isEmpty">New Game</h2>
            <div v-else>
              <div class="slot-icon" :style="getSpriteStyle(getSlotIconId(slot))"></div>
              <p>Security Clearance: {{ slot.metadata?.sector || 0 }}/6</p>
              <p>Progress: {{ slot.metadata?.completion || 0 }}%</p>
            </div>
          </div>
        </button>
        <button v-if="!slot.isEmpty" class="delete-btn" @click="confirmDelete(index)">Delete Save</button>
      </div>
    </div>

    <button class="back-btn" @click="goBack">Back</button>

    <div v-if="showIconPicker" class="modal-overlay">
      <div class="icon-picker-modal">
        <h2>Choose Your Icon</h2>
        <div class="icon-grid">
          <button 
            v-for="iconID in availableIcons" 
            :key="iconID" 
            class="icon-btn"
            @click="selectIcon(iconID)"
          >
            <div :style="getSpriteStyle(iconID)"></div>
          </button>
        </div>
        <button class="back-btn mt-4" @click="cancelIconPicker">Cancel</button>
      </div>
    </div>

    <div v-if="showDeletePrompt" class="modal-overlay">
      <div class="icon-picker-modal text-center">
        <h2>Delete Save?</h2>
        <p class="mb-4">Are you sure you want to delete this save?<br/>This action cannot be undone.</p>
        <div class="flex gap-4 justify-center">
          <button class="delete-btn" @click="deleteSave">Delete</button>
          <button class="back-btn" @click="showDeletePrompt = false">Cancel</button>
        </div>
      </div>
    </div>
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

.slot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slot-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
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

.delete-btn {
  background-color: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  padding: 0.5rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #ff4444;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.icon-picker-modal {
  background-color: #222;
  border: 2px solid #2fc5eb;
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.icon-btn {
  background-color: transparent;
  border: 1px solid #444;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-btn > div {
  width: 48px;
  height: 48px;
}

.icon-btn:hover {
  border-color: #2fc5eb;
  background-color: #333;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.gap-4 {
  gap: 1rem;
}

.justify-center {
  justify-content: center;
}
</style>
