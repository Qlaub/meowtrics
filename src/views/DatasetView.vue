<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadManifest, getDataset } from '@/data/manifest'
import { fetchCsv } from '@/data/csv'
import { normalizeLunchLog } from '@/data/lunchLog'
import { normalizeWeightLog } from '@/data/weightLog'
import { normalizeEventLog } from '@/data/eventLog'
import type { DatasetManifestEntry } from '@/types/manifest'
import type { NormalizedLunchLogEntry } from '@/types/lunchLog'
import type { NormalizedWeightLogEntry } from '@/types/weightLog'
import type { NormalizedEventLogEntry } from '@/types/eventLog'
import LunchLogDashboard from '@/components/LunchLogDashboard.vue'
import WeightLogDashboard from '@/components/WeightLogDashboard.vue'
import EventLogDashboard from '@/components/EventLogDashboard.vue'

type NormalizedRow = NormalizedLunchLogEntry | NormalizedWeightLogEntry | NormalizedEventLogEntry

const route = useRoute()
const dataset = ref<DatasetManifestEntry | undefined>(undefined)
const rows = ref<NormalizedRow[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

async function load(id: string | string[]): Promise<void> {
  const datasetId = Array.isArray(id) ? id[0] : id
  if (!datasetId) {
    error.value = 'No dataset ID provided'
    return
  }
  loading.value = true
  error.value = null
  try {
    const manifest = await loadManifest()
    dataset.value = getDataset(manifest, datasetId)
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
    if (id !== undefined) load(id)
  },
  { immediate: true },
)

</script>

<template>
  <div class="dataset-view">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button v-if="route.params.datasetId" @click="load(route.params.datasetId)">Retry</button>
    </div>

    <template v-else-if="dataset">
      <h1>{{ dataset.cat }} — {{ dataset.title }}</h1>

      <LunchLogDashboard
        v-if="dataset.type === 'lunch_log'"
        :rows="rows as NormalizedLunchLogEntry[]"
      />
      <WeightLogDashboard
        v-else-if="dataset.type === 'weight_log'"
        :rows="rows as NormalizedWeightLogEntry[]"
      />
      <EventLogDashboard
        v-else-if="dataset.type === 'event_log'"
        :rows="rows as NormalizedEventLogEntry[]"
      />
    </template>
  </div>
</template>

<style scoped>
.dataset-view h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.loading {
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
