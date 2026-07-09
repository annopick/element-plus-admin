<template>
  <el-dropdown :hide-on-click="false" :show-timeout="100" trigger="click">
    <el-button plain>
      Platfroms({{ platforms.length }})
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu class="no-border">
        <el-checkbox-group v-model="platforms" style="padding: 5px 15px;">
          <el-checkbox v-for="item in platformsOptions" :key="item.key" :value="item.key">
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

defineOptions({ name: 'PlatformDropdown' })

const props = withDefaults(defineProps<{
  modelValue?: string[]
}>(), {
  modelValue: () => [] as string[]
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
}>()

const platformsOptions = [
  { key: 'a-platform', name: 'a-platform' },
  { key: 'b-platform', name: 'b-platform' },
  { key: 'c-platform', name: 'c-platform' }
]

const platforms = computed<string[]>({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>
