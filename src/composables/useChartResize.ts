import { onMounted, onBeforeUnmount, onActivated, onDeactivated, type Ref } from 'vue'
import { debounce } from '@/utils'

// Replaces src/components/Charts/mixins/resize.js.
// Phase 4 will flesh out the full echarts resize logic. For now this provides
// the resize-listener scaffolding (window resize + sidebar transitionend).
export function useChartResize(chartRef: Ref<any>) {
  let resizeHandler: (() => void) | null = null
  let sidebarElm: Element | null = null

  const sidebarResizeHandler = (e: TransitionEvent): void => {
    if (e.propertyName === 'width') {
      resizeHandler?.()
    }
  }

  const resize = (): void => {
    const chart = chartRef.value
    chart && chart.resize()
  }

  const initListener = (): void => {
    resizeHandler = debounce(resize, 100) as () => void
    window.addEventListener('resize', resizeHandler)
    sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    sidebarElm?.addEventListener('transitionend', sidebarResizeHandler as EventListener)
  }

  const destroyListener = (): void => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    resizeHandler = null
    sidebarElm?.removeEventListener('transitionend', sidebarResizeHandler as EventListener)
  }

  onMounted(initListener)
  onActivated(() => {
    if (!resizeHandler) {
      initListener()
    }
    // when keep-alive chart is activated, auto resize
    resize()
  })
  onBeforeUnmount(destroyListener)
  onDeactivated(destroyListener)
}
