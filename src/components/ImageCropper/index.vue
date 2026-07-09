<template>
  <div v-show="modelValue" class="vue-image-crop-upload">
    <div class="vicp-wrap">
      <div class="vicp-close" @click="off">
        <i class="vicp-icon4" />
      </div>

      <div v-show="step == 1" class="vicp-step1">
        <div
          class="vicp-drop-area"
          @dragleave="preventDefault"
          @dragover="preventDefault"
          @dragenter="preventDefault"
          @click="handleClick"
          @drop="handleChange"
        >
          <i v-show="loading != 1" class="vicp-icon1">
            <i class="vicp-icon1-arrow" />
            <i class="vicp-icon1-body" />
            <i class="vicp-icon1-bottom" />
          </i>
          <span v-show="loading !== 1" class="vicp-hint">{{ lang.hint }}</span>
          <span v-show="!isSupported" class="vicp-no-supported-hint">{{ lang.noSupported }}</span>
          <input v-show="false" v-if="step == 1" ref="fileinput" type="file" @change="handleChange">
        </div>
        <div v-show="hasError" class="vicp-error">
          <i class="vicp-icon2" />
          {{ errorMsg }}
        </div>
        <div class="vicp-operate">
          <a @click="off" @mousedown="ripple">{{ lang.btn.off }}</a>
        </div>
      </div>

      <div v-if="step == 2" class="vicp-step2">
        <div class="vicp-crop">
          <div v-show="true" class="vicp-crop-left">
            <div class="vicp-img-container">
              <img
                ref="img"
                :src="sourceImgUrl"
                :style="sourceImgStyle"
                class="vicp-img"
                draggable="false"
                @drag="preventDefault"
                @dragstart="preventDefault"
                @dragend="preventDefault"
                @dragleave="preventDefault"
                @dragover="preventDefault"
                @dragenter="preventDefault"
                @drop="preventDefault"
                @touchstart="imgStartMove"
                @touchmove="imgMove"
                @touchend="createImg"
                @touchcancel="createImg"
                @mousedown="imgStartMove"
                @mousemove="imgMove"
                @mouseup="createImg"
                @mouseout="createImg"
              >
              <div :style="sourceImgShadeStyle" class="vicp-img-shade vicp-img-shade-1" />
              <div :style="sourceImgShadeStyle" class="vicp-img-shade vicp-img-shade-2" />
            </div>

            <div class="vicp-range">
              <input
                :value="scale.range"
                type="range"
                step="1"
                min="0"
                max="100"
                @input="zoomChange"
              >
              <i
                class="vicp-icon5"
                @mousedown="startZoomSub"
                @mouseout="endZoomSub"
                @mouseup="endZoomSub"
              />
              <i
                class="vicp-icon6"
                @mousedown="startZoomAdd"
                @mouseout="endZoomAdd"
                @mouseup="endZoomAdd"
              />
            </div>

            <div v-if="!noRotate" class="vicp-rotate">
              <i @mousedown="startRotateLeft" @mouseout="endRotate" @mouseup="endRotate">↺</i>
              <i @mousedown="startRotateRight" @mouseout="endRotate" @mouseup="endRotate">↻</i>
            </div>
          </div>
          <div v-show="true" class="vicp-crop-right">
            <div class="vicp-preview">
              <div v-if="!noSquare" class="vicp-preview-item">
                <img :src="createImgUrl" :style="previewStyle">
                <span>{{ lang.preview }}</span>
              </div>
              <div v-if="!noCircle" class="vicp-preview-item vicp-preview-item-circle">
                <img :src="createImgUrl" :style="previewStyle">
                <span>{{ lang.preview }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="vicp-operate">
          <a @click="setStep(1)" @mousedown="ripple">{{ lang.btn.back }}</a>
          <a class="vicp-operate-btn" @click="prepareUpload" @mousedown="ripple">{{ lang.btn.save }}</a>
        </div>
      </div>

      <div v-if="step == 3" class="vicp-step3">
        <div class="vicp-upload">
          <span v-show="loading === 1" class="vicp-loading">{{ lang.loading }}</span>
          <div class="vicp-progress-wrap">
            <span v-show="loading === 1" :style="progressStyle" class="vicp-progress" />
          </div>
          <div v-show="hasError" class="vicp-error">
            <i class="vicp-icon2" />
            {{ errorMsg }}
          </div>
          <div v-show="loading === 2" class="vicp-success">
            <i class="vicp-icon3" />
            {{ lang.success }}
          </div>
        </div>
        <div class="vicp-operate">
          <a @click="setStep(2)" @mousedown="ripple">{{ lang.btn.back }}</a>
          <a @click="off" @mousedown="ripple">{{ lang.btn.close }}</a>
        </div>
      </div>
      <canvas v-show="false" ref="canvas" :width="width" :height="height" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import request from '@/utils/request'
import language from '@/components/ImageCropper/utils/language'
import mimes from '@/components/ImageCropper/utils/mimes'
import data2blob from '@/components/ImageCropper/utils/data2blob'
import effectRipple from '@/components/ImageCropper/utils/effectRipple'

defineOptions({ name: 'ImageCropper' })

interface LangBtn {
  off: string
  close: string
  back: string
  save: string
}
interface LangError {
  onlyImg: string
  outOfSize: string
  lowestPx: string
}
interface Lang {
  hint: string
  loading: string
  noSupported: string
  success: string
  fail: string
  preview: string
  btn: LangBtn
  error: LangError
}

const props = withDefaults(defineProps<{
  // 域，上传文件name，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
  field?: string
  // 原名key，类似于id，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
  ki?: number
  // 显示该控件与否
  modelValue?: boolean
  // 上传地址
  url?: string
  // 其他要上传文件附带的数据，对象格式
  params?: Record<string, any> | null
  // Add custom headers
  headers?: Record<string, any> | null
  // 剪裁图片的宽
  width?: number
  // 剪裁图片的高
  height?: number
  // 不显示旋转功能
  noRotate?: boolean
  // 不预览圆形图片
  noCircle?: boolean
  // 不预览方形图片
  noSquare?: boolean
  // 单文件大小限制
  maxSize?: number
  // 语言类型
  langType?: string
  // 语言包
  langExt?: Record<string, any> | null
  // 图片上传格式
  imgFormat?: string
  // 是否支持跨域
  withCredentials?: boolean
}>(), {
  field: 'avatar',
  ki: 0,
  modelValue: true,
  url: '',
  params: null,
  headers: null,
  width: 200,
  height: 200,
  noRotate: true,
  noCircle: false,
  noSquare: false,
  maxSize: 10240,
  langType: 'zh',
  langExt: null,
  imgFormat: 'png',
  withCredentials: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'crop-success', imgUrl: string, field: string, ki: number): void
  (e: 'crop-upload-success', resData: any): void
  (e: 'crop-upload-fail', err: any, field: string, ki: number): void
}>()

const fileinput = ref<HTMLInputElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const img = ref<HTMLImageElement | null>(null)

// ---- setup-time initial values (computed from props) ----
const allowImgFormat = ['jpg', 'png']
const tempImgFormat =
  allowImgFormat.indexOf(props.imgFormat) === -1 ? 'jpg' : props.imgFormat
const lang: Lang = (language as Record<string, Lang>)[props.langType]
  ? (language as Record<string, Lang>)[props.langType]
  : (language as Record<string, Lang>)['en']
const mime = (mimes as Record<string, string>)[tempImgFormat]
if (props.langExt) {
  Object.assign(lang, props.langExt)
}
const isSupported = typeof FormData !== 'undefined'
const isSupportTouch = typeof document !== 'undefined' && 'ontouchstart' in document

// ---- reactive state ----
const step = ref(1) // 1选择文件 2剪裁 3上传
const loading = ref(0) // 0未开始 1正在 2成功 3错误
const progress = ref(0)
const hasError = ref(false)
const errorMsg = ref('')
const ratio = props.width / props.height
const sourceImg = ref<HTMLImageElement | null>(null)
const sourceImgUrl = ref('')
const createImgUrl = ref('')

interface DragDownState { on: boolean; mX: number; mY: number; x: number; y: number }
const sourceImgMouseDown = reactive<DragDownState>({ on: false, mX: 0, mY: 0, x: 0, y: 0 })

const previewContainer = reactive({ width: 100, height: 100 })
const sourceImgContainer = reactive({
  // sic
  width: 240,
  height: 184 // 如果生成图比例与此一致会出现bug，先改成特殊的格式吧，哈哈哈
})

interface ScaleState {
  zoomAddOn: boolean
  zoomSubOn: boolean
  range: number
  rotateLeft: boolean
  rotateRight: boolean
  degree: number
  x: number
  y: number
  width: number
  height: number
  maxWidth: number
  maxHeight: number
  minWidth: number
  minHeight: number
  naturalWidth: number
  naturalHeight: number
}
const scale = reactive<ScaleState>({
  zoomAddOn: false,
  zoomSubOn: false,
  range: 1,
  rotateLeft: false,
  rotateRight: false,
  degree: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  maxWidth: 0,
  maxHeight: 0,
  minWidth: 0,
  minHeight: 0,
  naturalWidth: 0,
  naturalHeight: 0
})

// ---- computed ----
const progressStyle = computed(() => {
  return {
    width: progress.value + '%'
  }
})

const sourceImgMasking = computed(() => {
  const sic = sourceImgContainer
  const sicRatio = sic.width / sic.height // 原图容器宽高比
  let x = 0
  let y = 0
  let w = sic.width
  let h = sic.height
  let maskScale = 1
  if (ratio < sicRatio) {
    maskScale = sic.height / props.height
    w = sic.height * ratio
    x = (sic.width - w) / 2
  }
  if (ratio > sicRatio) {
    maskScale = sic.width / props.width
    h = sic.width / ratio
    y = (sic.height - h) / 2
  }
  return {
    scale: maskScale, // 蒙版相对需求宽高的缩放
    x,
    y,
    width: w,
    height: h
  }
})

const sourceImgStyle = computed(() => {
  const sim = sourceImgMasking.value
  const top = scale.y + sim.y + 'px'
  const left = scale.x + sim.x + 'px'
  return {
    top,
    left,
    width: scale.width + 'px',
    height: scale.height + 'px',
    transform: 'rotate(' + scale.degree + 'deg)', // 旋转时 左侧原始图旋转样式
    '-ms-transform': 'rotate(' + scale.degree + 'deg)', // 兼容IE9
    '-moz-transform': 'rotate(' + scale.degree + 'deg)', // 兼容FireFox
    '-webkit-transform': 'rotate(' + scale.degree + 'deg)', // 兼容Safari 和 chrome
    '-o-transform': 'rotate(' + scale.degree + 'deg)' // 兼容 Opera
  }
})

const sourceImgShadeStyle = computed(() => {
  const sic = sourceImgContainer
  const sim = sourceImgMasking.value
  const w =
    sim.width === sic.width ? sim.width : (sic.width - sim.width) / 2
  const h =
    sim.height === sic.height ? sim.height : (sic.height - sim.height) / 2
  return {
    width: w + 'px',
    height: h + 'px'
  }
})

const previewStyle = computed(() => {
  const pc = previewContainer
  let w = pc.width
  let h = pc.height
  const pcRatio = w / h
  if (ratio < pcRatio) {
    w = pc.height * ratio
  }
  if (ratio > pcRatio) {
    h = pc.width / ratio
  }
  return {
    width: w + 'px',
    height: h + 'px'
  }
})

// ---- watch ----
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && loading.value !== 1) {
      reset()
    }
  }
)

