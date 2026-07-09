<template>
  <div class="dropzone-deprecated">
    <el-alert
      title="Dropzone deprecated"
      type="warning"
      :closable="false"
      description="Dropzone is deprecated, use el-upload with drag instead."
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Dropzone' })
</script>

<style scoped>
.dropzone-deprecated {
  padding: 20px;
}
</style>
