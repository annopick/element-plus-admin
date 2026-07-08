<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useUserStore } from '@/store/modules/user'
import adminDashboard from './admin/index.vue'
import editorDashboard from './editor/index.vue'

defineOptions({ name: 'Dashboard' })

const userStore = useUserStore()

// Vue 3 <component :is> takes a component object, not a string name.
// shallowRef avoids deep reactivity on the component object (prevents Vue warnings).
const currentRole = shallowRef(adminDashboard)

if (!userStore.roles.includes('admin')) {
  currentRole.value = editorDashboard
}
</script>
