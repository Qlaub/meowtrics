<script setup lang="ts">
import { ref, computed } from 'vue'
import { toDateKey } from '@/data/dates'
import type { NormalizedEventLogEntry } from '@/types/eventLog'
import FilterBar from './FilterBar.vue'

const props = defineProps<{
  rows: NormalizedEventLogEntry[]
}>()

type SortColumn = 'timestamp' | 'cat' | 'eventType' | 'description'
type SortDirection = 'asc' | 'desc'

interface FilterValues {
  cat: string
  event: string
  date: {
    start: string
    end: string
  }
}

const sortColumn = ref<SortColumn>('timestamp')
const sortDirection = ref<SortDirection>('desc')
const filterValues = ref<FilterValues>({ cat: '', event: '', date: { start: '', end: '' } })

const filterDefinitions = computed(() => {
  const cats = [...new Set(props.rows.map((r) => r.cat))].sort()
  const events = [...new Set(props.rows.map((r) => r.eventType))].sort()
  return [
    { key: 'cat', label: 'Cat', type: 'select' as const, options: cats },
    { key: 'event', label: 'Event', type: 'select' as const, options: events },
    { key: 'date', label: 'Date', type: 'date_range' as const },
  ]
})

const filterBarModelValue = computed(() => filterValues.value as unknown as Record<string, string | { start: string; end: string }>)

function updateFilters(newValues: unknown): void {
  filterValues.value = newValues as FilterValues
}

const filteredRows = computed((): NormalizedEventLogEntry[] => {
  return props.rows.filter((row) => {
    if (filterValues.value.cat && row.cat !== filterValues.value.cat) return false
    if (filterValues.value.event && row.eventType !== filterValues.value.event) return false
    const { start, end } = filterValues.value.date
    if (start) {
      const startDateKey = toDateKey(new Date(start + 'T00:00:00'))
      if (row.dateKey < startDateKey) return false
    }
    if (end) {
      const endDateKey = toDateKey(new Date(end + 'T00:00:00'))
      if (row.dateKey > endDateKey) return false
    }
    return true
  })
})

const sortedRows = computed((): NormalizedEventLogEntry[] => {
  const col = sortColumn.value
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    if (col === 'timestamp') {
      return (a.timestamp.getTime() - b.timestamp.getTime()) * dir
    }
    return String(a[col]).localeCompare(String(b[col])) * dir
  })
})

function toggleSort(column: SortColumn): void {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

function sortIndicator(column: SortColumn): string {
  if (sortColumn.value !== column) return ''
  return sortDirection.value === 'asc' ? ' ▴' : ' ▾'
}

function formatDateTime(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = date.getFullYear()
  let h = date.getHours()
  const min = String(date.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${m}/${d}/${y} ${h}:${min} ${ampm}`
}
</script>

<template>
  <div class="event-log-dashboard" data-testid="event-log-dashboard">
    <FilterBar
      :filters="filterDefinitions"
      :model-value="filterBarModelValue"
      @update:model-value="updateFilters"
    />
    <div class="table-wrapper">
      <table data-testid="event-log-table">
        <thead>
          <tr>
            <th data-testid="sort-cat" @click="toggleSort('cat')">
              Cat{{ sortIndicator('cat') }}
            </th>
            <th data-testid="sort-event" @click="toggleSort('eventType')">
              Event{{ sortIndicator('eventType') }}
            </th>
            <th data-testid="sort-description" @click="toggleSort('description')">
              Description{{ sortIndicator('description') }}
            </th>
            <th data-testid="sort-date" @click="toggleSort('timestamp')">
              Date/time{{ sortIndicator('timestamp') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in sortedRows" :key="idx">
            <td>{{ row.cat }}</td>
            <td>{{ row.eventType }}</td>
            <td>{{ row.description }}</td>
            <td>{{ formatDateTime(row.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

thead th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 2px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

thead th:hover {
  color: var(--color-text-primary);
}

tbody td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
}

tbody tr:last-child td {
  border-bottom: none;
}
</style>
