<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useChartResize } from '@/composables/useChartResize'

defineOptions({ name: 'KeyboardChart' })

const props = withDefaults(defineProps<{
  className?: string
  width?: string
  height?: string
}>(), {
  className: 'chart',
  width: '200px',
  height: '200px'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

useChartResize(chartRef as any)

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  const xAxisData = []
  const data = []
  const data2 = []
  for (let i = 0; i < 50; i++) {
    xAxisData.push(i)
    data.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5)
    data2.push((Math.sin(i / 5) * (i / 5 + 10) + i / 6) * 3)
  }
  chart.setOption({
    backgroundColor: '#08263a',
    grid: {
      left: '5%',
      right: '5%'
    },
    xAxis: [{
      show: false,
      data: xAxisData
    }, {
      show: false,
      data: xAxisData
    }],
    visualMap: {
      show: false,
      min: 0,
      max: 50,
      dimension: 0,
      inRange: {
        color: ['#4a657a', '#308e92', '#b1cfa5', '#f5d69f', '#f5898b', '#ef5055']
      }
    },
    yAxis: {
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#4a657a'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#08263f'
        }
      },
      axisTick: {
        show: false
      }
    },
    series: [{
      name: 'back',
      type: 'bar',
      data: data2,
      z: 1,
      itemStyle: {
        opacity: 0.4,
        borderRadius: 5,
        shadowBlur: 3,
        shadowColor: '#111'
      }
    }, {
      name: 'Simulate Shadow',
      type: 'line',
      data,
      z: 2,
      showSymbol: false,
      animationDelay: 0,
      animationEasing: 'linear',
      animationDuration: 1200,
      lineStyle: {
        color: 'transparent'
      },
      areaStyle: {
        color: '#08263a',
        shadowBlur: 50,
        shadowColor: '#000'
      }
    }, {
      name: 'front',
      type: 'bar',
      data,
      xAxisIndex: 1,
      z: 3,
      itemStyle: {
        borderRadius: 5
      }
    }],
    animationEasing: 'elasticOut',
    animationEasingUpdate: 'elasticOut',
    animationDelay(idx: number) {
      return idx * 20
    },
    animationDelayUpdate(idx: number) {
      return idx * 20
    }
  })
}
</script>
