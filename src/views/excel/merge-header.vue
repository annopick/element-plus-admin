<template>
  <div class="app-container">

    <el-button :loading="downloadLoading" style="margin-bottom:20px" type="primary" :icon="Document" @click="handleDownload">Export</el-button>

    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="Id" width="95">
        <template #default="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Main Information" align="center">
        <el-table-column label="Title">
          <template #default="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="Author" width="110" align="center">
          <template #default="scope">
            <el-tag>{{ scope.row.author }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Readings" width="115" align="center">
          <template #default="scope">
            {{ scope.row.pageviews }}
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="Date" width="220">
        <template #default="scope">
          <el-icon><Timer /></el-icon>
          <span>{{ parseTime(scope.row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Document, Timer } from '@element-plus/icons-vue'
import { fetchList } from '@/api/article'
import { parseTime } from '@/utils'
import { export_json_to_excel } from '@/vendor/Export2Excel'

defineOptions({ name: 'MergeHeader' })

const list = ref<any[]>([])
const listLoading = ref(true)
const downloadLoading = ref(false)

function fetchData() {
  listLoading.value = true
  fetchList({}).then(response => {
    list.value = response.data.items
    listLoading.value = false
  })
}

function formatJson(filterVal: string[], jsonData: any[]) {
  return jsonData.map(v => filterVal.map(j => {
    if (j === 'timestamp') {
      return parseTime(v[j])
    } else {
      return v[j]
    }
  }))
}

function handleDownload() {
  downloadLoading.value = true
  const multiHeader = [['Id', 'Main Information', '', '', 'Date']]
  const header = ['', 'Title', 'Author', 'Readings', '']
  const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
  const data = formatJson(filterVal, list.value)
  const merges = ['A1:A2', 'B1:D1', 'E1:E2']
  export_json_to_excel({
    multiHeader,
    header,
    merges,
    data
  })
  downloadLoading.value = false
}

onMounted(fetchData)
</script>
