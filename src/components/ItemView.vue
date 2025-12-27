<script setup lang="ts">
import { computed } from "vue";
import { Item } from "../Items"; // adjust path

const props = defineProps<{
  item: InstanceType<typeof Item>;
  type: 'consumable' | 'admin';
  cssclass?: string;
  tileSize: number;
  canBuy: boolean;       // for custom styling (shop / inventory)
  showController: boolean;
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
    case 3: return { label: "Rare", color: "orangered" };
    case 4: return { label: "Very Rare", color: "#9052f3ff" };
    case 5: return { label: "Black Market", color: "#ff0df3ff" };
    case 6: return { label: "Legendary", color: "#ffd700" };
    default: return { label: "Unknown", color: "grey" };
  }
}

const unicodeSymbol = computed(() =>
  props.item.unicode
    ? String.fromCodePoint(parseInt(props.item.unicode.replace('U+', ''), 16))
    : ''
)
  
const itemStyle = computed(() => {
  let styles = {
    width: props.tileSize-16 + 'px',
    height: props.tileSize-16 + 'px',
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

</script>

<template>
  <div
    :id="item.id"
    class="item"
    :class="`item-${cssclass} item-${type}`"
    @click="handleSelect"
    :style="itemStyle"
  >
    <p class='top-left' v-if="cssclass==='shop' && type == 'consumable'" :style="`top: -${((props.tileSize-10)/2 -24)}px`">I</p>
    <p class='top-left' v-if="cssclass==='shop' && type == 'admin'" :style="`top: -${((props.tileSize-10)/2 -24)}px`">A</p>
    <div class="icon">{{ unicodeSymbol }}</div>
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
            Buy ${{ item.cost }}
          </button>
            <button v-if="(cssclass == 'inventory' && type == 'consumable')"  @click="handleUse">
              Use
            </button>
            <button v-if="(cssclass == 'inventory')"
            @click="$emit('sell', item)"
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
</style>
