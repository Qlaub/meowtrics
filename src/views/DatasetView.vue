<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadManifest, getDataset } from '@/data/manifest.js'
import { fetchCsv } from '@/data/csv.js'
import { normalizeLunchLog } from '@/data/lunchLog.js'
import { normalizeWeightLog } from '@/data/weightLog.js'
import { filterByRange } from '@/data/dates.js'
import LunchLogDashboard from '@/components/LunchLogDashboard.vue'
import WeightLogDashboard from '@/components/WeightLogDashboard.vue'

const route = useRoute()
const dataset = ref(null)
const rows = ref([])
const loading = ref(true)
const error = ref(null)
const range = ref('all')
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const rangeOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

const activeLabel = computed(() => {
  const opt = rangeOptions.find((o) => o.value === range.value)
  return opt ? opt.label : 'All time'
})

function selectRange(value) {
  range.value = value
  dropdownOpen.value = false
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function load(id) {
  loading.value = true
  error.value = null
  try {
    const manifest = await loadManifest()
    dataset.value = getDataset(manifest, id)
    if (!dataset.value) {
      error.value = 'Dataset not found'
      return
    }
    const raw = await fetchCsv(dataset.value.file)
    if (dataset.value.type === 'lunch_log') {
      rows.value = normalizeLunchLog(raw)
    } else {
      rows.value = normalizeWeightLog(raw)
    }
  } catch {
    error.value = 'Failed to load dataset'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.datasetId,
  (id) => {
    if (id) load(id)
  },
  { immediate: true },
)

const filteredRows = computed(() => {
  return filterByRange(rows.value, 'timestamp', range.value)
})
</script>

<template>
  <div class="dataset-view">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="load(route.params.datasetId)">Retry</button>
    </div>

    <template v-else-if="dataset">
      <h1>{{ dataset.cat }} — {{ dataset.title }}</h1>

      <div ref="dropdownRef" class="range-dropdown" data-testid="date-filter">
        <button
          class="dropdown-trigger"
          data-testid="dropdown-trigger"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span>{{ activeLabel }}</span>
          <span class="dropdown-arrow">▾</span>
        </button>
        <div v-if="dropdownOpen" class="dropdown-menu">
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            :class="{ active: range === opt.value }"
            :data-testid="'filter-' + opt.value"
            @click="selectRange(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="filteredRows.length === 0" class="empty">No data in this range</div>

      <LunchLogDashboard
        v-else-if="dataset.type === 'lunch_log'"
        :rows="filteredRows"
      />
      <WeightLogDashboard
        v-else-if="dataset.type === 'weight_log'"
        :rows="filteredRows"
      />
    </template>
  </div>
</template>

<style scoped>
.dataset-view h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.range-dropdown {
  position: relative;
  margin-bottom: 1.5rem;
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.dropdown-arrow {
  font-size: 0.75rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.6rem 1rem;
  min-height: 44px;
  border: none;
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  text-align: left;
}

.dropdown-menu button.active {
  background: var(--color-accent-primary);
  color: var(--color-on-accent);
}

.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.error {
  text-align: center;
  padding: 2rem;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--color-accent-primary);
  color: var(--color-on-accent);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
