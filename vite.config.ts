import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// Mount the existing express mock server (mock/mock-server.js) as Vite dev middleware
function mockPlugin() {
  return {
    name: 'mock-server',
    configureServer(server: any) {
      // mock-server.js is CommonJS (uses require); load it lazily at config-eval time.
      // vite.config.ts runs in a Node context; require() works because tsconfig.node.json
      // compiles to CJS-compatible output.
      const mockServer = require('./mock/mock-server.js')
      const express = require('express')
      const app = express()
      mockServer(app)
      server.middlewares.use(app)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // Bridge .env vars into process.env so the Express mock middleware
  // (mock/mock-server.js, mounted via mockPlugin) can read VITE_APP_BASE_API
  Object.assign(process.env, env)
  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      }),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] }),
      mockPlugin()
    ],
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Inject variables into every SCSS file so SFC <style> blocks can use $menuBg etc.
          // `@use ... as *` exposes the plain `$var` declarations in variables.scss.
          //
          // IMPORTANT: variables.scss is itself compiled as an entry point (it's imported
          // from JS in src/layout/components/Sidebar/index.vue for its :export block, and it
          // is the root of src/styles/index.scss). Injecting `@use "variables.scss"` into
          // variables.scss itself produces "Module loop: this file is already being loaded".
          // We therefore skip injection for files whose basename is variables.scss.
          //
          // @use is chosen over @import because @import is deprecated in Dart Sass and
          // would emit a per-file warning on every build.
          additionalData(source: string, fp: string) {
            if (fp.endsWith('variables.scss')) return source
            return `@use "@/styles/variables.scss" as *;\n${source}`
          }
        }
      }
    },
    server: {
      port: 9527,
      open: true
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            vendor: ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  }
})
