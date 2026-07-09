<template>
  <div class="app-container">
    <aside>
      The guide page is useful for some people who entered the project for the first time. You can briefly introduce the
      features of the project. Demo is based on
      <a href="https://github.com/kamranahmedse/driver.js" target="_blank">driver.js.</a>
    </aside>
    <el-button :icon="QuestionFilled" type="primary" @click.prevent.stop="guide">
      Show Guide
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { driver } from 'driver.js'
import type { Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import steps from './steps'

defineOptions({ name: 'Guide' })

const driverInstance = ref<Driver | null>(null)

onMounted(() => {
  driverInstance.value = driver({ steps })
})

function guide() {
  driverInstance.value?.drive()
}
</script>
