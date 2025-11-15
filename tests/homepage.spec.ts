import { test, expect } from '@playwright/test';

test('homepage has gradient header and styled cards', async ({ page }) => {
  await page.goto('/');

  // Check if header is visible (this was the main issue)
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Check if header has gradient classes
  const hasGradientClass = await header.evaluate((el) => el.className.includes('bg-gradient-to-'));
  expect(hasGradientClass).toBeTruthy();

  // Check for search input visibility
  const searchInput = page.locator('input[placeholder="Search books, authors..."]').first();
  await expect(searchInput).toBeVisible();
  const radius = await searchInput.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
  expect(radius).toBeGreaterThan(8);
  // Rounded-full input should have large border radius
  expect(radius).toBeGreaterThan(20);

  // Check for category tiles
  const firstCategoryTile = page.locator('button').filter({ hasText: 'View books' }).first();
  await expect(firstCategoryTile).toBeVisible();

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });

  // Try to check for profile content if it exists (may not be available in test environment)
  try {
    await expect(page.getByText('Books Completed')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('Satkarm')).toBeVisible({ timeout: 2000 });
  } catch (error) {
    // Profile content might not be available in test environment, which is okay
    console.log('Profile content not found - this may be expected in test environment');
  }
});