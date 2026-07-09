import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

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
  // TODO Phase 2-4: restore /documentation, /guide, /profile routes when views are migrated
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes: AppRouteRecord[] = [
  // Phase 1: only restore permission routes (needed for core loop). Other modules restored in Phase 2-4.
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
  // TODO Phase 2-4: restore icon, components, charts, nested, table, example, tab, error, excel, zip, pdf, theme, clipboard, external-link routes
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
