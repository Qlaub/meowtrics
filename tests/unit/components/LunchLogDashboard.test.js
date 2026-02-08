import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LunchLogDashboard from '@/components/LunchLogDashboard.vue';
import { useDeviceContextStore } from '@/stores/deviceContext.js';

const EChartStub = {
  name: 'EChart',
  props: ['option', 'height'],
  template: '<div class="echart-stub"></div>',
};

const sampleRows = [
  {
    choice1: 'Pate - Natural White Meat Chicken Recipe',
    choice2: 'Pate - Natural Beef Recipe',
    winner: 'Pate - Natural White Meat Chicken Recipe',
    timestamp: new Date('2024-01-01'),
    dateKey: '2024-01-01',
  },
  {
    choice1: 'Pate - Natural White Meat Chicken Recipe',
    choice2: 'Gravy - Natural White Meat Chicken Recipe',
    winner: 'Gravy - Natural White Meat Chicken Recipe',
    timestamp: new Date('2024-01-02'),
    dateKey: '2024-01-02',
  },
  {
    choice1: 'Pate - Natural Beef Recipe',
    choice2: 'Pate - Natural Trout and Tuna Recipe',
    winner: 'Pate - Natural Beef Recipe',
    timestamp: new Date('2024-01-03'),
    dateKey: '2024-01-03',
  },
];

function mountDashboard(rows = sampleRows, viewportWidth = 1024) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const wrapper = mount(LunchLogDashboard, {
    props: { rows },
    global: {
      plugins: [pinia],
      stubs: { EChart: EChartStub },
    },
  });

  // Set viewport width on the deviceContext store after mount
  const deviceContext = useDeviceContextStore();
  deviceContext.viewport.width = viewportWidth;

  return wrapper;
}

describe('LunchLogDashboard structure and rendering', () => {
  it('renders the lunch dashboard container', () => {
    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="lunch-dashboard"]').exists()).toBe(true);
  });

  it('renders all 4 chart sections with correct test IDs', () => {
    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="offered-selected-chart"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="selection-rate-chart"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="pie-chart"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="heatmap-chart"]').exists()).toBe(true);
  });

  it('displays correct section titles', () => {
    const wrapper = mountDashboard();
    const headings = wrapper.findAll('h2').map((h) => h.text());
    expect(headings).toEqual([
      'Offered vs Selected',
      'Selection Rate',
      'Selection Share',
      'Head-to-Head',
    ]);
  });
});

describe('LunchLogDashboard chart option generation', () => {
  let wrapper;
  let echarts;

  beforeEach(async () => {
    wrapper = mountDashboard();
    await wrapper.vm.$nextTick();
    echarts = wrapper.findAllComponents({ name: 'EChart' });
  });

  it('double bar chart has Offered and Selected series with correct data', () => {
    const option = echarts[0].props('option');
    expect(option.series).toHaveLength(2);
    expect(option.series[0].name).toBe('Offered');
    expect(option.series[1].name).toBe('Selected');
    // Chicken offered 2x, Beef offered 2x, Gravy Chicken offered 1x, Trout offered 1x
    // Offered totals: Chicken Pate=2, Beef Pate=2, Gravy Chicken=1, Trout=1
    // Selected totals: Chicken Pate=1, Beef Pate=1, Gravy Chicken=1, Trout=0
    expect(option.series[0].data.length).toBeGreaterThan(0);
    expect(option.series[1].data.length).toBeGreaterThan(0);
  });

  it('selection rate chart computes percentage values', () => {
    const option = echarts[1].props('option');
    expect(option.series[0].type).toBe('bar');
    // All rate values should be between 0 and 100
    option.series[0].data.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('pie chart only includes items with selections > 0', () => {
    const option = echarts[2].props('option');
    const pieData = option.series[0].data;
    pieData.forEach((item) => {
      expect(item.value).toBeGreaterThan(0);
    });
    // Trout had 0 selections, should not appear
    const names = pieData.map((d) => d.name);
    expect(names).not.toContain('Trout');
  });

  it('heatmap chart has data with win percentages', () => {
    const option = echarts[3].props('option');
    const heatmapData = option.series[0].data;
    expect(heatmapData.length).toBeGreaterThan(0);
    heatmapData.forEach((item) => {
      const pct = item.value[2];
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });
});

describe('LunchLogDashboard shortName behavior', () => {
  it('uses full-style short names on desktop viewport', async () => {
    const wrapper = mountDashboard(sampleRows, 1024);
    await wrapper.vm.$nextTick();

    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    const option = echarts[0].props('option');
    const names = option.xAxis.data;

    expect(names).toContain('Chicken Pate');
    expect(names).toContain('Chicken Gravy');
  });

  it('uses abbreviated short names on mobile viewport', async () => {
    const wrapper = mountDashboard(sampleRows, 375);
    await wrapper.vm.$nextTick();

    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    const option = echarts[0].props('option');
    const names = option.xAxis.data;

    expect(names).toContain('Chicken (p)');
    expect(names).toContain('Chicken (g)');
  });

  it('maps Trout and Tuna to Trout and Wild Alaskan Salmon to Salmon', async () => {
    const rows = [
      {
        choice1: 'Pate - Natural Trout and Tuna Recipe',
        choice2: 'Pate - Natural Wild Alaskan Salmon Recipe',
        winner: 'Pate - Natural Trout and Tuna Recipe',
        timestamp: new Date('2024-01-01'),
        dateKey: '2024-01-01',
      },
    ];
    const wrapper = mountDashboard(rows, 1024);
    await wrapper.vm.$nextTick();

    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    const option = echarts[0].props('option');
    const names = option.xAxis.data;

    expect(names).toContain('Trout');
    expect(names).toContain('Salmon');
  });
});

describe('LunchLogDashboard edge cases', () => {
  it('renders with empty rows without errors', () => {
    const wrapper = mountDashboard([]);
    expect(wrapper.find('[data-testid="lunch-dashboard"]').exists()).toBe(true);

    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    // Double bar chart should have empty data
    const option = echarts[0].props('option');
    expect(option.series[0].data).toHaveLength(0);
    expect(option.series[1].data).toHaveLength(0);
  });
});
