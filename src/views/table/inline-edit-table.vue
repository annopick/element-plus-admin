<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Date">
        <template #default="{ row }">
          <span>{{ parseTime(row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Author">
        <template #default="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="Importance">
        <template #default="{ row }">
          <svg-icon v-for="n in Number(row.importance) || 0" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template #default="{ row }">
          <el-tag :type="statusFilter(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="Title">
        <template #default="{ row }">
          <template v-if="row.edit">
            <el-input v-model="row.title" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              :icon="Refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              cancel
            </el-button>
          </template>
          <span v-else>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template #default="{ row }">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            :icon="CircleCheck"
            @click="confirmEdit(row)"
          >
            Ok
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            :icon="Edit"
            @click="row.edit = !row.edit"
          >
            Edit
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit, CircleCheck } from '@element-plus/icons-vue'
import { fetchList } from '@/api/article'
import { parseTime } from '@/utils'

defineOptions({ name: 'InlineEditTable' })

interface ArticleRow {
  id: number
  timestamp: number
  author: string
  title: string
  importance: number
  status: string
  edit: boolean
  originalTitle: string
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

const list = ref<ArticleRow[]>([])
const listLoading = ref(true)
const listQuery = reactive({
  page: 1,
  limit: 10
})

async function getList() {
  listLoading.value = true
  const { data } = await fetchList(listQuery)
  const items = data.items
  list.value = items.map((v: any) => ({
    ...v,
    edit: false,
    originalTitle: v.title // will be used when user click the cancel button
  }))
  listLoading.value = false
}

function cancelEdit(row: any) {
  row.title = row.originalTitle
  row.edit = false
  ElMessage({
    message: 'The title has been restored to the original value',
    type: 'warning'
  })
}

function confirmEdit(row: any) {
  row.edit = false
  row.originalTitle = row.title
  ElMessage({
    message: 'The title has been edited',
    type: 'success'
  })
}

getList()
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
