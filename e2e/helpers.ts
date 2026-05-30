import { type Page } from '@playwright/test';

/** Two distinct books to use as mock search results across tests. */
export const MOCK_BOOKS = [
  {
    key: '/works/OL12345W',
    title: 'Dune',
    author_name: ['Frank Herbert'],
    cover_i: 12345,
    first_publish_year: 1965,
    number_of_pages_median: 412,
    isbn: ['9780441013593', '0441013597'],
    publisher: ['Chilton Books'],
    subject: ['Science Fiction'],
  },
  {
    key: '/works/OL67890W',
    title: 'Foundation',
    author_name: ['Isaac Asimov'],
    cover_i: 67890,
    first_publish_year: 1951,
    number_of_pages_median: 255,
    isbn: ['9780553293357', '0553293354'],
    publisher: ['Gnome Press'],
    subject: ['Science Fiction'],
  },
];

/**
 * Enters guest mode from the landing page and waits for the library to load.
 * Must be called before any action that requires authentication.
 */
export async function enterGuestMode(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /try as guest/i }).click();
  await page.waitForURL('**/library');
}

/**
 * Registers a route intercept for the Open Library search endpoint.
 * Should be called before navigation so the handler is registered early.
 */
export async function mockOpenLibrarySearch(
  page: Page,
  docs: unknown[] = MOCK_BOOKS,
): Promise<void> {
  await page.route('**/search.json**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ docs, numFound: docs.length, start: 0 }),
    }),
  );
}
