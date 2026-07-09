<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router'
import { compile } from 'path-to-regexp'

defineOptions({ name: 'Breadcrumb' })

const route = useRoute()
const router = useRouter()

const levelList = ref<RouteLocationMatched[]>([])

function isDashboard(routeItem: RouteLocationMatched | undefined): boolean {
  const name = routeItem && routeItem.name
  if (!name) {
    return false
  }
  return String(name).trim().toLocaleLowerCase() === 'dashboard'
}

function getBreadcrumb(): void {
  // only show routes with meta.title
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]

  if (!isDashboard(first)) {
    matched = [{ path: '/dashboard', meta: { title: 'Dashboard' } } as unknown as RouteLocationMatched].concat(matched)
  }

  levelList.value = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
}

function pathCompile(path: string): string {
  // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
  const { params } = route
  const toPath = compile(path)
  return toPath(params as Record<string, string>)
}

function handleLink(item: RouteLocationMatched): void {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect as string)
    return
  }
  router.push(pathCompile(path))
}

watch(() => route.path, (path) => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (path.startsWith('/redirect/')) {
    return
  }
  getBreadcrumb()
})

getBreadcrumb()
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
