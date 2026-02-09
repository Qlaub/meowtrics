<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'
import { dailyAverages, weeklyChanges } from '@/data/weightLog.js'
import { useChartTheme } from '@/composables/useChartTheme.js'
import { useDeviceContextStore } from '@/stores/deviceContext.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const { tokens, tooltipStyle, axisStyle } = useChartTheme()
const deviceContext = useDeviceContextStore()

const daily = computed(() => dailyAverages(props.rows))
const weekly = computed(() => weeklyChanges(daily.value))
const gridMargin = computed(() => ({
  left: deviceContext.isMobileViewport ? 5 : 50,
  right: deviceContext.isMobileViewport ? 5 : 20,
}))
const axisLabelSize = computed(() => (deviceContext.isMobileViewport ? 7 : 10))
const axisRotate = computed(() => (deviceContext.isMobileViewport ? 60 : 45))

const chartTitle = (text) => ({
  text,
  left: 'center',
  textStyle: { color: tokens.value['--color-accent-secondary'], fontSize: 18 },
})

const lineOption = computed(() => {
  return {
    title: chartTitle('Weight Over Time'),
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const p = params[0]
        return `${p.name}<br/>Weight: ${p.value} lbs`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: daily.value.map((d) => d.dateKey),
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: axisRotate.value,
        fontSize: axisLabelSize.value,
        interval: 0,
        color: tokens.value['--color-text-secondary'],
      },
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
    title: chartTitle('Weekly Weight Change'),
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const p = params[0]
        const sign = p.value >= 0 ? '+' : ''
        return `Week of ${p.name}<br/>Change: ${sign}${p.value} lbs`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: weekly.value.map((w) => w.dateKey),
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: axisRotate.value,
        fontSize: axisLabelSize.value,
        interval: 0,
        color: tokens.value['--color-text-secondary'],
      },
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
  <div class="dashboard" data-testid="weight-dashboard">
    <section class="chart-section" data-testid="weight-line-chart" aria-label="Weight Over Time chart">
      <EChart :option="lineOption" />
    </section>

    <section v-if="weekly.length > 0" class="chart-section" data-testid="weekly-change-chart" aria-label="Weekly Weight Change chart">
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

</style>
