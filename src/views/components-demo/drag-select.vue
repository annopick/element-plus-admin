<template>
  <div class="components-container">
    <el-drag-select v-model="value" style="width:500px;" multiple placeholder="请选择">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-drag-select>

    <div style="margin-top:30px;">
      <el-tag v-for="item of value" :key="item" style="margin-right:15px;">
        {{ item }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElDragSelect from '@/components/DragSelect/index.vue'

defineOptions({ name: 'DragSelectDemo' })

const value = ref(['Apple', 'Banana', 'Orange'])
const options = [
  { value: 'Apple', label: 'Apple' },
  { value: 'Banana', label: 'Banana' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Pear', label: 'Pear' },
  { value: 'Strawberry', label: 'Strawberry' }
]
</script>
