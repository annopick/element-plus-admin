<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Order_No" min-width="200">
      <template #default="{ row }">
        {{ row.order_no.substring(0, 30) }}
      </template>
    </el-table-column>
    <el-table-column label="Price" width="195" align="center">
      <template #default="{ row }">
        ¥{{ toThousandFilter(row.price) }}
      </template>
    </el-table-column>
    <el-table-column label="Status" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="statusFilter(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { transactionList } from '@/api/remote-search'
import { toThousandFilter } from '@/utils/filters'

defineOptions({ name: 'TransactionTable' })

const list = ref<any[]>([])

function statusFilter(status: string): 'success' | 'danger' | 'info' | 'primary' | 'warning' {
  const statusMap: Record<string, 'success' | 'danger'> = {
    success: 'success',
    pending: 'danger'
  }
  return statusMap[status] || 'info'
}

onBeforeMount(() => {
  fetchData()
})

function fetchData() {
  transactionList({}).then((response: any) => {
    list.value = response.data.items.slice(0, 8)
  })
}
</script>
