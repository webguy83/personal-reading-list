import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BookDetailComponent } from './book-detail.component';
import { LibraryStore } from '../../core/stores/library.store';

const BOOK = {
  id: 'book-1',
  apiId: 'ol-1',
  title: 'Dune',
  authors: ['Frank Herbert'],
  coverUrl: null,
  pageCount: 412,
  shelfId: 'currently-reading',
  dateAdded: '2024-01-01',
  dateFinished: null,
  rating: null,
  notes: '',
  genres: [],
  publishYear: 1965,
  description: 'A classic novel.',
  isbn10: null,
  isbn13: null,
  publisher: null,
  apiSource: 'openlibrary',
};

const SHELF = { id: 'currently-reading', name: 'Currently Reading', isDefault: true, position: 1, bookCount: 1 };

const mockDialogRef = { afterClosed: () => of(true) };
const mockDialog = { open: vi.fn().mockReturnValue(mockDialogRef) };
const mockRouter = { navigate: vi.fn() };

describe('BookDetailComponent', () => {
  const mockBooksSignal = signal<unknown[]>([BOOK]);
  const mockProgressSignal = signal<Record<string, unknown>>({});

  const mockStore = {
    books: mockBooksSignal,
    progress: mockProgressSignal,
    shelvesWithCounts: signal([SHELF]),
    updateProgress: vi.fn(),
    updateRating: vi.fn(),
    updateNotes: vi.fn(),
    moveBook: vi.fn(),
    deleteBook: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: LibraryStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ bookId: 'book-1' })) },
        },
      ],
    }).compileComponents();
    mockBooksSignal.set([BOOK]);
    mockProgressSignal.set({});
    vi.clearAllMocks();
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockRouter.navigate.mockClear();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays book title', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dune');
  });

  it('displays author', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Frank Herbert');
  });

  it('displays shelf name badge', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Currently Reading');
  });

  it('computed book() finds the correct book by id', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.book()?.id).toBe('book-1');
  });

  it('computed book() is undefined when bookId does not match', () => {
    mockBooksSignal.set([{ ...BOOK, id: 'other-book' }]);
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.book()).toBeUndefined();
  });

  it('computed progress() returns null when no progress exists', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.progress()).toBeNull();
  });

  it('computed progress() returns progress when it exists', () => {
    const progress = { bookId: 'book-1', currentPage: 100, percentage: 24, lastUpdated: '' };
    mockProgressSignal.set({ 'book-1': progress });
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.progress()?.currentPage).toBe(100);
  });

  it('saveProgress() calls store.updateProgress', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.currentPageInput.set(150);
    comp.saveProgress();
    expect(mockStore.updateProgress).toHaveBeenCalledWith('book-1', 150);
  });

  it('saveProgress() clears editingProgress', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.editingProgress.set(true);
    comp.saveProgress();
    expect(comp.editingProgress()).toBe(false);
  });

  it('rate() calls store.updateRating', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.rate(4);
    expect(mockStore.updateRating).toHaveBeenCalledWith('book-1', 4);
  });

  it('moveToShelf() calls store.moveBook', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.moveToShelf('read');
    expect(mockStore.moveBook).toHaveBeenCalledWith('book-1', 'read');
  });

  it('saveNotes() calls store.updateNotes', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.notesInput.set('A great read');
    comp.saveNotes();
    expect(mockStore.updateNotes).toHaveBeenCalledWith('book-1', 'A great read');
  });

  it('shelfName computed returns the shelf name', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.shelfName()).toBe('Currently Reading');
  });

  // ─── deleteBook ───────────────────────────────────────────────────────────

  it('deleteBook() opens a MatDialog', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockDialog.open).toHaveBeenCalledOnce();
  });

  it('deleteBook() passes the book title in the dialog message', () => {
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    const [, options] = mockDialog.open.mock.calls[0];
    expect(options.data.message).toContain('Dune');
  });

  it('deleteBook() calls store.deleteBook when dialog confirms', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockStore.deleteBook).toHaveBeenCalledWith('book-1');
  });

  it('deleteBook() does NOT call store.deleteBook when dialog is cancelled', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockStore.deleteBook).not.toHaveBeenCalled();
  });

  it('deleteBook() does nothing when book() is undefined', () => {
    mockBooksSignal.set([]);
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('deleteBook() navigates to /library when dialog confirms', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/library']);
  });

  it('deleteBook() does NOT navigate when dialog is cancelled', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
    const fixture = TestBed.createComponent(BookDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.deleteBook();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
