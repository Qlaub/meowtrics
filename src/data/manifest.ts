import type { DatasetManifest, DatasetManifestEntry } from '@/types'

let cached: DatasetManifest | null = null

export async function loadManifest(): Promise<DatasetManifest> {
  if (cached) return cached
  const res = await fetch(import.meta.env.BASE_URL + 'data/manifest.json')
  if (!res.ok) throw new Error('Failed to load manifest')
  cached = (await res.json()) as DatasetManifest
  return cached
}

export function getDataset(
  manifest: DatasetManifest,
  id: string,
): DatasetManifestEntry | undefined {
  return manifest.find((d) => d.id === id)
}

export function groupBycat(manifest: DatasetManifest): Record<string, DatasetManifestEntry[]> {
  const groups: Record<string, DatasetManifestEntry[]> = {}
  for (const d of manifest) {
    if (!groups[d.cat]) groups[d.cat] = []
    const group = groups[d.cat]
    if (group) group.push(d)
  }
  return groups
}