// ---- methods ----
// 点击波纹效果
function ripple(e: MouseEvent) {
  effectRipple(e)
}

// 关闭控件
function off() {
  setTimeout(() => {
    emit('update:modelValue', false)
    emit('close')
    if (step.value === 3 && loading.value === 2) {
      setStep(1)
    }
  }, 200)
}

// 设置步骤
function setStep(no: number) {
  // 延时是为了显示动画效果呢，哈哈哈
  setTimeout(() => {
    step.value = no
  }, 200)
}

/* 图片选择区域函数绑定
 ---------------------------------------------------------------*/
function preventDefault(e: Event) {
  e.preventDefault()
  return false
}

function handleClick(e: MouseEvent) {
  if (loading.value !== 1) {
    if (e.target !== fileinput.value) {
      e.preventDefault()
      if (document.activeElement !== fileinput.value) {
        fileinput.value?.click()
      }
    }
  }
}

function handleChange(e: Event) {
  e.preventDefault()
  if (loading.value !== 1) {
    const files = (e.target as HTMLInputElement).files || (e as DragEvent).dataTransfer?.files
    if (!files || !files[0]) return
    reset()
    if (checkFile(files[0])) {
      setSourceImg(files[0])
    }
  }
}

/* ---------------------------------------------------------------*/
// 检测选择的文件是否合适
function checkFile(file: File): boolean {
  // 仅限图片
  if (file.type.indexOf('image') === -1) {
    hasError.value = true
    errorMsg.value = lang.error.onlyImg
    return false
  }
  // 超出大小
  if (file.size / 1024 > props.maxSize) {
    hasError.value = true
    errorMsg.value = lang.error.outOfSize + props.maxSize + 'kb'
    return false
  }
  return true
}

