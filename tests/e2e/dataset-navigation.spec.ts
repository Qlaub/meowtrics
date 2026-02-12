import { test, expect } from '@playwright/test';

test.describe('Dataset Navigation', () => {
  test('loads lunch log dataset via direct URL', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    // Wait for dashboard to load
    await expect(page.locator('[data-testid="lunch-dashboard"]')).toBeVisible();
  });

  test('loads weight log dataset via direct URL', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    // Wait for dashboard to load
    await expect(page.locator('[data-testid="weight-dashboard"]')).toBeVisible();
  });

  test('shows error for invalid dataset ID', async ({ page }) => {
    await page.goto('/#/datasets/nonexistent-dataset');

    // Should show some error state
    await expect(page.locator('text=/not found|error/i')).toBeVisible();
  });

  test('back button returns to previous page', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="dataset-card"]').first().click();

    // Wait for dataset page
    await expect(page).toHaveURL(/\/#\/datasets\/.+/);

    // Go back
    await page.goBack();

    // Should be on home
    await expect(page).toHaveURL(/\/#?\/?$/);
  });
});
