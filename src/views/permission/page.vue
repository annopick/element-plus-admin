<template>
  <div class="app-container">
    <switch-roles @change="handleRolesChange" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SwitchRoles from './components/SwitchRoles.vue'

defineOptions({ name: 'PagePermission' })

const router = useRouter()

function handleRolesChange() {
  router.push({ path: '/permission/index?' + +new Date() })
}
</script>
