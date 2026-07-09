/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'virtual:svg-icons-register'

// variables.scss exposes an :export { ... } block (CSS modules interop).
// Vite's client.d.ts only types `*.scss` as `{}`, so declare the concrete
// shape here so imports like `import variables from '@/styles/variables.scss'`
// type-check (used by Sidebar/index.vue).
declare module '@/styles/variables.scss' {
  const variables: {
    menuText: string
    menuActiveText: string
    subMenuActiveText: string
    menuBg: string
    menuHover: string
    subMenuBg: string
    subMenuHover: string
    sideBarWidth: string
  }
  export default variables
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
