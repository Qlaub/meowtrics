<script setup lang="ts">
import DropdownButton from '@/components/DropdownButton.vue'
import DropdownDateRange from '@/components/DropdownDateRange.vue'
import DropdownMultiSelect from '@/components/DropdownMultiSelect.vue'

interface DropdownOption {
  value: string
  label: string
  displayLabel?: string
}

interface DateRange {
  start: string
  end: string
}

interface Filter {
  key: string
  label: string
  type: 'select' | 'multi_select' | 'date_range'
  options?: (string | DropdownOption)[]
  title?: string
  width?: string
  minWidth?: string
  maxWidth?: string
}

const props = defineProps<{
  filters: Filter[]
  modelValue: Record<string, string | string[] | DateRange>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | string[] | DateRange>]
}>()

function buildDropdownOptions(options: (string | DropdownOption)[] | undefined): DropdownOption[] {
  if (!options) return []
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

function updateFilter(key: string, value: string | string[] | DateRange): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="filter-bar" data-testid="filter-bar">
    <div v-for="filter in filters" :key="filter.key" class="filter-group">
      <DropdownButton
        v-if="filter.type === 'select'"
        :options="buildDropdownOptions(filter.options)"
        :modelValue="modelValue[filter.key] as string"
        :title="filter.title"
        :testIdPrefix="'filter-' + filter.key"
        :width="filter.width"
        :minWidth="filter.minWidth"
        :maxWidth="filter.maxWidth"
        @update:modelValue="updateFilter(filter.key, $event)"
      />
      <DropdownMultiSelect
        v-else-if="filter.type === 'multi_select'"
        :options="buildDropdownOptions(filter.options)"
        :modelValue="(modelValue[filter.key] as string[]) || []"
        :title="filter.title"
        :testIdPrefix="'filter-' + filter.key"
        :width="filter.width"
        :minWidth="filter.minWidth"
        :maxWidth="filter.maxWidth"
        @update:modelValue="updateFilter(filter.key, $event)"
      />
      <DropdownDateRange
        v-else-if="filter.type === 'date_range'"
        :modelValue="(modelValue[filter.key] as DateRange) || { start: '', end: '' }"
        :testIdPrefix="'filter-' + filter.key"
        @update:modelValue="updateFilter(filter.key, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
