<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import EChart from './EChart.vue'
import DropdownButton from './DropdownButton.vue'
import { aggregateLunchLog, buildHeadToHead } from '@/data/lunchLog'
import type { NormalizedLunchLogEntry, CanStats, HeadToHeadData } from '@/types/lunchLog'
import { useChartTheme } from '@/composables/useChartTheme'
import { useDeviceContextStore } from '@/stores/deviceContext'
import { relativeLuminance, contrastTextColor } from '@/utils/colorContrast'
import type { RGB } from '@/utils/colorContrast'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'

const props = defineProps<{
  rows: NormalizedLunchLogEntry[]
}>()

const { tokens, seriesColors, tooltipStyle, axisStyle } = useChartTheme()
const deviceContext = useDeviceContextStore()
const { range, rangeOptions, filteredRows } = useDateRangeFilter(() => props.rows, 'timestamp')

function parseRgb(str: string): RGB {
  const m = str.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return [0, 0, 0]
  const r = m[1]
  const g = m[2]
  const b = m[3]
  return [r ? +r : 0, g ? +g : 0, b ? +b : 0]
}

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const agg = computed((): CanStats[] => aggregateLunchLog(filteredRows.value))
const h2h = computed((): HeadToHeadData => buildHeadToHead(filteredRows.value))
const barAxisLabelSize = computed((): number => (deviceContext.isMobileViewport ? 7 : 10))
const barAxisRotate = computed((): number => (deviceContext.isMobileViewport ? 60 : 45))
const gridMargin = computed(() => ({
  left: deviceContext.isMobileViewport ? 5 : 40,
  right: deviceContext.isMobileViewport ? 5 : 20,
}))
const pieRadius = computed((): [string, string] =>
  deviceContext.isMobileViewport ? ['20%', '50%'] : ['30%', '65%'],
)
const pieLabelFontSize = computed((): number => (deviceContext.isMobileViewport ? 9 : 11))

function getToken(key: string): string {
  return tokens.value[key] ?? ''
}

function shortName(name: string): string {
  const match = name.match(/^(Pate|Gravy) - Natural (.+?) Recipe$/)
  if (match) {
    const type = match[1]
    const food = match[2]
    if (!type || !food) return name

    if (food === 'White Meat Chicken') {
      if (deviceContext.isMobileViewport) {
        return type === 'Pate' ? 'Chicken (p)' : 'Chicken (g)'
      }
      return `Chicken ${type}`
    }
    if (food === 'Beef') {
      if (deviceContext.isMobileViewport) {
        return type === 'Pate' ? 'Beef (p)' : 'Beef (g)'
      }
      return `Beef ${type}`
    }
    if (food === 'Trout and Tuna') return 'Trout'
    if (food === 'Wild Alaskan Salmon') return 'Salmon'
    return food
  }
  return name
}

const chartTitle = (text: string) => ({
  text,
  left: 'center',
  textStyle: { color: getToken('--color-accent-secondary'), fontSize: 18 },
})

const doubleBarOption = computed((): EChartsOption => {
  const names = agg.value.map((c) => shortName(c.name))
  return {
    title: chartTitle('Offered vs Selected'),
    color: seriesColors.value,
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params: unknown) {
        const paramsArray = params as Array<{ dataIndex: number; seriesName: string; value: number }>
        const firstParam = paramsArray[0]
        if (!firstParam) return ''
        const idx = firstParam.dataIndex
        const can = agg.value[idx]
        if (!can) return ''
        const full = can.name
        return `<b>${full}</b><br/>` + paramsArray.map((p) => `${p.seriesName}: ${p.value}`).join('<br/>')
      },
    },
    legend: { data: ['Offered', 'Selected'], bottom: 20, textStyle: { color: getToken('--color-text-secondary') } },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 45, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: barAxisRotate.value,
        fontSize: barAxisLabelSize.value,
        interval: 0,
        color: getToken('--color-text-secondary'),
      },
    },
    yAxis: { type: 'value', ...axisStyle.value },
    series: [
      { name: 'Offered', type: 'bar', data: agg.value.map((c) => c.offered) },
      { name: 'Selected', type: 'bar', data: agg.value.map((c) => c.selected) },
    ],
  }
})

const rateOption = computed((): EChartsOption => {
  const names = agg.value.map((c) => shortName(c.name))
  const rates = agg.value.map((c) => (c.offered ? +((c.selected / c.offered) * 100).toFixed(1) : 0))
  return {
    title: chartTitle('Selection Rate'),
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params: unknown) {
        const paramsArray = params as Array<{ dataIndex: number; value: number }>
        const firstParam = paramsArray[0]
        if (!firstParam) return ''
        const idx = firstParam.dataIndex
        const can = agg.value[idx]
        if (!can) return ''
        const full = can.name
        return `<b>${full}</b><br/>Selection rate: ${firstParam.value}%<br/>(${can.selected}/${can.offered})`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: axisStyle.value.axisLine,
      splitLine: axisStyle.value.splitLine,
      axisLabel: {
        rotate: barAxisRotate.value,
        fontSize: barAxisLabelSize.value,
        interval: 0,
        color: getToken('--color-text-secondary'),
      },
    },
    yAxis: { type: 'value', max: 100, ...axisStyle.value, axisLabel: { ...axisStyle.value.axisLabel, formatter: '{value}%' } },
    series: [
      {
        type: 'bar',
        data: rates,
        itemStyle: { color: getToken('--color-chart-series-1') },
      },
    ],
  }
})

