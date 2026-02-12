/**
 * Manifest Types
 * Describes dataset entries in public/data/manifest.json
 */

export type DatasetType = 'lunch_log' | 'weight_log' | 'event_log'

export interface DatasetManifestEntry {
  id: string
  title: string
  file: string
  type: DatasetType
  cat: string
  description?: string
}

export type DatasetManifest = DatasetManifestEntry[]
