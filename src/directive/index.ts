import type { App } from 'vue'
import permission from './permission/permission'
import clipboard from './clipboard/clipboard'
import waves from './waves/waves'
import drag from './el-drag-dialog/drag'
import adaptive from './el-table/adaptive'

export function setupDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('clipboard', clipboard)
  app.directive('waves', waves)
  app.directive('drag-dialog', drag)
  app.directive('adaptive', adaptive)
}
