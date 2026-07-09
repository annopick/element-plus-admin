<template>
  <div class="app-container">

    <div>
      <FilenameOption v-model="filename" />
      <AutoWidthOption v-model="autoWidth" />
      <BookTypeOption v-model="bookType" />
      <el-button :loading="downloadLoading" style="margin:0 0 20px 20px;" type="primary" :icon="Document" @click="handleDownload">
        Export Excel
      </el-button>
      <a href="https://panjiachen.github.io/vue-element-admin-site/feature/component/excel.html" target="_blank" style="margin-left:15px;">
        <el-tag type="info">Documentation</el-tag>
      </a>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading..." border fit highlight-current-row>
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
// options components
import FilenameOption from './components/FilenameOption.vue'
import AutoWidthOption from './components/AutoWidthOption.vue'
import BookTypeOption from './components/BookTypeOption.vue'

defineOptions({ name: 'ExportExcel' })

const list = ref<any[]>([])
const listLoading = ref(true)
const downloadLoading = ref(false)
const filename = ref('')
const autoWidth = ref(true)
const bookType = ref('xlsx')

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
  const tHeader = ['Id', 'Title', 'Author', 'Readings', 'Date']
  const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
  const data = formatJson(filterVal, list.value)
  export_json_to_excel({
    header: tHeader,
    data,
    filename: filename.value,
    autoWidth: autoWidth.value,
    bookType: bookType.value as any
  })
  downloadLoading.value = false
}

onMounted(fetchData)
</script>

<style>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
</style>
