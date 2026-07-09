import type { App } from 'vue'
import { useErrorLogStore } from '@/store/modules/errorLog'

// you can set in settings.js
// errorLog:'production' | ['production', 'development']
// Vue 3's app.config.errorHandler replaces Vue 2's Vue.config.errorHandler.
export function setupErrorLog(app: App) {
  app.config.errorHandler = (err, vm, info) => {
    const errorLogStore = useErrorLogStore()
    errorLogStore.addErrorLog({
      err: err as Error,
      vm: vm as any,
      info,
      url: window.location.href
    })
    console.error(err, info)
  }
}
