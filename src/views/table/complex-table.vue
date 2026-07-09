<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" :icon="Search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" :icon="Edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves class="filter-item" type="primary" :icon="Download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Date" width="150px" align="center">
        <template #default="{ row }">
          <span>{{ parseTime(row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Title" min-width="150px">
        <template #default="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag>{{ typeFilter(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110px" align="center">
        <template #default="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="Reviewer" width="110px" align="center">
        <template #default="{ row }">
          <span style="color:red;">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Imp" width="80px">
        <template #default="{ row }">
          <svg-icon v-for="n in Number(row.importance) || 0" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>
      <el-table-column label="Readings" align="center" width="95">
        <template #default="{ row }">
          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" width="100">
        <template #default="{ row }">
          <el-tag :type="statusFilter(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template #default="{ row, $index }">
          <el-button type="primary" size="small" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='published'" size="small" type="success" @click="handleModifyStatus(row,'published')">
            Publish
          </el-button>
          <el-button v-if="row.status!='draft'" size="small" @click="handleModifyStatus(row,'draft')">
            Draft
          </el-button>
          <el-button v-if="row.status!='deleted'" size="small" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="listQuery.page" v-model:limit="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible">
      <el-form ref="dataFormRef" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Type" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Date" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Imp">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElNotification } from 'element-plus'
import { Search, Edit, Download } from '@element-plus/icons-vue'
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination/index.vue'

defineOptions({ name: 'ComplexTable' })

// enables v-waves directive in template (Vue3 script setup naming convention)
const vWaves = waves

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {} as Record<string, string>)

const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  published: 'success',
  draft: 'info',
  deleted: 'danger'
}

function statusFilter(status: string) {
  return statusMap[status]
}

function typeFilter(type: string) {
  return calendarTypeKeyValue[type]
}

const tableKey = ref(0)
const list = ref<any[]>([])
const total = ref(0)
const listLoading = ref(true)
const listQuery = reactive({
  page: 1,
  limit: 20,
  importance: undefined as number | undefined,
  title: undefined as string | undefined,
  type: undefined as string | undefined,
  sort: '+id'
})
const importanceOptions = [1, 2, 3]
const sortOptions = [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }]
const statusOptions = ['published', 'draft', 'deleted']
const showReviewer = ref(false)
const temp = reactive({
  id: undefined as number | undefined,
  importance: 1,
  remark: '',
  timestamp: new Date() as Date,
  title: '',
  type: '',
  status: 'published',
  author: undefined as string | undefined
})
const dialogFormVisible = ref(false)
const dialogStatus = ref('')
const textMap: Record<string, string> = {
  update: 'Edit',
  create: 'Create'
}
const dialogPvVisible = ref(false)
const pvData = ref<any[]>([])
const dataFormRef = ref<FormInstance>()
const rules = reactive({
  type: [{ required: true, message: 'type is required', trigger: 'change' }],
  timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
  title: [{ required: true, message: 'title is required', trigger: 'blur' }]
})

function getList() {
  listLoading.value = true
  fetchList(listQuery).then(response => {
    list.value = response.data.items
    total.value = response.data.total

    // Just to simulate the time of the request
    setTimeout(() => {
      listLoading.value = false
    }, 1.5 * 1000)
  })
}

function handleFilter() {
  listQuery.page = 1
  getList()
}

function handleModifyStatus(row: any, status: string) {
  ElMessage({
    message: '操作Success',
    type: 'success'
  })
  row.status = status
}

function sortChange(data: { column: any; prop: string | null; order: string | null }) {
  const { prop, order } = data
  if (prop === 'id' && order) {
    sortByID(order)
  }
}

function sortByID(order: string | null) {
  if (order === 'ascending') {
    listQuery.sort = '+id'
  } else {
    listQuery.sort = '-id'
  }
  handleFilter()
}

function resetTemp() {
  temp.id = undefined
  temp.importance = 1
  temp.remark = ''
  temp.timestamp = new Date()
  temp.title = ''
  temp.status = 'published'
  temp.type = ''
  temp.author = undefined
}

function handleCreate() {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
  nextTick(() => {
    dataFormRef.value?.clearValidate()
  })
}

function createData() {
  dataFormRef.value?.validate((valid) => {
    if (valid) {
      temp.id = parseInt(Math.random() * 100 + '') + 1024 // mock a id
      temp.author = 'vue-element-admin'
      createArticle(temp).then(() => {
        list.value.unshift({ ...temp })
        dialogFormVisible.value = false
        ElNotification({
          title: 'Success',
          message: 'Created Successfully',
          type: 'success',
          duration: 2000
        })
      })
    }
  })
}

function handleUpdate(row: any) {
  Object.assign(temp, row) // copy obj
  temp.timestamp = new Date(temp.timestamp)
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
  nextTick(() => {
    dataFormRef.value?.clearValidate()
  })
}

function updateData() {
  dataFormRef.value?.validate((valid) => {
    if (valid) {
      const tempData: any = Object.assign({}, temp)
      tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateArticle(tempData).then(() => {
        const index = list.value.findIndex(v => v.id === temp.id)
        list.value.splice(index, 1, { ...temp })
        dialogFormVisible.value = false
        ElNotification({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    }
  })
}

function handleDelete(row: any, index: number) {
  ElNotification({
    title: 'Success',
    message: 'Delete Successfully',
    type: 'success',
    duration: 2000
  })
  list.value.splice(index, 1)
}

function handleFetchPv(pv: string) {
  fetchPv(pv).then(response => {
    pvData.value = response.data.pvData
    dialogPvVisible.value = true
  })
}

function handleDownload() {
  ElMessage.info('Excel export will be available in Phase 4')
}

function getSortClass(key: string) {
  const sort = listQuery.sort
  return sort === `+${key}` ? 'ascending' : 'descending'
}

getList()
</script>
