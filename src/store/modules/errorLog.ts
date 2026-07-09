import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

export interface ErrorLogEntry {
  err: Error
  // Vue 3's app.config.errorHandler passes (err, instance, info) — instance is ComponentPublicInstance | null
  vm: ComponentPublicInstance | null
  info: string
  // url is caller-supplied (from window.location.href), NOT provided by Vue 3's errorHandler
  url: string
}

export const useErrorLogStore = defineStore('errorLog', () => {
  const logs = ref<ErrorLogEntry[]>([])

  function addErrorLog(log: ErrorLogEntry) {
    logs.value.push(log)
  }
  function clearErrorLog() {
    logs.value.splice(0)
  }

  return { logs, addErrorLog, clearErrorLog }
})
