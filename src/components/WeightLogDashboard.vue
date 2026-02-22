<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import EChart from './EChart.vue'
import DropdownButton from './DropdownButton.vue'
import { dailyAverages, weeklyChanges } from '@/data/weightLog'
import type { NormalizedWeightLogEntry, DailyWeightAverage, WeeklyWeightChange } from '@/types/weightLog'
import { useChartTheme } from '@/composables/useChartTheme'
import { useDeviceContextStore } from '@/stores/deviceContext'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'

const props = defineProps<{
  rows: NormalizedWeightLogEntry[]
}>()

const { tokens, tooltipStyle, axisStyle } = useChartTheme()
const deviceContext = useDeviceContextStore()
const { range, rangeOptions, filteredRows } = useDateRangeFilter(() => props.rows, 'timestamp')

function getToken(key: string): string {
  return tokens.value[key] ?? ''
}

const daily = computed((): DailyWeightAverage[] => dailyAverages(filteredRows.value))
const weekly = computed((): WeeklyWeightChange[] => weeklyChanges(daily.value))
const gridMargin = computed(() => ({
  left: deviceContext.isMobileViewport ? 5 : 50,
  right: deviceContext.isMobileViewport ? 5 : 20,
}))
const axisLabelSize = computed((): number => (deviceContext.isMobileViewport ? 7 : 10))
const axisRotate = computed((): number => (deviceContext.isMobileViewport ? 60 : 45))

const chartTitle = (text: string) => ({
  text,
  left: 'center',
  textStyle: { color: getToken('--color-accent-secondary'), fontSize: 18 },
})

const lineOption = computed((): EChartsOption => {
  return {
    title: chartTitle('Weight Over Time'),
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params: unknown) {
        const paramsArray = params as Array<{ name: string; value: number }>
        const p = paramsArray[0]
        if (!p) return ''
        return `${p.name}<br/>Weight: ${p.value} lbs`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: daily.value.map((d) => d.dateKey),
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: axisRotate.value,
        fontSize: axisLabelSize.value,
        interval: 0,
        color: getToken('--color-text-secondary'),
      },
    },
    yAxis: {
      type: 'value',
      name: 'lbs',
      nameTextStyle: { color: getToken('--color-text-secondary') },
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
        itemStyle: { color: getToken('--color-chart-series-3') },
      },
    ],
  }
})

const weeklyOption = computed((): EChartsOption => {
  return {
    title: chartTitle('Weekly Weight Change'),
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params: unknown) {
        const paramsArray = params as Array<{ name: string; value: number }>
        const p = paramsArray[0]
        if (!p) return ''
        const sign = p.value >= 0 ? '+' : ''
        return `Week of ${p.name}<br/>Change: ${sign}${p.value} lbs`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: weekly.value.map((w) => w.dateKey),
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: axisRotate.value,
        fontSize: axisLabelSize.value,
        interval: 0,
        color: getToken('--color-text-secondary'),
      },
    },
    yAxis: {
      type: 'value',
      name: 'lbs',
      nameTextStyle: { color: getToken('--color-text-secondary') },
      ...axisStyle.value,
    },
    series: [
      {
        type: 'bar',
        data: weekly.value.map((w) => ({
          value: w.change,
          itemStyle: {
            color: w.change >= 0
              ? getToken('--color-chart-series-2')
              : getToken('--color-chart-series-7'),
          },
        })),
      },
    ],
  }
})
</script>

<template>
  <div class="dashboard" data-testid="weight-dashboard">
    <DropdownButton
      v-model="range"
      :options="rangeOptions"
      data-testid="date-filter"
      maxWidth="8rem"
    />

    <div v-if="filteredRows.length === 0" class="empty">No data in this range</div>

    <template v-else>
      <section class="chart-section" data-testid="weight-line-chart" aria-label="Weight Over Time chart">
        <EChart :option="lineOption" />
      </section>

      <section v-if="weekly.length > 0" class="chart-section" data-testid="weekly-change-chart" aria-label="Weekly Weight Change chart">
        <EChart :option="weeklyOption" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}
</style>