// 重置控件
function reset() {
  loading.value = 0
  hasError.value = false
  errorMsg.value = ''
  progress.value = 0
}

// 设置图片源
function setSourceImg(file: File) {
  const fr = new FileReader()
  fr.onload = () => {
    sourceImgUrl.value = fr.result as string
    startCrop()
  }
  fr.readAsDataURL(file)
}

// 剪裁前准备工作
function startCrop() {
  const sim = sourceImgMasking.value
  const image = new Image()
  image.src = sourceImgUrl.value
  image.onload = () => {
    const nWidth = image.naturalWidth
    const nHeight = image.naturalHeight
    const nRatio = nWidth / nHeight
    let w = sim.width
    let h = sim.height
    let x = 0
    let y = 0
    // 图片像素不达标
    if (nWidth < props.width || nHeight < props.height) {
      hasError.value = true
      errorMsg.value = lang.error.lowestPx + props.width + '*' + props.height
      return false
    }
    if (ratio > nRatio) {
      h = w / nRatio
      y = (sim.height - h) / 2
    }
    if (ratio < nRatio) {
      w = h * nRatio
      x = (sim.width - w) / 2
    }
    scale.range = 0
    scale.x = x
    scale.y = y
    scale.width = w
    scale.height = h
    scale.degree = 0
    scale.minWidth = w
    scale.minHeight = h
    scale.maxWidth = nWidth * sim.scale
    scale.maxHeight = nHeight * sim.scale
    scale.naturalWidth = nWidth
    scale.naturalHeight = nHeight
    sourceImg.value = image
    createImg()
    setStep(2)
  }
}

