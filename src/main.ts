import { createApp } from 'vue'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'normalize.css/normalize.css'
import '@/styles/index.scss'

import App from './App.vue'
import router from './router'
import store from './store'
import { setupIcons } from './icons'
import { setupDirectives } from './directive'
import { setupErrorLog } from './utils/error-log'

import './permission'

// Front-end XHR mock for the GitHub Pages demo (no backend available there).
// Only enabled when VITE_APP_USE_FRONTEND_MOCK==='true' (set in .env.demo).
// The mock module is CommonJS (.js) and lives outside src/, so dynamic import
// keeps it out of the normal build and we suppress the TS module-typing error.
async function setupFrontendMock() {
  if (import.meta.env.VITE_APP_USE_FRONTEND_MOCK !== 'true') return
  // @ts-expect-error -- mock/index.js is a CommonJS module without type declarations
  const { mockXHR } = await import('../mock')
  mockXHR()
}

const app = createApp(App)

// Register all Element Plus icons globally so <component :is="iconName" /> works
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

setupIcons(app)
setupDirectives(app)

app.use(store)
setupErrorLog(app)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: (Cookies.get('size') as 'default' | 'small' | 'large') || 'default'
})

// Install the XHR mock BEFORE mount: the router guard (permission.ts) fires
// its first navigation immediately after mount and will call getInfo(), which
// issues an XHR — the mock must already be intercepting by then.
setupFrontendMock().finally(() => {
  app.mount('#app')
})
