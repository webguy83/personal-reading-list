import { test, expect } from '@playwright/test';
import { enterGuestMode, mockOpenLibrarySearch, MOCK_BOOKS } from './helpers';

test.describe('Search page', () => {
  test.beforeEach(async ({ page }) => {
    // Register the API mock before any navigation so every search request is intercepted
    await mockOpenLibrarySearch(page);
    await enterGuestMode(page);
    await page
      .getByRole('navigation', { name: /main navigation/i })
      .getByRole('link', { name: /search/i })
      .click();
    await expect(page).toHaveURL(/\/search/);
  });

  test('shows the "Search Books" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /search books/i, level: 1 }),
    ).toBeVisible();
  });

  test('search input is accessible by its label', async ({ page }) => {
    await expect(page.getByLabel(/search books/i)).toBeVisible();
  });

  test('search input has the correct placeholder', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/search by title, author, or isbn/i),
    ).toBeVisible();
  });

  test('typing a query shows results from the API', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    // Results appear after the 400 ms debounce; allow 3 s total
    await expect(page.getByText(MOCK_BOOKS[0].title)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(MOCK_BOOKS[0].author_name[0])).toBeVisible();
  });

  test('shows a result-count summary', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    await expect(page.getByText(/results for/i)).toBeVisible({ timeout: 3000 });
  });

  test('shows multiple results when the API returns them', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('sci-fi');
    await expect(page.getByText(MOCK_BOOKS[0].title)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(MOCK_BOOKS[1].title)).toBeVisible();
  });

  test('"Add to shelf" button is present for books not in the library', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    await expect(
      page.getByRole('button', { name: /add to shelf/i }).first(),
    ).toBeVisible({ timeout: 3000 });
  });

  test('clicking "Add to shelf" opens the shelf-selection menu', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    await page.getByRole('button', { name: /add to shelf/i }).first().click({ timeout: 3000 });
    await expect(page.getByRole('menuitem', { name: /want to read/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /currently reading/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /^read$/i })).toBeVisible();
  });

  test('shows "In library" badge after adding a book to a shelf', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    await page.getByRole('button', { name: /add to shelf/i }).first().click({ timeout: 3000 });
    await page.getByRole('menuitem', { name: /want to read/i }).click();
    await expect(page.getByText(/in library/i)).toBeVisible();
  });

  test('shows a helpful message when no results are returned', async ({ page }) => {
    // Override the mock for this test with an empty response
    await page.route('**/search.json**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ docs: [], numFound: 0, start: 0 }),
      }),
    );
    await page.getByLabel(/search books/i).fill('xyznonexistentbook9999');
    await expect(page.getByText(/no books found/i)).toBeVisible({ timeout: 3000 });
  });

  test('"Clear search" button resets the input and hides results', async ({ page }) => {
    await page.getByLabel(/search books/i).fill('dune');
    await expect(page.getByText(MOCK_BOOKS[0].title)).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: /clear search/i }).click();
    await expect(page.getByLabel(/search books/i)).toHaveValue('');
    await expect(page.getByText(MOCK_BOOKS[0].title)).not.toBeVisible();
  });
});
