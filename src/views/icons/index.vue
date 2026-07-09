<template>
  <div class="icons-container">
    <aside>
      <a href="https://panjiachen.github.io/vue-element-admin-site/guide/advanced/icon.html" target="_blank">Add and use
      </a>
    </aside>
    <el-tabs type="border-card">
      <el-tab-pane label="Icons">
        <div class="grid">
          <div v-for="item of svgIcons" :key="item" @click="handleClipboard(generateIconCode(item), $event)">
            <el-tooltip placement="top">
              <template #content>
                {{ generateIconCode(item) }}
              </template>
              <div class="icon-item">
                <svg-icon :icon-class="item" class-name="disabled" />
                <span>{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-Plus Icons">
        <div class="grid">
          <div v-for="item of elementIcons" :key="item" @click="handleClipboard(generateElementIconCode(item), $event)">
            <el-tooltip placement="top">
              <template #content>
                {{ generateElementIconCode(item) }}
              </template>
              <div class="icon-item">
                <el-icon>
                  <component :is="item" />
                </el-icon>
                <span>{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import clip from '@/utils/clipboard'

defineOptions({ name: 'Icons' })

// SVG icons are registered via vite-plugin-svg-icons (iconDirs: src/icons/svg).
// Collect their names by globbing the same directory; the symbolId pattern is
// `icon-[name]`, so svg-icon matches by the bare file name (without extension).
const modules = import.meta.glob('@/icons/svg/*.svg')
const svgIcons = Object.keys(modules).map(path => path.match(/\/([^/]+)\.svg$/)![1])

// Element Plus icon components, registered globally in main.ts.
const elementIcons = Object.keys(ElementPlusIconsVue)

function generateIconCode(symbol: string) {
  return `<svg-icon icon-class="${symbol}" />`
}

function generateElementIconCode(symbol: string) {
  return `<el-icon><${symbol} /></el-icon>`
}

function handleClipboard(text: string, event: MouseEvent) {
  clip(text, event)
}
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .icon-item {
    margin: 20px;
    height: 85px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
