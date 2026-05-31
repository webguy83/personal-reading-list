import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReadingProgressBarComponent } from './reading-progress-bar.component';

describe('ReadingProgressBarComponent', () => {
  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingProgressBarComponent],
      providers: [provideZonelessChangeDetection()],
      teardown: { destroyAfterEach: false },
    });
  });

  afterAll(() => TestBed.resetTestingModule());

  function setup(inputs: {
    percentage?: number;
    currentPage?: number | null;
    totalPages?: number | null;
    showLabel?: boolean;
  } = {}) {
    const fixture = TestBed.createComponent(ReadingProgressBarComponent);
    if (inputs.percentage !== undefined) fixture.componentRef.setInput('percentage', inputs.percentage);
    if (inputs.currentPage !== undefined) fixture.componentRef.setInput('currentPage', inputs.currentPage);
    if (inputs.totalPages !== undefined) fixture.componentRef.setInput('totalPages', inputs.totalPages);
    if (inputs.showLabel !== undefined) fixture.componentRef.setInput('showLabel', inputs.showLabel);
    fixture.detectChanges();
    return fixture;
  }

  it('creates successfully', () => {
    expect(setup().componentInstance).toBeTruthy();
  });

  it('progress track has role="progressbar"', () => {
    const { nativeElement } = setup({ percentage: 50 });
    const track = nativeElement.querySelector('.progress-track') as HTMLElement;
    expect(track.getAttribute('role')).toBe('progressbar');
  });

  it('sets aria-valuenow to the percentage', () => {
    const { nativeElement } = setup({ percentage: 65 });
    const track = nativeElement.querySelector('.progress-track') as HTMLElement;
    expect(track.getAttribute('aria-valuenow')).toBe('65');
  });

  it('sets aria-valuemin to 0 and aria-valuemax to 100', () => {
    const { nativeElement } = setup({ percentage: 50 });
    const track = nativeElement.querySelector('.progress-track') as HTMLElement;
    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
  });

  it('fills progress bar to the given percentage', () => {
    const { nativeElement } = setup({ percentage: 42 });
    const fill = nativeElement.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('42%');
  });

  it('shows label by default', () => {
    const { nativeElement } = setup({ percentage: 30 });
    expect(nativeElement.querySelector('.progress-label')).toBeTruthy();
  });

  it('hides label when showLabel is false', () => {
    const { nativeElement } = setup({ percentage: 30, showLabel: false });
    expect(nativeElement.querySelector('.progress-label')).toBeNull();
  });

  it('shows percentage text in label', () => {
    const { nativeElement } = setup({ percentage: 75 });
    expect(nativeElement.querySelector('.progress-pct').textContent.trim()).toBe('75%');
  });

  it('shows page count when currentPage and totalPages are set', () => {
    const { nativeElement } = setup({ percentage: 50, currentPage: 100, totalPages: 200 });
    expect(nativeElement.textContent).toContain('100 / 200 pages');
  });

  it('omits page text when currentPage is null', () => {
    const { nativeElement } = setup({ percentage: 50, currentPage: null, totalPages: 200 });
    expect(nativeElement.textContent).not.toContain('pages');
  });

  it('omits page text when totalPages is null', () => {
    const { nativeElement } = setup({ percentage: 50, currentPage: 100, totalPages: null });
    expect(nativeElement.textContent).not.toContain('pages');
  });

  it('defaults to 0% with no inputs', () => {
    const { nativeElement } = setup();
    const fill = nativeElement.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });
});
