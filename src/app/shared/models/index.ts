// ─── Core Book ────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  /** External API identifier (e.g. '/works/OL45804W') */
  apiId: string;
  apiSource: 'openlibrary' | 'google';
  title: string;
  authors: string[];
  coverUrl: string | null;
  pageCount: number | null;
  publishYear: number | null;
  isbn10: string | null;
  isbn13: string | null;
  publisher: string | null;
  description: string | null;
  genres: string[];
  shelfId: string;
  dateAdded: Date;
  dateFinished: Date | null;
  /** 1–5 stars; null if not yet rated */
  rating: number | null;
  notes: string | null;
}

// ─── Shelves ──────────────────────────────────────────────────────────────────

export interface Shelf {
  id: string;
  name: string;
  isDefault: boolean;
  /** Zero-based order */
  position: number;
}

export const DEFAULT_SHELVES: Shelf[] = [
  { id: 'want-to-read', name: 'Want to Read', isDefault: true, position: 0 },
  { id: 'currently-reading', name: 'Currently Reading', isDefault: true, position: 1 },
  { id: 'read', name: 'Read', isDefault: true, position: 2 },
];

// ─── Reading Progress ─────────────────────────────────────────────────────────

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  /** 0–100 */
  percentage: number;
  lastUpdated: Date;
}

// ─── Reading Goal ─────────────────────────────────────────────────────────────

export interface ReadingGoal {
  year: number;
  target: number;
}

export interface GoalProgress {
  goal: ReadingGoal;
  completed: number;
  percentage: number;
  pace: 'ahead' | 'on-track' | 'behind';
  expectedByNow: number;
}

// ─── Sort / Filter ────────────────────────────────────────────────────────────

export type SortField = 'title' | 'author' | 'dateAdded' | 'dateFinished' | 'rating';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export interface FilterOptions {
  genres: string[];
  minRating: number | null;
  author: string | null;
}

// ─── Open Library API ─────────────────────────────────────────────────────────

export interface OLSearchResponse {
  numFound: number;
  start: number;
  docs: OLSearchDoc[];
}

export interface OLSearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  /** Cover image ID — use with covers.openlibrary.org */
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  publisher?: string[];
  subject?: string[];
}

// ─── Normalised search result ─────────────────────────────────────────────────

export interface SearchResult {
  apiId: string;
  apiSource: 'openlibrary' | 'google';
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishYear: number | null;
  pageCount: number | null;
  isbn13: string | null;
  isbn10: string | null;
  genres: string[];
  description: string | null;
  publisher: string | null;
}

// ─── Year-in-Review Statistics ────────────────────────────────────────────────

export interface YearStats {
  year: number;
  totalBooks: number;
  totalPages: number;
  /** Keys are month numbers 1–12 */
  booksByMonth: Record<number, number>;
  genreBreakdown: Record<string, number>;
  averageRating: number | null;
  longestBook: Book | null;
  shortestBook: Book | null;
  topGenre: string | null;
}

// ─── Guest data shape (matches data/sample-books.json) ───────────────────────

export interface SampleBook {
  title: string;
  author: string;
  isbn13: string;
  isbn10: string;
  coverUrl: string;
  pageCount: number;
  publishedDate: string;
  genres: string[];
  description: string;
  publisher: string;
}
