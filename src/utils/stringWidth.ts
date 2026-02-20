const NARROW_CHARS = new Set('il1.,|: ');
const WIDE_CHARS = new Set('WMmw');

const NARROW_WIDTH = 0.35;
const WIDE_WIDTH = 0.70;
const MEDIUM_WIDTH = 0.55;

export function approximateStringWidth(str: string): number {
  let width = 0;
  for (const ch of str) {
    if (NARROW_CHARS.has(ch)) {
      width += NARROW_WIDTH;
    } else if (WIDE_CHARS.has(ch)) {
      width += WIDE_WIDTH;
    } else {
      width += MEDIUM_WIDTH;
    }
  }
  return width;
}
