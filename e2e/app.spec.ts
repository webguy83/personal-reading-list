// Smoke test — full feature tests live in landing/library/search/book-detail/year-in-review specs.
import { test, expect } from '@playwright/test';

test.describe('Bookshelf App', () => {
  test('loads the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/bookshelf/i);
  });
});
