import { test, expect } from '@playwright/test';

async function waitForChartsRendered(locator) {
  const charts = locator.locator('[data-rendered]');
  const count = await charts.count();
  for (let i = 0; i < count; i++) {
    await expect(charts.nth(i)).toHaveAttribute('data-rendered', 'true');
  }
}

// Only run on desktop projects
test.describe('Desktop Chart Rendering', () => {
  test.skip(({ isMobile }) => isMobile);

  test('lunch dashboard renders correctly on desktop', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const dashboard = page.locator('[data-testid="lunch-dashboard"]');
    await dashboard.waitFor();
    await waitForChartsRendered(dashboard);

    await expect(dashboard).toHaveScreenshot(
      'lunch-dashboard-desktop.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('weight dashboard renders correctly on desktop', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    const dashboard = page.locator('[data-testid="weight-dashboard"]');
    await dashboard.waitFor();
    await waitForChartsRendered(dashboard);

    await expect(dashboard).toHaveScreenshot(
      'weight-dashboard-desktop.png',
      { maxDiffPixelRatio: 0.02 }
    );
  });

  test('pie chart renders with legend', async ({ page }) => {
    await page.goto('/#/datasets/cummings-lunch-log');

    const pieChart = page.locator('[data-testid="pie-chart"]');
    await pieChart.waitFor();
    await waitForChartsRendered(pieChart);

    await expect(pieChart).toHaveScreenshot('pie-chart-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('line chart renders with data points', async ({ page }) => {
    await page.goto('/#/datasets/cummings-weight-log');

    const lineChart = page.locator('[data-testid="weight-line-chart"]');
    await lineChart.waitFor();
    await waitForChartsRendered(lineChart);

    await expect(lineChart).toHaveScreenshot('line-chart-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
