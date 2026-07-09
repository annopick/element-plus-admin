<template>
  <div>
    <svg-icon :icon-class="isFullscreen?'exit-fullscreen':'fullscreen'" @click="click" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import screenfull from 'screenfull'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'Screenfull' })

const isFullscreen = ref(false)

function change(): void {
  isFullscreen.value = screenfull.isFullscreen
}

function click(): boolean | void {
  if (!screenfull.isEnabled) {
    ElMessage({
      message: 'you browser can not work',
      type: 'warning'
    })
    return false
  }
  screenfull.toggle()
}

function init(): void {
  if (screenfull.isEnabled) {
    screenfull.on('change', change)
  }
}

function destroy(): void {
  if (screenfull.isEnabled) {
    screenfull.off('change', change)
  }
}

onMounted(init)
onBeforeUnmount(destroy)
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
