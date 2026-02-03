import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'

export function useChartTheme() {
  const theme = useThemeStore()

  const tokens = computed(() => theme.activeTheme.tokens)

  const seriesColors = computed(() => [
    tokens.value['--color-chart-series-1'],
    tokens.value['--color-chart-series-2'],
    tokens.value['--color-chart-series-3'],
    tokens.value['--color-chart-series-4'],
    tokens.value['--color-chart-series-5'],
    tokens.value['--color-chart-series-6'],
    tokens.value['--color-chart-series-7'],
    tokens.value['--color-chart-series-8'],
  ])

  const tooltipStyle = computed(() => ({
    backgroundColor: tokens.value['--color-chart-tooltip-bg'],
    borderColor: tokens.value['--color-border-subtle'],
    textStyle: { color: tokens.value['--color-chart-tooltip-text'] },
  }))

  const axisStyle = computed(() => ({
    axisLine: { lineStyle: { color: tokens.value['--color-chart-axis'] } },
    axisLabel: { color: tokens.value['--color-text-secondary'] },
    splitLine: { lineStyle: { color: tokens.value['--color-chart-grid'] } },
  }))

  return { tokens, seriesColors, tooltipStyle, axisStyle }
}