// 鼠标按下图片准备移动
function imgStartMove(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  // 支持触摸事件，则鼠标事件无效
  if (isSupportTouch && !(e as TouchEvent).targetTouches) {
    return false
  }
  const et = (e as TouchEvent).targetTouches ? (e as TouchEvent).targetTouches[0] : (e as MouseEvent)
  const simd = sourceImgMouseDown
  simd.mX = et.screenX
  simd.mY = et.screenY
  simd.x = scale.x
  simd.y = scale.y
  simd.on = true
}

// 鼠标按下状态下移动，图片移动
function imgMove(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  // 支持触摸事件，则鼠标事件无效
  if (isSupportTouch && !(e as TouchEvent).targetTouches) {
    return false
  }
  const et = (e as TouchEvent).targetTouches ? (e as TouchEvent).targetTouches[0] : (e as MouseEvent)
  const { on, mX, mY, x, y } = sourceImgMouseDown
  const sim = sourceImgMasking.value
  const nX = et.screenX
  const nY = et.screenY
  const dX = nX - mX
  const dY = nY - mY
  let rX = x + dX
  let rY = y + dY
  if (!on) return
  if (rX > 0) {
    rX = 0
  }
  if (rY > 0) {
    rY = 0
  }
  if (rX < sim.width - scale.width) {
    rX = sim.width - scale.width
  }
  if (rY < sim.height - scale.height) {
    rY = sim.height - scale.height
  }
  scale.x = rX
  scale.y = rY
}

