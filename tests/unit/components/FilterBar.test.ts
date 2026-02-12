import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterBar from '@/components/FilterBar.vue';

const selectFilter = { key: 'color', label: 'Color', type: 'select', options: ['Red', 'Blue'] };
const dateRangeFilter = { key: 'date', label: 'Date', type: 'date_range' };

function mountFilterBar(
  filters = [selectFilter, dateRangeFilter],
  modelValue = { color: '', date: { start: '', end: '' } },
) {
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

  it('renders a control for each filter definition', async () => {
    const wrapper = mountFilterBar();
    expect(wrapper.find('[data-testid="dropdown-trigger"]').exists()).toBe(true);
    // Date range inputs are inside the dropdown — open it first
    await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
    expect(wrapper.find('[data-testid="filter-date-start"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-date-end"]').exists()).toBe(true);
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

  it('date_range filter renders two inputs of type date inside dropdown', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
    const startInput = wrapper.find('[data-testid="filter-date-start"]');
    const endInput = wrapper.find('[data-testid="filter-date-end"]');
    expect(startInput.element.type).toBe('date');
    expect(endInput.element.type).toBe('date');
  });
});

describe('FilterBar interaction', () => {
  it('selecting a value emits update:modelValue with updated filter state', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    await wrapper.find('[data-testid="filter-color-Red"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
      color: 'Red',
      date: { start: '', end: '' },
    });
  });

  it('changing start date input emits updated filter state', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
    const input = wrapper.find('[data-testid="filter-date-start"]');
    await input.setValue('2026-01-15');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
      color: '',
      date: { start: '2026-01-15', end: '' },
    });
  });

  it('changing end date input emits updated filter state', async () => {
    const wrapper = mountFilterBar();
    await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
    const input = wrapper.find('[data-testid="filter-date-end"]');
    await input.setValue('2026-02-28');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
      color: '',
      date: { start: '', end: '2026-02-28' },
    });
  });

  it('selecting "All" resets that filter key to empty string', async () => {
    const wrapper = mountFilterBar([selectFilter], { color: 'Red' });
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    await wrapper.find('[data-testid="filter-color-"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ color: '' });
  });
});

describe('FilterBar option objects with displayLabel', () => {
  const objectOptionsFilter = {
    key: 'cat',
    label: 'Cat',
    type: 'select',
    options: [
      { value: 'obi', label: 'Obi', displayLabel: 'Cat: Obi' },
      { value: 'cummings', label: 'Cummings', displayLabel: 'Cat: Cummings' },
    ],
  };

  it('preserves displayLabel when options are objects', async () => {
    const wrapper = mountFilterBar([objectOptionsFilter], { cat: '' });
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    const allOption = wrapper.find('[data-testid="filter-cat-"]');
    const obiOption = wrapper.find('[data-testid="filter-cat-obi"]');
    const cummingsOption = wrapper.find('[data-testid="filter-cat-cummings"]');
    expect(allOption.exists()).toBe(true);
    expect(allOption.text()).toBe('All');
    expect(obiOption.exists()).toBe(true);
    expect(obiOption.text()).toBe('Obi');
    expect(cummingsOption.exists()).toBe(true);
    expect(cummingsOption.text()).toBe('Cummings');
  });

  it('trigger shows displayLabel when an object option is selected', () => {
    const wrapper = mountFilterBar([objectOptionsFilter], { cat: 'obi' });
    const trigger = wrapper.find('[data-testid="dropdown-trigger"]');
    expect(trigger.text()).toContain('Cat: Obi');
  });

  it('trigger shows displayLabel for a different selected object option', () => {
    const wrapper = mountFilterBar([objectOptionsFilter], { cat: 'cummings' });
    const trigger = wrapper.find('[data-testid="dropdown-trigger"]');
    expect(trigger.text()).toContain('Cat: Cummings');
  });

  it('plain string options still work alongside object option support', async () => {
    const wrapper = mountFilterBar([selectFilter], { color: '' });
    await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
    const redOption = wrapper.find('[data-testid="filter-color-Red"]');
    expect(redOption.exists()).toBe(true);
    expect(redOption.text()).toBe('Red');
  });
});

describe('FilterBar reusability', () => {
  it('accepts arbitrary filter definitions', async () => {
    const customFilters = [
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { key: 'created', label: 'Created', type: 'date_range' },
    ];
    const wrapper = mountFilterBar(customFilters, {
      status: '',
      created: { start: '', end: '' },
    });
    expect(wrapper.find('[data-testid="dropdown-trigger"]').exists()).toBe(true);
    await wrapper.find('[data-testid="filter-created-trigger"]').trigger('click');
    expect(wrapper.find('[data-testid="filter-created-start"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-created-end"]').exists()).toBe(true);
  });

  it('works with a single filter', async () => {
    const wrapper = mountFilterBar([dateRangeFilter], { date: { start: '', end: '' } });
    expect(wrapper.findAll('.filter-group')).toHaveLength(1);
    await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
    expect(wrapper.find('[data-testid="filter-date-start"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-date-end"]').exists()).toBe(true);
  });
});
