<script setup>
import { ref } from 'vue'
import { loadManifest, groupBycat } from '@/data/manifest.js'

const manifest = ref([])
const error = ref(null)
const loading = ref(true)

async function load() {
  try {
    manifest.value = await loadManifest()
  } catch {
    error.value = 'Failed to load datasets. Please try again.'
  } finally {
    loading.value = false
  }
}
load()

const grouped = () => groupBycat(manifest.value)
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
        <h2>{{ cat }}</h2>
        <div class="card-grid">
          <RouterLink
            v-for="d in datasets"
            :key="d.id"
            :to="{ name: 'dataset', params: { datasetId: d.id } }"
            class="dataset-card"
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
  color: var(--color-text-muted);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.dataset-card {
  display: block;
  padding: 1.25rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--color-text);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.dataset-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.card-desc {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
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
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
