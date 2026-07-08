import { onBeforeMount, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/store/modules/app'

const WIDTH = 992 // refer to Bootstrap's responsive design

// Replaces src/layout/mixin/ResizeHandler.js.
// NOTE: the original mixin also watched `$route` to close the sidebar on mobile
// navigation. That route-watch logic moves into the layout component (Task 9),
// which calls this composable and adds `watch(route)` separately. Keep this
// composable focused on window resize only.
export function useResizeHandler() {
  const appStore = useAppStore()

  const isMobile = (): boolean => {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  const resizeHandler = (): void => {
    if (!document.hidden) {
      const mobile = isMobile()
      appStore.toggleDevice(mobile ? 'mobile' : 'desktop')
      if (mobile) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  // mounted equivalent: check initial mobile state
  if (typeof window !== 'undefined' && isMobile()) {
    appStore.toggleDevice('mobile')
    appStore.closeSideBar({ withoutAnimation: true })
  }
}
