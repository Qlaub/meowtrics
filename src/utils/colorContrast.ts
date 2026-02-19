export type RGB = [number, number, number]

export function relativeLuminance([r, g, b]: RGB): number {
  const normalized = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  const rs = normalized[0] ?? 0
  const gs = normalized[1] ?? 0
  const bs = normalized[2] ?? 0
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function contrastTextColor(bgRgb: RGB): string {
  const lum = relativeLuminance(bgRgb)
  return lum > 0.179 ? '#000' : '#fff'
}
