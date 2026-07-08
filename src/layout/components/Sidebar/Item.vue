<template>
  <span v-if="icon">
    <component :is="icon" v-if="icon.includes('el-icon')" class="sub-el-icon" />
    <svg-icon v-else :icon-class="icon" />
  </span>
  <template v-if="title"><span>{{ title }}</span></template>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title?: string }>(), { icon: '', title: '' })
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
