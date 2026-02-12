<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, ECharts } from 'echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string
  }>(),
  {
    height: '350px',
  },
)

const el = ref<HTMLElement | null>(null)
const chart = shallowRef<ECharts | null>(null)
const rendered = ref<boolean>(false)

onMounted(() => {
  if (!el.value) return
  chart.value = echarts.init(el.value)
  chart.value.on('finished', () => {
    rendered.value = true
  })
  chart.value.setOption(props.option)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})

watch(
  () => props.option,
  (opt: EChartsOption) => {
    rendered.value = false
    chart.value?.setOption(opt, true)
  },
  { deep: true },
)

function handleResize(): void {
  chart.value?.resize()
}
</script>

<template>
  <div ref="el" :style="{ width: '100%', height }" :data-rendered="String(rendered)"></div>
</template>