// 按钮按下开始向右旋转
function startRotateRight() {
  scale.rotateRight = true
  const rotate = () => {
    if (scale.rotateRight) {
      const degree = ++scale.degree
      createImg(degree)
      setTimeout(function() {
        rotate()
      }, 60)
    }
  }
  rotate()
}

// 按钮按下开始向左旋转
function startRotateLeft() {
  scale.rotateLeft = true
  const rotate = () => {
    if (scale.rotateLeft) {
      const degree = --scale.degree
      createImg(degree)
      setTimeout(function() {
        rotate()
      }, 60)
    }
  }
  rotate()
}

// 停止旋转
function endRotate() {
  scale.rotateLeft = false
  scale.rotateRight = false
}

// 按钮按下开始放大
function startZoomAdd() {
  scale.zoomAddOn = true
  const zoom = () => {
    if (scale.zoomAddOn) {
      const range = scale.range >= 100 ? 100 : ++scale.range
      zoomImg(range)
      setTimeout(function() {
        zoom()
      }, 60)
    }
  }
  zoom()
}

// 按钮松开或移开取消放大
function endZoomAdd() {
  scale.zoomAddOn = false
}

// 按钮按下开始缩小
function startZoomSub() {
  scale.zoomSubOn = true
  const zoom = () => {
    if (scale.zoomSubOn) {
      const range = scale.range <= 0 ? 0 : --scale.range
      zoomImg(range)
      setTimeout(function() {
        zoom()
      }, 60)
    }
  }
  zoom()
}

// 按钮松开或移开取消缩小
function endZoomSub() {
  scale.zoomSubOn = false
}

function zoomChange(e: Event) {
  zoomImg(Number((e.target as HTMLInputElement).value))
}

// 缩放原图
function zoomImg(newRange: number) {
  const {
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    width: sWidth2,
    height: sHeight2,
    x,
    y
  } = scale
  const sim = sourceImgMasking.value
  // 蒙版宽高
  const sWidth = sim.width
  const sHeight = sim.height
  // 新宽高
  const nWidth = minWidth + ((maxWidth - minWidth) * newRange) / 100
  const nHeight = minHeight + ((maxHeight - minHeight) * newRange) / 100
  // 新坐标（根据蒙版中心点缩放）
  let nX = sWidth / 2 - (nWidth / sWidth2) * (sWidth / 2 - x)
  let nY = sHeight / 2 - (nHeight / sHeight2) * (sHeight / 2 - y)
  // 判断新坐标是否超过蒙版限制
  if (nX > 0) {
    nX = 0
  }
  if (nY > 0) {
    nY = 0
  }
  if (nX < sWidth - nWidth) {
    nX = sWidth - nWidth
  }
  if (nY < sHeight - nHeight) {
    nY = sHeight - nHeight
  }
  // 赋值处理
  scale.x = nX
  scale.y = nY
  scale.width = nWidth
  scale.height = nHeight
  scale.range = newRange
  setTimeout(() => {
    if (scale.range === newRange) {
      createImg()
    }
  }, 300)
}

// 生成需求图片
function createImg(e?: any) {
  const srcImg = sourceImg.value
  const canvasEl = canvas.value
  if (!srcImg || !canvasEl) return
  const ctx = canvasEl.getContext('2d')
  if (!ctx) return
  if (e) {
    // 取消鼠标按下移动状态
    sourceImgMouseDown.on = false
  }
  const { x, y, width: cw, height: ch, degree } = scale
  const maskScale = sourceImgMasking.value.scale
  canvasEl.width = props.width
  canvasEl.height = props.height
  ctx.clearRect(0, 0, props.width, props.height)
  // 将透明区域设置为白色底边
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, props.width, props.height)
  ctx.translate(props.width * 0.5, props.height * 0.5)
  ctx.rotate((Math.PI * degree) / 180)
  ctx.translate(-props.width * 0.5, -props.height * 0.5)
  ctx.drawImage(
    srcImg,
    x / maskScale,
    y / maskScale,
    cw / maskScale,
    ch / maskScale
  )
  createImgUrl.value = canvasEl.toDataURL(mime)
}

