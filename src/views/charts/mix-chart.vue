<template>
  <div class="chart-container">
    <mix-chart height="100%" width="100%" />
  </div>
</template>

<script setup lang="ts">
import MixChart from '@/components/Charts/MixChart.vue'

defineOptions({ name: 'MixChart' })
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>
