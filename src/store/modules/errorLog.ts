import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ErrorLogEntry {
  err: Error
  vm: any
  info: string
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
