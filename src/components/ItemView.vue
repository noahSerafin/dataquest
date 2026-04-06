<script setup lang="ts">
import { computed } from "vue";
import { Item } from "../Items"; // adjust path
import { tutorialState, clearTooltips } from "../tutorial";
import { proTips, proTipSuggestion } from "../tutorialSteps";
//import type { PieceVariant } from "../types";

const props = defineProps<{
  item: InstanceType<typeof Item>;
  type: 'consumable' | 'admin';
  cssclass?: string;
  tileSize: number;
  canBuy: boolean;       // for custom styling (shop / inventory)
  canSteal?: boolean;
  showController: boolean;
  //variant: PieceVariant;
}>();

const emit = defineEmits<{
  select: [item: Item];
  deselect: [];
  buy: [item: Item];
  sell: [item: Item];
  use: [item: Item];
}>();

//const showController = ref(false);
function handleSelect() {
  emit("select", props.item);
}

function rarityStyle(rarity: number) {
  switch (rarity) {
    case 1: return { label: "Common", color: "lightgreen" };
    case 2: return { label: "Uncommon", color: "orange" };
    case 3: return { label: "Rare", color: "red" };//orangered?
    case 4: return { label: "Very Rare", color: "#9052f3ff" };
    case 5: return { label: "Black Market", color: "#ff0df3ff" };
    case 6: return { label: "Legendary", color: "#ffd700" };
    default: return { label: "Unknown", color: "grey" };
  }
}

const unicodeSymbol = computed(() =>
  props.item.unicode
    ? String.fromCodePoint(parseInt(props.item.unicode.replace('U+', ''), 16), 0xFE0F)
    : ''
)
  
const itemStyle = computed(() => {
  const widthAdjustment = props.type === 'admin' ? 22 : 16
  const heightAdjustment = props.type === 'consumable' ? 22 : 16
  let styles = {
    width: props.tileSize-widthAdjustment + 'px',
    height: props.tileSize-heightAdjustment + 'px',
    fontSize: props.tileSize * 0.6 + 'px',
    lineHeight: props.tileSize -24 + 'px',
    backgroundColor: props.item.color,
    '--piece-color': props.item.color,
    'z-index': 2,
    'border-color': rarityStyle(props.item.rarity).color
  }
  return styles
});

const handleUse = () => {
  emit('use', props.item);
}

const handleSell = () => {
  emit('sell', props.item);
  if (props.item.name === 'Clippy') {
    clearTooltips();
  }
}
// /<!-- v_${item.variantName}`

const isProTip = computed(() => {
  return tutorialState.activeId === 'proTip' || proTips.some(t => t.id === tutorialState.activeId);
});

function openProTip() {
  tutorialState.message = proTipSuggestion.tooltip;
  tutorialState.activeId = proTipSuggestion.id;
  tutorialState.collapsed = false;
}

function getRandomProTip() {
  const tips = proTips.filter(t => t.id !== 'proTip');
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  tutorialState.message = randomTip.tooltip;
  tutorialState.activeId = randomTip.id;
}

const isDisabled = computed(() => {
  return 'disabled' in props.item && (props.item as any).disabled;
});
</script>

