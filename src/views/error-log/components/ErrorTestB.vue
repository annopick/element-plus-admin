<template>
  <div />
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorTestB' })

// Deliberately throws during component creation to exercise the app
// errorHandler. Mirrors the original `created() { this.b = b }`, which raised
// a ReferenceError because `b` was never declared.
throw new Error('b is not defined') // eslint-disable-line
</script>
