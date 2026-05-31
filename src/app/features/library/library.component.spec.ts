import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LibraryComponent } from './library.component';
import { LibraryStore } from '../../core/stores/library.store';

const SHELF_READ = { id: 'read', name: 'Read', isDefault: true, position: 2, bookCount: 0 };
const SHELF_WANT = { id: 'want-to-read', name: 'Want to Read', isDefault: true, position: 0, bookCount: 0 };

describe('LibraryComponent', () => {
  const mockBooks = signal<unknown[]>([]);
  const mockGoalProgress = signal<unknown>(null);
  const mockCurrentlyReading = signal<unknown[]>([]);
  const mockShelvesWithCounts = signal<unknown[]>([SHELF_WANT, SHELF_READ]);

  const mockStore = {
    loading: signal(false),
    books: mockBooks,
    goalProgress: mockGoalProgress,
    currentlyReading: mockCurrentlyReading,
    shelvesWithCounts: mockShelvesWithCounts,
    progress: signal({}),
    booksOnShelf: () => signal<unknown[]>([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: LibraryStore, useValue: mockStore },
      ],
    }).compileComponents();
    mockBooks.set([]);
    mockGoalProgress.set(null);
    mockCurrentlyReading.set([]);
    mockShelvesWithCounts.set([SHELF_WANT, SHELF_READ]);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows "My Library" heading', () => {
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-title').textContent.trim()).toBe('My Library');
  });

  it('shows book count in subtitle', () => {
    mockBooks.set([{ id: '1' }, { id: '2' }]);
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-sub').textContent).toContain('2');
  });

  it('hides currently reading section when empty', () => {
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.currently-reading-section')).toBeNull();
  });

  it('shows currently reading section when there are books', () => {
    const book = {
      id: 'b1',
      title: 'Dune',
      authors: ['Frank Herbert'],
      coverUrl: null,
      pageCount: 400,
      shelfId: 'currently-reading',
      progress: { percentage: 50, currentPage: 200 },
    };
    mockCurrentlyReading.set([book]);
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.currently-reading-section')).toBeTruthy();
  });

  it('shows currently reading book title', () => {
    const book = {
      id: 'b1',
      title: 'Dune',
      authors: ['Frank Herbert'],
      coverUrl: null,
      pageCount: 400,
      shelfId: 'currently-reading',
      progress: null,
    };
    mockCurrentlyReading.set([book]);
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dune');
  });

  it('shows shelf sections', () => {
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    const shelves = fixture.nativeElement.querySelectorAll('.shelf-section');
    // currently-reading section is hidden (no books), 2 shelf sections for want/read
    expect(shelves.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty goal banner with set-a-goal link when goalProgress is null', () => {
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.goal-banner');
    expect(banner).toBeTruthy();
    expect(banner.classList).toContain('goal-banner--empty');
    expect(fixture.nativeElement.querySelector('.goal-set-link')).toBeTruthy();
  });

  it('shows goal banner when goalProgress is set', () => {
    const gp = {
      completed: 5,
      percentage: 42,
      pace: 'on-track',
      expectedByNow: 5,
      goal: { year: 2025, target: 12 },
    };
    mockGoalProgress.set(gp);
    const fixture = TestBed.createComponent(LibraryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.goal-banner')).toBeTruthy();
  });
});