<template>
  <div
    :id="item.id"
    class="item"
    :class="[`item-${type}`, `itemName-${item.name.replace(/\s+/g, '')}`, {'is-clippy': item.name === 'Clippy'}, {'is-disabled': isDisabled}]"
    @click="handleSelect"
    :style="itemStyle"
  >
    <p class='top-left' v-if="cssclass==='shop' && type == 'consumable'" :style="`top: -${((props.tileSize-10)/2 -24)}px`">I</p>
    <p class='top-left' v-if="cssclass==='shop' && type == 'admin'" :style="`top: -${((props.tileSize-10)/2 -24)}px`">A</p>
    <div class="icon">{{ unicodeSymbol }}</div>

    <!-- Speech bubble for Clippy admin -->
    <div v-if="cssclass !== 'shop' && cssclass !== 'collection' && item.name === 'Clippy' && tutorialState.message" class="clippy-speech-bubble-container" @click.stop>
      <div v-if="!tutorialState.collapsed" class="clippy-speech-bubble">
        <button class="clippy-toggle" @click="tutorialState.collapsed = true">X</button>
        <div class="clippy-message" v-html="tutorialState.message"></div>
        <button v-if="isProTip" class="give-tip-btn" @click="getRandomProTip">Give me a tip</button>
      </div>
      <div v-else class="clippy-collapsed-icon" @click="openProTip">
        ?
      </div>
    </div>
    <!--<Teleport to="body">-->
      <div v-if="props.showController" class="info" @click.stop >
        <button @click="emit('deselect')" class="close">X</button>
        <div class="name">{{ item.name }}</div>
        <div v-if="(cssclass == 'shop')" class="type">- {{ type }} -</div>
        <div class="rarity" :style="{ color: rarityStyle(item.rarity).color }">
          {{ rarityStyle(item.rarity).label }}
        </div>
        <div class="desc">{{ item.description }}</div>
        <div class="flex">
          <button v-if="(cssclass == 'shop')"
            @click="$emit('buy', item)"
            :disabled="!canBuy"
            >
            {{canSteal ? 'Steal' : 'Buy($'+item.cost+')'}}
          </button>
            <button v-if="(cssclass == 'inventory' && type == 'consumable')"  @click="handleUse">
              Use
            </button>
            <button v-if="(cssclass == 'inventory')"
            @click="handleSell"
            >
            Sell ${{ Math.round(item.cost / 2) }}
          </button>
        </div>
      </div>
    <!--</Teleport>-->
  </div>
</template>

<style scoped>
.item{
  text-align: center;
  transition: all 0.2s ease;
  border: outset;
  position: relative;
  cursor: pointer;
  transition: 0.15s;
}
.item.is-disabled {
  opacity: 0.7;
}
.item.is-disabled::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top left, transparent calc(50% - 2px), red calc(50% - 2px), red calc(50% + 2px), transparent calc(50% + 2px));
  z-index: 10;
  pointer-events: none;
}
.item-card {
  display: flex; 
  flex-direction: row;
  align-items: center;
  padding: 10px;
}
.item:hover {
  transform: scale(1.03);
}
.close{
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
.type, .name{
  margin-bottom: 5px;
  font-weight: bold;
}
.icon {
  font-size: 36px;
  margin-right: 12px;
}

.info {
  z-index: 99999;
  position: absolute;
  left: 99%;
  bottom: 0;
  border-radius: 5px;
  background-color: #494646ff;
  padding: 8px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  line-height: 16px;
  width: 100px;
  text-align: left;
}
.desc{
  text-align: left;
}

.name {
  font-weight: bold;
}

.desc {
  font-size: 13px;
  opacity: 0.8;
}

.cost {
  margin-top: 4px;
  font-size: 14px;
}
button{
  padding: 4px;
  margin: auto;
  margin-top: 5px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.top-left{
  background-color: black;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  line-height: 12px;
  font-weight: bold;
  font-size: 12px;
  position: absolute;
  right: 0px;
  margin: 0;
}
.inventory-item{
  .info{
    position: fixed;
    z-index: 9999;
  }
}
.enemy-info .info{
  top: 0;
  height: fit-content;
}

.clippy-speech-bubble-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10000;
}

.clippy-speech-bubble {
  position: absolute;
  bottom: 120%;
  right: -50px;
  background: #faeec8;
  color: black;
  border-radius: 8px;
  padding: 10px 14px;
  width: 180px;
  font-size: 13px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  text-align: left;
  line-height: normal;
}

.clippy-speech-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 60px;
  border-width: 8px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}

.clippy-message {
  margin-top: 4px;
}

.clippy-toggle {
  position: absolute;
  top: 2px;
  right: 2px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: bold;
  padding: 3px;
  color: #333;
  line-height: 10px;
  border: 1px solid black;
  border-radius: 1px;
}
.clippy-toggle:hover {
  color: #000;
  cursor: pointer;
  background-color: blue;
}

.clippy-collapsed-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #3b82f6;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  line-height: 20px;
}

.clippy-collapsed-icon:hover {
  background: #2563eb;
}

.give-tip-btn {
  margin-top: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}

.give-tip-btn:hover {
  background-color: #2563eb;
}
</style>
