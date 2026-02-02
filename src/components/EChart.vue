<script setup>
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '350px' },
})

const el = ref(null)
const chart = shallowRef(null)

onMounted(() => {
  chart.value = echarts.init(el.value)
  chart.value.setOption(props.option)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})

watch(
  () => props.option,
  (opt) => {
    chart.value?.setOption(opt, true)
  },
  { deep: true },
)

function handleResize() {
  chart.value?.resize()
}
</script>

<template>
  <div ref="el" :style="{ width: '100%', height }"></div>
</template>
