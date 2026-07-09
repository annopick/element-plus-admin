import type { Directive } from 'vue'

const drag: Directive = {
  beforeMount(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header') as HTMLElement | null
    const dragDom = el.querySelector('.el-dialog') as HTMLElement | null
    if (!dialogHeaderEl || !dragDom) {
      return
    }

    dialogHeaderEl.style.cssText += ';cursor:move;'
    dragDom.style.cssText += ';top:0px;'

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const getStyle = (function () {
      if ((window.document as any).currentStyle) {
        return (dom: HTMLElement, attr: string) => (dom as any).currentStyle[attr]
      } else {
        return (dom: HTMLElement, attr: string) => getComputedStyle(dom, undefined as any)[attr as any]
      }
    })()

    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      const dragDomWidth = dragDom.offsetWidth
      const dragDomHeight = dragDom.offsetHeight

      const screenWidth = document.body.clientWidth
      const screenHeight = document.body.clientHeight

      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight

      // 获取到的值带 px 正则匹配替换
      let styL = getStyle(dragDom, 'left')
      let styT = getStyle(dragDom, 'top')
      let styLNum: number
      let styTNum: number

      if (styL.includes('%')) {
        styLNum = +document.body.clientWidth * (+styL.replace(/%/g, '') / 100)
        styTNum = +document.body.clientHeight * (+styT.replace(/%/g, '') / 100)
      } else {
        styLNum = +styL.replace(/px/g, '')
        styTNum = +styT.replace(/px/g, '')
      }

      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (-top > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styLNum}px;top:${top + styTNum}px;`

        // TODO: Vue3 vnode emit — re-enable if dragDialog event needed.
        // In Vue2 this was: vnode.child.$emit('dragDialog')
        // Vue3 vnode API differs (vnode.el?.__vueParentComponent); the drag behavior
        // itself works without the emit, so it is left disabled for now.
      }

      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}

export default drag
