<template>
  <div class="components-container">
    <aside>drag-list base on
      <a href="https://github.com/SortableJS/Vue.Draggable" target="_blank">Vue.Draggable</a>
    </aside>
    <div class="editor-container">
      <dnd-list :list1="list1" :list2="list2" list1-title="List" list2-title="Article pool" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DndList from '@/components/DndList/index.vue'
import { fetchList } from '@/api/article'

defineOptions({ name: 'DndListDemo' })

const list1 = ref<any[]>([])
const list2 = ref<any[]>([])

function getData() {
  fetchList({}).then(response => {
    list1.value = response.data.items.splice(0, 5)
    list2.value = response.data.items
  })
}

getData()
</script>
