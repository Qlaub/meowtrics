import { test, expect } from '@playwright/test';

// Only run on desktop projects
test.describe('Desktop Chart Rendering', () => {
  test.skip(({ browserName }) => ['Mobile Chrome', 'Mobile Safari'].includes(browserName));

  test('lunch dashboard renders correctly on desktop', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    await page.waitForSelector('[data-testid="lunch-dashboard"]');
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-testid="lunch-dashboard"]')).toHaveScreenshot(
      'lunch-dashboard-desktop.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('weight dashboard renders correctly on desktop', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    await page.waitForSelector('[data-testid="weight-dashboard"]');
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-testid="weight-dashboard"]')).toHaveScreenshot(
      'weight-dashboard-desktop.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('pie chart renders with legend', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const pieChart = page.locator('[data-testid="pie-chart"]');
    await pieChart.waitFor();
    await page.waitForTimeout(1000);

    await expect(pieChart).toHaveScreenshot('pie-chart-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('line chart renders with data points', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    const lineChart = page.locator('[data-testid="weight-line-chart"]');
    await lineChart.waitFor();
    await page.waitForTimeout(1000);

    await expect(lineChart).toHaveScreenshot('line-chart-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
