<template>
  <article-detail :is-edit="true" />
</template>

<script setup lang="ts">
import ArticleDetail from './components/ArticleDetail.vue'

defineOptions({ name: 'EditForm' })
</script>
