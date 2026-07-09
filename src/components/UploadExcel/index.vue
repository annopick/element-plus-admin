<template>
  <div>
    <input ref="excelUploadInput" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
    <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
      Drop excel file here or
      <el-button :loading="loading" style="margin-left:16px;" size="small" type="primary" @click="handleUpload">
        Browse
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

defineOptions({ name: 'UploadExcel' })

const props = defineProps<{
  beforeUpload?: (file: File) => boolean | void
  onSuccess?: (data: { header: string[] | null; results: any[] | null }) => void
}>()

const emit = defineEmits<{
  (e: 'before-upload', file: File): void
  (e: 'on-success', data: { header: string[] | null; results: any[] | null }): void
}>()

interface ExcelData {
  header: string[] | null
  results: any[] | null
}

const loading = ref(false)
const excelData = ref<ExcelData>({
  header: null,
  results: null
})
const excelUploadInput = ref<HTMLInputElement | null>(null)

function generateData({ header, results }: ExcelData) {
  excelData.value.header = header
  excelData.value.results = results
  props.onSuccess && props.onSuccess(excelData.value)
}

function handleDrop(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
  if (loading.value) return
  const files = e.dataTransfer?.files
  if (!files || files.length !== 1) {
    ElMessage.error('Only support uploading one file!')
    return
  }
  const rawFile = files[0] // only use files[0]

  if (!isExcel(rawFile)) {
    ElMessage.error('Only supports upload .xlsx, .xls, .csv suffix files')
    return false
  }
  upload(rawFile)
  e.stopPropagation()
  e.preventDefault()
}

function handleDragover(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function handleUpload() {
  excelUploadInput.value?.click()
}

function handleClick(e: Event) {
  const files = (e.target as HTMLInputElement).files
  const rawFile = files?.[0] // only use files[0]
  if (!rawFile) return
  upload(rawFile)
}

function upload(rawFile: File) {
  if (excelUploadInput.value) {
    excelUploadInput.value.value = '' // fix can't select the same excel
  }

  if (!props.beforeUpload) {
    readerData(rawFile)
    return
  }
  const before = props.beforeUpload(rawFile)
  if (before) {
    readerData(rawFile)
  }
}

function readerData(rawFile: File) {
  loading.value = true
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const header = getHeaderRow(worksheet)
      const results = XLSX.utils.sheet_to_json(worksheet)
      generateData({ header, results: results as any[] })
      loading.value = false
      resolve()
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(rawFile)
  })
}

function getHeaderRow(sheet: XLSX.WorkSheet): string[] {
  const headers: string[] = []
  const range = XLSX.utils.decode_range(sheet['!ref'] as string)
  let C
  const R = range.s.r
  /* start in the first row */
  for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
    /* find the cell in the first row */
    let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
    if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
    headers.push(hdr)
  }
  return headers
}

function isExcel(file: File) {
  return /\.(xlsx|xls|csv)$/.test(file.name)
}
</script>

<style scoped>
.excel-upload-input{
  display: none;
  z-index: -9999;
}
.drop{
  border: 2px dashed #bbb;
  width: 600px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
  font-size: 24px;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
}
</style>
