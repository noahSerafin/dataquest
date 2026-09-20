<script setup lang="ts">
import { computed } from "vue";
import { allPieces, Spawn } from "../Pieces";
import { allItems } from "../Items";
import { allAdmins } from "../AdminPrograms";
import { allBosses } from "../Bosses";
import { makeBlueprint } from "../helperFunctions";

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const pieces = computed(() => allPieces.filter(p => p.name !== Spawn.name).map(c => makeBlueprint(c)));
const items = computed(() => allItems.map(ItemClass => new ItemClass()));
const admins = computed(() => allAdmins.map(AdminClass => new AdminClass()));
const bosses = computed(() => allBosses.map(BossClass => new BossClass()));

function getUnicode(unicodeStr: string) {
  if (!unicodeStr) return '';
  return String.fromCodePoint(parseInt(unicodeStr.replace('U+', ''), 16), 0xFE0F);
}

// Group all together
const allIcons = computed(() => {
  const result = [];
  
  pieces.value.forEach(p => {
    result.push({
      id: 'piece-' + p.name,
      primary: getUnicode(p.unicode),
      extra: p.extraUnicode ? getUnicode(p.extraUnicode) : '',
      hybrid: !!p.hybridName
    });
  });
  
  items.value.forEach(i => {
    result.push({
      id: 'item-' + i.name,
      primary: getUnicode(i.unicode),
      extra: '',
      hybrid: false
    });
  });
  
  admins.value.forEach(a => {
    result.push({
      id: 'admin-' + a.name,
      primary: getUnicode(a.unicode),
      extra: '',
      hybrid: false
    });
  });
  
  bosses.value.forEach(b => {
    result.push({
      id: 'boss-' + b.name,
      primary: getUnicode(b.unicode),
      extra: '',
      hybrid: false
    });
  });
  
  return result;
});

</script>

<template>
  <div class="sprite-sheet-overlay" @click="emit('close')">
    <div class="sprite-sheet">
      <div v-for="icon in allIcons" :key="icon.id" class="icon-wrapper" :class="{ hybrid: icon.hybrid }">
        <span class="primary">{{ icon.primary }}</span>
        <span v-if="icon.extra" class="extra">{{ icon.extra }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sprite-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 999999;
  display: flex;
  overflow: auto;
}

.sprite-sheet {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0px; /* Minimal distance */
  padding: 10px;
}

.icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  line-height: 1;
}

.hybrid .primary {
  transform: scale(1.5);
  position: absolute;
  left: 10%;
}

.hybrid .extra {
  position: absolute;
  left: 30%;
  top: -10%;
}
</style>
