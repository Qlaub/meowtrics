import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EChart from '@/components/EChart.vue';

// Mock echarts
const listeners = {};
const mockChart = {
  setOption: vi.fn(() => {
    // Simulate async finished event after setOption
    setTimeout(() => {
      if (listeners.finished) {
        listeners.finished.forEach((fn) => fn());
      }
    }, 0);
  }),
  on: vi.fn((event, fn) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }),
  resize: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('echarts', () => ({
  init: vi.fn(() => mockChart),
}));

describe('EChart data-rendered attribute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear listeners
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('sets data-rendered="true" after ECharts fires finished event', async () => {
    vi.useFakeTimers();

    const wrapper = mount(EChart, {
      props: { option: { xAxis: {}, yAxis: {}, series: [] } },
    });

    // Initially should be false before finished fires
    expect(wrapper.attributes('data-rendered')).toBe('false');

    // Wait for the async finished event
    await vi.runAllTimersAsync();
    await nextTick();

    expect(wrapper.attributes('data-rendered')).toBe('true');

    vi.useRealTimers();
  });

  it('resets data-rendered to "false" on option change, then back to "true" after re-render', async () => {
    vi.useFakeTimers();

    const wrapper = mount(EChart, {
      props: { option: { xAxis: {}, yAxis: {}, series: [] } },
    });

    // Let initial render complete
    await vi.runAllTimersAsync();
    await nextTick();
    expect(wrapper.attributes('data-rendered')).toBe('true');

    // Change option prop
    await wrapper.setProps({ option: { xAxis: {}, yAxis: {}, series: [{ data: [1] }] } });
    await nextTick();

    // Should reset to false
    expect(wrapper.attributes('data-rendered')).toBe('false');

    // Wait for finished event after re-render
    await vi.runAllTimersAsync();
    await nextTick();

    expect(wrapper.attributes('data-rendered')).toBe('true');

    vi.useRealTimers();
  });

  it('sets data-rendered correctly when finished fires synchronously', async () => {
    // Override setOption to fire finished synchronously
    mockChart.setOption.mockImplementationOnce(() => {
      if (listeners.finished) {
        listeners.finished.forEach((fn) => fn());
      }
    });

    const wrapper = mount(EChart, {
      props: { option: { xAxis: {}, yAxis: {}, series: [] } },
    });

    await nextTick();

    expect(wrapper.attributes('data-rendered')).toBe('true');
  });
});
