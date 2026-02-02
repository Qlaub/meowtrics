let cached = null

export async function loadManifest() {
  if (cached) return cached
  const res = await fetch(import.meta.env.BASE_URL + 'data/manifest.json')
  if (!res.ok) throw new Error('Failed to load manifest')
  cached = await res.json()
  return cached
}

export function getDataset(manifest, id) {
  return manifest.find((d) => d.id === id)
}

export function groupBycat(manifest) {
  const groups = {}
  for (const d of manifest) {
    if (!groups[d.cat]) groups[d.cat] = []
    groups[d.cat].push(d)
  }
  return groups
}
