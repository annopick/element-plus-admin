import type { Directive, DirectiveBinding } from 'vue'

interface StickyParams {
  stickyTop?: number
  zIndex?: number
}

let listenAction: (() => void) | null = null

const sticky: Directive<HTMLElement, StickyParams> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<StickyParams>) {
    const params = binding.value || {}
    const stickyTop = params.stickyTop || 0
    const zIndex = params.zIndex || 1000
    const elStyle = el.style

    elStyle.position = '-webkit-sticky'
    elStyle.position = 'sticky'
    // if the browser support css sticky（Currently Safari, Firefox and Chrome Canary）
    // if (~elStyle.position.indexOf('sticky')) {
    //     elStyle.top = `${stickyTop}px`;
    //     elStyle.zIndex = zIndex;
    //     return
    // }
    const elHeight = el.getBoundingClientRect().height
    const elWidth = el.getBoundingClientRect().width
    elStyle.cssText = `top: ${stickyTop}px; z-index: ${zIndex}`

    const parentElm = el.parentNode || document.documentElement
    const placeholder = document.createElement('div')
    placeholder.style.display = 'none'
    placeholder.style.width = `${elWidth}px`
    placeholder.style.height = `${elHeight}px`
    parentElm.insertBefore(placeholder, el)

    let active = false

    const getScroll = (target: Window, top: boolean): number => {
      const prop = top ? 'pageYOffset' : 'pageXOffset'
      const method = top ? 'scrollTop' : 'scrollLeft'
      let ret = (target as unknown as Record<string, number>)[prop]
      if (typeof ret !== 'number') {
        ret = window.document.documentElement[method]
      }
      return ret
    }

    const stickyFn = () => {
      if (active) {
        return
      }
      if (!elStyle.height) {
        elStyle.height = `${el.offsetHeight}px`
      }

      elStyle.position = 'fixed'
      elStyle.width = `${elWidth}px`
      placeholder.style.display = 'inline-block'
      active = true
    }

    const reset = () => {
      if (!active) {
        return
      }

      elStyle.position = ''
      placeholder.style.display = 'none'
      active = false
    }

    const check = () => {
      const scrollTop = getScroll(window, true)
      const offsetTop = el.getBoundingClientRect().top
      if (offsetTop < stickyTop) {
        stickyFn()
      } else {
        if (scrollTop < elHeight + stickyTop) {
          reset()
        }
      }
    }
    listenAction = () => {
      check()
    }

    window.addEventListener('scroll', listenAction)
  },

  unmounted() {
    if (listenAction) {
      window.removeEventListener('scroll', listenAction)
      listenAction = null
    }
  }
}

export default sticky
