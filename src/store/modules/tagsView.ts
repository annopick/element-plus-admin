import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagView {
  name?: string
  path: string
  fullPath?: string
  title?: string
  meta?: { title?: string; affix?: boolean; noCache?: boolean }
  matched?: any[]
  query?: any
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addView(view: TagView) {
    addVisitedView(view)
    addCachedView(view)
  }
  function addVisitedView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push({ ...view, title: view.meta?.title || 'no-name' })
    return [...visitedViews.value]
  }
  function addCachedView(view: TagView) {
    const name = view.name
    if (!name) return
    if (cachedViews.value.includes(name)) return
    if (!view.meta?.noCache) cachedViews.value.push(name)
  }

  function delView(view: TagView) {
    return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
      delVisitedView(view)
      delCachedView(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value]
      })
    })
  }
  function delVisitedView(view: TagView) {
    return new Promise<TagView[]>((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1)
          break
        }
      }
      resolve([...visitedViews.value])
    })
  }
  function delCachedView(view: TagView) {
    return new Promise<string[]>((resolve) => {
      const name = view.name
      if (name) {
        const index = cachedViews.value.indexOf(name)
        index > -1 && cachedViews.value.splice(index, 1)
      }
      resolve([...cachedViews.value])
    })
  }

  function delOthersViews(view: TagView) {
    return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
      delOthersVisitedView(view)
      delOthersCachedView(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value]
      })
    })
  }
  function delOthersVisitedView(view: TagView) {
    return new Promise<TagView[]>((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => v.meta?.affix || v.path === view.path)
      resolve([...visitedViews.value])
    })
  }
  function delOthersCachedView(view: TagView) {
    return new Promise<string[]>((resolve) => {
      const name = view.name
      const index = name ? cachedViews.value.indexOf(name) : -1
      cachedViews.value = index > -1 ? cachedViews.value.slice(index, index + 1) : []
      resolve([...cachedViews.value])
    })
  }

  function delAllViews() {
    return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
      delAllVisitedViews()
      delAllCachedViews()
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value]
      })
    })
  }
  function delAllVisitedViews() {
    return new Promise<TagView[]>((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix)
      visitedViews.value = affixTags
      resolve([...visitedViews.value])
    })
  }
  function delAllCachedViews() {
    return new Promise<string[]>((resolve) => {
      cachedViews.value = []
      resolve([...cachedViews.value])
    })
  }

  function updateVisitedView(view: TagView) {
    for (let i = 0; i < visitedViews.value.length; i++) {
      if (visitedViews.value[i].path === view.path) {
        visitedViews.value[i] = Object.assign({}, visitedViews.value[i], view)
        break
      }
    }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delCachedView,
    delOthersViews,
    delOthersVisitedView,
    delOthersCachedView,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    updateVisitedView
  }
})
