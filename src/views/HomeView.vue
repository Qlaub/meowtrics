<script setup lang="ts">
import { ref, reactive } from 'vue'
import { loadManifest, groupBycat } from '@/data/manifest'
import { fetchCsv } from '@/data/csv'
import { normalizeWeightLog, calculateWeightTrend } from '@/data/weightLog'
import type { DatasetManifestEntry } from '@/types/manifest'
import type { WeightTrend } from '@/data/weightLog'

const manifest = ref<DatasetManifestEntry[]>([])
const error = ref<string | null>(null)
const loading = ref<boolean>(true)
const trends = reactive<Record<string, WeightTrend>>({})

async function load(): Promise<void> {
  try {
    manifest.value = await loadManifest()
    loadTrends()
  } catch {
    error.value = 'Failed to load datasets. Please try again.'
  } finally {
    loading.value = false
  }
}

async function loadTrends(): Promise<void> {
  const weightDatasets = manifest.value.filter((d) => d.type === 'weight_log')
  for (const ds of weightDatasets) {
    try {
      const rows = await fetchCsv(ds.file)
      const normalized = normalizeWeightLog(rows)
      const trend = calculateWeightTrend(normalized)
      if (trend) trends[ds.cat] = trend
    } catch {
      // Silently skip — trend is optional decoration
    }
  }
}

function trendArrow(direction: 'up' | 'down' | 'equal'): string {
  if (direction === 'down') return '↓'
  if (direction === 'up') return '↑'
  return '='
}

load()

const grouped = (): Record<string, DatasetManifestEntry[]> => groupBycat(manifest.value)
</script>

<template>
  <div class="home">
    <h1>Datasets</h1>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loading = true; error = null; load()">Retry</button>
    </div>

    <template v-else>
      <section v-for="(datasets, cat) in grouped()" :key="cat" class="cat-group">
        <h2>
          {{ cat }}
          <span v-if="trends[cat]" class="weight-trend" data-testid="weight-trend">
            {{ trendArrow(trends[cat].direction) }}
            {{ Math.abs(trends[cat].change) }} lbs from last week
          </span>
        </h2>
        <div class="card-grid">
          <RouterLink
            v-for="d in datasets"
            :key="d.id"
            :to="{ name: 'dataset', params: { datasetId: d.id } }"
            class="dataset-card"
            data-testid="dataset-card"
          >
            <div class="card-title">{{ d.title }}</div>
            <div v-if="d.description" class="card-desc">{{ d.description }}</div>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.home h1 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

.cat-group {
  margin-bottom: 2rem;
}

.cat-group h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--color-accent-secondary);
}

.weight-trend {
  font-size: 0.85rem;
  font-weight: 400;
  margin-left: 0.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.dataset-card {
  display: block;
  padding: 1.25rem;
  background: var(--color-surface-card);
  border: 1px solid var(--color-surface-card);
  border-radius: 10px;
  text-decoration: none;
  color: var(--color-on-surface-card);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.dataset-card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  text-decoration: none;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.card-desc {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-on-surface-card);
  opacity: 0.75;
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
  font-size: 0.9rem;
}
</style>
