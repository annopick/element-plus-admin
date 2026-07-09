<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useChartResize } from '@/composables/useChartResize'

defineOptions({ name: 'LineChart' })

const props = withDefaults(defineProps<{
  className?: string
  width?: string
  height?: string
  autoResize?: boolean
  chartData?: { expectedData: number[]; actualData: number[] }
}>(), {
  className: 'chart',
  width: '100%',
  height: '350px',
  autoResize: true
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

useChartResize(chartRef as any)

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})

watch(() => props.chartData, (val) => {
  if (val) setOptions(val)
}, { deep: true })

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  if (props.chartData) setOptions(props.chartData)
}

function setOptions({ expectedData, actualData }: { expectedData: number[]; actualData: number[] } = { expectedData: [], actualData: [] }) {
  if (!chart) return
  chart.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: {
        show: false
      }
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 20,
      top: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      padding: [5, 10]
    },
    yAxis: {
      axisTick: {
        show: false
      }
    },
    legend: {
      data: ['expected', 'actual']
    },
    series: [{
      name: 'expected',
      itemStyle: {
        color: '#FF005A'
      },
      lineStyle: {
        color: '#FF005A',
        width: 2
      },
      smooth: true,
      type: 'line',
      data: expectedData,
      animationDuration: 2800,
      animationEasing: 'cubicInOut'
    },
    {
      name: 'actual',
      smooth: true,
      type: 'line',
      itemStyle: {
        color: '#3888fa'
      },
      lineStyle: {
        color: '#3888fa',
        width: 2
      },
      areaStyle: {
        color: '#f3f8ff'
      },
      data: actualData,
      animationDuration: 2800,
      animationEasing: 'quadraticOut'
    }]
  })
}
</script>
