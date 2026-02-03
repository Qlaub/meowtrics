import { test, expect } from '@playwright/test';

// Only run on mobile projects
test.describe('Mobile Chart Rendering', () => {
  test.skip(({ browserName }) => !['Mobile Chrome', 'Mobile Safari'].includes(browserName));

  test('lunch dashboard renders correctly on mobile', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    // Wait for charts to render
    await page.waitForSelector('[data-testid="lunch-dashboard"]');
    // Allow ECharts animations to complete
    await page.waitForTimeout(1000);

    // Screenshot the dashboard
    await expect(page.locator('[data-testid="lunch-dashboard"]')).toHaveScreenshot(
      'lunch-dashboard-mobile.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('weight dashboard renders correctly on mobile', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    await page.waitForSelector('[data-testid="weight-dashboard"]');
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-testid="weight-dashboard"]')).toHaveScreenshot(
      'weight-dashboard-mobile.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('bar chart axis labels are visible', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const barChart = page.locator('[data-testid="offered-selected-chart"]');
    await barChart.waitFor();
    await page.waitForTimeout(1000);

    await expect(barChart).toHaveScreenshot('bar-chart-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('heatmap labels are readable', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const heatmap = page.locator('[data-testid="heatmap-chart"]');
    await heatmap.waitFor();
    await page.waitForTimeout(1000);

    await expect(heatmap).toHaveScreenshot('heatmap-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
