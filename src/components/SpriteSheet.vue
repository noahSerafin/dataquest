<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { allPieces, Spawn } from "../Pieces";
import { allItems } from "../Items";
import { allAdmins } from "../AdminPrograms";
import { allBosses } from "../Bosses";
import { companies } from "../companies";
import { allOSes } from "../Operators";
import { makeBlueprint } from "../helperFunctions";

const emit = defineEmits<{
  (e: 'close'): void;
}>();

onMounted(() => {
  document.documentElement.style.setProperty('background-color', 'transparent', 'important');
  document.body.style.setProperty('background-color', 'transparent', 'important');
  document.getElementById('app')?.style.setProperty('background-color', 'transparent', 'important');
});

onUnmounted(() => {
  document.documentElement.style.removeProperty('background-color');
  document.body.style.removeProperty('background-color');
  document.getElementById('app')?.style.removeProperty('background-color');
});

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
  const result: { id: string, primary: string, extra: string, hybrid: boolean }[] = [];
  
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
      extra: (b as any).extraUnicode ? getUnicode((b as any).extraUnicode) : '',
      hybrid: false
    });
  });

  companies.forEach(c => {
    if (c.unicode) {
      result.push({
        id: 'company-' + c.name,
        primary: getUnicode(c.unicode),
        extra: '',
        hybrid: false
      });
    }
  });

  allOSes.forEach(os => {
    if (os.unicode) {
      result.push({
        id: 'os-' + os.name,
        primary: getUnicode(os.unicode),
        extra: '',
        hybrid: false
      });
    }
  });

  const mapNodes = ['U+1F6D2', 'U+1FAA6', 'U+1F46F', 'U+2699', 'U+1F9EC'];
  mapNodes.forEach((unicode, index) => {
    result.push({
      id: 'mapNode-' + index,
      primary: getUnicode(unicode),
      extra: '',
      hybrid: false
    });
  });
  
  const fastControls = ['U+1F44B', 'U+1F9B6'];
  fastControls.forEach((unicode, index) => {
    result.push({
      id: 'fastControl-' + index,
      primary: getUnicode(unicode),
      extra: '',
      hybrid: false
    });
  });

  const statuses = [
    'U+1F92E', // diseased 🤮
    'U+1F630', // slowed 😰
    'U+1F635', // blinded 😵
    'U+1F975', // burning 🥵
    'U+1F922', // poisoned 🤢
    'U+1F976', // frozen 🥶
    'U+1F60D', // charmed 😍
    'U+1F915', // confused 🤕
    'U+1FAE3', // exposed 🫣
    'U+1F92B', // hidden 🤫
    'U+1FAE5', // negative 🫥
    'U+1F4A2', // enraged 💢
    'U+1F60C', // zen 😌
    'U+1F910', // disarmed 🤐
    'U+1F624', // juiced 😤
    'U+1F532'
  ];
  statuses.forEach((unicode, index) => {
    result.push({
      id: 'status-' + index,
      primary: getUnicode(unicode),
      extra: '',
      hybrid: false
    });
  });

  return result;
});

function downloadSpriteSheet() {
  const canvas = document.createElement('canvas');
  const cols = 37; // 37 columns wide
  const rows = Math.ceil(allIcons.value.length / cols);
  
  const iconSize = 64; 
  canvas.width = cols * iconSize;
  canvas.height = rows * iconSize;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Guarantee transparent alpha channel
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white'; // Make monochrome emojis render white
  
  allIcons.value.forEach((icon, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * iconSize + (iconSize / 2);
    const y = row * iconSize + (iconSize / 2) + 4; // slight vertical optical offset
    
    if (icon.hybrid) {
      ctx.font = '72px system-ui, sans-serif'; // scale(1.5)
      ctx.fillText(icon.primary, x - 10, y);
      if (icon.extra) {
        ctx.font = '48px system-ui, sans-serif';
        ctx.fillText(icon.extra, x + 8, y - 10);
      }
    } else {
      ctx.font = '48px system-ui, sans-serif';
      ctx.fillText(icon.primary, x, y);
      if (icon.extra) {
        ctx.fillText(icon.extra, x, y);
      }
    }
  });
  
  const link = document.createElement('a');
  link.download = 'dataquest-spritesheet.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
</script>

<template>
  <div class="sprite-sheet-overlay" @click.self="emit('close')">
    <button class="download-btn" @click="downloadSpriteSheet">📥 Download Transparent PNG</button>
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
  min-height: 100vh;
  background: transparent !important;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
}

.download-btn {
  margin: 20px;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  z-index: 10;
}
.download-btn:hover {
  background: #3b82f6;
}

.sprite-sheet {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0px; /* Minimal distance */
  padding: 10px;
  background: transparent !important;
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
