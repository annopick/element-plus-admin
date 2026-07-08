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

import './permission'

const app = createApp(App)

// Register all Element Plus icons globally so <component :is="iconName" /> works
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

setupIcons(app)

app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: (Cookies.get('size') as 'default' | 'small' | 'large') || 'default'
})

app.mount('#app')
