<template>
  <el-table :data="list" border fit highlight-current-row style="width: 100%">
    <el-table-column
      v-loading="loading"
      align="center"
      label="ID"
      width="65"
      element-loading-text="请给我点时间！"
    >
      <template #default="scope">
        <span>{{ scope.row.id }}</span>
      </template>
    </el-table-column>

    <el-table-column width="180px" align="center" label="Date">
      <template #default="scope">
        <span>{{ parseTime(scope.row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
      </template>
    </el-table-column>

    <el-table-column min-width="300px" label="Title">
      <template #default="{ row }">
        <span>{{ row.title }}</span>
        <el-tag>{{ row.type }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column width="110px" align="center" label="Author">
      <template #default="scope">
        <span>{{ scope.row.author }}</span>
      </template>
    </el-table-column>

    <el-table-column width="120px" label="Importance">
      <template #default="scope">
        <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star" />
      </template>
    </el-table-column>

    <el-table-column align="center" label="Readings" width="95">
      <template #default="scope">
        <span>{{ scope.row.pageviews }}</span>
      </template>
    </el-table-column>

    <el-table-column class-name="status-col" label="Status" width="110">
      <template #default="{ row }">
        <el-tag :type="statusFilter(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { fetchList } from '@/api/article'
import { parseTime } from '@/utils'

defineOptions({ name: 'TabPane' })

const props = defineProps({
  type: {
    type: String,
    default: 'CN'
  }
})

const emit = defineEmits<{ (e: 'create'): void }>()

const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  published: 'success',
  draft: 'info',
  deleted: 'danger'
}

function statusFilter(status: string) {
  return statusMap[status]
}

const list = ref<any[]>([])
const listQuery = reactive({
  page: 1,
  limit: 5,
  type: props.type,
  sort: '+id'
})
const loading = ref(false)

function getList() {
  loading.value = true
  emit('create') // for test
  fetchList(listQuery).then(response => {
    list.value = response.data.items
    loading.value = false
  })
}

getList()
</script>
