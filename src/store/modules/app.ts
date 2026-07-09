import { defineStore } from 'pinia'
import { ref } from 'vue'
import Cookies from 'js-cookie'

export interface ISidebar {
  opened: boolean
  withoutAnimation: boolean
}

export const useAppStore = defineStore('app', () => {
  const sidebar = ref<ISidebar>({
    opened: Cookies.get('sidebarStatus') ? !!Number(Cookies.get('sidebarStatus')) : true,
    withoutAnimation: false
  })
  const device = ref<'desktop' | 'mobile'>('desktop')
  // Element Plus default size is 'default' (Element UI's was 'medium')
  const size = ref<string>(Cookies.get('size') || 'default')

  function toggleSideBar() {
    sidebar.value.opened = !sidebar.value.opened
    sidebar.value.withoutAnimation = false
    Cookies.set('sidebarStatus', sidebar.value.opened ? '1' : '0')
  }
  function closeSideBar({ withoutAnimation }: { withoutAnimation: boolean }) {
    Cookies.set('sidebarStatus', '0')
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
  }
  function toggleDevice(val: 'desktop' | 'mobile') {
    device.value = val
  }
  function setSize(val: string) {
    size.value = val
    Cookies.set('size', val)
  }

  return { sidebar, device, size, toggleSideBar, closeSideBar, toggleDevice, setSize }
})
