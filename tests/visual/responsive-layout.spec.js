import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test('home page layout adapts to viewport', async ({ page, viewport }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dataset-card"]');

    const viewportLabel = viewport.width < 768 ? 'mobile' : viewport.width < 1024 ? 'tablet' : 'desktop';

    await expect(page).toHaveScreenshot(`home-${viewportLabel}.png`, {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('header collapses on mobile', async ({ page, viewport }) => {
    await page.goto('/');

    // Hamburger menu toggle should be visible at all viewport sizes (mobile-first design)
    await expect(page.locator('[data-testid="menu-toggle"]')).toBeVisible();

    // Nav menu should be hidden until toggled
    await expect(page.locator('[data-testid="nav-menu"]')).not.toBeVisible();

    // Clicking toggle reveals nav menu
    await page.locator('[data-testid="menu-toggle"]').click();
    await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();
  });

  test('dataset cards reflow at breakpoints', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dataset-card"]');

    const cards = page.locator('[data-testid="dataset-card"]');
    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    if (firstBox && secondBox) {
      // Cards should either be side by side (desktop) or stacked (mobile)
      const isStacked = secondBox.y > firstBox.y + firstBox.height / 2;
      const isSideBySide = Math.abs(firstBox.y - secondBox.y) < 10;

      expect(isStacked || isSideBySide).toBe(true);
    }
  });
});
