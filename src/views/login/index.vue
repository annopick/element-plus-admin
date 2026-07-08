<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="usernameRef"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="passwordRef"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          autocomplete="on"
          @keyup="checkCapslock"
          @blur="capsTooltip = false"
          @keyup.enter="handleLogin"
        />
        <span v-if="capsTooltip" class="caps-warning">Caps lock is On</span>
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.prevent="handleLogin">Login</el-button>

      <div style="position:relative">
        <div class="tips">
          <span>Username : admin</span>
          <span>Password : any</span>
        </div>
        <div class="tips">
          <span style="margin-right:18px;">Username : editor</span>
          <span>Password : any</span>
        </div>

        <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
          Or connect with
        </el-button>
      </div>
    </el-form>

    <el-dialog title="Or connect with" v-model="showDialog">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { validUsername } from '@/utils/validate'
import { useUserStore } from '@/store/modules/user'
import SocialSign from './components/SocialSignin.vue'

defineOptions({ name: 'Login' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const usernameRef = ref()
const passwordRef = ref()

const validateUsername = (rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (!validUsername(value)) {
    callback(new Error('Please enter the correct user name'))
  } else {
    callback()
  }
}

const validatePassword = (rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value.length < 6) {
    callback(new Error('The password can not be less than 6 digits'))
  } else {
    callback()
  }
}

const loginForm = reactive({
  username: 'admin',
  password: '111111'
})

const loginRules = reactive({
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
})

const passwordType = ref('password')
const capsTooltip = ref(false)
const loading = ref(false)
const showDialog = ref(false)
const redirect = ref<string | undefined>(undefined)
const otherQuery = ref<Record<string, string>>({})

function checkCapslock(e: KeyboardEvent) {
  const { key } = e
  capsTooltip.value = !!(key && key.length === 1 && key >= 'A' && key <= 'Z')
}

function showPwd() {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    passwordRef.value?.focus()
  })
}

function handleLogin() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      userStore.login(loginForm)
        .then(() => {
          router.push({ path: redirect.value || '/', query: otherQuery.value })
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    } else {
      console.log('error submit!!')
    }
  })
}

function getOtherQuery(query: Record<string, string>) {
  return Object.keys(query).reduce((acc, cur) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur]
    }
    return acc
  }, {} as Record<string, string>)
}

watch(() => route.query, (query) => {
  if (query) {
    redirect.value = query.redirect as string | undefined
    otherQuery.value = getOtherQuery(query as Record<string, string>)
  }
}, { immediate: true })

onMounted(() => {
  if (loginForm.username === '') {
    usernameRef.value?.focus()
  } else if (loginForm.password === '') {
    passwordRef.value?.focus()
  }
})
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .caps-warning {
    position: absolute;
    right: 10px;
    bottom: 7px;
    font-size: 12px;
    color: #f56c6c;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
