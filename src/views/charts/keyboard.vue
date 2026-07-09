<template>
  <div class="chart-container">
    <keyboard-chart height="100%" width="100%" />
  </div>
</template>

<script setup lang="ts">
import KeyboardChart from '@/components/Charts/Keyboard.vue'

defineOptions({ name: 'KeyboardChart' })
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>
