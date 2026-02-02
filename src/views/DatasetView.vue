<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadManifest, getDataset } from '@/data/manifest.js'
import { fetchCsv } from '@/data/csv.js'
import { normalizeLunchLog } from '@/data/lunchLog.js'
import { normalizeWeightLog } from '@/data/weightLog.js'
import { filterByRange, toDateKey } from '@/data/dates.js'
import LunchLogDashboard from '@/components/LunchLogDashboard.vue'
import WeightLogDashboard from '@/components/WeightLogDashboard.vue'

const route = useRoute()
const dataset = ref(null)
const rows = ref([])
const loading = ref(true)
const error = ref(null)
const range = ref('all')

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

const stats = computed(() => {
  const r = filteredRows.value
  if (r.length === 0) return null
  const dates = r.map((x) => x.timestamp).sort((a, b) => a - b)
  return {
    count: r.length,
    from: toDateKey(dates[0]),
    to: toDateKey(dates[dates.length - 1]),
  }
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

      <div v-if="stats" class="stats">
        {{ stats.count }} entries &middot; {{ stats.from }} – {{ stats.to }}
      </div>

      <div class="range-filter">
        <button
          v-for="opt in [
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: 'all', label: 'All time' },
          ]"
          :key="opt.value"
          :class="{ active: range === opt.value }"
          @click="range = opt.value"
        >
          {{ opt.label }}
        </button>
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

.stats {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.range-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.range-filter button {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text);
}

.range-filter button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
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
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
