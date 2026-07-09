export interface ISettings {
  title: string
  showSettings: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  errorLog: 'production' | ('production' | 'development')[]
}

const settings: ISettings = {
  title: 'Vue Element Admin',
  showSettings: true,
  tagsView: true,
  fixedHeader: false,
  sidebarLogo: false,
  errorLog: 'production'
}

export default settings
