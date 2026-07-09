<template>
  <div class="json-editor">
    <codemirror
      v-model="code"
      :placeholder="placeholder"
      :style="{ height }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

const props = withDefaults(defineProps<{
  modelValue?: string
  height?: string
}>(), {
  modelValue: '[]',
  height: '150px'
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
}>()

const placeholder = 'Code...'
const extensions = [json(), oneDark]

const code = ref(props.modelValue)

watch(code, (val) => {
  emit('update:modelValue', val)
})

function onChange(val: string) {
  emit('change', val)
}

watch(() => props.modelValue, (val) => {
  if (val !== code.value) code.value = val
})
</script>

<style scoped>
.json-editor {
  height: 100%;
  position: relative;
}
.json-editor :deep(.cm-editor) {
  font-size: 12px;
}
</style>
