<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'
import { aggregateLunchLog, buildHeadToHead } from '@/data/lunchLog.js'
import { useChartTheme } from '@/composables/useChartTheme.js'
import { useDeviceContextStore } from '@/stores/deviceContext.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const { tokens, seriesColors, tooltipStyle, axisStyle } = useChartTheme()
const deviceContext = useDeviceContextStore()

function parseRgb(str) {
  const m = str.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0]
}

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastTextColor(bgRgb) {
  const lum = relativeLuminance(bgRgb)
  return lum > 0.179 ? '#000' : '#fff'
}

const agg = computed(() => aggregateLunchLog(props.rows))
const h2h = computed(() => buildHeadToHead(props.rows))
const barAxisLabelSize = computed(() => (deviceContext.isMobileViewport ? 7 : 10))
const barAxisRotate = computed(() => (deviceContext.isMobileViewport ? 60 : 45))
const gridMargin = computed(() => ({
  left: deviceContext.isMobileViewport ? 5 : 40,
  right: deviceContext.isMobileViewport ? 5 : 20,
}))

function shortName(name) {
  const match = name.match(/^(Pate|Gravy) - Natural (.+?) Recipe$/)
  if (match) {
    const [, type, food] = match
    if (food === 'White Meat Chicken') {
      if (deviceContext.isMobileViewport) {
        return type === 'Pate' ? 'Chicken (p)' : 'Chicken (g)'
      }
      return `Chicken ${type}`
    }
    if (food === 'Trout and Tuna') return 'Trout'
    if (food === 'Wild Alaskan Salmon') return 'Salmon'
    return food
  }
  return name
}

const doubleBarOption = computed(() => {
  const names = agg.value.map((c) => shortName(c.name))
  return {
    color: seriesColors.value,
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const idx = params[0].dataIndex
        const full = agg.value[idx].name
        return `<b>${full}</b><br/>` + params.map((p) => `${p.seriesName}: ${p.value}`).join('<br/>')
      },
    },
    legend: { data: ['Offered', 'Selected'], textStyle: { color: tokens.value['--color-text-secondary'] } },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: barAxisRotate.value, fontSize: barAxisLabelSize.value, interval: 0 },
      ...axisStyle.value,
    },
    yAxis: { type: 'value', ...axisStyle.value },
    series: [
      { name: 'Offered', type: 'bar', data: agg.value.map((c) => c.offered) },
      { name: 'Selected', type: 'bar', data: agg.value.map((c) => c.selected) },
    ],
  }
})

const rateOption = computed(() => {
  const names = agg.value.map((c) => shortName(c.name))
  const rates = agg.value.map((c) => (c.offered ? +((c.selected / c.offered) * 100).toFixed(1) : 0))
  return {
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle.value,
      formatter(params) {
        const idx = params[0].dataIndex
        const full = agg.value[idx].name
        const c = agg.value[idx]
        return `<b>${full}</b><br/>Selection rate: ${params[0].value}%<br/>(${c.selected}/${c.offered})`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: barAxisRotate.value, fontSize: barAxisLabelSize.value, interval: 0 },
      ...axisStyle.value,
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: tokens.value['--color-text-secondary'] }, ...axisStyle.value },
    series: [
      {
        type: 'bar',
        data: rates,
        itemStyle: { color: tokens.value['--color-chart-series-1'] },
      },
    ],
  }
})

const pieOption = computed(() => {
  return {
    color: seriesColors.value,
    tooltip: {
      trigger: 'item',
      ...tooltipStyle.value,
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        data: agg.value
          .filter((c) => c.selected > 0)
          .map((c) => ({ name: shortName(c.name), value: c.selected })),
        label: { fontSize: 11, color: tokens.value['--color-text-secondary'] },
      },
    ],
  }
})

function heatmapCellColor(pct) {
  const stops = [
    parseRgb(tokens.value['--color-chart-heatmap-high']),
    parseRgb(tokens.value['--color-chart-heatmap-mid']),
    parseRgb(tokens.value['--color-chart-heatmap-low']),
  ]
  const t = pct / 100
  const bg =
    t <= 0.5
      ? lerpColor(stops[0], stops[1], t * 2)
      : lerpColor(stops[1], stops[2], (t - 0.5) * 2)
  const bgStr = `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`
  const text = contrastTextColor(bg)
  return { bg: bgStr, text }
}

const heatmapOption = computed(() => {
  const { names, matchups } = h2h.value
  const short = names.map(shortName)

  // Pre-compute colors for each cell so we can use them in the formatter
  const cellColors = {}
  const seriesData = []
  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      if (i === j) continue
      const m = matchups[names[i]]?.[names[j]]
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
    tooltip: {
      ...tooltipStyle.value,
      formatter(params) {
        const [j, i, val] = params.data?.value ?? params.value
        const a = names[i]
        const b = names[j]
        const m = matchups[a]?.[b]
        if (!m) return ''
        return `<b>${shortName(a)} vs ${shortName(b)}</b><br/>${m.wins}/${m.total} (${val}%)`
      },
    },
    grid: { left: gridMargin.value.left, right: gridMargin.value.right, top: 10, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: short,
      axisLabel: { rotate: 45, fontSize: 10, color: tokens.value['--color-text-secondary'] },
      axisLine: { lineStyle: { color: tokens.value['--color-chart-axis'] } },
      position: 'bottom',
    },
    yAxis: {
      type: 'category',
      data: short,
      axisLabel: { fontSize: 10, color: tokens.value['--color-text-secondary'] },
      axisLine: { lineStyle: { color: tokens.value['--color-chart-axis'] } },
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: [
          tokens.value['--color-chart-heatmap-high'],
          tokens.value['--color-chart-heatmap-mid'],
          tokens.value['--color-chart-heatmap-low'],
        ],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData,
        label: {
          show: true,
          formatter(params) {
            const [j, i, pct] = params.data?.value ?? params.value
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
  <div class="dashboard">
    <section class="chart-section">
      <h3>Offered vs Selected</h3>
      <EChart :option="doubleBarOption" />
    </section>

    <section class="chart-section">
      <h3>Selection Rate</h3>
      <EChart :option="rateOption" />
    </section>

    <section class="chart-section">
      <h3>Selection Share</h3>
      <EChart :option="pieOption" />
    </section>

    <section class="chart-section">
      <h3>Head-to-Head</h3>
      <EChart :option="heatmapOption" :height="Math.max(300, h2h.names.length * 50) + 'px'" />
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
