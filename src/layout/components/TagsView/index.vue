<template>
  <div id="tags-view-container" ref="tagsViewContainer" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        ref="tagRefs"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query }"
        custom
        v-slot="{ navigate }"
      >
        <span
          class="tags-view-item"
          @click="navigate"
          @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          @contextmenu.prevent="openMenu(tag, $event)"
        >
          {{ tag.title }}
          <el-icon v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"><Close /></el-icon>
        </span>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left: left + 'px', top: top + 'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">Refresh</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">Close</li>
      <li @click="closeOthersTags">Close Others</li>
      <li @click="closeAllTags(selectedTag)">Close All</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import path from 'path'
import ScrollPane from './ScrollPane.vue'
import { useTagsViewStore, type TagView } from '@/store/modules/tagsView'
import { usePermissionStore } from '@/store/modules/permission'
import type { AppRouteRecord } from '@/router'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const permissionStore = usePermissionStore()

const scrollPane = ref<InstanceType<typeof ScrollPane>>()
const tagsViewContainer = ref<HTMLElement>()

// In Vue3, a ref on a v-for collects component instances into an array when
// using a function ref. router-link with `custom` renders its slot content
// (a <span> here), so the ref lands on the router-link instance whose $el is
// the rendered span. We capture the DOM elements on demand in moveToCurrentTag.
const tagRefs = ref<any[]>([])

const visible = ref(false)
const top = ref(0)
const left = ref(0)
// Holds the tag the context menu is acting on. Initialized empty until the
// first right-click populates it; cast because TagView.path is required but
// no tag is selected initially.
const selectedTag = ref<TagView>({} as TagView)
const affixTags = ref<TagView[]>([])

const visitedViews = computed(() => tagsViewStore.visitedViews)
const routes = computed(() => permissionStore.routes)

watch(route, () => {
  addTags()
  moveToCurrentTag()
})

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  initTags()
  addTags()
})

function isActive(r: TagView): boolean {
  return r.path === route.path
}

function isAffix(tag: TagView): boolean {
  return !!(tag.meta && tag.meta.affix)
}

function filterAffixTags(routes: AppRouteRecord[], basePath = '/'): TagView[] {
  let tags: TagView[] = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = path.resolve(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name as string | undefined,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

function initTags() {
  const tags = affixTags.value = filterAffixTags(routes.value)
  for (const tag of tags) {
    // Must have tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

function addTags() {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route as unknown as TagView)
  }
  return false
}

function moveToCurrentTag() {
  const tags = tagRefs.value
  nextTick(() => {
    for (const tag of tags) {
      // router-link instance exposes `to` (the resolved route location)
      const tagEl: HTMLElement = tag.$el || tag
      const to = tag.to
      if (to && to.path === route.path) {
        const currentTagEl = tagEl
        // Build the full ordered list of tag DOM elements for ScrollPane.
        const tagEls = tags.map(t => (t.$el || t) as HTMLElement)
        scrollPane.value?.moveToTarget(currentTagEl, tagEls)
        // when query is different then update
        if (to.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route as unknown as TagView)
        }
        break
      }
    }
  })
}

function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view).then(() => {
    const { fullPath } = view
    nextTick(() => {
      router.replace({
        path: '/redirect' + fullPath
      })
    })
  })
}

function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

function closeOthersTags() {
  router.push(selectedTag.value as any)
  tagsViewStore.delOthersViews(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    if (affixTags.value.some(tag => tag.path === view.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

function toLastView(visitedViews: TagView[], view: TagView) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath as string)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

function openMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105
  const offsetLeft = tagsViewContainer.value!.getBoundingClientRect().left // container margin left
  const offsetWidth = tagsViewContainer.value!.offsetWidth // container width
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const leftVal = e.clientX - offsetLeft + 15 // 15: margin right

  if (leftVal > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = leftVal
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

function closeMenu() {
  visible.value = false
}

function handleScroll() {
  closeMenu()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
