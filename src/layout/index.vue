<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebarOpened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import RightPanel from '@/components/RightPanel/index.vue'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import { useResizeHandler } from '@/composables/useResizeHandler'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

// Replaces the former ResizeMixin (src/layout/mixin/ResizeHandler.js) — handles
// window resize / device toggling only.
useResizeHandler()

// NOTE: this const must not be named `sidebar` — in <script setup> a top-level
// binding named `sidebar` would shadow the imported `Sidebar` component in the
// template (`<sidebar class="sidebar-container" />`), so Vue would render the
// ref object instead of the component and the sidebar would silently vanish.
const sidebarOpened = computed(() => appStore.sidebar.opened)
const sidebarWithoutAnimation = computed(() => appStore.sidebar.withoutAnimation)
const device = computed(() => appStore.device)
const showSettings = computed(() => settingsStore.showSettings)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => {
  return {
    hideSidebar: !sidebarOpened.value,
    openSidebar: sidebarOpened.value,
    withoutAnimation: sidebarWithoutAnimation.value,
    mobile: device.value === 'mobile'
  }
})

// The original ResizeMixin also watched `$route` to close the sidebar on mobile
// navigation. That responsibility moves here since useResizeHandler is scoped
// to window resize only.
watch(route, () => {
  if (appStore.device === 'mobile' && appStore.sidebar.opened) {
    appStore.closeSideBar({ withoutAnimation: false })
  }
})

function handleClickOutside() {
  appStore.closeSideBar({ withoutAnimation: false })
}
</script>

<style lang="scss" scoped>
  @import "@/styles/mixin.scss";
  @import "@/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
