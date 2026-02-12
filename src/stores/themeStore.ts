import { defineStore } from 'pinia'
import type { Theme } from '@/types/theme'
import themes from '@/themes/index'

const STORAGE_KEY = 'meowtrics.theme'
const DEFAULT_THEME_ID = 'cummings'

function resolveThemeId(id: string | null): string {
  if (id === null) return DEFAULT_THEME_ID
  return themes.find((t) => t.id === id) ? id : DEFAULT_THEME_ID
}

interface ThemeState {
  activeThemeId: string
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    activeThemeId: DEFAULT_THEME_ID,
  }),

  getters: {
    themes: (): Theme[] => themes,

    activeTheme(state): Theme {
      const found = themes.find((t) => t.id === state.activeThemeId)
      if (found) return found
      const firstTheme = themes[0]
      if (!firstTheme) throw new Error('No themes available')
      return firstTheme
    },

    isThemeSwitchEnabled: (): boolean => themes.length > 1,
  },

  actions: {
    init(this: { activeThemeId: string; _apply: () => void }) {
      const saved = localStorage.getItem(STORAGE_KEY)
      this.activeThemeId = resolveThemeId(saved)
      this._apply()
    },

    setTheme(this: { activeThemeId: string; _apply: () => void }, id: string) {
      this.activeThemeId = resolveThemeId(id)
      localStorage.setItem(STORAGE_KEY, this.activeThemeId)
      this._apply()
    },

    cycleTheme(this: { activeThemeId: string; setTheme: (id: string) => void }) {
      const idx = themes.findIndex((t) => t.id === this.activeThemeId)
      const next = (idx + 1) % themes.length
      const nextTheme = themes[next]
      if (nextTheme) this.setTheme(nextTheme.id)
    },

    _apply(this: { activeTheme: Theme }) {
      const tokens = this.activeTheme.tokens
      const root = document.documentElement
      for (const [key, value] of Object.entries(tokens)) {
        root.style.setProperty(key, value)
      }
    },
  },
})
