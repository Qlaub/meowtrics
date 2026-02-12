import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useChartTheme } from '@/composables/useChartTheme';

function setup() {
  setActivePinia(createPinia());
  return useChartTheme();
}

describe('useChartTheme tooltipStyle', () => {
  it('includes confine: true to keep tooltips within the chart container', () => {
    const { tooltipStyle } = setup();
    expect(tooltipStyle.value.confine).toBe(true);
  });

  it('includes expected theme properties (backgroundColor, borderColor, textStyle)', () => {
    const { tooltipStyle } = setup();
    expect(tooltipStyle.value).toHaveProperty('backgroundColor');
    expect(tooltipStyle.value).toHaveProperty('borderColor');
    expect(tooltipStyle.value).toHaveProperty('textStyle');
    expect(tooltipStyle.value.textStyle).toHaveProperty('color');
  });
});