function prepareUpload() {
  emit('crop-success', createImgUrl.value, props.field, props.ki)
  if (typeof props.url === 'string' && props.url) {
    upload()
  } else {
    off()
  }
}

// 上传图片
function upload() {
  const fmData = new FormData()
  fmData.append(
    props.field,
    data2blob(createImgUrl.value, mime),
    props.field + '.' + tempImgFormat
  )
  // 添加其他参数
  if (typeof props.params === 'object' && props.params) {
    Object.keys(props.params).forEach(k => {
      fmData.append(k, props.params![k])
    })
  }
  // 监听进度回调
  // const uploadProgress = (event) => {
  //   if (event.lengthComputable) {
  //     this.progress = 100 * Math.round(event.loaded) / event.total
  //   }
  // }
  // 上传文件
  reset()
  loading.value = 1
  setStep(3)
  request({
    url: props.url,
    method: 'post',
    data: fmData
  })
    .then((resData: any) => {
      loading.value = 2
      emit('crop-upload-success', resData.data)
    })
    .catch((err: any) => {
      if (props.modelValue) {
        loading.value = 3
        hasError.value = true
        errorMsg.value = lang.fail
        emit('crop-upload-fail', err, props.field, props.ki)
      }
    })
}

function closeHandler(e: KeyboardEvent) {
  if (props.modelValue && (e.key === 'Escape' || e.keyCode === 27)) {
    off()
  }
}

// 绑定按键esc隐藏此插件事件
onMounted(() => {
  document.addEventListener('keyup', closeHandler)
})

onBeforeUnmount(() => {
  document.removeEventListener('keyup', closeHandler)
})
</script>

