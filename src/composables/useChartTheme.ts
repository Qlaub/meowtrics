import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

interface TooltipStyle {
  backgroundColor: string
  borderColor: string
  textStyle: { color: string }
  confine: boolean
}

interface AxisStyle {
  axisLine: { lineStyle: { color: string } }
  axisLabel: { color: string }
  splitLine: { lineStyle: { color: string } }
}

interface ChartTheme {
  tokens: ComputedRef<Record<string, string>>
  seriesColors: ComputedRef<string[]>
  tooltipStyle: ComputedRef<TooltipStyle>
  axisStyle: ComputedRef<AxisStyle>
}

export function useChartTheme(): ChartTheme {
  const theme = useThemeStore()

  const tokens = computed(() => theme.activeTheme.tokens)

  const getToken = (key: string): string => tokens.value[key] ?? ''

  const seriesColors = computed((): string[] => [
    getToken('--color-chart-series-1'),
    getToken('--color-chart-series-2'),
    getToken('--color-chart-series-3'),
    getToken('--color-chart-series-4'),
    getToken('--color-chart-series-5'),
    getToken('--color-chart-series-6'),
    getToken('--color-chart-series-7'),
    getToken('--color-chart-series-8'),
  ])

  const tooltipStyle = computed((): TooltipStyle => ({
    backgroundColor: getToken('--color-chart-tooltip-bg'),
    borderColor: getToken('--color-border-subtle'),
    textStyle: { color: getToken('--color-chart-tooltip-text') },
    confine: true,
  }))

  const axisStyle = computed((): AxisStyle => ({
    axisLine: { lineStyle: { color: getToken('--color-chart-axis') } },
    axisLabel: { color: getToken('--color-text-secondary') },
    splitLine: { lineStyle: { color: getToken('--color-chart-grid') } },
  }))

  return { tokens, seriesColors, tooltipStyle, axisStyle }
}
