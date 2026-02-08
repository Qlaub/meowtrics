import { test, expect } from '@playwright/test';

test.describe('Date Range Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');
    await page.waitForSelector('[data-testid="lunch-dashboard"]');
  });

  test('displays filter buttons', async ({ page }) => {
    const filterGroup = page.locator('[data-testid="date-filter"]');
    await expect(filterGroup).toBeVisible();

    await expect(filterGroup.locator('text=30 days')).toBeVisible();
    await expect(filterGroup.locator('text=90 days')).toBeVisible();
    await expect(filterGroup.locator('text=All time')).toBeVisible();
  });

  test('clicking filter button changes active state', async ({ page }) => {
    const filter30 = page.locator('[data-testid="filter-30"]');
    const filter90 = page.locator('[data-testid="filter-90"]');

    await filter30.click();
    await expect(filter30).toHaveClass(/active|selected/);

    await filter90.click();
    await expect(filter90).toHaveClass(/active|selected/);
    await expect(filter30).not.toHaveClass(/active|selected/);
  });

  test('filter persists on same page', async ({ page }) => {
    const filter30 = page.locator('[data-testid="filter-30"]');
    await filter30.click();

    // Scroll or interact with page
    await page.evaluate(() => window.scrollBy(0, 200));

    // Filter should still be selected
    await expect(filter30).toHaveClass(/active|selected/);
  });
});
