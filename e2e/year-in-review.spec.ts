import { test, expect } from '@playwright/test';
import { enterGuestMode } from './helpers';

test.describe('Year in Review page', () => {
  test.beforeEach(async ({ page }) => {
    await enterGuestMode(page);
    await page
      .getByRole('navigation', { name: /main navigation/i })
      .getByRole('link', { name: /year in review/i })
      .click();
    await expect(page).toHaveURL(/\/year-in-review/);
  });

  test('shows a heading containing the current year', async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(
      page.getByRole('heading', { name: new RegExp(year), level: 1 }),
    ).toBeVisible();
  });

  test('shows the "Reading Goal" section', async ({ page }) => {
    // Guest mode starts with a pre-set reading goal
    await expect(
      page.getByRole('heading', { name: /reading goal/i }),
    ).toBeVisible();
  });

  test('shows the goal progress text', async ({ page }) => {
    // "N of M books"
    await expect(page.getByText(/\d+ of \d+ books/)).toBeVisible();
  });

  test('shows the "Books read" stat card', async ({ page }) => {
    await expect(page.getByText(/books read/i)).toBeVisible();
  });

  test('shows the "Pages read" stat card', async ({ page }) => {
    await expect(page.getByText(/pages read/i)).toBeVisible();
  });

  test('"Edit goal" button reveals the goal input form', async ({ page }) => {
    await page.getByRole('button', { name: /edit goal/i }).click();
    await expect(page.getByLabel(/book goal/i)).toBeVisible();
  });

  test('saving a new goal updates the displayed target', async ({ page }) => {
    await page.getByRole('button', { name: /edit goal/i }).click();
    const input = page.getByLabel(/book goal/i);
    await input.fill('30');
    await page.getByRole('button', { name: /^save$/i }).click();
    // Input should be dismissed
    await expect(input).not.toBeVisible();
    // Progress text should now show the new target
    await expect(page.getByText(/of 30 books/i)).toBeVisible();
  });

  test('"Cancel" discards the goal edit', async ({ page }) => {
    await page.getByRole('button', { name: /edit goal/i }).click();
    await expect(page.getByLabel(/book goal/i)).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByLabel(/book goal/i)).not.toBeVisible();
  });

  test('shows the "Average rating" stat card', async ({ page }) => {
    await expect(page.getByText(/avg rating/i)).toBeVisible();
  });
});