const pieOption = computed((): EChartsOption => {
  return {
    title: chartTitle('Selection Share'),
    color: seriesColors.value,
    tooltip: {
      trigger: 'item',
      ...tooltipStyle.value,
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: pieRadius.value,
        data: agg.value
          .filter((c) => c.selected > 0)
          .map((c) => ({ name: shortName(c.name), value: c.selected })),
        label: {
          fontSize: pieLabelFontSize.value,
          color: getToken('--color-text-secondary'),
          overflow: 'break',
          minMargin: 5,
        },
      },
    ],
  }
})

interface CellColors {
  bg: string
  text: string
}

function heatmapCellColor(pct: number): CellColors {
  const stops: RGB[] = [
    parseRgb(getToken('--color-chart-heatmap-high')),
    parseRgb(getToken('--color-chart-heatmap-mid')),
    parseRgb(getToken('--color-chart-heatmap-low')),
  ]
  const t = pct / 100
  const stop0 = stops[0] ?? [0, 0, 0]
  const stop1 = stops[1] ?? [0, 0, 0]
  const stop2 = stops[2] ?? [0, 0, 0]
  const bg = t <= 0.5 ? lerpColor(stop0, stop1, t * 2) : lerpColor(stop1, stop2, (t - 0.5) * 2)
  const bgStr = `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`
  const text = contrastTextColor(bg)
  return { bg: bgStr, text }
}

const heatmapOption = computed((): EChartsOption => {
  const { names, matchups } = h2h.value
  const short = names.map(shortName)

  // Pre-compute colors for each cell so we can use them in the formatter
  const cellColors: Record<string, CellColors> = {}
  const seriesData: Array<{
    value: [number, number, number]
    itemStyle: { color: string }
    emphasis: { itemStyle: { color: string; borderColor: string; borderWidth: number } }
  }> = []
  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      if (i === j) continue
      const nameI = names[i]
      const nameJ = names[j]
      if (!nameI || !nameJ) continue
      const m = matchups[nameI]?.[nameJ]
      const pct = m && m.total > 0 ? +((m.wins / m.total) * 100).toFixed(0) : null
      if (pct === null) continue
      const colors = heatmapCellColor(pct)
      const key = `${j},${i}`
      cellColors[key] = colors
      seriesData.push({
        value: [j, i, pct],
        itemStyle: { color: colors.bg },
        emphasis: { itemStyle: { color: colors.bg, borderColor: '#fff', borderWidth: 2 } },
      })
    }
  }
  return {
    title: chartTitle('Head-to-Head'),
    tooltip: {
      ...tooltipStyle.value,
      formatter(params: unknown) {
        const p = params as { data?: { value: [number, number, number] }; value: [number, number, number] }
        const [j, i, val] = p.data?.value ?? p.value
        const a = names[i ?? 0]
        const b = names[j ?? 0]
        if (!a || !b) return ''
        const m = matchups[a]?.[b]
        if (!m) return ''
        return `<b>${shortName(a)} vs ${shortName(b)}</b><br/>${m.wins}/${m.total} (${val ?? 0}%)`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: short,
      axisLabel: { rotate: 45, fontSize: 10, color: getToken('--color-text-secondary') },
      axisLine: { lineStyle: { color: getToken('--color-chart-axis') } },
      position: 'bottom',
    },
    yAxis: {
      type: 'category',
      data: short,
      axisLabel: { fontSize: 10, color: getToken('--color-text-secondary') },
      axisLine: { lineStyle: { color: getToken('--color-chart-axis') } },
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: [
          getToken('--color-chart-heatmap-high'),
          getToken('--color-chart-heatmap-mid'),
          getToken('--color-chart-heatmap-low'),
        ],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData,
        label: {
          show: true,
          formatter(params: unknown) {
            const p = params as { data?: { value: [number, number, number] }; value: [number, number, number] }
            const [j, i, pct] = p.data?.value ?? p.value
            return `{c${j}_${i}|${pct}%}`
          },
          rich: Object.fromEntries(
            Object.entries(cellColors).map(([key, colors]) => [
              `c${key.replace(',', '_')}`,
              { fontSize: 10, color: colors.text },
            ]),
          ),
        },
        emphasis: {
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
        },
      },
    ],
  }
})
</script>

<template>
  <div class="dashboard" data-testid="lunch-dashboard">
    <DropdownButton
      v-model="range"
      :options="rangeOptions"
      data-testid="date-filter"
      maxWidth="8rem"
    />

    <div v-if="filteredRows.length === 0" class="empty">No data in this range</div>

    <template v-else>
    <section class="chart-section" data-testid="offered-selected-chart" aria-label="Offered vs Selected chart">
      <EChart :option="doubleBarOption" />
    </section>

    <section class="chart-section" data-testid="selection-rate-chart" aria-label="Selection Rate chart">
      <EChart :option="rateOption" />
    </section>

    <section class="chart-section" data-testid="pie-chart" aria-label="Selection Share chart">
      <EChart :option="pieOption" />
    </section>

    <section class="chart-section" data-testid="heatmap-chart" aria-label="Head-to-Head chart">
      <EChart :option="heatmapOption" :height="Math.max(300, h2h.names.length * 50) + 'px'" />
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
