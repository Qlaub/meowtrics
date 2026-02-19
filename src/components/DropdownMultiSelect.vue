<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface DropdownOption {
  value: string
  label: string
  displayLabel?: string
}

const props = withDefaults(
  defineProps<{
    options: DropdownOption[]
    modelValue: string[]
    title?: string
    testIdPrefix?: string
    width?: string
    minWidth?: string
    maxWidth?: string
  }>(),
  {
    testIdPrefix: 'filter',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const dropdownOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)

const activeLabel = computed(() => {
  if (props.modelValue.length === 0) {
    return props.title ? `All: ${props.title}` : 'All'
  }
  if (props.modelValue.length === 1) {
    const opt = props.options.find((o) => o.value === props.modelValue[0])
    if (!opt) return ''
    return opt.displayLabel || opt.label
  }
  // Multiple selections
  const firstOpt = props.options.find((o) => o.value === props.modelValue[0])
  if (!firstOpt) return ''
  const firstLabel = firstOpt.displayLabel || firstOpt.label
  return `${firstLabel}...`
})

const dropdownStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.minWidth) style.minWidth = props.minWidth
  if (props.maxWidth) style.maxWidth = props.maxWidth
  return style
})

function toggleOption(value: string): void {
  const currentSelections = [...props.modelValue]
  const index = currentSelections.indexOf(value)

  if (index >= 0) {
    // Remove from selection
    currentSelections.splice(index, 1)
  } else {
    // Add to selection
    currentSelections.push(value)
  }

  emit('update:modelValue', currentSelections)
}

function isSelected(value: string): boolean {
  return props.modelValue.includes(value)
}

function handleClickOutside(e: MouseEvent): void {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="range-dropdown" :style="dropdownStyle">
    <button
      class="dropdown-trigger"
      data-testid="dropdown-trigger"
      @click="dropdownOpen = !dropdownOpen"
    >
      <span>{{ activeLabel }}</span>
      <span class="dropdown-arrow">▾</span>
    </button>
    <div v-if="dropdownOpen" class="dropdown-menu">
      <button
        v-for="opt in options"
        :key="opt.value"
        :class="{ active: isSelected(opt.value) }"
        :data-testid="testIdPrefix + '-' + opt.value"
        @click="toggleOption(opt.value)"
      >
        <span class="checkbox">{{ isSelected(opt.value) ? '☑' : '☐' }}</span>
        <span>{{ opt.label }}</span>
      </button>
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
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  width: 100%;
}

.dropdown-arrow {
  font-size: 0.75rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  min-height: 44px;
  border: none;
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  text-align: left;
}

.dropdown-menu button:hover:not(.active) {
  background: var(--color-hover-bg);
  color: var(--color-on-hover);
}

.dropdown-menu button.active {
  background: var(--color-selected-bg);
  color: var(--color-on-selected);
}

.checkbox {
  font-size: 1rem;
  line-height: 1;
}
</style>
