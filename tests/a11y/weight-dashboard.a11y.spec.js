import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Weight Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');
    await page.waitForSelector('[data-testid="weight-dashboard"]');
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

      const hasAccessibleName = ariaLabel !== null || role === 'img';
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('text contrast meets WCAG AA standards', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="weight-dashboard"]')
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

});
