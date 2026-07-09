<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Date">
        <template #default="scope">
          <span>{{ parseTime(scope.row.timestamp, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Author">
        <template #default="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="Importance">
        <template #default="scope">
          <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star" class="meta-item__icon" />
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
          <router-link :to="'/example/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template #default="scope">
          <router-link :to="'/example/edit/'+scope.row.id">
            <el-button type="primary" size="small" :icon="Edit">
              Edit
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="listQuery.page" v-model:limit="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { fetchList } from '@/api/article'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination/index.vue'

defineOptions({ name: 'ArticleList' })

const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  published: 'success',
  draft: 'info',
  deleted: 'danger'
}

function statusFilter(status: string) {
  return statusMap[status]
}

const list = ref<any[]>([])
const total = ref(0)
const listLoading = ref(true)
const listQuery = reactive({
  page: 1,
  limit: 20
})

function getList() {
  listLoading.value = true
  fetchList(listQuery).then(response => {
    list.value = response.data.items
    total.value = response.data.total
    listLoading.value = false
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
