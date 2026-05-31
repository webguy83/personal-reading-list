import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';
import { BookApiService } from '../../core/services/book-api.service';
import { LibraryStore } from '../../core/stores/library.store';

describe('SearchComponent', () => {
  const mockApi = {
    search: vi.fn().mockReturnValue(of([])),
  };

  const mockStore = {
    shelvesWithCounts: signal([]),
    isBookInLibrary: vi.fn().mockReturnValue(false),
    addBook: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: BookApiService, useValue: mockApi },
        { provide: LibraryStore, useValue: mockStore },
      ],
    }).compileComponents();
    vi.clearAllMocks();
    mockApi.search.mockReturnValue(of([]));
    mockStore.isBookInLibrary.mockReturnValue(false);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows initial search prompt when query is empty', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(fixture.nativeElement.querySelector('.search-prompt')).toBeTruthy();
  });

  it('renders search input', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(fixture.nativeElement.querySelector('.search-input')).toBeTruthy();
  });

  it('clear() resets query and results', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const comp = fixture.componentInstance;
    comp.query.set('dune');
    comp.results.set([{ apiId: '1', title: 'Dune', authors: [] }]);
    comp.clear();
    expect(comp.query()).toBe('');
    expect(comp.results()).toEqual([]);
    expect(comp.searching()).toBe(false);
  });

  it('clear() hides results and shows prompt', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const comp = fixture.componentInstance;
    comp.query.set('dune');
    comp.results.set([{ apiId: '1', title: 'Dune', authors: ['F Herbert'] }]);
    fixture.detectChanges();
    comp.clear();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.search-prompt')).toBeTruthy();
  });

  it('isInLibrary delegates to store.isBookInLibrary', () => {
    mockStore.isBookInLibrary.mockReturnValue(true);
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const result = fixture.componentInstance.isInLibrary('ol-123');
    expect(mockStore.isBookInLibrary).toHaveBeenCalledWith('ol-123');
    expect(result).toBe(true);
  });

  it('addToShelf delegates to store.addBook', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const result = { apiId: 'ol-1', title: 'Dune', authors: [] };
    fixture.componentInstance.addToShelf(result, 'want-to-read');
    expect(mockStore.addBook).toHaveBeenCalledWith(result, 'want-to-read');
  });

  it('shows results count when there are results', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const comp = fixture.componentInstance;
    comp.query.set('dune');
    comp.results.set([
      { apiId: '1', title: 'Dune', authors: ['F Herbert'], coverUrl: null },
      { apiId: '2', title: 'Dune Messiah', authors: ['F Herbert'], coverUrl: null },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.results-count')).toBeTruthy();
  });

  it('shows no-results state when query is set but results are empty', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    const comp = fixture.componentInstance;
    comp.query.set('xyz');
    comp.searching.set(false);
    comp.results.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.no-results')).toBeTruthy();
  });
});
