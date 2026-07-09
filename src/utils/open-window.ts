/**
 * Created by PanJiaChen on 16/11/29.
 * @param url
 * @param title
 * @param w
 * @param h
 */
export default function openWindow(url: string, title: string, w: number, h: number): void {
  // Fixes dual-screen position                            Most browsers       Firefox
  const screenAny = screen as unknown as Record<string, number>
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screenAny.left
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screenAny.top

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

  const left = ((width / 2) - (w / 2)) + dualScreenLeft
  const top = ((height / 2) - (h / 2)) + dualScreenTop
  const newWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left)

  // Puts focus on the newWindow
  if (newWindow) {
    newWindow.focus()
  }
}
