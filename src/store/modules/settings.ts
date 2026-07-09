import { defineStore } from 'pinia'
import { ref } from 'vue'
import defaultSettings from '@/settings'

const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('#1890ff')
  const showSettingsFlag = ref(showSettings)
  const tagsViewEnabled = ref(tagsView)
  const fixedHeaderEnabled = ref(fixedHeader)
  const sidebarLogoEnabled = ref(sidebarLogo)

  function changeSetting({ key, value }: { key: string; value: any }) {
    switch (key) {
      case 'theme': theme.value = value; break
      case 'showSettings': showSettingsFlag.value = value; break
      case 'tagsView': tagsViewEnabled.value = value; break
      case 'fixedHeader': fixedHeaderEnabled.value = value; break
      case 'sidebarLogo': sidebarLogoEnabled.value = value; break
    }
  }

  return { theme, showSettings: showSettingsFlag, tagsView: tagsViewEnabled, fixedHeader: fixedHeaderEnabled, sidebarLogo: sidebarLogoEnabled, changeSetting }
})
