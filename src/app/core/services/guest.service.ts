import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Book, Shelf, ReadingProgress, ReadingGoal, DEFAULT_SHELVES, SampleBook, SearchResult } from '../../shared/models';
import sampleBooks from '../../../../data/sample-books.json';

// Distribute the sample books across shelves with realistic data
function buildGuestLibrary(): { books: Book[]; progress: Record<string, ReadingProgress>; goal: ReadingGoal } {
  const raw = sampleBooks as SampleBook[];
  const books: Book[] = [];
  const progress: Record<string, ReadingProgress> = {};

  const shelfAssignments: Array<{ shelfId: string; rating?: number; notes?: string; daysAgoFinished?: number }> = [
    // First 15 → 'read' with ratings
    { shelfId: 'read', rating: 5, daysAgoFinished: 10 },
    { shelfId: 'read', rating: 4, daysAgoFinished: 22 },
    { shelfId: 'read', rating: 5, daysAgoFinished: 35, notes: 'One of the most haunting books I have ever read.' },
    { shelfId: 'read', rating: 4, daysAgoFinished: 48 },
    { shelfId: 'read', rating: 3, daysAgoFinished: 60 },
    { shelfId: 'read', rating: 5, daysAgoFinished: 75 },
    { shelfId: 'read', rating: 4, daysAgoFinished: 88 },
    { shelfId: 'read', rating: 2, daysAgoFinished: 100 },
    { shelfId: 'read', rating: 5, daysAgoFinished: 112, notes: 'Absolutely brilliant. Will read again.' },
    { shelfId: 'read', rating: 4, daysAgoFinished: 125 },
    { shelfId: 'read', rating: 3, daysAgoFinished: 138 },
    { shelfId: 'read', rating: 5, daysAgoFinished: 150 },
    { shelfId: 'read', rating: 4, daysAgoFinished: 162 },
    { shelfId: 'read', rating: 4, daysAgoFinished: 175 },
    { shelfId: 'read', rating: 5, daysAgoFinished: 188 },
    // Next 3 → 'currently-reading' with progress
    { shelfId: 'currently-reading' },
    { shelfId: 'currently-reading' },
    { shelfId: 'currently-reading' },
    // Remaining → 'want-to-read' or a custom shelf
  ];

  const progressStates = [
    { page: 150, of: 300 },
    { page: 45, of: 320 },
    { page: 220, of: 250 },
  ];

  let currentlyReadingIdx = 0;

  raw.forEach((sample, i) => {
    const assignment = shelfAssignments[i] ?? { shelfId: 'want-to-read' };
    const id = `guest-book-${i}`;
    const now = new Date();

    const dateAdded = new Date(now);
    dateAdded.setDate(dateAdded.getDate() - (200 - i * 3));

    const dateFinished = assignment.daysAgoFinished != null
      ? (() => { const d = new Date(now); d.setDate(d.getDate() - assignment.daysAgoFinished!); return d; })()
      : null;

    books.push({
      id,
      apiId: `guest:${sample.isbn13}`,
      apiSource: 'openlibrary',
      title: sample.title,
      authors: [sample.author],
      coverUrl: sample.coverUrl,
      pageCount: sample.pageCount,
      publishYear: Number(sample.publishedDate?.split('-')[0]) || null,
      isbn10: sample.isbn10,
      isbn13: sample.isbn13,
      publisher: sample.publisher,
      description: sample.description,
      genres: sample.genres,
      shelfId: assignment.shelfId,
      dateAdded,
      dateFinished,
      rating: assignment.rating ?? null,
      notes: assignment.notes ?? null,
    });

    if (assignment.shelfId === 'currently-reading') {
      const state = progressStates[currentlyReadingIdx++];
      if (state) {
        progress[id] = {
          bookId: id,
          currentPage: state.page,
          percentage: Math.round((state.page / state.of) * 100),
          lastUpdated: new Date(now.getTime() - 1000 * 60 * 60 * 2),
        };
      }
    }
  });

  return {
    books,
    progress,
    goal: { year: new Date().getFullYear(), target: 24 },
  };
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  static readonly STORAGE_KEY = 'bookshelf-guest-library';

  readonly shelves: Shelf[] = [
    ...DEFAULT_SHELVES,
    { id: 'favorites', name: 'Favourites', isDefault: false, position: 3 },
    { id: 'book-club', name: 'Book Club 2026', isDefault: false, position: 4 },
  ];

  readonly books: WritableSignal<Book[]>;
  readonly progress: WritableSignal<Record<string, ReadingProgress>>;
  readonly goal: WritableSignal<ReadingGoal>;

  constructor() {
    const initial = this.loadOrBuild();
    this.books = signal(initial.books);
    this.progress = signal(initial.progress);
    this.goal = signal(initial.goal);
  }

  private loadOrBuild(): { books: Book[]; progress: Record<string, ReadingProgress>; goal: ReadingGoal } {
    const raw = localStorage.getItem(GuestService.STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          books: parsed.books.map((b: Book & { dateAdded: string; dateFinished: string | null }) => ({
            ...b,
            dateAdded: new Date(b.dateAdded),
            dateFinished: b.dateFinished ? new Date(b.dateFinished) : null,
          })),
          progress: Object.fromEntries(
            Object.entries(parsed.progress).map(([k, v]) => [
              k,
              { ...(v as ReadingProgress), lastUpdated: new Date((v as ReadingProgress & { lastUpdated: string }).lastUpdated) },
            ]),
          ),
          goal: parsed.goal,
        };
      } catch {
        // Corrupted data — fall through to fresh defaults
      }
    }
    return buildGuestLibrary();
  }

  static clearStorage(): void {
    localStorage.removeItem(GuestService.STORAGE_KEY);
  }

  booksOnShelf(shelfId: string) {
    return computed(() => this.books().filter(b => b.shelfId === shelfId));
  }

  updateBook(id: string, updates: Partial<Book>): void {
    this.books.update(books => books.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }

  addBook(result: SearchResult, shelfId: string): Book {
    const id = `guest-added-${Date.now()}`;
    const newBook: Book = {
      id,
      apiId: result.apiId,
      apiSource: result.apiSource,
      title: result.title,
      authors: result.authors,
      coverUrl: result.coverUrl,
      pageCount: result.pageCount,
      publishYear: result.publishYear,
      isbn10: result.isbn10,
      isbn13: result.isbn13,
      publisher: result.publisher,
      description: result.description,
      genres: result.genres,
      shelfId,
      dateAdded: new Date(),
      dateFinished: null,
      rating: null,
      notes: null,
    };
    this.books.update(books => [...books, newBook]);
    return newBook;
  }

  updateProgress(bookId: string, currentPage: number, totalPages: number | null): void {
    const percentage = totalPages ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
    this.progress.update(p => ({
      ...p,
      [bookId]: { bookId, currentPage, percentage, lastUpdated: new Date() },
    }));
  }
}
