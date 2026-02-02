<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'
import { aggregateLunchLog, buildHeadToHead } from '@/data/lunchLog.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const agg = computed(() => aggregateLunchLog(props.rows))
const h2h = computed(() => buildHeadToHead(props.rows))

function shortName(name) {
  return name.replace(/^(Pate|Gravy) - Natural /, '').replace(/ Recipe$/, '')
}

const doubleBarOption = computed(() => {
  const names = agg.value.map((c) => shortName(c.name))
  return {
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const idx = params[0].dataIndex
        const full = agg.value[idx].name
        return `<b>${full}</b><br/>` + params.map((p) => `${p.seriesName}: ${p.value}`).join('<br/>')
      },
    },
    legend: { data: ['Offered', 'Selected'] },
    grid: { left: 40, right: 20, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: { type: 'value' },
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
      formatter(params) {
        const idx = params[0].dataIndex
        const full = agg.value[idx].name
        const c = agg.value[idx]
        return `<b>${full}</b><br/>Selection rate: ${params[0].value}%<br/>(${c.selected}/${c.offered})`
      },
    },
    grid: { left: 40, right: 20, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        type: 'bar',
        data: rates,
        itemStyle: { color: '#e8913a' },
      },
    ],
  }
})

const pieOption = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        data: agg.value
          .filter((c) => c.selected > 0)
          .map((c) => ({ name: shortName(c.name), value: c.selected })),
        label: { fontSize: 11 },
      },
    ],
  }
})

const heatmapOption = computed(() => {
  const { names, matchups } = h2h.value
  const short = names.map(shortName)
  const data = []
  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      if (i === j) {
        data.push([j, i, '-'])
      } else {
        const m = matchups[names[i]]?.[names[j]]
        const pct = m && m.total > 0 ? +((m.wins / m.total) * 100).toFixed(0) : null
        data.push([j, i, pct])
      }
    }
  }
  return {
    tooltip: {
      formatter(params) {
        const [j, i, val] = params.data.value ?? params.value
        if (i === j) return ''
        const a = names[i]
        const b = names[j]
        const m = matchups[a]?.[b]
        if (!m) return ''
        return `<b>${shortName(a)} vs ${shortName(b)}</b><br/>${m.wins}/${m.total} (${val}%)`
      },
    },
    grid: { left: 10, right: 20, top: 10, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: short,
      axisLabel: { rotate: 45, fontSize: 10 },
      position: 'bottom',
    },
    yAxis: {
      type: 'category',
      data: short,
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: { color: ['#f7d4bc', '#e8913a', '#c0392b'] },
    },
    series: [
      {
        type: 'heatmap',
        data: data.filter((d) => d[2] !== '-' && d[2] !== null).map((d) => ({ value: d })),
        label: {
          show: true,
          formatter(params) {
            return params.value[2] + '%'
          },
          fontSize: 10,
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
}
</style>
