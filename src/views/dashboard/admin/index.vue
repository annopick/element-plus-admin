<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <panel-group @handle-set-line-chart-data="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <!-- TODO Phase 4: LineChart (echarts 5) -->
      <div class="chart-placeholder">
        <div class="placeholder-box">
          Line Chart (Phase 4)
          <div v-if="currentChartData" class="placeholder-data">
            expected: {{ currentChartData.expectedData.join(', ') }}<br>
            actual: {{ currentChartData.actualData.join(', ') }}
          </div>
        </div>
      </div>
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- TODO Phase 4: RaddarChart (echarts 5) -->
          <div class="chart-placeholder"><div class="placeholder-box">Raddar Chart (Phase 4)</div></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- TODO Phase 4: PieChart (echarts 5) -->
          <div class="chart-placeholder"><div class="placeholder-box">Pie Chart (Phase 4)</div></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- TODO Phase 4: BarChart (echarts 5) -->
          <div class="chart-placeholder"><div class="placeholder-box">Bar Chart (Phase 4)</div></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{ span: 24 }" :sm="{ span: 24 }" :md="{ span: 24 }" :lg="{ span: 12 }" :xl="{ span: 12 }" style="padding-right:8px;margin-bottom:30px;">
        <!-- TODO Phase 2+: TransactionTable -->
        <div class="chart-placeholder"><div class="placeholder-box">Transaction Table (Phase 2+)</div></div>
      </el-col>
      <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }" style="margin-bottom:30px;">
        <!-- TODO Phase 2+: TodoList -->
        <div class="chart-placeholder"><div class="placeholder-box">Todo List (Phase 2+)</div></div>
      </el-col>
      <el-col :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 12 }" :lg="{ span: 6 }" :xl="{ span: 6 }" style="margin-bottom:30px;">
        <!-- TODO Phase 2+: BoxCard -->
        <div class="chart-placeholder"><div class="placeholder-box">Box Card (Phase 2+)</div></div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GithubCorner from '@/components/GithubCorner/index.vue'
import PanelGroup from './components/PanelGroup.vue'

defineOptions({ name: 'DashboardAdmin' })

interface LineChartData {
  expectedData: number[]
  actualData: number[]
}

const lineChartData: Record<string, LineChartData> = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

const currentChartData = ref<LineChartData>(lineChartData.newVisitis)

function handleSetLineChartData(type: string) {
  currentChartData.value = lineChartData[type]
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .chart-placeholder {
    background: #fff;
    min-height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-box {
    color: #999;
    text-align: center;
    width: 100%;
  }

  .placeholder-data {
    margin-top: 12px;
    font-size: 12px;
    color: #bbb;
    line-height: 1.6;
    word-break: break-all;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
