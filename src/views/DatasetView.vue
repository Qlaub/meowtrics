<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadManifest, getDataset } from '@/data/manifest.js'
import { fetchCsv } from '@/data/csv.js'
import { normalizeLunchLog } from '@/data/lunchLog.js'
import { normalizeWeightLog } from '@/data/weightLog.js'
import { normalizeEventLog } from '@/data/eventLog.js'
import { filterByRange } from '@/data/dates.js'
import DropdownButton from '@/components/DropdownButton.vue'
import LunchLogDashboard from '@/components/LunchLogDashboard.vue'
import WeightLogDashboard from '@/components/WeightLogDashboard.vue'
import EventLogDashboard from '@/components/EventLogDashboard.vue'

const route = useRoute()
const dataset = ref(null)
const rows = ref([])
const loading = ref(true)
const error = ref(null)
const range = ref('all')

const rangeOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

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
    } else if (dataset.value.type === 'weight_log') {
      rows.value = normalizeWeightLog(raw)
    } else if (dataset.value.type === 'event_log') {
      rows.value = normalizeEventLog(raw)
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

      <DropdownButton
        v-model="range"
        :options="rangeOptions"
        data-testid="date-filter"
      />

      <div v-if="filteredRows.length === 0" class="empty">No data in this range</div>

      <LunchLogDashboard
        v-else-if="dataset.type === 'lunch_log'"
        :rows="filteredRows"
      />
      <WeightLogDashboard
        v-else-if="dataset.type === 'weight_log'"
        :rows="filteredRows"
      />
      <EventLogDashboard
        v-else-if="dataset.type === 'event_log'"
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
