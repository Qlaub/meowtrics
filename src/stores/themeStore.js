import { defineStore } from 'pinia'
import themes from '@/themes/index.js'

const STORAGE_KEY = 'meowtrics.theme'
const DEFAULT_THEME_ID = 'cummings'

function resolveThemeId(id) {
  return themes.find((t) => t.id === id) ? id : DEFAULT_THEME_ID
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    activeThemeId: DEFAULT_THEME_ID,
  }),

  getters: {
    themes: () => themes,

    activeTheme(state) {
      return themes.find((t) => t.id === state.activeThemeId) || themes[0]
    },

    isThemeSwitchEnabled: () => themes.length > 1,
  },

  actions: {
    init() {
      const saved = localStorage.getItem(STORAGE_KEY)
      this.activeThemeId = resolveThemeId(saved)
      this._apply()
    },

    setTheme(id) {
      this.activeThemeId = resolveThemeId(id)
      localStorage.setItem(STORAGE_KEY, this.activeThemeId)
      this._apply()
    },

    cycleTheme() {
      const idx = themes.findIndex((t) => t.id === this.activeThemeId)
      const next = (idx + 1) % themes.length
      this.setTheme(themes[next].id)
    },

    _apply() {
      const tokens = this.activeTheme.tokens
      const root = document.documentElement
      for (const [key, value] of Object.entries(tokens)) {
        root.style.setProperty(key, value)
      }
    },
  },
})
