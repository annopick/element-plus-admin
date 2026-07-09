<template>
  <div class="createPost-container">
    <el-form ref="postFormRef" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <CommentDropdown v-model="postForm.comment_disabled" />
        <PlatformDropdown v-model="postForm.platforms" />
        <SourceUrlDropdown v-model="postForm.source_uri" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          Publish
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          Draft
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <Warning />

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                Title
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="Author:" class="postInfo-container-item">
                    <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable default-first-option remote placeholder="Search user">
                      <el-option v-for="(item,index) in userListOptions" :key="item+index" :label="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="120px" label="Publish Time:" class="postInfo-container-item">
                    <el-date-picker v-model="displayTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" placeholder="Select date and time" />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label-width="90px" label="Importance:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="Summary:">
          <el-input v-model="postForm.content_short" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="400" />
        </el-form-item>

        <el-form-item prop="image_uri" style="margin-bottom: 30px;">
          <Upload v-model="postForm.image_uri" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElNotification } from 'element-plus'
import { useRoute } from 'vue-router'
import Tinymce from '@/components/Tinymce/index.vue'
import Upload from '@/components/Upload/SingleImage3.vue'
import MDinput from '@/components/MDinput/index.vue'
import Sticky from '@/components/Sticky/index.vue'
import { validURL } from '@/utils/validate'
import { fetchArticle } from '@/api/article'
import { searchUser } from '@/api/remote-search'
import Warning from './Warning.vue'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown/index'
import { useTagsViewStore } from '@/store/modules/tagsView'

defineOptions({ name: 'ArticleDetail' })

const props = withDefaults(defineProps<{
  isEdit?: boolean
}>(), {
  isEdit: false
})

const route = useRoute()
const tagsViewStore = useTagsViewStore()

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  content_short: '', // 文章摘要
  source_uri: '', // 文章外链
  image_uri: '', // 文章图片
  display_time: undefined as Date | string | undefined, // 前台展示时间
  id: undefined as number | undefined,
  author: undefined as string | undefined, // 文章作者
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0
}

const validateRequire = (rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value === '') {
    ElMessage({
      message: (rule as any)?.field + '为必传项',
      type: 'error'
    })
    callback(new Error((rule as any)?.field + '为必传项'))
  } else {
    callback()
  }
}
const validateSourceUri = (rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value) {
    if (validURL(value)) {
      callback()
    } else {
      ElMessage({
        message: '外链url填写不正确',
        type: 'error'
      })
      callback(new Error('外链url填写不正确'))
    }
  } else {
    callback()
  }
}

const postFormRef = ref<FormInstance>()
const editor = ref()
const loading = ref(false)
const userListOptions = ref<string[]>([])
const rules = reactive({
  image_uri: [{ validator: validateRequire }],
  title: [{ validator: validateRequire }],
  content: [{ validator: validateRequire }],
  source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
})
// copy of route so title updates aren't lost when quickly switching tags
const tempRoute = ref<any>({})

const postForm = reactive({ ...defaultForm })

const contentShortLength = computed(() => postForm.content_short.length)

const displayTime = computed<number | Date>({
  // set and get is useful when the data
  // returned by the back end api is different from the front end
  // back end return => "2013-06-25 06:59:25"
  // front end need timestamp => 1372114765000
  get() {
    return (+new Date(postForm.display_time as string | Date))
  },
  set(val) {
    postForm.display_time = new Date(val)
  }
})

function fetchData(id: number) {
  fetchArticle(id).then(response => {
    Object.assign(postForm, response.data)

    // just for test
    postForm.title += `   Article Id:${postForm.id}`
    postForm.content_short += `   Article Id:${postForm.id}`

    // set tagsview title
    setTagsViewTitle()

    // set page title
    setPageTitle()
  }).catch(err => {
    console.log(err)
  })
}
function setTagsViewTitle() {
  const title = 'Edit Article'
  const newRoute = Object.assign({}, tempRoute.value, { title: `${title}-${postForm.id}` })
  tagsViewStore.updateVisitedView(newRoute)
}
function setPageTitle() {
  const title = 'Edit Article'
  document.title = `${title} - ${postForm.id}`
}
function submitForm() {
  console.log(postForm)
  postFormRef.value?.validate(valid => {
    if (valid) {
      loading.value = true
      ElNotification({
        title: '成功',
        message: '发布文章成功',
        type: 'success',
        duration: 2000
      })
      postForm.status = 'published'
      loading.value = false
    } else {
      console.log('error submit!!')
    }
  })
}
function draftForm() {
  if (postForm.content.length === 0 || postForm.title.length === 0) {
    ElMessage({
      message: '请填写必要的标题和内容',
      type: 'warning'
    })
    return
  }
  ElMessage({
    message: '保存成功',
    type: 'success',
    showClose: true,
    duration: 1000
  })
  postForm.status = 'draft'
}
function getRemoteUserList(query: string) {
  searchUser(query).then(response => {
    if (!response.data.items) return
    userListOptions.value = response.data.items.map((v: any) => v.name)
  })
}

if (props.isEdit) {
  const id = route.params && route.params.id
  fetchData(id as unknown as number)
}

// Why need to make a copy of this.$route here?
// Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
// https://github.com/PanJiaChen/vue-element-admin/issues/1221
tempRoute.value = Object.assign({}, route)
</script>

<style lang="scss" scoped>
@import "@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea :deep() {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
