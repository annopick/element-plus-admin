<template>
  <el-color-picker
    v-model="theme"
    :predefine="['#409EFF', '#1890ff', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'

const emit = defineEmits<{ (e: 'change', val: string): void }>()

const settingsStore = useSettingsStore()
const theme = ref(settingsStore.theme)

watch(theme, (val) => {
  if (!val) return
  // Persist to settings store
  settingsStore.changeSetting({ key: 'theme', value: val })
  // Apply Element Plus CSS variables
  applyTheme(val)
  // Notify listeners (e.g. Settings panel)
  emit('change', val)
})

function applyTheme(primary: string) {
  const el = document.documentElement
  el.style.setProperty('--el-color-primary', primary)
  // Generate derived colors (light-3/5/7/8/9 for hover/disabled states, dark-2 for active)
  const derived: Record<string, string> = {
    '--el-color-primary-light-3': mixColor(primary, '#ffffff', 0.3),
    '--el-color-primary-light-5': mixColor(primary, '#ffffff', 0.5),
    '--el-color-primary-light-7': mixColor(primary, '#ffffff', 0.7),
    '--el-color-primary-light-8': mixColor(primary, '#ffffff', 0.8),
    '--el-color-primary-light-9': mixColor(primary, '#ffffff', 0.9),
    '--el-color-primary-dark-2': mixColor(primary, '#000000', 0.2)
  }
  Object.entries(derived).forEach(([name, color]) => {
    el.style.setProperty(name, color)
  })
}

// Mix two hex colors. weight is the proportion of the second color (0 = all first, 1 = all second)
function mixColor(color1: string, color2: string, weight: number): string {
  const hex2rgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '')
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    ]
  }
  const rgb2hex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
  const [r1, g1, b1] = hex2rgb(color1)
  const [r2, g2, b2] = hex2rgb(color2)
  return rgb2hex(
    r1 + (r2 - r1) * weight,
    g1 + (g2 - g1) * weight,
    b1 + (b2 - b1) * weight
  )
}
</script>

<style>
.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}
.theme-picker-dropdown {
  /* The Settings panel (RightPanel) is teleported to body with z-index 40000
     and its fullscreen backdrop is at 20000. The color-picker popper is also
     teleported to body, so it needs a higher z-index to sit above the panel. */
  z-index: 99999 !important;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
