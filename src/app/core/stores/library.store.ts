import { Injectable, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { GuestService } from '../services/guest.service';
import { LibraryService } from '../services/library.service';
import {
  Book,
  Shelf,
  ReadingProgress,
  ReadingGoal,
  GoalProgress,
  SearchResult,
  SortOptions,
  FilterOptions,
  YearStats,
  DEFAULT_SHELVES,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class LibraryStore implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly guest = inject(GuestService);
  private readonly svc = inject(LibraryService);

  private subs: Subscription[] = [];

  // ─── Raw state ─────────────────────────────────────────────────────────────

  private readonly _books = signal<Book[]>([]);
  private readonly _shelves = signal<Shelf[]>([...DEFAULT_SHELVES]);
  private readonly _progress = signal<Record<string, ReadingProgress>>({});
  private readonly _goal = signal<ReadingGoal | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _sortOptions = signal<SortOptions>({ field: 'dateAdded', direction: 'desc' });
  private readonly _filterOptions = signal<FilterOptions>({ genres: [], minRating: null, author: null });

  // ─── Public readonly ───────────────────────────────────────────────────────

  readonly books = this._books.asReadonly();
  readonly shelves = this._shelves.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly goal = this._goal.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly sortOptions = this._sortOptions.asReadonly();
  readonly filterOptions = this._filterOptions.asReadonly();

  // ─── Derived / computed ────────────────────────────────────────────────────

  readonly totalBooks = computed(() => this._books().length);

  readonly shelvesWithCounts = computed(() =>
    this._shelves().map(shelf => ({
      ...shelf,
      bookCount: this._books().filter(b => b.shelfId === shelf.id).length,
    })),
  );

  readonly currentlyReading = computed(() =>
    this._books()
      .filter(b => b.shelfId === 'currently-reading')
      .map(book => ({ ...book, progress: this._progress()[book.id] ?? null })),
  );

  readonly booksThisYear = computed(() => {
    const year = new Date().getFullYear();
    return this._books().filter(
      b => b.shelfId === 'read' && b.dateFinished && new Date(b.dateFinished).getFullYear() === year,
    );
  });

  readonly goalProgress = computed((): GoalProgress | null => {
    const goal = this._goal();
    if (!goal) return null;

    const completed = this._books().filter(
      b =>
        b.shelfId === 'read' &&
        b.dateFinished &&
        new Date(b.dateFinished).getFullYear() === goal.year,
    ).length;

    const now = new Date();
    const startOfYear = new Date(goal.year, 0, 1);
    const endOfYear = new Date(goal.year, 11, 31);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / 86_400_000;
    const daysPassed = (now.getTime() - startOfYear.getTime()) / 86_400_000;
    const expectedByNow = Math.floor((daysPassed / totalDays) * goal.target);
    const percentage = Math.min(100, Math.round((completed / goal.target) * 100));

    const pace: 'ahead' | 'on-track' | 'behind' =
      completed >= expectedByNow + 1 ? 'ahead' : completed >= expectedByNow - 1 ? 'on-track' : 'behind';

    return { goal, completed, percentage, pace, expectedByNow };
  });

  readonly sortedFilteredBooks = computed(() => {
    let books = [...this._books()];
    const filter = this._filterOptions();
    const sort = this._sortOptions();

    if (filter.genres.length) {
      books = books.filter(b => b.genres.some(g => filter.genres.includes(g)));
    }
    if (filter.minRating != null) {
      books = books.filter(b => b.rating != null && b.rating >= filter.minRating!);
    }
    if (filter.author) {
      const q = filter.author.toLowerCase();
      books = books.filter(b => b.authors.some(a => a.toLowerCase().includes(q)));
    }

    books.sort((a, b) => {
      let cmp = 0;
      switch (sort.field) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'author': cmp = (a.authors[0] ?? '').localeCompare(b.authors[0] ?? ''); break;
        case 'dateAdded': cmp = (a.dateAdded?.getTime() ?? 0) - (b.dateAdded?.getTime() ?? 0); break;
        case 'dateFinished': cmp = (a.dateFinished?.getTime() ?? 0) - (b.dateFinished?.getTime() ?? 0); break;
        case 'rating': cmp = (a.rating ?? 0) - (b.rating ?? 0); break;
      }
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return books;
  });

  readonly yearStats = computed((): YearStats => {
    const year = new Date().getFullYear();
    const read = this._books().filter(
      b => b.shelfId === 'read' && b.dateFinished && new Date(b.dateFinished).getFullYear() === year,
    );

    const booksByMonth: Record<number, number> = {};
    const genreBreakdown: Record<string, number> = {};
    let totalPages = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    for (const book of read) {
      const month = book.dateFinished ? new Date(book.dateFinished).getMonth() + 1 : 0;
      if (month) booksByMonth[month] = (booksByMonth[month] ?? 0) + 1;
      if (book.pageCount) totalPages += book.pageCount;
      for (const genre of book.genres) {
        genreBreakdown[genre] = (genreBreakdown[genre] ?? 0) + 1;
      }
      if (book.rating) { ratingSum += book.rating; ratingCount++; }
    }

    const sorted = [...read].sort((a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0));
    const topGenreEntry = Object.entries(genreBreakdown).sort((a, b) => b[1] - a[1])[0];

    return {
      year,
      totalBooks: read.length,
      totalPages,
      booksByMonth,
      genreBreakdown,
      averageRating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
      longestBook: sorted[0] ?? null,
      shortestBook: sorted[sorted.length - 1] ?? null,
      topGenre: topGenreEntry?.[0] ?? null,
    };
  });

  constructor() {
    // React to auth/guest state changes — load appropriate data source
    effect(() => {
      const uid = this.auth.currentUid();
      const isGuest = this.auth.isGuest();

      if (isGuest) {
        this.loadGuestData();
      } else if (uid) {
        this.loadFirestoreData(uid);
      } else {
        this.clearData();
      }
    });
  }

  // ─── Load methods ──────────────────────────────────────────────────────────

  private loadGuestData(): void {
    this._books.set(this.guest.books());
    this._shelves.set(this.guest.shelves);
    this._progress.set(this.guest.progress());
    this._goal.set(this.guest.goal());
  }

  private loadFirestoreData(uid: string): void {
    this._loading.set(true);
    this._error.set(null);

    // Subscribe to real-time Firestore streams
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [
      this.svc.books$(uid).subscribe({
        next: books => {
          this._books.set(books);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('Failed to load books');
          this._loading.set(false);
        },
      }),
      this.svc.shelves$(uid).subscribe({
        next: shelves => {
          if (shelves.length === 0) {
            // First sign-in — show defaults immediately and persist to Firestore.
            this._shelves.set([...DEFAULT_SHELVES]);
            this.svc.initDefaultShelves(uid);
          } else {
            this._shelves.set(shelves);
          }
        },
        error: () => {},
      }),
      this.svc.progress$(uid).subscribe({
        next: progressList => {
          const map: Record<string, ReadingProgress> = {};
          for (const p of progressList) map[p.bookId] = p;
          this._progress.set(map);
        },
        error: () => {},
      }),
      this.svc.goal$(uid, new Date().getFullYear()).subscribe({ next: goal => this._goal.set(goal), error: () => {} }),
    ];
  }

  private clearData(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
    this._books.set([]);
    this._shelves.set([...DEFAULT_SHELVES]);
    this._progress.set({});
    this._goal.set(null);
  }

  // ─── Mutations ─────────────────────────────────────────────────────────────

  async addBook(result: SearchResult, shelfId: string): Promise<void> {
    const uid = this.auth.currentUid();

    // Optimistic duplicate check
    const existing = this._books().find(b => b.apiId === result.apiId);
    if (existing) throw new Error('DUPLICATE');

    if (uid) {
      await this.svc.addBook(uid, result, shelfId);
    } else if (this.auth.isGuest()) {
      const newBook = this.guest.addBook(result, shelfId);
      this._books.update(books => [...books, newBook]);
    }
  }

  async moveBook(bookId: string, targetShelfId: string): Promise<void> {
    const uid = this.auth.currentUid();
    const updates: Partial<Book> = { shelfId: targetShelfId };
    if (targetShelfId === 'read') {
      updates.dateFinished = new Date();
    }

    if (uid) {
      await this.svc.updateBook(uid, bookId, updates);
    } else if (this.auth.isGuest()) {
      this.guest.updateBook(bookId, updates);
      this._books.update(books => books.map(b => (b.id === bookId ? { ...b, ...updates } : b)));
    }
  }

  async updateProgress(bookId: string, currentPage: number): Promise<void> {
    const book = this._books().find(b => b.id === bookId);
    const uid = this.auth.currentUid();

    if (uid) {
      await this.svc.updateProgress(uid, bookId, currentPage, book?.pageCount ?? null);
    } else if (this.auth.isGuest()) {
      this.guest.updateProgress(bookId, currentPage, book?.pageCount ?? null);
      this._progress.update(p => ({
        ...p,
        [bookId]: {
          bookId,
          currentPage,
          percentage: book?.pageCount ? Math.min(100, Math.round((currentPage / book.pageCount) * 100)) : 0,
          lastUpdated: new Date(),
        },
      }));
    }
  }

  async updateRating(bookId: string, rating: number): Promise<void> {
    await this.updateBookField(bookId, { rating });
  }

  async updateNotes(bookId: string, notes: string): Promise<void> {
    await this.updateBookField(bookId, { notes });
  }

  async deleteBook(bookId: string): Promise<void> {
    const uid = this.auth.currentUid();
    if (uid) {
      await this.svc.deleteBook(uid, bookId);
    } else if (this.auth.isGuest()) {
      this._books.update(books => books.filter(b => b.id !== bookId));
    }
  }

  async setGoal(target: number): Promise<void> {
    const year = new Date().getFullYear();
    const uid = this.auth.currentUid();
    if (uid) {
      await this.svc.setGoal(uid, year, target);
    } else if (this.auth.isGuest()) {
      this._goal.set({ year, target });
    }
  }

  setSortOptions(options: SortOptions): void {
    this._sortOptions.set(options);
  }

  setFilterOptions(options: FilterOptions): void {
    this._filterOptions.set(options);
  }

  booksOnShelf(shelfId: string) {
    return computed(() => this.sortedFilteredBooks().filter(b => b.shelfId === shelfId));
  }

  isBookInLibrary(apiId: string): boolean {
    return this._books().some(b => b.apiId === apiId);
  }

  private async updateBookField(bookId: string, updates: Partial<Book>): Promise<void> {
    const uid = this.auth.currentUid();
    if (uid) {
      await this.svc.updateBook(uid, bookId, updates);
    } else if (this.auth.isGuest()) {
      this.guest.updateBook(bookId, updates);
      this._books.update(books => books.map(b => (b.id === bookId ? { ...b, ...updates } : b)));
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
