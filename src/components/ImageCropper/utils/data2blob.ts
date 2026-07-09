/**
 * database64文件格式转换为2进制
 *
 * @param  data dataURL 的格式为 “data:image/png;base64,****”,逗号之前都是一些说明性的文字，我们只需要逗号之后的就行了
 * @param  mime [description]
 * @return blob
 */
export default function data2blob(data: string, mime: string): Blob {
  const base64Data = data.split(',')[1]
  const decoded = window.atob(base64Data)
  const ia = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i++) {
    ia[i] = decoded.charCodeAt(i)
  }
  // canvas.toDataURL 返回的默认格式就是 image/png
  return new Blob([ia], {
    type: mime
  })
}
