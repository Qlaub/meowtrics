<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  testIdPrefix: {
    type: String,
    default: 'date-range',
  },
})

const emit = defineEmits(['update:modelValue'])

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const triggerLabel = computed(() => {
  const { start, end } = props.modelValue
  if (start && end) return `${start} – ${end}`
  if (start) return `${start} – …`
  if (end) return `… – ${end}`
  return 'Select dates'
})

function updateDate(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="range-dropdown">
    <button
      class="dropdown-trigger"
      :data-testid="testIdPrefix + '-trigger'"
      @click="dropdownOpen = !dropdownOpen"
    >
      <span>{{ triggerLabel }}</span>
      <span class="dropdown-arrow">▾</span>
    </button>
    <div v-if="dropdownOpen" class="dropdown-menu">
      <div class="date-inputs">
        <input
          type="date"
          :data-testid="testIdPrefix + '-start'"
          :value="modelValue.start"
          @input="updateDate('start', $event.target.value)"
        />
        <input
          type="date"
          :data-testid="testIdPrefix + '-end'"
          :value="modelValue.end"
          @input="updateDate('end', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.range-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.dropdown-arrow {
  font-size: 0.75rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  min-width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.date-inputs {
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
}

.date-inputs input[type='date'] {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.85rem;
  min-height: 36px;
}
</style>
