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

  test('shows a theme toggle button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /switch to (dark|light) mode/i }),
    ).toBeVisible();
  });

  test('theme toggle switches between light and dark mode', async ({ page }) => {
    // Set an explicit starting theme so toggle() goes light → dark → light
    await page.evaluate(() => localStorage.setItem('bookshelf-theme', 'light'));
    await page.reload();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(html).toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch to light mode/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('unauthenticated navigation to /library redirects to landing', async ({ page }) => {
    await page.goto('/library');
    await expect(page).toHaveURL('/');
  });

  test('guest user navigating to /auth/login redirects to library', async ({ page }) => {
    // Enter guest mode
    await page.getByRole('button', { name: /try as guest/i }).click();
    await expect(page).toHaveURL(/\/library$/);
    
    // Try to access login page
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/library$/);
  });

  test('guest user navigating to /auth/signup redirects to library', async ({ page }) => {
    // Enter guest mode
    await page.getByRole('button', { name: /try as guest/i }).click();
    await expect(page).toHaveURL(/\/library$/);
    
    // Try to access signup page
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/\/library$/);
  });

  test('guest user navigating to landing page redirects to library', async ({ page }) => {
    // Enter guest mode
    await page.getByRole('button', { name: /try as guest/i }).click();
    await expect(page).toHaveURL(/\/library$/);
    
    // Try to access landing page
    await page.goto('/');
    await expect(page).toHaveURL(/\/library$/);
  });
});
