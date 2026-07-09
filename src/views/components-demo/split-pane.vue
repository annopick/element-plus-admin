<template>
  <div class="components-container">
    <aside><strong>SplitPane</strong> If you've used
      <a href="https://codepen.io/" target="_blank"> codepen</a>,
      <a href="https://jsfiddle.net/" target="_blank"> jsfiddle </a>will not be unfamiliar.
      <a href="https://github.com/antoniandre/splitpanes" target="_blank"> Github repository</a>
    </aside>
    <splitpanes vertical @resize="resize">
      <pane min-size="20">
        <div class="left-container" />
      </pane>
      <pane min-size="20">
        <splitpanes horizontal>
          <pane><div class="top-container" /></pane>
          <pane><div class="bottom-container" /></pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

defineOptions({ name: 'SplitpaneDemo' })

function resize() {
  console.log('resize')
}
</script>

<style scoped>
  .components-container {
    position: relative;
    height: 100vh;
  }

  .left-container {
    background-color: #F38181;
    height: 100%;
  }

  .right-container {
    background-color: #FCE38A;
    height: 200px;
  }

  .top-container {
    background-color: #FCE38A;
    width: 100%;
    height: 100%;
  }

  .bottom-container {
    width: 100%;
    background-color: #95E1D3;
    height: 100%;
  }
</style>