<style lang="scss">
@charset "UTF-8";
@-webkit-keyframes vicp_progress {
  0% {
    background-position-y: 0;
  }
  100% {
    background-position-y: 40px;
  }
}
@keyframes vicp_progress {
  0% {
    background-position-y: 0;
  }
  100% {
    background-position-y: 40px;
  }
}
@-webkit-keyframes vicp {
  0% {
    opacity: 0;
    -webkit-transform: scale(0) translatey(-60px);
    transform: scale(0) translatey(-60px);
  }
  100% {
    opacity: 1;
    -webkit-transform: scale(1) translatey(0);
    transform: scale(1) translatey(0);
  }
}
@keyframes vicp {
  0% {
    opacity: 0;
    -webkit-transform: scale(0) translatey(-60px);
    transform: scale(0) translatey(-60px);
  }
  100% {
    opacity: 1;
    -webkit-transform: scale(1) translatey(0);
    transform: scale(1) translatey(0);
  }
}
.vue-image-crop-upload {
  position: fixed;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  z-index: 10000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  -webkit-tap-highlight-color: transparent;
  -moz-tap-highlight-color: transparent;
}
.vue-image-crop-upload .vicp-wrap {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  position: fixed;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  z-index: 10000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 600px;
  height: 330px;
  padding: 25px;
  background-color: #fff;
  border-radius: 2px;
  -webkit-animation: vicp 0.12s ease-in;
  animation: vicp 0.12s ease-in;
}
.vue-image-crop-upload .vicp-wrap .vicp-close {
  position: absolute;
  right: -30px;
  top: -30px;
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4 {
  position: relative;
  display: block;
  width: 30px;
  height: 30px;
  cursor: pointer;
  -webkit-transition: -webkit-transform 0.18s;
  transition: -webkit-transform 0.18s;
  transition: transform 0.18s;
  transition: transform 0.18s, -webkit-transform 0.18s;
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::after,
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::before {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  content: "";
  position: absolute;
  top: 12px;
  left: 4px;
  width: 20px;
  height: 3px;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  background-color: #fff;
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::after {
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4:hover {
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area {
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 35px;
  height: 170px;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-icon1 {
  display: block;
  margin: 0 auto 6px;
  width: 42px;
  height: 42px;
  overflow: hidden;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step1
  .vicp-drop-area
  .vicp-icon1
  .vicp-icon1-arrow {
  display: block;
  margin: 0 auto;
  width: 0;
  height: 0;
  border-bottom: 14.7px solid rgba(0, 0, 0, 0.3);
  border-left: 14.7px solid transparent;
  border-right: 14.7px solid transparent;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step1
  .vicp-drop-area
  .vicp-icon1
  .vicp-icon1-body {
  display: block;
  width: 12.6px;
  height: 14.7px;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.3);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step1
  .vicp-drop-area
  .vicp-icon1
  .vicp-icon1-bottom {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: block;
  height: 12.6px;
  border: 6px solid rgba(0, 0, 0, 0.3);
  border-top: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-hint {
  display: block;
  padding: 15px;
  font-size: 14px;
  color: #666;
  line-height: 30px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step1
  .vicp-drop-area
  .vicp-no-supported-hint {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  padding: 30px;
  width: 100%;
  height: 60px;
  line-height: 30px;
  background-color: #eee;
  text-align: center;
  color: #666;
  font-size: 14px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area:hover {
  cursor: pointer;
  border-color: rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.05);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop {
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left {
  float: left;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-img-container {
  position: relative;
  display: block;
  width: 240px;
  height: 180px;
  background-color: #e5e5e0;
  overflow: hidden;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-img-container
  .vicp-img {
  position: absolute;
  display: block;
  cursor: move;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-img-container
  .vicp-img-shade {
  -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  position: absolute;
  background-color: rgba(241, 242, 243, 0.8);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-img-container
  .vicp-img-shade.vicp-img-shade-1 {
  top: 0;
  left: 0;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-img-container
  .vicp-img-shade.vicp-img-shade-2 {
  bottom: 0;
  right: 0;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-rotate {
  position: relative;
  width: 240px;
  height: 18px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-rotate
  i {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  line-height: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.08);
  color: #fff;
  overflow: hidden;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-rotate
  i:hover {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.14);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-rotate
  i:first-child {
  float: left;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-rotate
  i:last-child {
  float: right;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range {
  position: relative;
  margin: 30px 0 10px 0;
  width: 240px;
  height: 18px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon5,
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon6 {
  position: absolute;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.08);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon5:hover,
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon6:hover {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.14);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon5 {
  left: 0;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon5::before {
  position: absolute;
  content: "";
  display: block;
  left: 3px;
  top: 8px;
  width: 12px;
  height: 2px;
  background-color: #fff;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon6 {
  right: 0;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon6::before {
  position: absolute;
  content: "";
  display: block;
  left: 3px;
  top: 8px;
  width: 12px;
  height: 2px;
  background-color: #fff;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  .vicp-icon6::after {
  position: absolute;
  content: "";
  display: block;
  top: 3px;
  left: 8px;
  width: 2px;
  height: 12px;
  background-color: #fff;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"] {
  display: block;
  padding-top: 5px;
  margin: 0 auto;
  width: 180px;
  height: 8px;
  vertical-align: top;
  background: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  /* 滑块
               ---------------------------------------------------------------*/
  /* 轨道
               ---------------------------------------------------------------*/
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:focus {
  outline: none;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-webkit-slider-thumb {
  -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  -webkit-appearance: none;
  appearance: none;
  margin-top: -3px;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border-radius: 100%;
  border: none;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-moz-range-thumb {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  -moz-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border-radius: 100%;
  border: none;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-ms-thumb {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  appearance: none;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border: none;
  border-radius: 100%;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:active::-moz-range-thumb {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:active::-ms-thumb {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:active::-webkit-slider-thumb {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  margin-top: -4px;
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-webkit-slider-runnable-track {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 2px;
  border: none;
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-moz-range-track {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 2px;
  border: none;
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-ms-track {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
  height: 6px;
  border-radius: 2px;
  border: none;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-ms-fill-lower {
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]::-ms-fill-upper {
  background-color: rgba(68, 170, 119, 0.15);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:focus::-webkit-slider-runnable-track {
  background-color: rgba(68, 170, 119, 0.5);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:focus::-moz-range-track {
  background-color: rgba(68, 170, 119, 0.5);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:focus::-ms-fill-lower {
  background-color: rgba(68, 170, 119, 0.45);
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-left
  .vicp-range
  input[type="range"]:focus::-ms-fill-upper {
  background-color: rgba(68, 170, 119, 0.25);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right {
  float: right;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview {
  height: 150px;
  overflow: hidden;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview
  .vicp-preview-item {
  position: relative;
  padding: 5px;
  width: 100px;
  height: 100px;
  float: left;
  margin-right: 16px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview
  .vicp-preview-item
  span {
  position: absolute;
  bottom: -30px;
  width: 100%;
  font-size: 14px;
  color: #bbb;
  display: block;
  text-align: center;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview
  .vicp-preview-item
  img {
  position: absolute;
  display: block;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  padding: 3px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview
  .vicp-preview-item.vicp-preview-item-circle {
  margin-right: 0;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step2
  .vicp-crop
  .vicp-crop-right
  .vicp-preview
  .vicp-preview-item.vicp-preview-item-circle
  img {
  border-radius: 100%;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload {
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 35px;
  height: 170px;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  border: 1px dashed #ddd;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-loading {
  display: block;
  padding: 15px;
  font-size: 16px;
  color: #999;
  line-height: 30px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-progress-wrap {
  margin-top: 12px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step3
  .vicp-upload
  .vicp-progress-wrap
  .vicp-progress {
  position: relative;
  display: block;
  height: 5px;
  border-radius: 3px;
  background-color: #4a7;
  -webkit-box-shadow: 0 2px 6px 0 rgba(68, 170, 119, 0.3);
  box-shadow: 0 2px 6px 0 rgba(68, 170, 119, 0.3);
  -webkit-transition: width 0.15s linear;
  transition: width 0.15s linear;
  background-image: -webkit-linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  -webkit-animation: vicp_progress 0.5s linear infinite;
  animation: vicp_progress 0.5s linear infinite;
}
.vue-image-crop-upload
  .vicp-wrap
  .vicp-step3
  .vicp-upload
  .vicp-progress-wrap
  .vicp-progress::after {
  content: "";
  position: absolute;
  display: block;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  border: 1px solid rgba(245, 246, 247, 0.7);
  -webkit-box-shadow: 0 1px 4px 0 rgba(68, 170, 119, 0.7);
  box-shadow: 0 1px 4px 0 rgba(68, 170, 119, 0.7);
  border-radius: 100%;
  background-color: #4a7;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-error,
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-success {
  height: 100px;
  line-height: 100px;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate a {
  position: relative;
  float: left;
  display: block;
  margin-left: 10px;
  width: 100px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #4a7;
  border-radius: 2px;
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate a:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.vue-image-crop-upload .vicp-wrap .vicp-error,
.vue-image-crop-upload .vicp-wrap .vicp-success {
  display: block;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  color: #d10;
  text-align: center;
  vertical-align: top;
}
.vue-image-crop-upload .vicp-wrap .vicp-success {
  color: #4a7;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon3 {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  top: 4px;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon3::after {
  position: absolute;
  top: 3px;
  left: 6px;
  width: 6px;
  height: 10px;
  border-width: 0 2px 2px 0;
  border-color: #4a7;
  border-style: solid;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  content: "";
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2 {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  top: 4px;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2::after,
.vue-image-crop-upload .vicp-wrap .vicp-icon2::before {
  content: "";
  position: absolute;
  top: 9px;
  left: 4px;
  width: 13px;
  height: 2px;
  background-color: #d10;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2::after {
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.e-ripple {
  position: absolute;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.15);
  background-clip: padding-box;
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transform: scale(0);
  -ms-transform: scale(0);
  transform: scale(0);
  opacity: 1;
}
.e-ripple.z-active {
  opacity: 0;
  -webkit-transform: scale(2);
  -ms-transform: scale(2);
  transform: scale(2);
  -webkit-transition: opacity 1.2s ease-out, -webkit-transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, -webkit-transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, transform 0.6s ease-out,
    -webkit-transform 0.6s ease-out;
}
</style>
