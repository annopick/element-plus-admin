<template>
  <div class="app-container">
    <!-- Note that row-key is necessary to get a correct row order. -->
    <el-table ref="dragTableRef" v-loading="listLoading" :data="list" row-key="id" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="65">
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Date">
        <template #default="{ row }">
          <span>{{ parseTime(row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="Title">
        <template #default="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" align="center" label="Author">
        <template #default="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="Importance">
        <template #default="{ row }">
          <svg-icon v-for="n in Number(row.importance) || 0" :key="n" icon-class="star" class="icon-star" />
        </template>
      </el-table-column>

      <el-table-column align="center" label="Readings" width="95">
        <template #default="{ row }">
          <span>{{ row.pageviews }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template #default="{ row }">
          <el-tag :type="statusFilter(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Drag" width="80">
        <template #default>
          <svg-icon class="drag-handler" icon-class="drag" />
        </template>
      </el-table-column>
    </el-table>
    <div class="show-d">
      <el-tag>The default order :</el-tag> {{ oldList }}
    </div>
    <div class="show-d">
      <el-tag>The after dragging order :</el-tag> {{ newList }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { fetchList } from '@/api/article'
import { parseTime } from '@/utils'

defineOptions({ name: 'DragTable' })

interface ArticleRow {
  id: number
  timestamp: number
  title: string
  author: string
  importance: number
  pageviews: number
  status: string
  [key: string]: any
}

const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  published: 'success',
  draft: 'info',
  deleted: 'danger'
}

function statusFilter(status: string) {
  return statusMap[status]
}

const dragTableRef = ref<any>()
const list = ref<ArticleRow[]>([])
const total = ref<number>(0)
const listLoading = ref(true)
const listQuery = reactive({
  page: 1,
  limit: 10
})
let sortable: Sortable | null = null
const oldList = ref<number[]>([])
const newList = ref<number[]>([])

async function getList() {
  listLoading.value = true
  const { data } = await fetchList(listQuery)
  list.value = data.items
  total.value = data.total
  listLoading.value = false
  oldList.value = list.value.map(v => v.id)
  newList.value = oldList.value.slice()
  nextTick(() => {
    setSort()
  })
}

let setSortRetries = 0
function setSort() {
  // Element Plus 3 wraps the table body in an el-scrollbar, so the tbody is
  // not a direct child of .el-table__body-wrapper. It is also rendered
  // asynchronously, so we retry until it is available.
  const el = dragTableRef.value?.$el.querySelector('.el-table__body-wrapper tbody') as HTMLElement | null
  if (!el || el.children.length === 0) {
    // Retry on the next frame — el-scrollbar hasn't rendered the tbody yet.
    // Guard against an infinite loop if the selector never resolves.
    if (setSortRetries++ < 50) requestAnimationFrame(setSort)
    return
  }
  setSortRetries = 0
  const options: Sortable.SortableOptions = {
    ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
    setData: function(dataTransfer: DataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    },
    onEnd: (evt: Sortable.SortableEvent) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex === undefined || newIndex === undefined) return
      const targetRow = list.value.splice(oldIndex, 1)[0]
      list.value.splice(newIndex, 0, targetRow)

      // for show the changes, you can delete in you code
      const tempIndex = newList.value.splice(oldIndex, 1)[0]
      newList.value.splice(newIndex, 0, tempIndex)
    }
  }
  sortable = Sortable.create(el, options)
}

getList()
</script>

<style>
.sortable-ghost{
  opacity: .8;
  color: #fff!important;
  background: #42b983!important;
}
</style>

<style scoped>
.icon-star{
  margin-right:2px;
}
.drag-handler{
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d{
  margin-top: 15px;
}
</style>
