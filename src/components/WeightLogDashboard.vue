<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'
import { dailyAverages, weeklyChanges } from '@/data/weightLog.js'
import { useChartTheme } from '@/composables/useChartTheme.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const { tokens, tooltipStyle, axisStyle } = useChartTheme()

const daily = computed(() => dailyAverages(props.rows))
const weekly = computed(() => weeklyChanges(daily.value))

const lineOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const p = params[0]
        return `${p.name}<br/>Weight: ${p.value} lbs`
      },
    },
    grid: { left: 50, right: 20, bottom: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: daily.value.map((d) => d.dateKey),
      axisLabel: { rotate: 45, fontSize: 10 },
      ...axisStyle.value,
    },
    yAxis: {
      type: 'value',
      name: 'lbs',
      nameTextStyle: { color: tokens.value['--color-text-secondary'] },
      scale: true,
      ...axisStyle.value,
    },
    series: [
      {
        type: 'line',
        data: daily.value.map((d) => d.avgWeightLbs),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: tokens.value['--color-chart-series-3'] },
      },
    ],
  }
})

const weeklyOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const p = params[0]
        const sign = p.value >= 0 ? '+' : ''
        return `Week of ${p.name}<br/>Change: ${sign}${p.value} lbs`
      },
    },
    grid: { left: 50, right: 20, bottom: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: weekly.value.map((w) => w.dateKey),
      axisLabel: { rotate: 45, fontSize: 10 },
      ...axisStyle.value,
    },
    yAxis: {
      type: 'value',
      name: 'lbs',
      nameTextStyle: { color: tokens.value['--color-text-secondary'] },
      ...axisStyle.value,
    },
    series: [
      {
        type: 'bar',
        data: weekly.value.map((w) => ({
          value: w.change,
          itemStyle: {
            color: w.change >= 0
              ? tokens.value['--color-chart-series-2']
              : tokens.value['--color-chart-series-7'],
          },
        })),
      },
    ],
  }
})
</script>

<template>
  <div class="dashboard">
    <section class="chart-section">
      <h3>Weight Over Time</h3>
      <EChart :option="lineOption" />
    </section>

    <section v-if="weekly.length > 0" class="chart-section">
      <h3>Weekly Weight Change</h3>
      <EChart :option="weeklyOption" />
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chart-section h3 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: var(--color-accent-secondary);
}
</style>
