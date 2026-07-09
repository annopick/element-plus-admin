<template>
  <div class="components-container">
    <aside>Markdown is based on
      <a href="https://github.com/imzbf/md-editor-v3" target="_blank">md-editor-v3</a> ，simply wrapped with Vue.
    </aside>

    <div class="editor-container">
      <el-tag class="tag-title">
        Basic:
      </el-tag>
      <markdown-editor v-model="content1" height="300px" />
    </div>

    <div class="editor-container">
      <el-tag class="tag-title">
        Preview Only Mode:
      </el-tag>
      <markdown-editor v-model="content2" height="200px" />
    </div>

    <div class="editor-container">
      <el-tag class="tag-title">
        Third Editor:
      </el-tag>
      <markdown-editor v-model="content3" />
    </div>

    <div class="editor-container">
      <el-tag class="tag-title">
        I18n:
      </el-tag>
      <el-alert
        :closable="false"
        title="You can change the language of the admin system to see the effect"
        type="success"
      />
      <markdown-editor v-model="content4" height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownEditor from '@/components/MarkdownEditor/index.vue'

defineOptions({ name: 'MarkdownDemo' })

const content = `
**This is test**

* vue
* element
* webpack

`
const content1 = ref(content)
const content2 = ref(content)
const content3 = ref(content)
const content4 = ref(content)
</script>

<style scoped>
.editor-container{
  margin-bottom: 30px;
}
.tag-title{
  margin-bottom: 5px;
}
</style>
