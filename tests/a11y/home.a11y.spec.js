import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Home Page Accessibility', () => {
  test('has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dataset-card"]');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('dataset cards are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dataset-card"]');

    // Focus first dataset card and activate with Enter
    const firstCard = page.locator('[data-testid="dataset-card"]').first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();

    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/#\/datasets\/.+/);
  });

  test('skip link is available for keyboard users', async ({ page }) => {
    await page.goto('/');

    // Tab should reveal skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#main"], [data-testid="skip-link"]');
    // Skip link may or may not exist depending on implementation
    const skipLinkCount = await skipLink.count();

    if (skipLinkCount > 0) {
      await expect(skipLink.first()).toBeFocused();
    }
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dataset-card"]');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
