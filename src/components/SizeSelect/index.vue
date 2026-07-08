<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size===item.value" :command="item.value">
          {{
            item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useTagsViewStore } from '@/store/modules/tagsView'

defineOptions({ name: 'SizeSelect' })

const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()
const route = useRoute()
const router = useRouter()

const sizeOptions = [
  { label: 'Large', value: 'large' },
  { label: 'Default', value: 'default' },
  { label: 'Small', value: 'small' }
]

const size = computed(() => appStore.size)

function refreshView(): void {
  // In order to make the cached page re-rendered
  tagsViewStore.delAllCachedViews()

  const { fullPath } = route

  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}

function handleSetSize(size: string): void {
  appStore.setSize(size)
  refreshView()
  ElMessage({
    message: 'Switch Size Success',
    type: 'success'
  })
}
</script>
