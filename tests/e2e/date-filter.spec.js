import { test, expect } from '@playwright/test';

test.describe('Date Range Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');
    await page.waitForSelector('[data-testid="lunch-dashboard"]');
  });

  test('displays dropdown filter', async ({ page }) => {
    const filterGroup = page.locator('[data-testid="date-filter"]');
    await expect(filterGroup).toBeVisible();

    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('All time');
    await expect(trigger).toContainText('▾');

    // Open dropdown and verify all options
    await trigger.click();
    await expect(page.locator('[data-testid="filter-30"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-90"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
  });

  test('selecting option updates trigger label and closes dropdown', async ({ page }) => {
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    const menu = page.locator('.dropdown-menu');

    // Open and select "Last 30 days"
    await trigger.click();
    await expect(menu).toBeVisible();
    await page.locator('[data-testid="filter-30"]').click();
    await expect(trigger).toContainText('Last 30 days');
    await expect(menu).not.toBeVisible();

    // Open and select "Last 90 days"
    await trigger.click();
    await page.locator('[data-testid="filter-90"]').click();
    await expect(trigger).toContainText('Last 90 days');
    await expect(menu).not.toBeVisible();
  });

  test('filter persists on same page', async ({ page }) => {
    const trigger = page.locator('[data-testid="dropdown-trigger"]');

    // Open and select "Last 30 days"
    await trigger.click();
    await page.locator('[data-testid="filter-30"]').click();

    // Scroll or interact with page
    await page.evaluate(() => window.scrollBy(0, 200));

    // Filter should still be selected
    await expect(trigger).toContainText('Last 30 days');
  });
});
