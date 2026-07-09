import type { ECharts } from 'echarts'
import { onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
import { debounce } from '@/utils'

// Replaces src/components/Charts/mixins/resize.js.
//
// The composable wires up window `resize` and sidebar `transitionend` listeners
// and forwards them to the chart instance's `resize()` method. Callers pass a
// getter that returns the echarts instance (not the DOM element ref), because
// the instance is created lazily inside `onMounted` and may be `null` until
// then, and `HTMLElement` has no `resize` method.
//
//   const chartRef = ref<HTMLElement>()
//   let chart: ECharts | null = null
//   useChartResize(() => chart)
export function useChartResize(getChart: () => ECharts | null) {
  let resizeHandler: (() => void) | null = null
  let sidebarElm: Element | null = null

  const sidebarResizeHandler = (e: TransitionEvent): void => {
    if (e.propertyName === 'width') {
      resizeHandler?.()
    }
  }

  const resize = (): void => {
    const chart = getChart()
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
