<script setup lang="ts">
    import { ref } from "vue";
    import { Item } from './Items';
    import { Admin } from './AdminPrograms';
    import ItemView from './components/ItemView.vue';

    const props = defineProps<{
        admins: Admin[]
    }>();

    const selectedItem = ref<Item | null>(null)
</script>

<template>
    <div>
        <p><strong>Bosses:</strong></p>
        <ul class="admins">
            <li v-for="(item, index) in props.admins"
                :key="item.id"
                class="p-1 border rounded mb-1 flex justify-between items-center">
                <ItemView 
                    :item="item"
                    type="admin"
                    cssclass="inventory"
                    :tileSize="60"
                    :canBuy="false"
                    :showController="(selectedItem === item)"
                />
            </li>
        </ul>
    </div>
</template>
             