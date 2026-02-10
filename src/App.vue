<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { loadManifest, groupBycat } from '@/data/manifest.js'
import { useDeviceContextStore } from '@/stores/deviceContext.js'
import { useThemeStore } from '@/stores/themeStore.js'
import ThemeSwitch from '@/components/ThemeSwitch.vue'

const route = useRoute()
const deviceContext = useDeviceContextStore()
deviceContext.init()
const themeStore = useThemeStore()
themeStore.init()
const menuOpen = ref(false)
const navMenuRef = ref(null)
const hamburgerRef = ref(null)
const manifest = ref([])
const error = ref(null)

async function load() {
  try {
    manifest.value = await loadManifest()
    error.value = null
  } catch {
    error.value = 'Failed to load datasets'
  }
}
load()

const grouped = () => groupBycat(manifest.value)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

function handleClickOutside(e) {
  if (!menuOpen.value) return
  if (navMenuRef.value && navMenuRef.value.contains(e.target)) return
  if (hamburgerRef.value && hamburgerRef.value.contains(e.target)) return
  menuOpen.value = false
}

onMounted(() => document.addEventListener('pointerdown', handleClickOutside))
onUnmounted(() => document.removeEventListener('pointerdown', handleClickOutside))
</script>

<template>
  <header class="app-header">
    <button ref="hamburgerRef" class="hamburger" aria-label="Toggle menu" data-testid="menu-toggle" @click="menuOpen = !menuOpen">
      <span :class="{ open: menuOpen }"></span>
    </button>
    <RouterLink to="/" class="app-title">Meowtrics</RouterLink>
    <ThemeSwitch />
  </header>

  <div class="nav-menu-wrapper" :class="{ 'is-open': menuOpen }" data-testid="nav-menu-wrapper">
    <nav ref="navMenuRef" class="nav-menu" :inert="!menuOpen" data-testid="nav-menu">
      <RouterLink to="/" class="nav-link" @click="menuOpen = false">Home</RouterLink>
      <template v-for="(datasets, cat) in grouped()" :key="cat">
        <div class="nav-group-label">{{ cat }}</div>
        <RouterLink
          v-for="d in datasets"
          :key="d.id"
          :to="{ name: 'dataset', params: { datasetId: d.id } }"
          class="nav-link nav-link--indent"
          @click="menuOpen = false"
        >
          {{ d.title }}
        </RouterLink>
      </template>
    </nav>
  </div>

  <main id="main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-accent-secondary);
  margin-bottom: 1.5rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger span,
.hamburger span::before,
.hamburger span::after {
  display: block;
  width: 1.25rem;
  height: 2px;
  background: var(--color-text-primary);
  transition: transform 0.2s;
  position: absolute;
}

.hamburger span::before,
.hamburger span::after {
  content: '';
}

.hamburger span::before {
  transform: translateY(-6px);
}

.hamburger span::after {
  transform: translateY(6px);
}

.hamburger span.open {
  background: transparent;
}

.hamburger span.open::before {
  transform: rotate(45deg);
}

.hamburger span.open::after {
  transform: rotate(-45deg);
}

.nav-menu-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.15s ease, margin-bottom 0.15s ease;
}

.nav-menu-wrapper.is-open {
  grid-template-rows: 1fr;
  margin-bottom: 1.5rem;
}

.nav-menu {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-1);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0;
  opacity: 0;
  transform: translateY(-8px);
  visibility: hidden;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    visibility 0.15s,
    padding 0.15s ease,
    border-color 0.15s ease;
}

.nav-menu-wrapper.is-open .nav-menu {
  border-color: var(--color-border-subtle);
  padding: 0.5rem 0;
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--color-surface-2);
  text-decoration: none;
}

.nav-link--indent {
  padding-left: 2rem;
  font-weight: 400;
}

.nav-group-label {
  padding: 0.5rem 1rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-secondary);
}

</style>
