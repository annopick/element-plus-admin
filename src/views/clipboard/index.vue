<template>
  <div class="app-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="use clipboard  directly" name="directly">
        <el-input v-model="inputData" placeholder="Please input" style="width:400px;max-width:100%;" />
        <el-button type="primary" :icon="Document" @click="handleCopy(inputData, $event)">
          copy
        </el-button>
      </el-tab-pane>
      <el-tab-pane label="use clipboard by v-directive" name="v-directive">
        <el-input v-model="inputData" placeholder="Please input" style="width:400px;max-width:100%;" />
        <el-button v-clipboard:copy="inputData" v-clipboard:success="clipboardSuccess" type="primary" :icon="Document">
          copy
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import clip from '@/utils/clipboard' // use clipboard directly
import clipboard from '@/directive/clipboard' // use clipboard by v-directive

// Vue 3 auto-resolves the `v-clipboard` directive from this `vClipboard` name.
const vClipboard = clipboard

defineOptions({ name: 'ClipboardDemo' })

const activeName = ref('directly')
const inputData = ref('https://github.com/PanJiaChen/vue-element-admin')

function handleCopy(text: string, event: MouseEvent) {
  clip(text, event)
}

function clipboardSuccess() {
  ElMessage({
    message: 'Copy successfully',
    type: 'success',
    duration: 1500
  })
}
</script>
