<template>
  <el-color-picker
    v-model="theme"
    :predefine="['#409EFF', '#1890ff', '#304156','#212121','#11a983', '#13c2c2', '#6959CD', '#f5222d', ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script>
// NOTE: This component is Phase 4 scope (element-ui → element-plus theme
// customization). The original `require('element-ui/package.json').version`
// is a CommonJS call that (a) is unavailable in the browser ESM context and
// (b) references the removed element-ui dependency. Guarded here so importing
// the component no longer crashes the Layout shell. Full migration is deferred.
let version = '2.15.14' // fallback element-ui version (unpkg URL still resolves)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  version = require('element-ui/package.json').version
} catch (e) {
  // element-ui is not installed (Vue 3 migration); keep the fallback above.
}
const ORIGINAL_THEME = '#409EFF' // default color

export default {
  data() {
    return {
      chalk: '', // content of theme-chalk css
      theme: ''
    }
  },
  computed: {
    // NOTE: original was `this.$store.state.settings.theme` (Vuex). The Vuex
    // store is gone (Pinia migration), so this would throw at runtime. The
    // theme-customization feature depends on element-ui and is deferred to
    // Phase 4; return '' (no theme) so the component no longer crashes the
    // Layout shell. Full migration will wire this to useSettingsStore().
    defaultTheme() {
      return ''
    }
  },
  watch: {
    defaultTheme: {
      handler: function(val, oldVal) {
        this.theme = val
      },
      immediate: true
    },
    async theme(val) {
      // TODO Phase 3: rebuild theme customization for Element Plus (CSS variables).
      // The original element-ui chalk-CSS rewriting approach is incompatible with Element Plus.
      // Until then, this picker renders but is intentionally non-functional.
    }
  },

  methods: {
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },

    getCSSString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
            resolve()
          }
        }
        xhr.open('GET', url)
        xhr.send()
      })
    },

    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) { // when primary color is in its rgb space
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    }
  }
}
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
