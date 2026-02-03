import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Lunch Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');
    await page.waitForSelector('[data-testid="lunch-dashboard"]');
  });

  test('has no WCAG 2.1 AA violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('chart containers have accessible names', async ({ page }) => {
    const charts = page.locator('[data-testid$="-chart"]');
    const count = await charts.count();

    for (let i = 0; i < count; i++) {
      const chart = charts.nth(i);
      const ariaLabel = await chart.getAttribute('aria-label');
      const role = await chart.getAttribute('role');

      // Charts should have either aria-label or be marked as img with description
      const hasAccessibleName = ariaLabel !== null || role === 'img';
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('filter buttons are keyboard accessible', async ({ page }) => {
    const filterGroup = page.locator('[data-testid="date-filter"]');

    // Tab into filter group
    await filterGroup.locator('button').first().focus();

    // Should be able to navigate with arrow keys or tab
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('text contrast in dashboard meets WCAG AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="lunch-dashboard"]')
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('heading hierarchy is correct', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
