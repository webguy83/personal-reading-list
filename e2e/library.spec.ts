import { test, expect } from '@playwright/test';
import { enterGuestMode } from './helpers';

test.describe('Library page (guest mode)', () => {
  test.beforeEach(async ({ page }) => {
    await enterGuestMode(page);
  });

  test('shows the "My Library" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /my library/i, level: 1 }),
    ).toBeVisible();
  });

  test('displays a non-zero book count', async ({ page }) => {
    // The page sub-heading reads "N books"
    const countText = await page.getByText(/\d+ books/).first().textContent();
    const count = parseInt(countText!.match(/\d+/)![0], 10);
    expect(count).toBeGreaterThan(0);
  });

  test('shows the "Currently Reading" section', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: /currently reading/i }),
    ).toBeVisible();
  });

  test('shows the "Want to Read" shelf', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: /want to read/i }),
    ).toBeVisible();
  });

  test('shows the "Read" shelf', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Read', exact: true, level: 2 }),
    ).toBeVisible();
  });

  test('"Add book" link navigates to the search page', async ({ page }) => {
    await page.getByRole('link', { name: /add book/i }).click();
    await expect(page).toHaveURL(/\/search/);
  });

  test('clicking a currently-reading book navigates to its detail page', async ({ page }) => {
    const currentlyReadingSection = page.getByRole('region', { name: /currently reading/i });
    await currentlyReadingSection.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/library\/book\/.+/);
  });

  test('shows the reading goal banner', async ({ page }) => {
    // Guest mode has a pre-set reading goal
    await expect(page.getByText(/reading goal/i).first()).toBeVisible();
  });

  test('main navigation links are visible', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(nav.getByRole('link', { name: /search/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /year in review/i })).toBeVisible();
  });

  test('nav "Search" link navigates to the search page', async ({ page }) => {
    await page
      .getByRole('navigation', { name: /main navigation/i })
      .getByRole('link', { name: /search/i })
      .click();
    await expect(page).toHaveURL(/\/search/);
  });

  test('nav "Year in Review" link navigates to that page', async ({ page }) => {
    await page
      .getByRole('navigation', { name: /main navigation/i })
      .getByRole('link', { name: /year in review/i })
      .click();
    await expect(page).toHaveURL(/\/year-in-review/);
  });

  test('sign out button is visible in the nav', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('clicking sign out navigates back to the landing page', async ({ page }) => {
    await page.getByRole('button', { name: /sign out/i }).click();
    const dialog = page.getByRole('dialog', { name: /sign out/i });
    await dialog.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL('/');
  });
});
