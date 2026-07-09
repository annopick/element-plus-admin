<template>
  <div class="app-container">
    <el-input v-model="filename" placeholder="Please enter the file name (default file)" style="width:300px;" :prefix-icon="Document" />
    <el-button :loading="downloadLoading" style="margin-bottom:20px;" type="primary" :icon="Document" @click="handleDownload">
      Export Zip
    </el-button>
    <el-table v-loading="listLoading" :data="list" element-loading-text="拼命加载中" border fit highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template #default="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template #default="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Author" width="95" align="center">
        <template #default="scope">
          <el-tag>{{ scope.row.author }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Readings" width="115" align="center">
        <template #default="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Date" width="220">
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
import { Document, Timer } from '@element-plus/icons-vue'
import { fetchList } from '@/api/article'
import { export_txt_to_zip } from '@/vendor/Export2Zip'

defineOptions({ name: 'ExportZip' })

const list = ref<any[]>([])
const listLoading = ref(true)
const downloadLoading = ref(false)
const filename = ref('')

async function fetchData() {
  listLoading.value = true
  const { data } = await fetchList({})
  list.value = data.items
  listLoading.value = false
}

function formatJson(filterVal: string[], jsonData: any[]) {
  return jsonData.map(v => filterVal.map(j => v[j]))
}

function handleDownload() {
  downloadLoading.value = true
  const tHeader = ['Id', 'Title', 'Author', 'Readings', 'Date']
  const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
  const data = formatJson(filterVal, list.value)
  export_txt_to_zip(tHeader, data, filename.value, filename.value)
  downloadLoading.value = false
}

onMounted(fetchData)
</script>
