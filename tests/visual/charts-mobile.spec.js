import { test, expect } from '@playwright/test';

async function waitForChartsRendered(locator) {
  const charts = locator.locator('[data-rendered]');
  const count = await charts.count();
  for (let i = 0; i < count; i++) {
    await expect(charts.nth(i)).toHaveAttribute('data-rendered', 'true');
  }
}

// Only run on mobile projects
test.describe('Mobile Chart Rendering', () => {
  test.skip(({ isMobile }) => !isMobile);

  test('lunch dashboard renders correctly on mobile', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const dashboard = page.locator('[data-testid="lunch-dashboard"]');
    await dashboard.waitFor();
    await waitForChartsRendered(dashboard);

    await expect(dashboard).toHaveScreenshot(
      'lunch-dashboard-mobile.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('weight dashboard renders correctly on mobile', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    const dashboard = page.locator('[data-testid="weight-dashboard"]');
    await dashboard.waitFor();
    await waitForChartsRendered(dashboard);

    await expect(dashboard).toHaveScreenshot(
      'weight-dashboard-mobile.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('bar chart axis labels are visible', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const barChart = page.locator('[data-testid="offered-selected-chart"]');
    await barChart.waitFor();
    await waitForChartsRendered(barChart);

    await expect(barChart).toHaveScreenshot('bar-chart-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('heatmap labels are readable', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const heatmap = page.locator('[data-testid="heatmap-chart"]');
    await heatmap.waitFor();
    await waitForChartsRendered(heatmap);

    await expect(heatmap).toHaveScreenshot('heatmap-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
