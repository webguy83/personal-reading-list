import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { YearInReviewComponent } from './year-in-review.component';
import { LibraryStore } from '../../core/stores/library.store';

const YEAR_STATS = {
  totalBooks: 10,
  totalPages: 3200,
  averageRating: 4.1,
  topGenre: 'Science Fiction',
  booksByMonth: { '1': 2, '3': 3, '7': 5 },
  genreBreakdown: {},
  ratingBreakdown: {},
  longestBook: null,
  shortestBook: null,
  fastestRead: null,
};

describe('YearInReviewComponent', () => {
  const mockGoalProgress = signal<unknown>(null);
  const mockYearStats = signal<unknown>(null);

  const mockStore = {
    goalProgress: mockGoalProgress,
    yearStats: mockYearStats,
    setGoal: vi.fn().mockResolvedValue(undefined),
    currentYear: signal(2025),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearInReviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LibraryStore, useValue: mockStore },
      ],
    }).compileComponents();
    mockGoalProgress.set(null);
    mockYearStats.set(null);
    vi.clearAllMocks();
    mockStore.setGoal.mockResolvedValue(undefined);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows year in heading', () => {
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('.page-title').textContent as string;
    expect(heading).toContain('in Review');
  });

  it('hides goal card when goalProgress is null', () => {
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.goal-card')).toBeNull();
  });

  it('shows goal card when goalProgress is set', () => {
    const gp = {
      completed: 8,
      percentage: 67,
      pace: 'ahead',
      expectedByNow: 6,
      goal: { year: 2025, target: 12 },
    };
    mockGoalProgress.set(gp);
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.goal-card')).toBeTruthy();
  });

  it('shows year stats when yearStats is set', () => {
    mockYearStats.set(YEAR_STATS);
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-cards')).toBeTruthy();
  });

  it('hides stat cards when yearStats is null', () => {
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-cards')).toBeNull();
  });

  it('saveGoal() calls store.setGoal with goalInput value', () => {
    const gp = { completed: 0, percentage: 0, pace: 'behind', expectedByNow: 5, goal: { year: 2025, target: 12 } };
    mockGoalProgress.set(gp);
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.editingGoal.set(true);
    comp.goalInput.set(20);
    comp.saveGoal();
    expect(mockStore.setGoal).toHaveBeenCalledWith(20);
  });

  it('saveGoal() resets editingGoal to false', () => {
    const gp = { completed: 0, percentage: 0, pace: 'behind', expectedByNow: 5, goal: { year: 2025, target: 12 } };
    mockGoalProgress.set(gp);
    const fixture = TestBed.createComponent(YearInReviewComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.editingGoal.set(true);
    comp.saveGoal();
    expect(comp.editingGoal()).toBe(false);
  });

  describe('monthAbbr()', () => {
    it('returns "Jan" for "1"', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.monthAbbr('1')).toBe('Jan');
    });
    it('returns "Feb" for "2"', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.monthAbbr('2')).toBe('Feb');
    });
    it('returns "Jun" for "6"', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.monthAbbr('6')).toBe('Jun');
    });
    it('returns "Dec" for "12"', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.monthAbbr('12')).toBe('Dec');
    });
    it('slices first 3 chars for non-numeric keys', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.monthAbbr('January')).toBe('Jan');
    });
  });

  describe('maxMonthlyCount()', () => {
    it('returns the maximum value from the record', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.maxMonthlyCount({ '1': 2, '3': 5, '7': 3 })).toBe(5);
    });
    it('returns 1 when all values are below 1', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.maxMonthlyCount({ '1': 0 })).toBe(1);
    });
    it('returns 1 for empty record', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.maxMonthlyCount({})).toBe(1);
    });
    it('returns the single value when record has one entry', () => {
      const comp = TestBed.createComponent(YearInReviewComponent).componentInstance;
      expect(comp.maxMonthlyCount({ '4': 7 })).toBe(7);
    });
  });
});
