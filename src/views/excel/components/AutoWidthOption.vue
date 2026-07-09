<template>
  <div style="display:inline-block;">
    <label class="radio-label">Cell Auto-Width: </label>
    <el-radio-group :model-value="modelValue" @update:model-value="update">
      <el-radio :label="true" border>
        True
      </el-radio>
      <el-radio :label="false" border>
        False
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AutoWidthOption' })

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function update(value: string | number | boolean | undefined) {
  emit('update:modelValue', !!value)
}
</script>
