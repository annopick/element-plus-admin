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

// Install the front-end XHR mock BEFORE mount: the router guard (permission.ts)
// fires its first navigation immediately after mount and will call getInfo(),
// which issues an XHR — the mock must already be intercepting by then.
// Dynamic import keeps mockjs out of the main chunk; the ESM wrapper
// (src/mock/index.ts) is bundled correctly, unlike the CJS mock/index.js.
if (import.meta.env.VITE_APP_USE_FRONTEND_MOCK === 'true') {
  import('./mock').then(({ mockXHR }) => mockXHR()).finally(() => {
    app.mount('#app')
  })
} else {
  app.mount('#app')
}
