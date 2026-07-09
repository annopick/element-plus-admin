<template>
  <div>
    <!--error code-->
    {{ a.a }}
    <!--error code-->
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorTestA' })

// Deliberately undefined: accessing `a.a` in the template throws a TypeError
// at render time, which the app errorHandler (setupErrorLog) catches.
// Typed as `any` only to satisfy vue-tsc; the value stays undefined.
const a: any = undefined
</script>
