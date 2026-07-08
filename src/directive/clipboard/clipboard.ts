// Inspired by https://github.com/Inndy/vue-clipboard2
import type { Directive, DirectiveBinding } from 'vue'
import ClipboardJS from 'clipboard'

type ElWithClip = HTMLElement & {
  __clip_success__?: (e: ClipboardJS.Event) => void
  __clip_error__?: (e: ClipboardJS.Event) => void
}

// WeakMap avoids attaching ClipboardJS instances onto the DOM element.
const clipboardMap = new WeakMap<HTMLElement, ClipboardJS>()

const clipboard: Directive = {
  mounted(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      el.__clip_success__ = binding.value
    } else if (binding.arg === 'error') {
      el.__clip_error__ = binding.value
    } else {
      const clip = new ClipboardJS(el, {
        text: () => binding.value,
        action: () => (binding.arg === 'cut' ? 'cut' : 'copy')
      })
      clip.on('success', (e) => el.__clip_success__ && el.__clip_success__(e))
      clip.on('error', (e) => el.__clip_error__ && el.__clip_error__(e))
      clipboardMap.set(el, clip)
    }
  },
  updated(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      el.__clip_success__ = binding.value
    } else if (binding.arg === 'error') {
      el.__clip_error__ = binding.value
    } else {
      const clip = clipboardMap.get(el)
      if (clip) {
        // ClipboardJS reads text/action as instance properties at click time;
        // they're not on the type defs, so assign via a cast.
        const instance = clip as unknown as {
          text: () => string
          action: () => 'cut' | 'copy'
        }
        instance.text = () => binding.value
        instance.action = () => (binding.arg === 'cut' ? 'cut' : 'copy')
      }
    }
  },
  unmounted(el: ElWithClip, binding: DirectiveBinding) {
    if (binding.arg === 'success') {
      delete el.__clip_success__
    } else if (binding.arg === 'error') {
      delete el.__clip_error__
    } else {
      const clip = clipboardMap.get(el)
      if (clip) {
        clip.destroy()
        clipboardMap.delete(el)
      }
    }
  }
}

export default clipboard
