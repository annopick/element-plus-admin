<template>
  <div class="upload-container">
    <el-button :style="{ background: color, borderColor: color }" :icon="Upload" size="small" type="primary" @click="dialogVisible = true">
      upload
    </el-button>
    <el-dialog v-model="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        action="https://httpbin.org/post"
        list-type="picture-card"
      >
        <el-button size="small" type="primary">
          Click upload
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        Cancel
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        Confirm
      </el-button>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// import { getToken } from 'api/qiniu'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadRawFile, UploadUserFile } from 'element-plus'

defineOptions({ name: 'EditorSlideUpload' })

const props = withDefaults(defineProps<{
  color?: string
}>(), {
  color: '#1890ff'
})

const emit = defineEmits<{
  (e: 'successCBK', arr: Array<{ hasSuccess: boolean; uid: number; width: number; height: number; url?: string }>): void
}>()

interface ImageItem {
  hasSuccess: boolean
  uid: number
  width: number
  height: number
  url?: string
}

const dialogVisible = ref(false)
const listObj = ref<Record<number, ImageItem>>({})
const fileList = ref<UploadUserFile[]>([])

function checkAllSuccess() {
  return Object.keys(listObj.value).every(item => listObj.value[Number(item)].hasSuccess)
}

function handleSubmit() {
  const arr = Object.keys(listObj.value).map(v => listObj.value[Number(v)])
  if (!checkAllSuccess()) {
    ElMessage('Please wait for all images to be uploaded successfully. If there is a network problem, please refresh the page and upload again!')
    return
  }
  emit('successCBK', arr)
  listObj.value = {}
  fileList.value = []
  dialogVisible.value = false
}

function handleSuccess(response: any, file: UploadFile) {
  const uid = file.uid
  const objKeyArr = Object.keys(listObj.value)
  for (let i = 0, len = objKeyArr.length; i < len; i++) {
    if (listObj.value[Number(objKeyArr[i])].uid === uid) {
      listObj.value[Number(objKeyArr[i])].url = response.files.file
      listObj.value[Number(objKeyArr[i])].hasSuccess = true
      return
    }
  }
}

function handleRemove(file: UploadFile) {
  const uid = file.uid
  const objKeyArr = Object.keys(listObj.value)
  for (let i = 0, len = objKeyArr.length; i < len; i++) {
    if (listObj.value[Number(objKeyArr[i])].uid === uid) {
      delete listObj.value[Number(objKeyArr[i])]
      return
    }
  }
}

function beforeUpload(file: UploadRawFile) {
  const fileName = file.uid
  listObj.value[fileName] = {} as ImageItem
  const _URL = window.URL || (window as any).webkitURL
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.src = _URL.createObjectURL(file)
    img.onload = function() {
      listObj.value[fileName] = { hasSuccess: false, uid: file.uid, width: img.width, height: img.height }
    }
    resolve(true)
  })
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  :deep(.el-upload--picture-card) {
    width: 100%;
  }
}
</style>
