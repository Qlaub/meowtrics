<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'
import { useDeviceContextStore } from '@/stores/deviceContext.js'

const theme = useThemeStore()
const device = useDeviceContextStore()

const dropdownOpen = ref(false)
const wrapper = ref(null)
let longPressTimer = null

function handleClick() {
  if (!theme.isThemeSwitchEnabled) return
  if (device.shouldUseMobileInteractions) {
    theme.cycleTheme()
  } else {
    dropdownOpen.value = !dropdownOpen.value
  }
}

function handlePointerDown() {
  if (!theme.isThemeSwitchEnabled || !device.shouldUseMobileInteractions) return
  longPressTimer = setTimeout(() => {
    longPressTimer = null
    dropdownOpen.value = true
  }, 500)
}

function handlePointerUp() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function selectTheme(id) {
  theme.setTheme(id)
  dropdownOpen.value = false
}

function handleClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', handleClickOutside))
onUnmounted(() => document.removeEventListener('pointerdown', handleClickOutside))
</script>

<template>
  <div ref="wrapper" class="theme-switch">
    <button
      class="theme-btn"
      :class="{ disabled: !theme.isThemeSwitchEnabled }"
      :aria-disabled="!theme.isThemeSwitchEnabled"
      aria-label="Change theme"
      @click="handleClick"
      @pointerdown.prevent="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
        <circle cx="8" cy="10" r="2" fill="currentColor" />
        <circle cx="16" cy="10" r="2" fill="currentColor" />
        <circle cx="12" cy="16" r="2" fill="currentColor" />
      </svg>
    </button>

    <div v-if="dropdownOpen" class="theme-dropdown">
      <button
        v-for="t in theme.themes"
        :key="t.id"
        class="theme-option"
        :class="{ selected: t.id === theme.activeThemeId }"
        @click="selectTheme(t.id)"
      >
        <span v-if="t.id === theme.activeThemeId" class="check" aria-hidden="true">&#10003;</span>
        <span>{{ t.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-switch {
  position: relative;
  margin-left: auto;
}

.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.35rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.theme-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.theme-btn.disabled {
  opacity: 0.35;
  cursor: default;
}

.theme-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 0.25rem 0;
  min-width: 140px;
  z-index: 100;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
}

.theme-option:hover {
  background: var(--color-bg-primary);
}

.theme-option .check {
  font-size: 0.75rem;
  color: var(--color-accent-primary);
}
</style>
