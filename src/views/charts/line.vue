<template>
  <div class="chart-container">
    <line-marker height="100%" width="100%" />
  </div>
</template>

<script setup lang="ts">
import LineMarker from '@/components/Charts/LineMarker.vue'

defineOptions({ name: 'LineChart' })
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>
