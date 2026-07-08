/**
 * Sidebar style constants shared between SCSS (`variables.scss`) and JS.
 *
 * Why a TS file? Vite does NOT support the webpack `:export { ... }` SCSS→JS
 * interop that this project originally used (`import variables from '@/styles/variables.scss'`).
 * Vite's CSS-module pipeline emits `:export` as raw CSS text rather than a JS
 * default export, so the Sidebar can't read menu colors from the SCSS file.
 *
 * This TS module is the single source of truth for JS consumers; the SCSS file
 * remains the source of truth for `<style>` blocks. Keep the two in sync — the
 * values below mirror `src/styles/variables.scss`.
 */
export const sidebarVariables = {
  menuText: '#bfcbd9',
  menuActiveText: '#409EFF',
  subMenuActiveText: '#f4f4f5',
  menuBg: '#304156',
  menuHover: '#263445',
  subMenuBg: '#1f2d3d',
  subMenuHover: '#001528',
  sideBarWidth: '210px'
}

export default sidebarVariables
