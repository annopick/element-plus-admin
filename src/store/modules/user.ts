import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getInfo as getInfoApi, logout as logoutApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
// TODO Task 4: re-enable when tagsView store exists
// import { useTagsViewStore } from './tagsView'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const name = ref('')
  const avatar = ref('')
  const introduction = ref('')
  const roles = ref<string[]>([])

  function login(userInfo: { username: string; password: string }) {
    const { username, password } = userInfo
    return new Promise<void>((resolve, reject) => {
      loginApi({ username: username.trim(), password })
        .then((response: any) => {
          const { data } = response
          token.value = data.token
          setToken(data.token)
          resolve()
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function getInfo() {
    return new Promise<any>((resolve, reject) => {
      getInfoApi(token.value)
        .then((response: any) => {
          const { data } = response
          if (!data) reject('Verification failed, please Login again.')
          const { roles: r, name: n, avatar: a, introduction: i } = data
          if (!r || r.length <= 0) reject('getInfo: roles must be a non-null array!')
          roles.value = r
          name.value = n
          avatar.value = a
          introduction.value = i
          resolve(data)
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          token.value = ''
          roles.value = []
          removeToken()
          resetRouter()
          // TODO Task 4: re-enable when tagsView store exists
          // useTagsViewStore().delAllViews()
          resolve()
        })
        .catch((error: unknown) => reject(error))
    })
  }

  function resetToken() {
    return new Promise<void>((resolve) => {
      token.value = ''
      roles.value = []
      removeToken()
      resolve()
    })
  }

  return { token, name, avatar, introduction, roles, login, getInfo, logout, resetToken }
})
