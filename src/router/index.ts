import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import tableRouter from './modules/table'
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import nestedRouter from './modules/nested'

// vue-router 4's `RouteRecordRaw` is a discriminated union (single-view | multiple-views | redirect),
// so an interface cannot extend it. Use a type intersection instead to preserve the recursive
// `children` typing and our own `meta` shape while staying assignable to `RouteRecordRaw`.
export type AppRouteRecord = RouteRecordRaw & {
  children?: AppRouteRecord[]
  hidden?: boolean
  alwaysShow?: boolean
  meta?: {
    title?: string
    icon?: string
    roles?: string[]
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
  }
}

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes: AppRouteRecord[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  } as AppRouteRecord,
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  } as AppRouteRecord
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes: AppRouteRecord[] = [
  // Phase 2: permission, table, example routes restored.
  // Phase 3: profile, theme, clipboard, tab, icons, error-log routes restored.
  // Phase 4: components, charts, nested, excel, zip, pdf, guide, documentation, external-link routes restored.
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true,
    name: 'Permission',
    meta: { title: 'Permission', icon: 'lock', roles: ['admin', 'editor'] },
    children: [
      {
        path: 'page',
        name: 'PagePermission',
        component: () => import('@/views/permission/page.vue'),
        meta: { title: 'Page Permission', roles: ['admin'] }
      },
      {
        path: 'directive',
        name: 'DirectivePermission',
        component: () => import('@/views/permission/directive.vue'),
        meta: { title: 'Directive Permission' }
      },
      {
        path: 'role',
        name: 'RolePermission',
        component: () => import('@/views/permission/role.vue'),
        meta: { title: 'Role Permission', roles: ['admin'] }
      }
    ]
  } as AppRouteRecord,
  tableRouter,
  {
    path: '/example',
    component: Layout,
    redirect: '/example/list',
    name: 'Example',
    meta: { title: 'Example', icon: 'edit' },
    children: [
      { path: 'create', name: 'CreateArticle', component: () => import('@/views/example/create.vue'), meta: { title: 'Create Article', icon: 'edit' } },
      { path: 'edit/:id(\\d+)', name: 'EditArticle', component: () => import('@/views/example/edit.vue'), meta: { title: 'Edit Article', noCache: true, activeMenu: '/example/list' }, hidden: true } as AppRouteRecord,
      { path: 'list', name: 'ArticleList', component: () => import('@/views/example/list.vue'), meta: { title: 'Article List', icon: 'list' } }
    ]
  } as AppRouteRecord,
  // Phase 3: profile, theme, clipboard, tab, icons, error-log routes restored.
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      { path: 'index', name: 'Profile', component: () => import('@/views/profile/index.vue'), meta: { title: 'Profile', icon: 'user', noCache: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/theme',
    component: Layout,
    children: [
      { path: 'index', name: 'Theme', component: () => import('@/views/theme/index.vue'), meta: { title: 'Theme', icon: 'theme' } }
    ]
  } as AppRouteRecord,
  {
    path: '/clipboard',
    component: Layout,
    children: [
      { path: 'index', name: 'ClipboardDemo', component: () => import('@/views/clipboard/index.vue'), meta: { title: 'Clipboard', icon: 'clipboard' } }
    ]
  } as AppRouteRecord,
  {
    path: '/tab',
    component: Layout,
    children: [
      { path: 'index', name: 'Tab', component: () => import('@/views/tab/index.vue'), meta: { title: 'Tab', icon: 'tab' } }
    ]
  } as AppRouteRecord,
  {
    path: '/icons',
    component: Layout,
    children: [
      { path: 'index', name: 'Icons', component: () => import('@/views/icons/index.vue'), meta: { title: 'Icons', icon: 'icon', noCache: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/error-log',
    component: Layout,
    children: [
      { path: 'log', name: 'ErrorLog', component: () => import('@/views/error-log/index.vue'), meta: { title: 'Error Log', icon: 'bug' } }
    ]
  } as AppRouteRecord,
  // Phase 4: components, charts, nested, excel, zip, pdf, guide, documentation, external-link routes restored.
  componentsRouter,
  chartsRouter,
  nestedRouter,
  {
    path: '/excel',
    component: Layout,
    redirect: '/excel/export-excel',
    name: 'Excel',
    meta: { title: 'Excel', icon: 'excel' },
    children: [
      { path: 'export-excel', name: 'ExportExcel', component: () => import('@/views/excel/export-excel.vue'), meta: { title: 'Export Excel' } },
      { path: 'export-selected-excel', name: 'SelectExcel', component: () => import('@/views/excel/select-excel.vue'), meta: { title: 'Export Selected' } },
      { path: 'export-merge-header', name: 'MergeHeader', component: () => import('@/views/excel/merge-header.vue'), meta: { title: 'Merge Header' } },
      { path: 'upload-excel', name: 'UploadExcel', component: () => import('@/views/excel/upload-excel.vue'), meta: { title: 'Upload Excel' } }
    ]
  } as AppRouteRecord,
  {
    path: '/zip',
    component: Layout,
    redirect: '/zip/download',
    name: 'Zip',
    meta: { title: 'Zip', icon: 'zip' },
    children: [
      { path: 'download', name: 'ExportZip', component: () => import('@/views/zip/index.vue'), meta: { title: 'Export Zip' } }
    ]
  } as AppRouteRecord,
  {
    path: '/pdf',
    component: Layout,
    redirect: '/pdf/index',
    children: [
      { path: 'index', name: 'PDF', component: () => import('@/views/pdf/index.vue'), meta: { title: 'PDF', icon: 'pdf' } }
    ]
  } as AppRouteRecord,
  {
    path: '/pdf/download',
    component: () => import('@/views/pdf/download.vue'),
    hidden: true
  } as AppRouteRecord,
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      { path: 'index', name: 'Guide', component: () => import('@/views/guide/index.vue'), meta: { title: 'Guide', icon: 'guide', noCache: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/documentation',
    component: Layout,
    children: [
      { path: 'index', name: 'Documentation', component: () => import('@/views/documentation/index.vue'), meta: { title: 'Documentation', icon: 'documentation', affix: true } }
    ]
  } as AppRouteRecord,
  {
    path: '/external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/PanJiaChen/vue-element-admin',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  } as AppRouteRecord,
  // 404 must be last
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true } as AppRouteRecord
]

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

// vue-router 4 public API: remove all dynamically-added routes by name,
// keeping the constantRoutes intact. Routes without names (e.g. catch-all)
// are skipped since they can't be removed by name.
export function resetRouter() {
  const constantRouteNames = new Set(
    constantRoutes
      .flatMap((r) => [r, ...(r.children || [])])
      .map((r) => r.name)
      .filter((n): n is string => typeof n === 'string')
  )
  router.getRoutes().forEach((r) => {
    if (r.name && !constantRouteNames.has(r.name as string)) {
      router.removeRoute(r.name)
    }
  })
}

export default router
