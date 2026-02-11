import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DropdownButton from '@/components/DropdownButton.vue';

const defaultOptions = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

function mountDropdown(props = {}) {
  return mount(DropdownButton, {
    props: {
      options: defaultOptions,
      modelValue: 'all',
      ...props,
    },
    attachTo: document.body,
  });
}

describe('DropdownButton', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('rendering', () => {
    it('renders a trigger button with the active option label', () => {
      wrapper = mountDropdown();
      const trigger = wrapper.find('[data-testid="dropdown-trigger"]');
      expect(trigger.exists()).toBe(true);
      expect(trigger.text()).toContain('All time');
    });

    it('renders a dropdown arrow in the trigger', () => {
      wrapper = mountDropdown();
      const arrow = wrapper.find('.dropdown-arrow');
      expect(arrow.exists()).toBe(true);
      expect(arrow.text()).toBe('▾');
    });

    it('does not show the dropdown menu by default', () => {
      wrapper = mountDropdown();
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    it('shows the label of the currently selected option', () => {
      wrapper = mountDropdown({ modelValue: '30' });
      const trigger = wrapper.find('[data-testid="dropdown-trigger"]');
      expect(trigger.text()).toContain('Last 30 days');
    });
  });

  describe('toggle', () => {
    it('opens the menu when trigger is clicked', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    });

    it('closes the menu when trigger is clicked again', async () => {
      wrapper = mountDropdown();
      const trigger = wrapper.find('[data-testid="dropdown-trigger"]');
      await trigger.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
      await trigger.trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });
  });

  describe('options rendering', () => {
    it('renders all options as buttons when open', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      const buttons = wrapper.findAll('.dropdown-menu button');
      expect(buttons).toHaveLength(3);
      expect(buttons[0].text()).toBe('Last 30 days');
      expect(buttons[1].text()).toBe('Last 90 days');
      expect(buttons[2].text()).toBe('All time');
    });

    it('assigns data-testid to each option using testIdPrefix', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      expect(wrapper.find('[data-testid="filter-30"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="filter-90"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(true);
    });

    it('supports custom testIdPrefix', async () => {
      wrapper = mountDropdown({ testIdPrefix: 'opt' });
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      expect(wrapper.find('[data-testid="opt-30"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="opt-90"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="opt-all"]').exists()).toBe(true);
    });
  });

  describe('selection', () => {
    it('emits update:modelValue with the selected value', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      await wrapper.find('[data-testid="filter-30"]').trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('30');
    });

    it('closes the menu after selection', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      await wrapper.find('[data-testid="filter-90"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });
  });

  describe('active highlighting', () => {
    it('applies active class to the option matching modelValue', async () => {
      wrapper = mountDropdown({ modelValue: '90' });
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      const opt30 = wrapper.find('[data-testid="filter-30"]');
      const opt90 = wrapper.find('[data-testid="filter-90"]');
      const optAll = wrapper.find('[data-testid="filter-all"]');
      expect(opt30.classes()).not.toContain('active');
      expect(opt90.classes()).toContain('active');
      expect(optAll.classes()).not.toContain('active');
    });
  });

  describe('click outside to close', () => {
    it('closes the menu when clicking outside the component', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);

      // Simulate a click outside the component
      const outsideEvent = new Event('click', { bubbles: true });
      document.body.dispatchEvent(outsideEvent);
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    it('does not close the menu when clicking inside the component', async () => {
      wrapper = mountDropdown();
      await wrapper.find('[data-testid="dropdown-trigger"]').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);

      // Click inside the dropdown menu area (on a non-option element)
      await wrapper.find('.dropdown-menu').trigger('click');
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    });
  });
});
