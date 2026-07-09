declare module '@/components/ImageCropper/utils/language' {
  const value: Record<string, any>
  export default value
}

declare module '@/components/ImageCropper/utils/mimes' {
  const value: Record<string, string>
  export default value
}

declare module '@/components/ImageCropper/utils/data2blob' {
  const value: (data: string, mime: string) => Blob
  export default value
}

declare module '@/components/ImageCropper/utils/effectRipple' {
  const value: (e: MouseEvent, opts?: Record<string, any>) => boolean | undefined
  export default value
}
