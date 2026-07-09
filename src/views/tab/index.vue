<template>
  <div class="tab-container">
    <el-tag>mounted times ：{{ createdTimes }}</el-tag>
    <el-alert :closable="false" style="width:200px;display:inline-block;vertical-align: middle;margin-left:30px;" title="Tab with keep-alive" type="success" />
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card">
      <el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
        <keep-alive>
          <tab-pane v-if="activeName===item.key" :type="item.key" @create="showCreatedTimes" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabPane from './components/TabPane.vue'

defineOptions({ name: 'Tab' })

const route = useRoute()
const router = useRouter()

const tabMapOptions = [
  { label: 'China', key: 'CN' },
  { label: 'USA', key: 'US' },
  { label: 'Japan', key: 'JP' },
  { label: 'Eurozone', key: 'EU' }
]
const activeName = ref('CN')
const createdTimes = ref(0)

watch(activeName, (val) => {
  router.push(`${route.path}?tab=${val}`)
})

// init the default selected tab
const tab = route.query.tab
if (tab) {
  activeName.value = tab as string
}

function showCreatedTimes() {
  createdTimes.value = createdTimes.value + 1
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
