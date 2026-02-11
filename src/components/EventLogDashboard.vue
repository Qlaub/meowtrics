<script setup>
import { ref, computed } from 'vue'
import { toDateKey } from '@/data/dates.js'
import FilterBar from './FilterBar.vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
})

const sortColumn = ref('timestamp')
const sortDirection = ref('desc')
const filterValues = ref({ cat: '', event: '', date: '' })

const filterDefinitions = computed(() => {
  const cats = [...new Set(props.rows.map((r) => r.cat))].sort()
  const events = [...new Set(props.rows.map((r) => r.eventType))].sort()
  return [
    { key: 'cat', label: 'Cat', type: 'select', options: cats },
    { key: 'event', label: 'Event', type: 'select', options: events },
    { key: 'date', label: 'Date', type: 'date' },
  ]
})

const filteredRows = computed(() => {
  return props.rows.filter((row) => {
    if (filterValues.value.cat && row.cat !== filterValues.value.cat) return false
    if (filterValues.value.event && row.eventType !== filterValues.value.event) return false
    if (filterValues.value.date) {
      const inputDate = new Date(filterValues.value.date + 'T00:00:00')
      const rowDateKey = row.dateKey
      const filterDateKey = toDateKey(inputDate)
      if (rowDateKey !== filterDateKey) return false
    }
    return true
  })
})

const sortedRows = computed(() => {
  const col = sortColumn.value
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    if (col === 'timestamp') {
      return (a.timestamp - b.timestamp) * dir
    }
    return String(a[col]).localeCompare(String(b[col])) * dir
  })
})

function toggleSort(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

function sortIndicator(column) {
  if (sortColumn.value !== column) return ''
  return sortDirection.value === 'asc' ? ' \u25B4' : ' \u25BE'
}

function formatDateTime(date) {
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
      :model-value="filterValues"
      @update:model-value="filterValues = $event"
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
