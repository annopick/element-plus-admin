<template>
  <article-detail :is-edit="false" />
</template>

<script setup lang="ts">
import ArticleDetail from './components/ArticleDetail.vue'

defineOptions({ name: 'CreateArticle' })
</script>
