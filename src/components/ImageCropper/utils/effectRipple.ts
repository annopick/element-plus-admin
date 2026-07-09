/**
 * 点击波纹效果
 *
 * @param  e
 * @param  arg_opts
 */
interface RippleOptions {
  /** 波纹作用元素 */
  ele?: HTMLElement | EventTarget | null
  /** hit点击位置扩散 center中心点扩展 */
  type?: 'hit' | 'center'
  /** 波纹颜色 */
  bgc?: string
}

export default function effectRipple(e: MouseEvent, arg_opts?: RippleOptions): boolean | undefined {
  const opts: Required<Pick<RippleOptions, 'type' | 'bgc'>> & Pick<RippleOptions, 'ele'> = Object.assign({
    ele: e.target, // 波纹作用元素
    type: 'hit', // hit点击位置扩散center中心点扩展
    bgc: 'rgba(0, 0, 0, 0.15)' // 波纹颜色
  }, arg_opts)
  const target = opts.ele as HTMLElement | null
  if (target) {
    const rect = target.getBoundingClientRect()
    let ripple = target.querySelector('.e-ripple') as HTMLSpanElement | null
    if (!ripple) {
      ripple = document.createElement('span')
      ripple.className = 'e-ripple'
      ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px'
      target.appendChild(ripple)
    } else {
      ripple.className = 'e-ripple'
    }
    switch (opts.type) {
      case 'center':
        ripple.style.top = (rect.height / 2 - ripple.offsetHeight / 2) + 'px'
        ripple.style.left = (rect.width / 2 - ripple.offsetWidth / 2) + 'px'
        break
      default:
        ripple.style.top = (e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop) + 'px'
        ripple.style.left = (e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft) + 'px'
    }
    ripple.style.backgroundColor = opts.bgc
    ripple.className = 'e-ripple z-active'
    return false
  }
}
