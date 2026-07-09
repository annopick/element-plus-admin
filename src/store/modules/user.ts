import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getInfo as getInfoApi, logout as logoutApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { useTagsViewStore } from './tagsView'
import { usePermissionStore } from './permission'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const name = ref('')
  const avatar = ref('')
  const introduction = ref('')
  const roles = ref<string[]>([])

  async function login(userInfo: { username: string; password: string }) {
    const { username, password } = userInfo
    const { data } = await loginApi({ username: username.trim(), password })
    token.value = data.token
    setToken(data.token)
  }

  async function getInfo() {
    const { data } = await getInfoApi(token.value)
    if (!data) throw 'Verification failed, please Login again.'
    const { roles: r, name: n, avatar: a, introduction: i } = data
    if (!r || r.length <= 0) throw 'getInfo: roles must be a non-null array!'
    roles.value = r
    name.value = n
    avatar.value = a
    introduction.value = i
    return data
  }

  async function logout() {
    await logoutApi()
    token.value = ''
    roles.value = []
    removeToken()
    resetRouter()
    useTagsViewStore().delAllViews()
  }

  function resetToken() {
    token.value = ''
    roles.value = []
    removeToken()
  }

  async function changeRoles(role: string) {
    const newToken = role + '-token'
    token.value = newToken
    setToken(newToken)

    await getInfo()
    resetRouter()

    const accessRoutes = await usePermissionStore().generateRoutes(roles.value)
    accessRoutes.forEach((route) => router.addRoute(route as any))

    useTagsViewStore().delAllViews()
  }

  return { token, name, avatar, introduction, roles, login, getInfo, logout, resetToken, changeRoles }
})
