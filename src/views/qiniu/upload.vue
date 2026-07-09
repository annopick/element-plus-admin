<template>
  <el-upload :data="dataObj" :multiple="true" :before-upload="beforeUpload" action="https://upload.qbox.me" drag>
    <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
    <div class="el-upload__text">
      将文件拖到此处，或<em>点击上传</em>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/api/qiniu'
// 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token
// 七牛官方sdk https://developer.qiniu.com/sdk#official-sdk

defineOptions({ name: 'QiniuUpload' })

const dataObj = reactive({ token: '', key: '' })

function beforeUpload(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    getToken().then(response => {
      const key = (response.data as any).qiniu_key
      const token = (response.data as any).qiniu_token
      dataObj.token = token
      dataObj.key = key
      resolve(true)
    }).catch(err => {
      console.log(err)
      reject(false)
    })
  })
}
</script>
