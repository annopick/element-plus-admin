<template>
  <div style="display:inline-block;">
    <label class="radio-label" style="padding-left:0;">Filename: </label>
    <el-input :model-value="modelValue" placeholder="Please enter the file name (default excel-list)" style="width:345px;" :prefix-icon="Document" @update:model-value="update" />
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'

defineOptions({ name: 'FilenameOption' })

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function update(value: string) {
  emit('update:modelValue', value)
}
</script>
