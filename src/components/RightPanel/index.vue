<template>
  <teleport to="body">
    <div :class="{show:show}" class="rightPanel-container">
      <div class="rightPanel-background" />
      <div class="rightPanel">
        <div class="handle-button" :style="{'top':buttonTop+'px','background-color':theme}" @click="show=!show">
          <el-icon>
            <component :is="show ? Close : Setting" />
          </el-icon>
        </div>
        <div class="rightPanel-items">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close, Setting } from '@element-plus/icons-vue'
import { addClass, removeClass } from '@/utils'
import { useSettingsStore } from '@/store/modules/settings'

defineOptions({ name: 'RightPanel' })

const props = withDefaults(defineProps<{
  clickNotClose?: boolean
  buttonTop?: number
}>(), {
  clickNotClose: false,
  buttonTop: 250
})

const settingsStore = useSettingsStore()

const show = ref(false)

const theme = computed(() => settingsStore.theme)

function addEventClick(): void {
  window.addEventListener('click', closeSidebar)
}

function closeSidebar(evt: MouseEvent): void {
  const target = evt.target as HTMLElement
  // Keep panel open when clicking inside the panel, or inside a popper/dropdown
  // that was spawned from the panel (e.g. ThemePicker's color-picker popper,
  // which Element Plus teleports to <body> — outside .rightPanel).
  const inPanel = target.closest('.rightPanel')
  const inPopper = target.closest('.el-popper') || target.closest('.el-color-dropdown')
  if (!inPanel && !inPopper) {
    show.value = false
    window.removeEventListener('click', closeSidebar)
  }
}

watch(show, (value) => {
  if (value && !props.clickNotClose) {
    addEventClick()
  }
  if (value) {
    addClass(document.body, 'showRightPanel')
  } else {
    removeClass(document.body, 'showRightPanel')
  }
})
</script>

<style>
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, .2);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
  transition: all .25s cubic-bezier(.7, .3, .1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 40000;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;

  i {
    font-size: 24px;
    line-height: 48px;
  }

  .el-icon {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
