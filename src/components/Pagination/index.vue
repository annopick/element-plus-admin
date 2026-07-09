<template>
  <div :class="{ hidden }" class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { scrollTo } from '@/utils/scroll-to'

defineOptions({ name: 'Pagination', inheritAttrs: false })

const props = withDefaults(defineProps<{
  total: number
  page?: number
  limit?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
}>(), {
  page: 1,
  limit: 20,
  pageSizes: () => [10, 20, 30, 50],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  autoScroll: true,
  hidden: false
})

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'update:limit', val: number): void
  (e: 'pagination', val: { page: number; limit: number }): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val: number) => emit('update:page', val)
})
const pageSize = computed({
  get: () => props.limit,
  set: (val: number) => emit('update:limit', val)
})

function handleSizeChange(val: number) {
  emit('pagination', { page: props.page, limit: val })
  if (props.autoScroll) scrollTo(0, 800)
}
function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: props.limit })
  if (props.autoScroll) scrollTo(0, 800)
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 32px 16px;
}
.pagination-container.hidden {
  display: none;
}
</style>
