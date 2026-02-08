import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays the app title', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toContainText('Meowtrics');
  });

  test('displays dataset cards from manifest', async ({ page }) => {
    await page.goto('/');

    // Wait for cards to render
    const cards = page.locator('[data-testid="dataset-card"]');
    await expect(cards.first()).toBeVisible();

    // Should have at least one card
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigates to dataset page on card click', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('[data-testid="dataset-card"]').first();
    await firstCard.click();

    // Should navigate to dataset route
    await expect(page).toHaveURL(/\/#\/datasets\/.+/);
  });

  test('hamburger menu opens and closes', async ({ page, isMobile }) => {
    // This test is most relevant on mobile
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/');

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Menu should be closed initially on mobile
    await expect(nav).not.toBeVisible();

    // Open menu
    await menuButton.click();
    await expect(nav).toBeVisible();

    // Close menu
    await menuButton.click();
    await expect(nav).not.toBeVisible();
  });

  test('nav menu closes when clicking the current page link', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Open menu and click the Home link (already on home page)
    await menuButton.click();
    await expect(nav).toBeVisible();

    await nav.locator('a', { hasText: 'Home' }).click();
    await expect(nav).not.toBeVisible();
  });

  test('nav menu closes when navigating to a different page via menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Open menu and click a dataset link
    await menuButton.click();
    await expect(nav).toBeVisible();

    await nav.locator('.nav-link--indent').first().click();
    await expect(nav).not.toBeVisible();
    await expect(page).toHaveURL(/\/#\/datasets\/.+/);
  });

  test('nav menu closes when clicking current dataset page link', async ({ page }) => {
    // Navigate to a dataset page via home card to ensure manifest is loaded
    await page.goto('/');
    const firstCard = page.locator('[data-testid="dataset-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/\/#\/datasets\/.+/);

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Open menu and click the link for the current dataset page
    await menuButton.click();
    await expect(nav).toBeVisible();

    // Find the link whose href matches the current URL's dataset path
    const currentUrl = page.url();
    const datasetPath = currentUrl.split('#')[1];
    const currentPageLink = nav.locator(`a[href*="${datasetPath}"]`);
    await expect(currentPageLink).toBeVisible();
    await currentPageLink.click();
    await expect(nav).not.toBeVisible();
  });
});
