<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

defineOptions({ name: 'AuthRedirect' })

onMounted(() => {
  const hash = window.location.search.slice(1)
  if (window.localStorage) {
    window.localStorage.setItem('x-admin-oauth-code', hash)
    window.close()
  }
})
</script>
