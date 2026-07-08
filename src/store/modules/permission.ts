import { defineStore } from 'pinia'
import { ref } from 'vue'
import { asyncRoutes, constantRoutes, type AppRouteRecord } from '@/router'

function hasPermission(roles: string[], route: AppRouteRecord): boolean {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta!.roles!.includes(role))
  }
  return true
}

export function filterAsyncRoutes(routes: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
  const res: AppRouteRecord[] = []
  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) tmp.children = filterAsyncRoutes(tmp.children, roles)
      res.push(tmp)
    }
  })
  return res
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<AppRouteRecord[]>([])
  const addRoutes = ref<AppRouteRecord[]>([])

  function generateRoutes(roles: string[]): Promise<AppRouteRecord[]> {
    return new Promise((resolve) => {
      let accessedRoutes: AppRouteRecord[]
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      addRoutes.value = accessedRoutes
      routes.value = constantRoutes.concat(accessedRoutes)
      resolve(accessedRoutes)
    })
  }

  return { routes, addRoutes, generateRoutes }
})
