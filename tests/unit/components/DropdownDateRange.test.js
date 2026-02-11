import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DropdownDateRange from '@/components/DropdownDateRange.vue';
import DropdownButton from '@/components/DropdownButton.vue';

function mountDateRange(props = {}) {
  return mount(DropdownDateRange, {
    props: {
      modelValue: { start: '', end: '' },
      ...props,
    },
    attachTo: document.body,
  });
}

function mountDropdownButton() {
  return mount(DropdownButton, {
    props: {
      options: [{ value: 'a', label: 'A' }],
      modelValue: 'a',
    },
    attachTo: document.body,
  });
}

describe('DropdownDateRange', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('toggle open/close', () => {
    it('opens the dropdown panel when trigger button is clicked', async () => {
      wrapper = mountDateRange();
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    });

    it('closes the dropdown panel when trigger button is clicked again', async () => {
      wrapper = mountDateRange();
      const trigger = wrapper.find('[data-testid="date-range-trigger"]');
      await trigger.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      await trigger.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });
  });

  describe('date emission', () => {
    it('emits update:modelValue with updated start date', async () => {
      wrapper = mountDateRange();
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      const startInput = wrapper.find('[data-testid="date-range-start"]');
      await startInput.setValue('2026-01-15');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
        start: '2026-01-15',
        end: '',
      });
    });

    it('emits update:modelValue with updated end date', async () => {
      wrapper = mountDateRange();
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      const endInput = wrapper.find('[data-testid="date-range-end"]');
      await endInput.setValue('2026-02-28');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
        start: '',
        end: '2026-02-28',
      });
    });

    it('preserves existing start when end date changes', async () => {
      wrapper = mountDateRange({ modelValue: { start: '2026-01-01', end: '' } });
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      const endInput = wrapper.find('[data-testid="date-range-end"]');
      await endInput.setValue('2026-03-15');
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
        start: '2026-01-01',
        end: '2026-03-15',
      });
    });
  });

  describe('click outside to close', () => {
    it('closes the dropdown when clicking outside the component', async () => {
      wrapper = mountDateRange();
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);

      const outsideEvent = new Event('click', { bubbles: true });
      document.body.dispatchEvent(outsideEvent);
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    it('does not close the dropdown when clicking inside the component', async () => {
      wrapper = mountDateRange();
      await wrapper.find('[data-testid="date-range-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);

      await wrapper.find('.dropdown-menu').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    });
  });

  describe('style consistency with DropdownButton', () => {
    it('uses the same CSS class names as DropdownButton for trigger and dropdown', async () => {
      // Check DropdownDateRange classes
      wrapper = mountDateRange();
      expect(wrapper.find('.range-dropdown').exists()).toBe(true);
      expect(wrapper.find('.dropdown-trigger').exists()).toBe(true);
      expect(wrapper.find('.dropdown-arrow').exists()).toBe(true);
      expect(wrapper.find('.dropdown-arrow').text()).toBe('▾');
      await wrapper.find('.dropdown-trigger').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      wrapper.unmount();

      // Check DropdownButton classes independently
      const dbWrapper = mountDropdownButton();
      expect(dbWrapper.find('.range-dropdown').exists()).toBe(true);
      expect(dbWrapper.find('.dropdown-trigger').exists()).toBe(true);
      expect(dbWrapper.find('.dropdown-arrow').exists()).toBe(true);
      await dbWrapper.find('.dropdown-trigger').trigger('click');
      expect(dbWrapper.find('.dropdown-menu').exists()).toBe(true);
      dbWrapper.unmount();

      // Re-mount wrapper for afterEach cleanup
      wrapper = mountDateRange();
    });
  });

  describe('trigger button label', () => {
    it('shows "Select dates" when both dates are empty', () => {
      wrapper = mountDateRange();
      const trigger = wrapper.find('[data-testid="date-range-trigger"]');
      expect(trigger.text()).toContain('Select dates');
    });

    it('shows the date range when both dates are set', () => {
      wrapper = mountDateRange({ modelValue: { start: '2026-01-15', end: '2026-02-28' } });
      const trigger = wrapper.find('[data-testid="date-range-trigger"]');
      expect(trigger.text()).toContain('2026-01-15');
      expect(trigger.text()).toContain('2026-02-28');
    });
  });

  describe('testIdPrefix prop', () => {
    it('uses custom testIdPrefix for data-testid attributes', async () => {
      wrapper = mountDateRange({ testIdPrefix: 'filter-date' });
      expect(wrapper.find('[data-testid="filter-date-trigger"]').exists()).toBe(true);
      await wrapper.find('[data-testid="filter-date-trigger"]').trigger('click');
      expect(wrapper.find('[data-testid="filter-date-start"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="filter-date-end"]').exists()).toBe(true);
    });
  });
});
