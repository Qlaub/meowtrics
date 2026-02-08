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

describe('EChart height prop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('uses default height of 350px when no height prop is provided', () => {
    const wrapper = mount(EChart, {
      props: { option: { series: [] } },
    });
    expect(wrapper.element.style.height).toBe('350px');
  });

  it('applies custom height from prop', () => {
    const wrapper = mount(EChart, {
      props: { option: { series: [] }, height: '500px' },
    });
    expect(wrapper.element.style.height).toBe('500px');
  });
});

describe('EChart resize behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('registers resize listener on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    mount(EChart, {
      props: { option: { series: [] } },
    });
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    addSpy.mockRestore();
  });

  it('calls chart.resize() when window resize event fires', () => {
    mount(EChart, {
      props: { option: { series: [] } },
    });
    window.dispatchEvent(new Event('resize'));
    expect(mockChart.resize).toHaveBeenCalled();
  });
});

describe('EChart cleanup on unmount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('removes resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(EChart, {
      props: { option: { series: [] } },
    });
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('disposes the chart instance on unmount', () => {
    const wrapper = mount(EChart, {
      props: { option: { series: [] } },
    });
    wrapper.unmount();
    expect(mockChart.dispose).toHaveBeenCalled();
  });
});

describe('EChart setOption behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('calls setOption with replace=true when option prop changes', async () => {
    const wrapper = mount(EChart, {
      props: { option: { series: [] } },
    });

    const newOption = { series: [{ data: [1, 2, 3] }] };
    await wrapper.setProps({ option: newOption });
    await nextTick();

    // First call is from onMounted, second from the watcher
    const calls = mockChart.setOption.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toEqual(newOption);
    expect(lastCall[1]).toBe(true);
  });
});
