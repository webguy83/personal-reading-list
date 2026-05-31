import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { LibraryStore } from './library.store';
import { AuthService } from '../auth/auth.service';
import { LibraryService } from '../services/library.service';
import { GuestService } from '../services/guest.service';
import {
  Book,
  ReadingProgress,
  ReadingGoal,
  SortOptions,
  FilterOptions,
  DEFAULT_SHELVES,
} from '../../shared/models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

let bookIdCounter = 0;

function makeBook(overrides: Partial<Book> = {}): Book {
  bookIdCounter++;
  return {
    id: `book-${bookIdCounter}`,
    apiId: `api-${bookIdCounter}`,
    apiSource: 'openlibrary',
    title: `Test Book ${bookIdCounter}`,
    authors: ['Test Author'],
    coverUrl: null,
    pageCount: 300,
    publishYear: 2020,
    isbn10: null,
    isbn13: null,
    publisher: null,
    description: null,
    genres: ['Fiction'],
    shelfId: 'want-to-read',
    dateAdded: new Date(),
    dateFinished: null,
    rating: null,
    notes: null,
    ...overrides,
  };
}

function finishedThisYear(daysAgo = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function finishedLastYear(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

// ─── Mock providers ───────────────────────────────────────────────────────────

const mockLibrarySvc = {
  books$: () => EMPTY,
  shelves$: () => EMPTY,
  progress$: () => EMPTY,
  goal$: () => EMPTY,
  addBook: async () => {},
  updateBook: async () => {},
  deleteBook: async () => {},
  updateProgress: async () => {},
  setGoal: async () => {},
  initDefaultShelves: vi.fn().mockResolvedValue(undefined),
};

function buildTestBed() {
  const mockAuth = {
    currentUid: signal<string | null>(null),
    isGuest: signal(false),
  };

  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      LibraryStore,
      GuestService,
      { provide: AuthService, useValue: mockAuth },
      { provide: LibraryService, useValue: mockLibrarySvc },
    ],
  });

  const store = TestBed.inject(LibraryStore);
  TestBed.flushEffects(); // run the constructor effect (clearData since uid=null, isGuest=false)
  return store;
}

// Shorthand to set private signals on the store
function setBooks(store: LibraryStore, books: Book[]) {
  (store as any)['_books'].set(books);
}

function setGoal(store: LibraryStore, goal: ReadingGoal | null) {
  (store as any)['_goal'].set(goal);
}

