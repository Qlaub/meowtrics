/**
 * Cummings theme — base palette + extended chart pool.
 *
 * Every semantic token maps to one of these named swatches.
 * No raw RGB literals should appear in the token block below.
 */

const palette = {
  black1: 'rgb(39, 38, 42)',
  black2: 'rgb(41, 34, 31)',
  white1: 'rgb(226, 234, 243)',
  white2: 'rgb(239, 239, 231)',
  cream: 'rgb(217, 210, 166)',
  sage: 'rgb(146, 148, 112)',
  blush: 'rgb(214, 168, 173)',
  rose: 'rgb(204, 132, 131)',
}

/** Derived from palette.white2 at low opacity — for subtle dividers on dark surfaces. */
const borderMix = 'rgba(239, 239, 231, 0.12)'

const extended = {
  orange: 'rgb(165, 112, 56)',
  grey: 'rgb(153, 153, 153)',
  blue: 'rgb(104, 172, 209)',
  green: 'rgb(106, 153, 119)',
  yellow: 'rgb(231, 190, 87)',
  pinkDark: 'rgb(89, 48, 55)',
  pinkMid: 'rgb(153, 90, 97)',
  pinkLight: 'rgb(230, 190, 195)',
}

export default {
  id: 'cummings',
  name: 'Cummings',
  tokens: {
    // Surfaces
    '--color-bg-primary': palette.black2,
    '--color-bg-secondary': palette.black1,
    '--color-surface-1': palette.black1,
    '--color-surface-2': palette.black2,
    '--color-surface-card': palette.white1,
    '--color-on-surface-card': palette.black2,

    // Text
    '--color-text-primary': palette.white2,
    '--color-text-secondary': palette.white1,
    '--color-text-muted': palette.sage,

    // Accents & borders
    '--color-accent-primary': palette.cream,
    '--color-accent-secondary': palette.blush,
    '--color-on-accent': palette.black2,
    '--color-border-subtle': borderMix,
    '--color-border-strong': palette.cream,
    '--color-focus-ring': extended.blue,

    // Charts
    '--color-chart-bg': palette.black2,
    '--color-chart-grid': borderMix,
    '--color-chart-axis': palette.white1,
    '--color-chart-tooltip-bg': palette.black1,
    '--color-chart-tooltip-text': palette.white2,

    // Heatmap gradient (low → high)
    '--color-chart-heatmap-low': extended.pinkDark,
    '--color-chart-heatmap-mid': extended.pinkMid,
    '--color-chart-heatmap-high': extended.pinkLight,

    // Chart series (base palette first, then extended pool)
    '--color-chart-series-1': palette.cream,
    '--color-chart-series-2': extended.green,
    '--color-chart-series-3': extended.blue,
    '--color-chart-series-4': extended.yellow,
    '--color-chart-series-5': extended.orange,
    '--color-chart-series-6': palette.blush,
    '--color-chart-series-7': palette.rose,
    '--color-chart-series-8': extended.grey,
  },
}
