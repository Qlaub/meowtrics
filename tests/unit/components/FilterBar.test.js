import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterBar from '@/components/FilterBar.vue';

const selectFilter = { key: 'color', label: 'Color', type: 'select', options: ['Red', 'Blue'] };
const dateFilter = { key: 'date', label: 'Date', type: 'date' };

function mountFilterBar(filters = [selectFilter, dateFilter], modelValue = { color: '', date: '' }) {
  return mount(FilterBar, {
    props: { filters, modelValue },
    attachTo: document.body,
  });
}

describe('FilterBar rendering', () => {
  it('renders filter-bar container with data-testid', () => {
    const wrapper = mountFilterBar();
    expect(wrapper.find('[data-testid="filter-bar"]').exists()).toBe(true);
  });

  it('renders a control for each filter definition', () => {
    const wrapper = mountFilterBar();
    expect(wrapper.find('[data-testid="dropdown-trigger"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-date"]').exists()).toBe(true);
  });

  it('select filter shows "All" as first option plus provided options', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    const allOption = wrapper.find('[data-testid="filter-color-"]');
    const redOption = wrapper.find('[data-testid="filter-color-Red"]');
    const blueOption = wrapper.find('[data-testid="filter-color-Blue"]');
    expect(allOption.exists()).toBe(true);
    expect(allOption.text()).toBe('All');
    expect(redOption.exists()).toBe(true);
    expect(redOption.text()).toBe('Red');
    expect(blueOption.exists()).toBe(true);
    expect(blueOption.text()).toBe('Blue');
  });

  it('date filter renders an input of type date', () => {
    const wrapper = mountFilterBar();
    const input = wrapper.find('[data-testid="filter-date"]');
    expect(input.element.type).toBe('date');
  });

  it('renders labels for each filter', () => {
    const wrapper = mountFilterBar();
    const labels = wrapper.findAll('label');
    expect(labels.some((l) => l.text() === 'Color')).toBe(true);
    expect(labels.some((l) => l.text() === 'Date')).toBe(true);
  });
});

describe('FilterBar interaction', () => {
  it('selecting a value emits update:modelValue with updated filter state', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    await wrapper.find('[data-testid="filter-color-Red"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ color: 'Red', date: '' });
  });

  it('changing date input emits updated filter state', async () => {
    const wrapper = mountFilterBar();
    const input = wrapper.find('[data-testid="filter-date"]');
    await input.setValue('2026-01-15');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ color: '', date: '2026-01-15' });
  });

  it('selecting "All" resets that filter key to empty string', async () => {
    const wrapper = mountFilterBar([selectFilter], { color: 'Red' });
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    await wrapper.find('[data-testid="filter-color-"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ color: '' });
  });
});

describe('FilterBar reusability', () => {
  it('accepts arbitrary filter definitions', () => {
    const customFilters = [
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { key: 'created', label: 'Created', type: 'date' },
    ];
    const wrapper = mountFilterBar(customFilters, { status: '', created: '' });
    expect(wrapper.find('[data-testid="dropdown-trigger"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-created"]').exists()).toBe(true);
  });

  it('works with a single filter', () => {
    const wrapper = mountFilterBar([dateFilter], { date: '' });
    expect(wrapper.findAll('.filter-group')).toHaveLength(1);
    expect(wrapper.find('[data-testid="filter-date"]').exists()).toBe(true);
  });
});
