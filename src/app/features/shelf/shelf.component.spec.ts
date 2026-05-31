import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ShelfComponent } from './shelf.component';
import { LibraryStore } from '../../core/stores/library.store';

const SHELF_READ = { id: 'read', name: 'Read', isDefault: true, position: 2, bookCount: 0 };
const SHELF_WANT = { id: 'want-to-read', name: 'Want to Read', isDefault: true, position: 0, bookCount: 0 };

describe('ShelfComponent', () => {
  const paramMapSubject = new BehaviorSubject(convertToParamMap({ shelfId: 'read' }));
  const mockBooksSignal = signal<unknown[]>([]);

  const mockStore = {
    shelvesWithCounts: signal([SHELF_WANT, SHELF_READ]),
    booksOnShelf: (_id: string) => mockBooksSignal,
    setSortOptions: vi.fn(),
    sortOptions: signal({ field: 'dateAdded', direction: 'desc' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelfComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: LibraryStore, useValue: mockStore },
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
      ],
    }).compileComponents();
    paramMapSubject.next(convertToParamMap({ shelfId: 'read' }));
    mockBooksSignal.set([]);
    vi.clearAllMocks();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computed shelf() returns the correct shelf by id', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.shelf()?.name).toBe('Read');
  });

  it('computed shelf() returns undefined for an unknown id', () => {
    paramMapSubject.next(convertToParamMap({ shelfId: 'unknown-shelf' }));
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.shelf()).toBeUndefined();
  });

  it('computed shelfId() returns value from route', () => {
    paramMapSubject.next(convertToParamMap({ shelfId: 'want-to-read' }));
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.shelfId()).toBe('want-to-read');
  });

  it('computed books() returns books for the shelf', () => {
    const book = { id: 'b1', title: 'Dune', authors: ['Frank Herbert'], genres: [], shelfId: 'read' };
    mockBooksSignal.set([book]);
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.books()).toHaveLength(1);
  });

  it('displays shelf heading when shelf exists', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Read');
  });

  it('shows sort options', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.sortOptions.length).toBe(4);
  });

  it('updateSort() calls store.setSortOptions with desc direction', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    fixture.componentInstance.updateSort('title');
    expect(mockStore.setSortOptions).toHaveBeenCalledWith({ field: 'title', direction: 'desc' });
  });

  it('shows empty state when no books on shelf', () => {
    const fixture = TestBed.createComponent(ShelfComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
  });
});
