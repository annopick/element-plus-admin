import { defineConfig, loadEnv, type ViteDevServer, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// Mount the existing express mock server (mock/mock-server.js) as Vite dev middleware
function mockPlugin(): PluginOption {
  return {
    name: 'mock-server',
    configureServer(server: ViteDevServer) {
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
  // Bridge VITE_APP_BASE_API into process.env so the Express mock middleware
  // (mock/mock-server.js, mounted via mockPlugin) can read it at request time.
  // Vite does not auto-populate process.env from .env files for server middleware.
  if (env.VITE_APP_BASE_API) {
    process.env.VITE_APP_BASE_API = env.VITE_APP_BASE_API
  }
  // GitHub Pages serves project sites under a sub-path
  // (https://<user>.github.io/<repo>/), so assets must be rebased. Only the
  // 'demo' build mode (npm run build:demo) sets this; regular build/build:stage
  // stay at '/' so local and self-hosted deployments are unaffected.
  const base = mode === 'demo' ? '/element-plus-admin/' : '/'
  return {
    base,
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
      // The demo's front-end mock reuses data from mock/*.js (CommonJS). Rollup
      // leaves `module.exports` / `require()` in those files unconverted when
      // they are pulled in via import.meta.glob, which crashes in the browser
      // ("module is not defined"). Explicitly mark mock/ as CommonJS so the
      // built-in plugin converts it. Only affects demo builds that bundle mock.
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/, /mock\//, /mock/]
      },
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
