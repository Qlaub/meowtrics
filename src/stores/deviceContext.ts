import { defineStore } from 'pinia'
import Bowser from 'bowser'

const RESIZE_DEBOUNCE_MS = 150

interface BowserInfo {
  platformType: string | null
  browserName: string | null
  browserVersion: string | null
  osName: string | null
  osVersion: string | null
}

interface ViewportInfo {
  width: number
  height: number
}

interface MediaInfo {
  prefersCoarsePointer: boolean
  prefersFinePointer: boolean
  hoverNone: boolean
  hoverHover: boolean
}

interface FeaturesInfo {
  hasTouchPoints: boolean
}

interface DeviceContextState {
  ua: string
  bowser: BowserInfo
  viewport: ViewportInfo
  media: MediaInfo
  features: FeaturesInfo
}

type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'unknown'
type ViewportClass = 'mobile' | 'tablet' | 'desktop'
type InteractionMode = 'touch' | 'mouse' | 'mixed'

interface MediaQueryListener {
  mql: MediaQueryList
  handler: (e: MediaQueryListEvent) => void
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export const useDeviceContextStore = defineStore('deviceContext', {
  state: (): DeviceContextState => ({
    ua: '',

    bowser: {
      platformType: null,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
    },

    viewport: {
      width: 0,
      height: 0,
    },

    media: {
      prefersCoarsePointer: false,
      prefersFinePointer: false,
      hoverNone: false,
      hoverHover: false,
    },

    features: {
      hasTouchPoints: false,
    },
  }),

  getters: {
    deviceClass(state): DeviceClass {
      const type = state.bowser.platformType
      if (type === 'mobile') return 'mobile'
      if (type === 'tablet') return 'tablet'
      if (type === 'desktop') return 'desktop'
      return 'unknown'
    },

    viewportClass(state): ViewportClass {
      if (state.viewport.width < 768) return 'mobile'
      if (state.viewport.width < 1024) return 'tablet'
      return 'desktop'
    },

    interactionMode(state): InteractionMode {
      if (state.media.prefersCoarsePointer && state.media.hoverNone) return 'touch'
      if (state.media.prefersFinePointer && state.media.hoverHover) return 'mouse'
      return 'mixed'
    },

    isMobileDevice(): boolean {
      return this.deviceClass === 'mobile'
    },

    isMobileViewport(): boolean {
      return this.viewportClass === 'mobile'
    },

    isTouchPreferred(state): boolean {
      return state.media.prefersCoarsePointer
    },

    shouldUseMobileInteractions(): boolean {
      return this.interactionMode !== 'mouse'
    },
  },

  actions: {
    init(this: {
      ua: string
      bowser: BowserInfo
      viewport: ViewportInfo
      media: MediaInfo
      features: FeaturesInfo
      _updateViewport: () => void
      _evalMedia: () => void
      _debouncedResize?: (...args: unknown[]) => void
      _mediaListeners?: MediaQueryListener[]
    }) {
      // Parse UA
      this.ua = navigator.userAgent
      const browser = Bowser.getParser(this.ua)
      this.bowser.platformType = browser.getPlatformType() || null
      this.bowser.browserName = browser.getBrowserName() || null
      this.bowser.browserVersion = browser.getBrowserVersion() || null
      this.bowser.osName = browser.getOSName() || null
      this.bowser.osVersion = browser.getOSVersion() || null

      // Viewport
      this._updateViewport()

      // Media queries
      this._evalMedia()

      // Touch points
      this.features.hasTouchPoints = navigator.maxTouchPoints > 0

      // Listeners
      this._debouncedResize = debounce(() => this._updateViewport(), RESIZE_DEBOUNCE_MS)
      window.addEventListener('resize', this._debouncedResize)
      window.addEventListener('orientationchange', this._debouncedResize)

      this._mediaListeners = []
      const queries: Record<string, (v: boolean) => void> = {
        '(pointer: coarse)': (v) => (this.media.prefersCoarsePointer = v),
        '(pointer: fine)': (v) => (this.media.prefersFinePointer = v),
        '(hover: none)': (v) => (this.media.hoverNone = v),
        '(hover: hover)': (v) => (this.media.hoverHover = v),
      }
      for (const [query, setter] of Object.entries(queries)) {
        const mql = window.matchMedia(query)
        const handler = (e: MediaQueryListEvent) => setter(e.matches)
        mql.addEventListener('change', handler)
        this._mediaListeners.push({ mql, handler })
      }
    },

    _updateViewport(this: { viewport: ViewportInfo }) {
      this.viewport.width = window.innerWidth
      this.viewport.height = window.innerHeight
    },

    _evalMedia(this: { media: MediaInfo }) {
      this.media.prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches
      this.media.prefersFinePointer = window.matchMedia('(pointer: fine)').matches
      this.media.hoverNone = window.matchMedia('(hover: none)').matches
      this.media.hoverHover = window.matchMedia('(hover: hover)').matches
    },
  },
})