function setProgress(store: LibraryStore, prog: Record<string, ReadingProgress>) {
  (store as any)['_progress'].set(prog);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LibraryStore', () => {
  beforeEach(() => {
    bookIdCounter = 0;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── totalBooks ─────────────────────────────────────────────────────────────

  describe('totalBooks', () => {
    it('is 0 on initial state', () => {
      const store = buildTestBed();
      expect(store.totalBooks()).toBe(0);
    });

    it('reflects the number of books set', () => {
      const store = buildTestBed();
      setBooks(store, [makeBook(), makeBook(), makeBook()]);
      expect(store.totalBooks()).toBe(3);
    });
  });

  // ─── currentlyReading ───────────────────────────────────────────────────────

  describe('currentlyReading', () => {
    it('returns only books on the currently-reading shelf', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'currently-reading' }),
        makeBook({ shelfId: 'read' }),
        makeBook({ shelfId: 'want-to-read' }),
      ]);
      expect(store.currentlyReading().length).toBe(1);
      expect(store.currentlyReading()[0].shelfId).toBe('currently-reading');
    });

    it('attaches progress to currently-reading books', () => {
      const store = buildTestBed();
      const book = makeBook({ shelfId: 'currently-reading' });
      setBooks(store, [book]);
      const prog: ReadingProgress = {
        bookId: book.id,
        currentPage: 50,
        percentage: 25,
        lastUpdated: new Date(),
      };
      setProgress(store, { [book.id]: prog });
      expect(store.currentlyReading()[0].progress).toEqual(prog);
    });

    it('sets progress to null when no progress entry exists', () => {
      const store = buildTestBed();
      const book = makeBook({ shelfId: 'currently-reading' });
      setBooks(store, [book]);
      expect(store.currentlyReading()[0].progress).toBeNull();
    });
  });

  // ─── booksThisYear ──────────────────────────────────────────────────────────

  describe('booksThisYear', () => {
    it('returns only books finished in the current year', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedLastYear() }),
        makeBook({ shelfId: 'read', dateFinished: null }),
        makeBook({ shelfId: 'currently-reading' }),
      ]);
      expect(store.booksThisYear().length).toBe(1);
    });
  });

  // ─── goalProgress ───────────────────────────────────────────────────────────

  describe('goalProgress', () => {
    it('returns null when no goal is set', () => {
      const store = buildTestBed();
      expect(store.goalProgress()).toBeNull();
    });

    it('calculates completed count from books finished this year', () => {
      const store = buildTestBed();
      const year = new Date().getFullYear();
      setGoal(store, { year, target: 10 });
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(5) }),
        makeBook({ shelfId: 'read', dateFinished: finishedLastYear() }), // last year - not counted
        makeBook({ shelfId: 'currently-reading' }),
      ]);
      expect(store.goalProgress()!.completed).toBe(2);
    });

    it('calculates percentage (rounds to nearest integer)', () => {
      const store = buildTestBed();
      const year = new Date().getFullYear();
      setGoal(store, { year, target: 20 });
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
      ]);
      // 5 of 20 = 25%
      expect(store.goalProgress()!.percentage).toBe(25);
    });

    it('caps percentage at 100', () => {
      const store = buildTestBed();
      const year = new Date().getFullYear();
      setGoal(store, { year, target: 2 });
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear() }),
      ]);
      expect(store.goalProgress()!.percentage).toBe(100);
    });

    it('returns "ahead" pace when completed exceeds expected by 2+', () => {
      // Pin to Jan 10 — daysPassed ≈ 10, expectedByNow for target=12 → floor(10/365*12)=0
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 10));

      const store = buildTestBed();
      setGoal(store, { year: 2025, target: 12 });
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: new Date(2025, 0, 5) }),
        makeBook({ shelfId: 'read', dateFinished: new Date(2025, 0, 6) }),
        makeBook({ shelfId: 'read', dateFinished: new Date(2025, 0, 7) }),
        makeBook({ shelfId: 'read', dateFinished: new Date(2025, 0, 8) }),
        makeBook({ shelfId: 'read', dateFinished: new Date(2025, 0, 9) }),
      ]);
      // expectedByNow = floor(10/365 * 12) = 0; completed = 5 >= 0+1 → 'ahead'
      expect(store.goalProgress()!.pace).toBe('ahead');

      vi.useRealTimers();
    });

    it('includes goal in the returned object', () => {
      const store = buildTestBed();
      const year = new Date().getFullYear();
      const goal: ReadingGoal = { year, target: 12 };
      setGoal(store, goal);
      expect(store.goalProgress()!.goal).toEqual(goal);
    });
  });

  // ─── sortedFilteredBooks ────────────────────────────────────────────────────

  describe('sortedFilteredBooks', () => {
    it('sorts by title ascending', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ title: 'Zebra' }),
        makeBook({ title: 'Apple' }),
        makeBook({ title: 'Mango' }),
      ]);
      store.setSortOptions({ field: 'title', direction: 'asc' });
      const titles = store.sortedFilteredBooks().map(b => b.title);
      expect(titles).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('sorts by title descending', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ title: 'Zebra' }),
        makeBook({ title: 'Apple' }),
        makeBook({ title: 'Mango' }),
      ]);
      store.setSortOptions({ field: 'title', direction: 'desc' });
      const titles = store.sortedFilteredBooks().map(b => b.title);
      expect(titles).toEqual(['Zebra', 'Mango', 'Apple']);
    });

    it('sorts by rating descending', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ rating: 3 }),
        makeBook({ rating: 5 }),
        makeBook({ rating: 1 }),
      ]);
      store.setSortOptions({ field: 'rating', direction: 'desc' });
      const ratings = store.sortedFilteredBooks().map(b => b.rating);
      expect(ratings).toEqual([5, 3, 1]);
    });

    it('filters by genre', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ genres: ['Fiction'] }),
        makeBook({ genres: ['History'] }),
        makeBook({ genres: ['Fiction', 'Fantasy'] }),
      ]);
      store.setFilterOptions({ genres: ['Fiction'], minRating: null, author: null });
      expect(store.sortedFilteredBooks().length).toBe(2);
    });

    it('filters by minRating', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ rating: 5 }),
        makeBook({ rating: 3 }),
        makeBook({ rating: 2 }),
        makeBook({ rating: null }),
      ]);
      store.setFilterOptions({ genres: [], minRating: 4, author: null });
      expect(store.sortedFilteredBooks().length).toBe(1);
      expect(store.sortedFilteredBooks()[0].rating).toBe(5);
    });

    it('filters by author substring (case-insensitive)', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ authors: ['Jane Austen'] }),
        makeBook({ authors: ['Leo Tolstoy'] }),
        makeBook({ authors: ['Jane Smiley'] }),
      ]);
      store.setFilterOptions({ genres: [], minRating: null, author: 'jane' });
      expect(store.sortedFilteredBooks().length).toBe(2);
    });

    it('returns all books when no filter is active', () => {
      const store = buildTestBed();
      setBooks(store, [makeBook(), makeBook(), makeBook()]);
      store.setFilterOptions({ genres: [], minRating: null, author: null });
      expect(store.sortedFilteredBooks().length).toBe(3);
    });
  });

  // ─── yearStats ──────────────────────────────────────────────────────────────

  describe('yearStats', () => {
    it('returns zero totals when no books are read this year', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedLastYear() }),
        makeBook({ shelfId: 'currently-reading' }),
      ]);
      const stats = store.yearStats();
      expect(stats.totalBooks).toBe(0);
      expect(stats.totalPages).toBe(0);
      expect(stats.averageRating).toBeNull();
      expect(stats.topGenre).toBeNull();
    });

    it('sums totalPages for books finished this year', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), pageCount: 200 }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), pageCount: 350 }),
        makeBook({ shelfId: 'read', dateFinished: finishedLastYear(), pageCount: 999 }),
      ]);
      expect(store.yearStats().totalPages).toBe(550);
    });

    it('calculates averageRating rounded to 1 decimal', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), rating: 4 }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), rating: 5 }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), rating: 3 }),
      ]);
      // (4+5+3)/3 = 4.0
      expect(store.yearStats().averageRating).toBe(4);
    });

    it('tracks booksByMonth correctly', () => {
      const store = buildTestBed();
      const jan = new Date(new Date().getFullYear(), 0, 15); // month index 0 = Jan
      const feb = new Date(new Date().getFullYear(), 1, 10); // month index 1 = Feb
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: jan }),
        makeBook({ shelfId: 'read', dateFinished: jan }),
        makeBook({ shelfId: 'read', dateFinished: feb }),
      ]);
      const { booksByMonth } = store.yearStats();
      expect(booksByMonth[1]).toBe(2); // January
      expect(booksByMonth[2]).toBe(1); // February
    });

    it('identifies the top genre', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), genres: ['Fiction'] }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), genres: ['Fiction'] }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), genres: ['History'] }),
      ]);
      expect(store.yearStats().topGenre).toBe('Fiction');
    });

    it('sets year to the current year', () => {
      const store = buildTestBed();
      expect(store.yearStats().year).toBe(new Date().getFullYear());
    });

    it('identifies longest and shortest book', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), pageCount: 100 }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), pageCount: 800 }),
        makeBook({ shelfId: 'read', dateFinished: finishedThisYear(), pageCount: 300 }),
      ]);
      const stats = store.yearStats();
      expect(stats.longestBook?.pageCount).toBe(800);
      expect(stats.shortestBook?.pageCount).toBe(100);
    });
  });

  // ─── booksOnShelf ───────────────────────────────────────────────────────────

  describe('booksOnShelf', () => {
    it('returns books filtered to the given shelf', () => {
      const store = buildTestBed();
      setBooks(store, [
        makeBook({ shelfId: 'read' }),
        makeBook({ shelfId: 'read' }),
        makeBook({ shelfId: 'want-to-read' }),
      ]);
      expect(store.booksOnShelf('read')().length).toBe(2);
      expect(store.booksOnShelf('want-to-read')().length).toBe(1);
    });
  });

  // ─── Firestore shelves initialization ──────────────────────────────────────

  describe('loadFirestoreData — shelves initialization', () => {
    function buildWithUidAndShelves(shelvesObservable: ReturnType<typeof of>, initDefaultShelves = vi.fn().mockResolvedValue(undefined)) {
      const mockAuth = {
        currentUid: signal<string | null>('user-123'),
        isGuest: signal(false),
      };
      const customSvc = { ...mockLibrarySvc, shelves$: () => shelvesObservable, initDefaultShelves };

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          LibraryStore,
          GuestService,
          { provide: AuthService, useValue: mockAuth },
          { provide: LibraryService, useValue: customSvc },
        ],
      });

      const store = TestBed.inject(LibraryStore);
      TestBed.flushEffects();
      return { store, initDefaultShelves };
    }

    it('shows default shelves immediately when Firestore returns empty', () => {
      const { store } = buildWithUidAndShelves(of([]));
      expect(store.shelvesWithCounts().length).toBe(DEFAULT_SHELVES.length);
      expect(store.shelvesWithCounts().map(s => s.id)).toEqual(DEFAULT_SHELVES.map(s => s.id));
    });

    it('calls initDefaultShelves with the user uid when shelves are empty', () => {
      const { initDefaultShelves } = buildWithUidAndShelves(of([]));
      expect(initDefaultShelves).toHaveBeenCalledWith('user-123');
    });

    it('does NOT call initDefaultShelves when shelves already exist', () => {
      const existing = [DEFAULT_SHELVES[0]];
      const { initDefaultShelves } = buildWithUidAndShelves(of(existing));
      expect(initDefaultShelves).not.toHaveBeenCalled();
    });

    it('uses shelves from Firestore when they already exist', () => {
      const existing = DEFAULT_SHELVES.map(s => ({ ...s }));
      const { store } = buildWithUidAndShelves(of(existing));
      expect(store.shelvesWithCounts().length).toBe(DEFAULT_SHELVES.length);
    });
  });
});
