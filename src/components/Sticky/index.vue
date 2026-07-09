<template>
  <div ref="rootRef" :style="{ height: (height ?? 0) + 'px', zIndex: zIndex }">
    <div
      :class="className"
      :style="stickyStyle"
    >
      <slot>
        <div>sticky</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'Sticky' })

const props = withDefaults(defineProps<{
  stickyTop?: number
  zIndex?: number
  className?: string
}>(), {
  stickyTop: 0,
  zIndex: 1,
  className: ''
})

const rootRef = ref<HTMLElement | null>(null)

const active = ref(false)
const position = ref('')
const width = ref<string | number | undefined>(undefined)
const height = ref<number | undefined>(undefined)
const isSticky = ref(false)

const stickyStyle = computed(() => {
  const base: Record<string, string | number> = {
    top: isSticky.value ? props.stickyTop + 'px' : '',
    zIndex: props.zIndex,
    width: width.value === undefined ? '' : String(width.value),
    height: (height.value ?? 0) + 'px'
  }
  if (position.value) {
    base.position = position.value
  }
  return base
})

function sticky() {
  if (active.value) {
    return
  }
  position.value = 'fixed'
  active.value = true
  width.value = (width.value || 0) + 'px'
  isSticky.value = true
}

function reset() {
  position.value = ''
  width.value = 'auto'
  active.value = false
  isSticky.value = false
}

function handleReset() {
  if (!active.value) {
    return
  }
  reset()
}

function handleScroll() {
  const el = rootRef.value
  if (!el) return
  const w = el.getBoundingClientRect().width
  width.value = w || 'auto'
  const offsetTop = el.getBoundingClientRect().top
  if (offsetTop < props.stickyTop) {
    sticky()
    return
  }
  handleReset()
}

function handleResize() {
  const el = rootRef.value
  if (!el) return
  if (isSticky.value) {
    width.value = el.getBoundingClientRect().width + 'px'
  }
}

onMounted(() => {
  const el = rootRef.value
  if (el) {
    height.value = el.getBoundingClientRect().height
  }
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
})

onActivated(() => {
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>
