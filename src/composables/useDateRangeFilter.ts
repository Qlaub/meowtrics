import { ref, computed } from 'vue'
import { filterByRange } from '@/data/dates'

export function useDateRangeFilter<T>(getRows: () => T[], dateField: keyof T) {
  const range = ref<'all' | '30' | '90'>('all')
  const rangeOptions = [
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
  ]
  const filteredRows = computed((): T[] =>
    filterByRange(
      getRows() as unknown as Record<string, unknown>[],
      dateField as string,
      range.value,
    ) as unknown as T[],
  )
  return { range, rangeOptions, filteredRows }
}
