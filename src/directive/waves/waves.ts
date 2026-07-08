import './waves.css'
import type { Directive, DirectiveBinding } from 'vue'

interface WavesContext {
  removeHandle: (e: Event) => void
}

// WeakMap avoids attaching the context onto the DOM element via a string key.
const wavesMap = new WeakMap<HTMLElement, WavesContext>()

function handleClick(el: HTMLElement, binding: DirectiveBinding): (e: Event) => void {
  function handle(e: Event) {
    const customOpts = Object.assign({}, binding.value)
    const opts = Object.assign(
      {
        ele: el, // 波纹作用元素
        type: 'hit', // hit 点击位置扩散 center 中心点扩展
        color: 'rgba(0, 0, 0, 0.15)' // 波纹颜色
      },
      customOpts
    )
    const target = opts.ele
    if (target) {
      target.style.position = 'relative'
      target.style.overflow = 'hidden'
      const rect = target.getBoundingClientRect()
      let ripple = target.querySelector('.waves-ripple') as HTMLSpanElement | null
      if (!ripple) {
        ripple = document.createElement('span')
        ripple.className = 'waves-ripple'
        ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px'
        target.appendChild(ripple)
      } else {
        ripple.className = 'waves-ripple'
      }
      const me = e as MouseEvent
      switch (opts.type) {
        case 'center':
          ripple.style.top = rect.height / 2 - ripple.offsetHeight / 2 + 'px'
          ripple.style.left = rect.width / 2 - ripple.offsetWidth / 2 + 'px'
          break
        default:
          ripple.style.top =
            (me.pageY - rect.top - ripple.offsetHeight / 2 - document.documentElement.scrollTop ||
              document.body.scrollTop) + 'px'
          ripple.style.left =
            (me.pageX - rect.left - ripple.offsetWidth / 2 - document.documentElement.scrollLeft ||
              document.body.scrollLeft) + 'px'
      }
      ripple.style.backgroundColor = opts.color
      ripple.className = 'waves-ripple z-active'
      return false
    }
  }

  const ctx = wavesMap.get(el)
  if (!ctx) {
    wavesMap.set(el, { removeHandle: handle })
  } else {
    ctx.removeHandle = handle
  }

  return handle
}

const waves: Directive = {
  beforeMount(el, binding) {
    el.addEventListener('click', handleClick(el, binding), false)
  },
  updated(el, binding) {
    const ctx = wavesMap.get(el)
    if (ctx) {
      el.removeEventListener('click', ctx.removeHandle, false)
    }
    el.addEventListener('click', handleClick(el, binding), false)
  },
  unmounted(el) {
    const ctx = wavesMap.get(el)
    if (ctx) {
      el.removeEventListener('click', ctx.removeHandle, false)
      wavesMap.delete(el)
    }
  }
}

export default waves
