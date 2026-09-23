<script setup lang="ts">


const emit = defineEmits<{
  (e: 'selectMode', mode: 'rogueMenu' | 'campaignMenu' | 'levelEditor' | 'worldEditor'): void;
}>();

function selectMode(mode: 'rogueMenu' | 'campaignMenu' | 'levelEditor' | 'worldEditor') {
  emit('selectMode', mode);
}
</script>

<template>
  <div class="main-menu-hub">
    <h1 class="hub-title">Dataquest</h1>
    <div class="hub-options">
      <button class="hub-btn" @click="selectMode('rogueMenu')">
        <h2>Rogue Mode</h2>
        <p>Procedurally generated runs</p>
      </button>
      
      <button class="hub-btn" @click="selectMode('campaignMenu')">
        <h2>Campaign Mode</h2>
        <p>Play authored level sets</p>
      </button>
      
      <button class="hub-btn" @click="selectMode('worldEditor')">
        <h2>World Editor</h2>
        <p>Create custom campaign worlds</p>
      </button>

      <button class="hub-btn" @click="selectMode('levelEditor')">
        <h2>Level Editor</h2>
        <p>Create custom battle levels</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-menu-hub {
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

.hub-title {
  font-size: 4rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px #2fc5eb;
}

.hub-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
}

.hub-btn {
  background-color: #222;
  border: 2px solid #444;
  color: white;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  text-align: left;
}

.hub-btn:hover {
  background-color: #333;
  border-color: #2fc5eb;
  transform: scale(1.05);
}

.hub-btn h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #2fc5eb;
}

.hub-btn p {
  margin: 0;
  font-size: 0.9rem;
  color: #aaa;
}
</style>
