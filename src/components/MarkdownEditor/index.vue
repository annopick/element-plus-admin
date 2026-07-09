<template>
  <MdEditor
    v-model="text"
    :style="{ height, width }"
    :toolbars-exclude="excludeToolbars"
    @on-save="onSave"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = withDefaults(defineProps<{
  modelValue?: string
  height?: string
  width?: string
}>(), {
  modelValue: '',
  height: '300px',
  width: '100%'
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
  (e: 'submit', val: string): void
}>()

const text = ref(props.modelValue)

watch(text, (val) => {
  emit('update:modelValue', val)
  emit('change', val)
})

watch(() => props.modelValue, (val) => {
  if (val !== text.value) text.value = val
})

const excludeToolbars: ToolbarNames[] = ['github', 'save']
function onSave(val: string) {
  emit('submit', val)
}
</script>
