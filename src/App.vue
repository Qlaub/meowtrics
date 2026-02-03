<script setup>
import { ref, watch } from 'vue'
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
</script>

<template>
  <header class="app-header">
    <button class="hamburger" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
      <span :class="{ open: menuOpen }"></span>
    </button>
    <RouterLink to="/" class="app-title">Meowtrics</RouterLink>
    <ThemeSwitch />
  </header>

  <nav v-if="menuOpen" class="nav-menu">
    <RouterLink to="/" class="nav-link">Home</RouterLink>
    <template v-for="(datasets, cat) in grouped()" :key="cat">
      <div class="nav-group-label">{{ cat }}</div>
      <RouterLink
        v-for="d in datasets"
        :key="d.id"
        :to="{ name: 'dataset', params: { datasetId: d.id } }"
        class="nav-link nav-link--indent"
      >
        {{ d.title }}
      </RouterLink>
    </template>
  </nav>

  <main>
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

.nav-menu {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-1);
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
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
