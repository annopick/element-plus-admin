/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'virtual:svg-icons-register'

interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
