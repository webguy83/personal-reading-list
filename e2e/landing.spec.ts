import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/bookshelf/i);
  });

  test('shows the hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /beautifully/i, level: 1 }),
    ).toBeVisible();
  });

  test('shows a "Try as guest" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /try as guest/i })).toBeVisible();
  });

  test('shows a "Start for free" call-to-action', async ({ page }) => {
    await expect(page.getByRole('link', { name: /start for free/i }).first()).toBeVisible();
  });

  test('shows a "Sign in" link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('shows the features section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /everything you need/i }),
    ).toBeVisible();
  });

  test('"Try as guest" button navigates to the library', async ({ page }) => {
    await page.getByRole('button', { name: /try as guest/i }).click();
    await expect(page).toHaveURL(/\/library$/);
  });

  test('"Sign in" link navigates to the login page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('"Start for free" link navigates to the sign-up page', async ({ page }) => {
    await page.getByRole('link', { name: /start for free/i }).first().click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('unauthenticated navigation to /library redirects to landing', async ({ page }) => {
    await page.goto('/library');
    await expect(page).toHaveURL('/');
  });
});
