import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EventLogDashboard from '@/components/EventLogDashboard.vue';
import FilterBar from '@/components/FilterBar.vue';

const sampleRows = [
  {
    cat: 'Obi',
    eventType: 'Vet visit',
    description: 'Annual checkup',
    timestamp: new Date('2026-01-15T10:00:00-05:00'),
    dateKey: '01/15/2026',
  },
  {
    cat: 'Cummings',
    eventType: 'Vet visit',
    description: 'Dental cleaning',
    timestamp: new Date('2026-01-20T14:30:00-05:00'),
    dateKey: '01/20/2026',
  },
  {
    cat: 'Obi',
    eventType: 'Medication',
    description: 'Started new supplement',
    timestamp: new Date('2026-02-01T09:00:00-05:00'),
    dateKey: '02/01/2026',
  },
];

function mountDashboard(rows = sampleRows) {
  return mount(EventLogDashboard, {
    props: { rows },
  });
}

function getTableRows(wrapper) {
  return wrapper.findAll('tbody tr');
}

function getCellTexts(wrapper, colIndex) {
  return getTableRows(wrapper).map((row) => row.findAll('td')[colIndex].text());
}

describe('EventLogDashboard structure', () => {
  it('renders event-log-dashboard container', () => {
    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="event-log-dashboard"]').exists()).toBe(true);
  });

  it('renders event-log-table with correct column headers', () => {
    const wrapper = mountDashboard();
    const table = wrapper.find('[data-testid="event-log-table"]');
    expect(table.exists()).toBe(true);
    const headers = table.findAll('th');
    expect(headers).toHaveLength(4);
    expect(headers[0].text()).toContain('Cat');
    expect(headers[1].text()).toContain('Event');
    expect(headers[2].text()).toContain('Description');
    expect(headers[3].text()).toContain('Date/time');
  });

  it('renders FilterBar component', () => {
    const wrapper = mountDashboard();
    expect(wrapper.findComponent(FilterBar).exists()).toBe(true);
  });

  it('displays all rows in table body', () => {
    const wrapper = mountDashboard();
    expect(getTableRows(wrapper)).toHaveLength(3);
  });

  it('displays correct data in table cells', () => {
    const wrapper = mountDashboard();
    const cats = getCellTexts(wrapper, 0);
    expect(cats).toContain('Obi');
    expect(cats).toContain('Cummings');
  });
});

describe('EventLogDashboard sorting', () => {
  it('default sort is by timestamp descending', () => {
    const wrapper = mountDashboard();
    const dates = getCellTexts(wrapper, 3);
    // Most recent first (Feb 1, then Jan 20, then Jan 15)
    expect(dates[0]).toContain('02/01/2026');
    expect(dates[1]).toContain('01/20/2026');
    expect(dates[2]).toContain('01/15/2026');
  });

  it('clicking a column header sorts by that column ascending', async () => {
    const wrapper = mountDashboard();
    await wrapper.find('[data-testid="sort-cat"]').trigger('click');
    const cats = getCellTexts(wrapper, 0);
    // Ascending: Cummings before Obi
    expect(cats[0]).toBe('Cummings');
  });

  it('clicking the same column header again toggles to descending', async () => {
    const wrapper = mountDashboard();
    const catHeader = wrapper.find('[data-testid="sort-cat"]');
    await catHeader.trigger('click'); // asc
    await catHeader.trigger('click'); // desc
    const cats = getCellTexts(wrapper, 0);
    // Descending: Obi before Cummings
    expect(cats[0]).toBe('Obi');
  });

  it('string columns sort alphabetically', async () => {
    const wrapper = mountDashboard();
    await wrapper.find('[data-testid="sort-event"]').trigger('click');
    const events = getCellTexts(wrapper, 1);
    // Ascending: Medication before Vet visit
    expect(events[0]).toBe('Medication');
    expect(events[1]).toBe('Vet visit');
  });

  it('timestamp column sorts chronologically', async () => {
    const wrapper = mountDashboard();
    const dateHeader = wrapper.find('[data-testid="sort-date"]');
    // Default is desc, click once for asc
    await dateHeader.trigger('click');
    const dates = getCellTexts(wrapper, 3);
    // Ascending: oldest first
    expect(dates[0]).toContain('01/15/2026');
    expect(dates[2]).toContain('02/01/2026');
  });

  it('sort indicator appears on active column', async () => {
    const wrapper = mountDashboard();
    // Default sort is timestamp desc
    const dateHeader = wrapper.find('[data-testid="sort-date"]');
    expect(dateHeader.text()).toContain('\u25BE'); // down arrow
  });
});

