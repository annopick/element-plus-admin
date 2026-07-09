<template>
  <el-select
    ref="dragSelect"
    v-model="selectVal"
    v-bind="$attrs"
    class="drag-select"
    multiple
  >
    <slot />
  </el-select>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs'
import { computed, onMounted, ref } from 'vue'
import type { SelectInstance } from 'element-plus'

defineOptions({ name: 'DragSelect', inheritAttrs: false })

const props = defineProps<{
  modelValue: Array<string | number>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Array<string | number>): void
}>()

const dragSelect = ref<SelectInstance | null>(null)
let sortable: Sortable | null = null

const selectVal = computed<Array<string | number>>({
  get() {
    return [...props.modelValue]
  },
  set(val) {
    emit('update:modelValue', [...val])
  }
})

function setSort() {
  const selectEl = (dragSelect.value as any)?.$el as HTMLElement | undefined
  if (!selectEl) return
  // Element Plus renders the selected tags inside `.el-select__selection`.
  // Fall back to `.el-select__tags` (legacy) for safety.
  let el = selectEl.querySelector<HTMLElement>('.el-select__selection')
  if (!el) {
    el = selectEl.querySelector<HTMLElement>('.el-select__tags')
  }
  if (!el) return
  sortable = Sortable.create(el, {
    ghostClass: 'sortable-ghost', // Class name for the drop placeholder
    setData(dataTransfer: DataTransfer) {
      dataTransfer.setData('Text', '')
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
    },
    onEnd: evt => {
      const targetRow = props.modelValue.splice(evt.oldIndex as number, 1)[0]
      props.modelValue.splice(evt.newIndex as number, 0, targetRow)
    }
  })
}

onMounted(() => {
  setSort()
})
</script>

<style lang="scss" scoped>
.drag-select {
  :deep() {
    .sortable-ghost {
      opacity: .8;
      color: #fff !important;
      background: #42b983 !important;
    }

    .el-tag {
      cursor: pointer;
    }
  }
}
</style>
