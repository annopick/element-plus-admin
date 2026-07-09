<template>
  <div :class="{'show':show}" class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-select
      ref="headerSearchSelectRef"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="Search"
      class="header-search-select"
      @change="change"
    >
      <el-option v-for="item in options" :key="item.path" :value="item" :label="item.title.join(' > ')" />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'
// fuse is a lightweight fuzzy-search module
// make search results more in line with expectations
import Fuse from 'fuse.js'
import path from '@/utils/path'
import { usePermissionStore } from '@/store/modules/permission'
import type { AppRouteRecord } from '@/router'

defineOptions({ name: 'HeaderSearch' })

interface SearchItem {
  path: string
  title: string[]
}

const router = useRouter()
const permissionStore = usePermissionStore()

const search = ref('')
const options = ref<SearchItem[]>([])
const searchPool = ref<SearchItem[]>([])
const show = ref(false)
const fuse = ref<Fuse<SearchItem> | undefined>(undefined)

const headerSearchSelectRef = ref<{ focus: () => void; blur: () => void } | null>(null)

const routes = computed<AppRouteRecord[]>(() => permissionStore.routes)

function click(): void {
  show.value = !show.value
  if (show.value) {
    headerSearchSelectRef.value && headerSearchSelectRef.value.focus()
  }
}

function close(): void {
  headerSearchSelectRef.value && headerSearchSelectRef.value.blur()
  options.value = []
  show.value = false
}

function change(val: SearchItem): void {
  router.push(val.path)
  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
  })
}

function initFuse(list: SearchItem[]): void {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [{
      name: 'title',
      weight: 0.7
    }, {
      name: 'path',
      weight: 0.3
    }]
  })
}

// Filter out the routes that can be displayed in the sidebar
// And generate the internationalized title
function generateRoutes(routes: AppRouteRecord[], basePath = '/', prefixTitle: string[] = []): SearchItem[] {
  let res: SearchItem[] = []

  for (const routerItem of routes) {
    // skip hidden router
    if (routerItem.hidden) { continue }

    const data: SearchItem = {
      path: path.resolve(basePath, routerItem.path),
      title: [...prefixTitle]
    }

    if (routerItem.meta && routerItem.meta.title) {
      data.title = [...data.title, routerItem.meta.title]

      if (routerItem.redirect !== 'noRedirect') {
        // only push the routes with title
        // special case: need to exclude parent router without redirect
        res.push(data)
      }
    }

    // recursive child routes
    if (routerItem.children) {
      const tempRoutes = generateRoutes(routerItem.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}

function querySearch(query: string): void {
  if (query !== '') {
    // fuse.js v6+ returns FuseResult<T>[] (objects with `.item`); unwrap to raw items
    options.value = fuse.value ? fuse.value.search(query).map(result => result.item) : []
  } else {
    options.value = []
  }
}

watch(routes, () => {
  searchPool.value = generateRoutes(routes.value)
})

watch(searchPool, (list) => {
  initFuse(list)
})

watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})

onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    :deep(.el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