describe('EventLogDashboard filtering', () => {
  it('filtering by cat shows only matching rows', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: 'Obi',
      event: '',
      date: { start: '', end: '' },
    });
    await wrapper.vm.$nextTick();
    const cats = getCellTexts(wrapper, 0);
    expect(cats.every((c) => c === 'Obi')).toBe(true);
    expect(cats).toHaveLength(2);
  });

  it('filtering by event type shows only matching rows', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: '',
      event: 'Medication',
      date: { start: '', end: '' },
    });
    await wrapper.vm.$nextTick();
    const events = getCellTexts(wrapper, 1);
    expect(events).toEqual(['Medication']);
  });

  it('filtering by date range start shows only rows on or after start date', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: '',
      event: '',
      date: { start: '2026-01-20', end: '' },
    });
    await wrapper.vm.$nextTick();
    const rows = getTableRows(wrapper);
    expect(rows).toHaveLength(2);
  });

  it('filtering by date range end shows only rows on or before end date', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: '',
      event: '',
      date: { start: '', end: '2026-01-20' },
    });
    await wrapper.vm.$nextTick();
    const rows = getTableRows(wrapper);
    expect(rows).toHaveLength(2);
  });

  it('filtering by full date range is inclusive of both boundaries', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: '',
      event: '',
      date: { start: '2026-01-15', end: '2026-01-20' },
    });
    await wrapper.vm.$nextTick();
    const rows = getTableRows(wrapper);
    expect(rows).toHaveLength(2);
    const dates = getCellTexts(wrapper, 3);
    expect(dates.some((d) => d.includes('01/15/2026'))).toBe(true);
    expect(dates.some((d) => d.includes('01/20/2026'))).toBe(true);
  });

  it('multiple filters combine with AND logic', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    await filterBar.vm.$emit('update:modelValue', {
      cat: 'Obi',
      event: 'Vet visit',
      date: { start: '', end: '' },
    });
    await wrapper.vm.$nextTick();
    const rows = getTableRows(wrapper);
    expect(rows).toHaveLength(1);
    expect(rows[0].findAll('td')[0].text()).toBe('Obi');
    expect(rows[0].findAll('td')[1].text()).toBe('Vet visit');
  });

  it('clearing a filter restores those rows', async () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    // Apply filter
    await filterBar.vm.$emit('update:modelValue', {
      cat: 'Obi',
      event: '',
      date: { start: '', end: '' },
    });
    await wrapper.vm.$nextTick();
    expect(getTableRows(wrapper)).toHaveLength(2);
    // Clear filter
    await filterBar.vm.$emit('update:modelValue', {
      cat: '',
      event: '',
      date: { start: '', end: '' },
    });
    await wrapper.vm.$nextTick();
    expect(getTableRows(wrapper)).toHaveLength(3);
  });
});

describe('EventLogDashboard edge cases', () => {
  it('renders with empty rows without errors', () => {
    const wrapper = mountDashboard([]);
    expect(wrapper.find('[data-testid="event-log-dashboard"]').exists()).toBe(true);
    expect(getTableRows(wrapper)).toHaveLength(0);
  });

  it('filter options are derived from actual row data', () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    const filters = filterBar.props('filters');
    const catFilter = filters.find((f) => f.key === 'cat');
    const eventFilter = filters.find((f) => f.key === 'event');
    expect(catFilter.options.map((o) => o.value)).toEqual(['Cummings', 'Obi']);
    expect(eventFilter.options.map((o) => o.value)).toEqual(['Medication', 'Vet visit']);
  });

  it('filter options are empty when rows are empty', () => {
    const wrapper = mountDashboard([]);
    const filterBar = wrapper.findComponent(FilterBar);
    const filters = filterBar.props('filters');
    const catFilter = filters.find((f) => f.key === 'cat');
    expect(catFilter.options).toEqual([]);
  });
});

describe('EventLogDashboard display labels', () => {
  it('cat filter options include displayLabel with "Cat: " prefix', () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    const filters = filterBar.props('filters');
    const catFilter = filters.find((f) => f.key === 'cat');

    const catOption = catFilter.options.find((o) => o.value === 'Obi');
    expect(catOption).toBeDefined();
    expect(catOption.label).toBe('Obi');
    expect(catOption.displayLabel).toBe('Cat: Obi');
  });

  it('event filter options include displayLabel with "Event: " prefix', () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    const filters = filterBar.props('filters');
    const eventFilter = filters.find((f) => f.key === 'event');

    const eventOption = eventFilter.options.find((o) => o.value === 'Vet visit');
    expect(eventOption).toBeDefined();
    expect(eventOption.label).toBe('Vet visit');
    expect(eventOption.displayLabel).toBe('Event: Vet visit');
  });

  it('date filter is unaffected and has no options', () => {
    const wrapper = mountDashboard();
    const filterBar = wrapper.findComponent(FilterBar);
    const filters = filterBar.props('filters');
    const dateFilter = filters.find((f) => f.key === 'date');

    expect(dateFilter.type).toBe('date_range');
    expect(dateFilter.options).toBeUndefined();
  });
});
