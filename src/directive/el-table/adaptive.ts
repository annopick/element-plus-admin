import type { Directive } from 'vue'

// TODO Phase 2: This directive depended on element-ui/src/utils/resize-event (deep internal).
// Element Plus table internals differ — needs rewrite using ResizeObserver when tables are migrated.
const adaptive: Directive = {
  mounted() {
    // eslint-disable-next-line no-console
    console.warn(
      '[v-adaptive] el-table adaptive directive not yet migrated for Element Plus — see TODO'
    )
  }
}

export default adaptive
