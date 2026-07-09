import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import type { App } from 'vue'

export function setupIcons(app: App) {
  app.component('svg-icon', SvgIcon)
}
