<template>
  <el-dropdown :show-timeout="100" trigger="click">
    <el-button plain>
      Link
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu class="no-padding no-border" style="width:400px">
        <el-form-item label-width="0px" style="margin-bottom: 0px" prop="source_uri">
          <el-input v-model="source_uri" placeholder="Please enter the content">
            <template #prepend>
              URL
            </template>
          </el-input>
        </el-form-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

defineOptions({ name: 'SourceUrlDropdown' })

const props = withDefaults(defineProps<{
  modelValue?: string
}>(), {
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const source_uri = computed<string>({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>
