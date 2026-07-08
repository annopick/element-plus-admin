<template>
  <el-scrollbar ref="scrollContainer" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type ElScrollbar from 'element-plus/es/components/scrollbar/index'

const emit = defineEmits<{(e: 'scroll'): void}>()

const tagAndTagSpacing = 4 // tagAndTagSpacing

const scrollContainer = ref<InstanceType<typeof ElScrollbar>>()

const scrollWrapper = computed<HTMLElement | undefined>(() => {
  // ElScrollbar exposes its inner wrap element via $refs.wrap
  return (scrollContainer.value as any)?.wrapRef as HTMLElement | undefined
})

function handleScroll(e: WheelEvent) {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  if ($scrollWrapper) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
  }
}

function emitScroll() {
  emit('scroll')
}

/**
 * Move the scroll position so that the current tag is visible.
 * In Vue2 this read `this.$parent.$refs.tag` (an array of router-link
 * component instances). That coupling is broken in Vue3, so the parent
 * TagsView now passes the current tag DOM element and the full ordered
 * list of tag DOM elements directly.
 */
function moveToTarget(currentTag: HTMLElement, tagList: HTMLElement[]) {
  const $container = (scrollContainer.value as any)?.$el as HTMLElement | undefined
  const $scrollWrapper = scrollWrapper.value
  if (!$container || !$scrollWrapper) return

  const $containerWidth = $container.offsetWidth

  let firstTag: HTMLElement | null = null
  let lastTag: HTMLElement | null = null

  // find first tag and last tag
  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    // find preTag and nextTag
    const currentIndex = tagList.findIndex(item => item === currentTag)
    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing

    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}

onMounted(() => {
  scrollWrapper.value?.addEventListener('scroll', emitScroll, true)
})

onBeforeUnmount(() => {
  scrollWrapper.value?.removeEventListener('scroll', emitScroll)
})

defineExpose({ moveToTarget })
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep() {
    .el-scrollbar__bar {
      bottom: 0px;
    }
    .el-scrollbar__wrap {
      height: 49px;
    }
  }
}
</style>
