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
    modelValue: string
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
  'update:modelValue': [value: string]
}>()

const dropdownOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)

const activeLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  if (!opt) return ''
  return opt.displayLabel || opt.label
})

const dropdownStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.minWidth) style.minWidth = props.minWidth
  if (props.maxWidth) style.maxWidth = props.maxWidth
  return style
})

function selectOption(value: string): void {
  emit('update:modelValue', value)
  dropdownOpen.value = false
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
        :class="{ active: modelValue === opt.value }"
        :data-testid="testIdPrefix + '-' + opt.value"
        @click="selectOption(opt.value)"
      >
        {{ opt.label }}
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

.dropdown-menu button.active {
  background: var(--color-accent-primary);
  color: var(--color-on-accent);
}
</style>
