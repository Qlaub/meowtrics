<script setup>
import DropdownButton from '@/components/DropdownButton.vue'

const props = defineProps({
  filters: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function buildDropdownOptions(options) {
  return [{ value: '', label: 'All' }, ...options.map((o) => ({ value: o, label: o }))]
}

function updateFilter(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="filter-bar" data-testid="filter-bar">
    <div v-for="filter in filters" :key="filter.key" class="filter-group">
      <label :for="'filter-' + filter.key">{{ filter.label }}</label>
      <DropdownButton
        v-if="filter.type === 'select'"
        :options="buildDropdownOptions(filter.options)"
        :modelValue="modelValue[filter.key]"
        :testIdPrefix="'filter-' + filter.key"
        @update:modelValue="updateFilter(filter.key, $event)"
      />
      <input
        v-else-if="filter.type === 'date'"
        type="date"
        :id="'filter-' + filter.key"
        :data-testid="'filter-' + filter.key"
        :value="modelValue[filter.key]"
        @input="updateFilter(filter.key, $event.target.value)"
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

.filter-group label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.filter-group input[type='date'] {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.85rem;
  min-height: 36px;
}
</style>
