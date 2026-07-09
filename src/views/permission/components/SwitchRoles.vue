<template>
  <div>
    <div style="margin-bottom:15px;">
      Your roles: {{ roles }}
    </div>
    Switch roles:
    <el-radio-group v-model="switchRoles">
      <el-radio-button value="editor" />
      <el-radio-button value="admin" />
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const emit = defineEmits<{
  (e: 'change'): void
}>()

const userStore = useUserStore()

const roles = computed(() => userStore.roles)

const switchRoles = computed<string>({
  get() {
    return roles.value[0]
  },
  async set(val: string) {
    await userStore.changeRoles(val)
    emit('change')
  }
})
</script>
