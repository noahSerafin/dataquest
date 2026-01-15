<script setup lang="ts">
    import { ref } from "vue";
    import { Item } from '../Items';
    import { Admin } from '../AdminPrograms';
    import ItemView from '../components/ItemView.vue';

    const props = defineProps<{
        admins: Admin[]
    }>();

    const selectedItem = ref<Item | null>(null)
    function selectItem(item: Item){
        selectedItem.value = item;
        return;
    }
    function deselectItem(){
        selectedItem.value = null;
        return;
    }
</script>
<template>
    <div>
        <span><strong>Bosses:</strong></span>
        <span class="admins">
            <span v-for="(item) in props.admins"
                :key="item.id"
                class="p-1 border rounded mb-1"
                :class="{ 'z-top': selectedItem === item }" 
                >
                <ItemView 
                    :item="item"
                    type="admin"
                    cssclass="boss"
                    :tileSize="60"
                    :canBuy="false"
                    :showController="(selectedItem === item)"
                    @select="selectItem"
                    @deselect="deselectItem"
                />
            </span>
        </span>
    </div>
</template>

<style scoped>
    .admins{
        display: flex;
        justify-content: space-between;
    }
    .z-top {
        position: relative;
        z-index: 1000;
    }
</style>
             