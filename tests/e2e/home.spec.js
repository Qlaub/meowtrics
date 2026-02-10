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

  test('nav menu closes when clicking outside the menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Open menu
    await menuButton.click();
    await expect(nav).toBeVisible();

    // Click outside the menu (on the main content area)
    await page.locator('#main').click();
    await expect(nav).not.toBeVisible();
  });

  test('nav menu does not close when clicking inside the menu (non-link area)', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-testid="menu-toggle"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    // Open menu
    await menuButton.click();
    await expect(nav).toBeVisible();

    // Click on the nav group label (inside menu but not a link)
    await nav.locator('.nav-group-label').first().click();
    await expect(nav).toBeVisible();
  });

  test('main content moves down smoothly when nav menu opens', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('#main');
    const menuButton = page.locator('[data-testid="menu-toggle"]');

    const mainTopBefore = (await main.boundingBox()).y;

    // Open menu and wait for transition to complete
    await menuButton.click();
    await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();
    // Wait for CSS transition (0.15s) to settle
    await page.waitForTimeout(200);

    const mainTopAfter = (await main.boundingBox()).y;
    expect(mainTopAfter).toBeGreaterThan(mainTopBefore);
  });

  test('main content moves back up when nav menu closes', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('#main');
    const menuButton = page.locator('[data-testid="menu-toggle"]');

    const mainTopBefore = (await main.boundingBox()).y;

    // Open menu
    await menuButton.click();
    await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();
    await page.waitForTimeout(200);

    // Close menu
    await menuButton.click();
    await expect(page.locator('[data-testid="nav-menu"]')).not.toBeVisible();
    await page.waitForTimeout(200);

    const mainTopAfter = (await main.boundingBox()).y;
    expect(mainTopAfter).toBeCloseTo(mainTopBefore, 0);
  });

  test('content transition timing matches nav menu transition', async ({ page }) => {
    await page.goto('/');

    const wrapper = page.locator('[data-testid="nav-menu-wrapper"]');
    const nav = page.locator('[data-testid="nav-menu"]');

    const wrapperTransition = await wrapper.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    const navTransition = await nav.evaluate((el) => getComputedStyle(el).transitionDuration);

    // Both should include 0.15s durations
    expect(wrapperTransition).toContain('0.15s');
    expect(navTransition).toContain('0.15s');
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
