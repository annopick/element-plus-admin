<template>
  <div class="app-container">
    <el-input v-model="filename" placeholder="Please enter the file name (default excel-list)" style="width:350px;" :prefix-icon="Document" />
    <el-button :loading="downloadLoading" style="margin-bottom:20px" type="primary" :icon="Document" @click="handleDownload">
      Export Selected Items
    </el-button>
    <a href="https://panjiachen.github.io/vue-element-admin-site/feature/component/excel.html" target="_blank" style="margin-left:15px;">
      <el-tag type="info">Documentation</el-tag>
    </a>
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column align="center" label="Id" width="95">
        <template #default="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
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
      <el-table-column align="center" label="PDate" width="220">
        <template #default="scope">
          <el-icon><Timer /></el-icon>
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { TableInstance } from 'element-plus'
import { Document, Timer } from '@element-plus/icons-vue'
import { fetchList } from '@/api/article'
import { export_json_to_excel } from '@/vendor/Export2Excel'

defineOptions({ name: 'SelectExcel' })

const list = ref<any[]>([])
const listLoading = ref(true)
const multipleSelection = ref<any[]>([])
const downloadLoading = ref(false)
const filename = ref('')
const multipleTable = ref<TableInstance>()

function fetchData() {
  listLoading.value = true
  fetchList({}).then(response => {
    list.value = response.data.items
    listLoading.value = false
  })
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val
}

function formatJson(filterVal: string[], jsonData: any[]) {
  return jsonData.map(v => filterVal.map(j => v[j]))
}

function handleDownload() {
  if (multipleSelection.value.length) {
    downloadLoading.value = true
    const tHeader = ['Id', 'Title', 'Author', 'Readings', 'Date']
    const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
    const data = formatJson(filterVal, multipleSelection.value)
    export_json_to_excel({
      header: tHeader,
      data,
      filename: filename.value
    })
    multipleTable.value?.clearSelection()
    downloadLoading.value = false
  } else {
    ElMessage({
      message: 'Please select at least one item',
      type: 'warning'
    })
  }
}

onMounted(fetchData)
</script>
