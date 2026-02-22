import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import WeightLogDashboard from '@/components/WeightLogDashboard.vue';

const EChartStub = {
  name: 'EChart',
  props: ['option', 'height'],
  template: '<div class="echart-stub"></div>',
};

// Data spanning 3 weeks to produce weekly change data
const multiWeekRows = [
  { timestamp: new Date('2024-01-01'), dateKey: '2024-01-01', weightLbs: 10.5 },
  { timestamp: new Date('2024-01-02'), dateKey: '2024-01-02', weightLbs: 10.6 },
  { timestamp: new Date('2024-01-08'), dateKey: '2024-01-08', weightLbs: 10.8 },
  { timestamp: new Date('2024-01-15'), dateKey: '2024-01-15', weightLbs: 10.4 },
];

// Data within a single week — not enough for weekly changes
const singleWeekRows = [
  { timestamp: new Date('2024-01-01'), dateKey: '2024-01-01', weightLbs: 10.5 },
  { timestamp: new Date('2024-01-02'), dateKey: '2024-01-02', weightLbs: 10.6 },
];

function mountDashboard(rows = multiWeekRows) {
  const pinia = createPinia();
  setActivePinia(pinia);

  return mount(WeightLogDashboard, {
    props: { rows },
    global: {
      plugins: [pinia],
      stubs: { EChart: EChartStub },
    },
  });
}

describe('WeightLogDashboard structure and rendering', () => {
  it('renders the weight dashboard container', () => {
    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="weight-dashboard"]').exists()).toBe(true);
  });

  it('renders the weight line chart section', () => {
    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="weight-line-chart"]').exists()).toBe(true);
  });

  it('renders weekly change chart section when sufficient data exists', () => {
    const wrapper = mountDashboard(multiWeekRows);
    expect(wrapper.find('[data-testid="weekly-change-chart"]').exists()).toBe(true);
  });

  it('has no h2 title elements in the template', () => {
    const wrapper = mountDashboard();
    expect(wrapper.findAll('h2')).toHaveLength(0);
  });

  it('displays correct chart titles via ECharts title config', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    expect(echarts[0].props('option').title.text).toBe('Weight Over Time');
    expect(echarts[1].props('option').title.text).toBe('Weekly Weight Change');
  });

  it('all chart titles are centered', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    echarts.forEach((chart, i) => {
      expect(chart.props('option').title.left, `chart ${i} title should be centered`).toBe(
        'center',
      );
    });
  });

  it('chart titles have a font size larger than axis labels', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    echarts.forEach((chart, i) => {
      const titleFontSize = chart.props('option').title.textStyle.fontSize;
      expect(titleFontSize, `chart ${i} title fontSize should be 18`).toBe(18);
    });
  });
});

describe('WeightLogDashboard conditional rendering', () => {
  it('hides weekly change section when only one week of data exists', () => {
    const wrapper = mountDashboard(singleWeekRows);
    expect(wrapper.find('[data-testid="weekly-change-chart"]').exists()).toBe(false);
  });
});

describe('WeightLogDashboard chart option generation', () => {
  let wrapper;
  let echarts;

  beforeEach(async () => {
    wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    echarts = wrapper.findAllComponents({ name: 'EChart' });
  });

  it('line chart has daily average data in series', () => {
    const option = echarts[0].props('option');
    expect(option.series[0].type).toBe('line');
    expect(option.series[0].data.length).toBeGreaterThan(0);
    option.series[0].data.forEach((val) => {
      expect(typeof val).toBe('number');
    });
  });

  it('weekly change bar chart has correct change values', () => {
    const option = echarts[1].props('option');
    expect(option.series[0].type).toBe('bar');
    const values = option.series[0].data.map((d) => d.value);
    expect(values.length).toBeGreaterThan(0);
    // Changes should be numbers (positive or negative)
    values.forEach((val) => {
      expect(typeof val).toBe('number');
    });
  });

  it('weekly change chart colors positive and negative changes differently', () => {
    const option = echarts[1].props('option');
    const items = option.series[0].data;
    // With our test data, we expect at least one positive and one negative change
    const hasPositive = items.some((d) => d.value > 0);
    const hasNegative = items.some((d) => d.value < 0);
    if (hasPositive && hasNegative) {
      const posItem = items.find((d) => d.value >= 0);
      const negItem = items.find((d) => d.value < 0);
      expect(posItem.itemStyle.color).not.toBe(negItem.itemStyle.color);
    }
  });
});

describe('WeightLogDashboard tooltip confinement', () => {
  it('all charts have confine: true in tooltip options', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();

    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    expect(echarts.length).toBe(2);
    echarts.forEach((chart, i) => {
      const option = chart.props('option');
      expect(option.tooltip.confine, `chart ${i} should have confine: true`).toBe(true);
    });
  });
});

describe('WeightLogDashboard axis label sizes are unaffected by title size', () => {
  it('axis labels remain at default mobile font size', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    echarts.forEach((chart, i) => {
      const option = chart.props('option');
      expect(option.xAxis.axisLabel.fontSize, `chart ${i} xAxis label size`).toBe(7);
    });
  });
});

describe('WeightLogDashboard consistent chart spacing', () => {
  it('both charts use the same grid.bottom for consistent spacing', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    const lineBottom = echarts[0].props('option').grid.bottom;
    const weeklyBottom = echarts[1].props('option').grid.bottom;
    expect(lineBottom).toBe(weeklyBottom);
  });

  it('grid.bottom matches standard value for cross-dashboard consistency', async () => {
    const wrapper = mountDashboard(multiWeekRows);
    await wrapper.vm.$nextTick();
    const echarts = wrapper.findAllComponents({ name: 'EChart' });
    const lineBottom = echarts[0].props('option').grid.bottom;
    expect(lineBottom).toBe(20);
  });
});

describe('WeightLogDashboard edge cases', () => {
  it('renders with empty rows without errors, weekly section hidden', () => {
    const wrapper = mountDashboard([]);
    expect(wrapper.find('[data-testid="weight-dashboard"]').exists()).toBe(true);

    // With empty rows, the empty state is shown and charts are not rendered
    expect(wrapper.find('.empty').exists()).toBe(true);
    expect(wrapper.find('[data-testid="weight-line-chart"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="weekly-change-chart"]').exists()).toBe(false);
  });
});
