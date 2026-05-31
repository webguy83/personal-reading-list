import { test, expect } from '@playwright/test';
import { enterGuestMode } from './helpers';

/**
 * Navigate to the first currently-reading book from the library.
 * Guest mode pre-loads 3 currently-reading books with progress already set.
 */
async function gotoFirstCurrentlyReadingBook(page: import('@playwright/test').Page) {
  await enterGuestMode(page);
  const currentlyReadingSection = page.getByRole('region', { name: /currently reading/i });
  await currentlyReadingSection.getByRole('link').first().click();
  await page.waitForURL(/\/library\/book\/.+/);
}

test.describe('Book detail page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFirstCurrentlyReadingBook(page);
  });

  test('shows the book title as a heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const title = await heading.textContent();
    expect(title?.trim().length).toBeGreaterThan(0);
  });

  test('shows the "Currently Reading" shelf badge', async ({ page }) => {
    await expect(page.getByText('Currently Reading')).toBeVisible();
  });

  test('shows the author name', async ({ page }) => {
    // The author paragraph is always present in the book header
    const author = page.locator('.book-author');
    await expect(author).not.toBeEmpty();
  });

  test('shows the "Your rating" section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /your rating/i }),
    ).toBeVisible();
  });

  test('shows star-rating buttons', async ({ page }) => {
    // Star buttons are "Rate N stars" / "Rate 1 star"
    await expect(page.getByRole('button', { name: /rate 5 stars/i })).toBeVisible();
  });

  test('can rate a book with the star buttons', async ({ page }) => {
    await page.getByRole('button', { name: /rate 4 stars/i }).click();
    // After rating, the container's aria-label reflects the new value
    await expect(page.getByLabel(/rating: 4 of 5 stars/i)).toBeVisible();
  });

  test('shows the "Reading progress" section for a currently-reading book', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /reading progress/i }),
    ).toBeVisible();
  });

  test('"Edit progress" button reveals the page-input form', async ({ page }) => {
    await page.getByRole('button', { name: /edit progress/i }).click();
    await expect(page.getByLabel(/current page/i)).toBeVisible();
  });

  test('saving a new page number updates the progress and hides the form', async ({ page }) => {
    await page.getByRole('button', { name: /edit progress/i }).click();
    const input = page.getByLabel(/current page/i);
    await input.fill('50');
    await page.getByRole('button', { name: /^save$/i }).click();
    // Form is dismissed
    await expect(input).not.toBeVisible();
    // Progress text should now reflect the saved page
    await expect(page.getByText(/50/)).toBeVisible();
  });

  test('"Cancel" discards the edit and hides the form', async ({ page }) => {
    await page.getByRole('button', { name: /edit progress/i }).click();
    await expect(page.getByLabel(/current page/i)).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByLabel(/current page/i)).not.toBeVisible();
  });

  test('"Move to shelf" button opens a shelf-selection menu', async ({ page }) => {
    await page.getByRole('button', { name: /move to shelf/i }).click();
    await expect(page.getByRole('menuitem', { name: /want to read/i })).toBeVisible();
  });

  test('moving to a different shelf updates the shelf badge', async ({ page }) => {
    await page.getByRole('button', { name: /move to shelf/i }).click();
    await page.getByRole('menuitem', { name: /^read$/i }).click();
    // Wait for the mat-menu overlay to fully close before checking text that overlaps with menu items
    await page.getByRole('menu').waitFor({ state: 'detached' });
    await expect(page.getByText('Read')).toBeVisible();
    // The progress section should no longer appear (book is no longer currently-reading)
    await expect(
      page.getByRole('heading', { name: /reading progress/i }),
    ).not.toBeVisible();
  });

  test('"Back to library" link returns to the library', async ({ page }) => {
    await page.getByRole('link', { name: /back to library/i }).click();
    await expect(page).toHaveURL(/\/library$/);
  });
});
