<template>
  <div style="display:inline-block;">
    <label class="radio-label">Book Type: </label>
    <el-select :model-value="modelValue" style="width:120px;" @update:model-value="update">
      <el-option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'BookTypeOption' })

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const options = ref(['xlsx', 'csv', 'txt'])

function update(value: string) {
  emit('update:modelValue', value)
}
</script>
