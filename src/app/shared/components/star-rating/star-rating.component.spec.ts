import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingComponent],
      providers: [provideZonelessChangeDetection()],
      teardown: { destroyAfterEach: false },
    });
  });

  afterAll(() => TestBed.resetTestingModule());

  function setup(inputs: { rating?: number | null; readonly?: boolean } = {}) {
    const fixture = TestBed.createComponent(StarRatingComponent);
    if (inputs.rating !== undefined) fixture.componentRef.setInput('rating', inputs.rating);
    if (inputs.readonly !== undefined) fixture.componentRef.setInput('readonly', inputs.readonly);
    fixture.detectChanges();
    return fixture;
  }

  it('creates successfully', () => {
    expect(setup().componentInstance).toBeTruthy();
  });

  it('renders 5 star buttons', () => {
    const { nativeElement } = setup();
    expect(nativeElement.querySelectorAll('.star-btn').length).toBe(5);
  });

  it('marks correct number of stars as filled for rating=3', () => {
    const { nativeElement } = setup({ rating: 3 });
    const buttons = nativeElement.querySelectorAll('.star-btn');
    const filled = [...buttons].filter((b: Element) => b.classList.contains('filled'));
    expect(filled.length).toBe(3);
  });

  it('marks all stars as unfilled when rating is null', () => {
    const { nativeElement } = setup({ rating: null });
    const filled = nativeElement.querySelectorAll('.star-btn.filled');
    expect(filled.length).toBe(0);
  });

  it('marks all 5 stars filled for rating=5', () => {
    const { nativeElement } = setup({ rating: 5 });
    const filled = nativeElement.querySelectorAll('.star-btn.filled');
    expect(filled.length).toBe(5);
  });

  it('emits rateChange when a star is clicked', () => {
    const fixture = setup({ rating: null });
    const emitted: number[] = [];
    fixture.componentInstance.rateChange.subscribe((v: number) => emitted.push(v));
    const buttons = fixture.nativeElement.querySelectorAll('.star-btn');
    buttons[3].click(); // 4th star
    expect(emitted).toEqual([4]);
  });

  it('emits the correct star value when clicked', () => {
    const fixture = setup({ rating: 2 });
    const emitted: number[] = [];
    fixture.componentInstance.rateChange.subscribe((v: number) => emitted.push(v));
    const buttons = fixture.nativeElement.querySelectorAll('.star-btn');
    buttons[1].click(); // 2nd star
    expect(emitted).toEqual([2]);
  });

  it('does not emit rateChange when readonly and star is clicked', () => {
    const fixture = setup({ rating: 3, readonly: true });
    const emitted: number[] = [];
    fixture.componentInstance.rateChange.subscribe((v: number) => emitted.push(v));
    const buttons = fixture.nativeElement.querySelectorAll('.star-btn');
    buttons[4].click();
    expect(emitted).toEqual([]);
  });

  it('disables all buttons when readonly is true', () => {
    const { nativeElement } = setup({ rating: 3, readonly: true });
    const buttons = [...nativeElement.querySelectorAll('.star-btn')] as HTMLButtonElement[];
    expect(buttons.every(b => b.disabled)).toBe(true);
  });

  it('updates filled stars on hover', () => {
    const fixture = setup({ rating: 1 });
    const buttons = fixture.nativeElement.querySelectorAll('.star-btn');
    buttons[4].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const filled = fixture.nativeElement.querySelectorAll('.star-btn.filled');
    expect(filled.length).toBe(5);
  });

  it('restores rating after mouse leaves', () => {
    const fixture = setup({ rating: 2 });
    const buttons = fixture.nativeElement.querySelectorAll('.star-btn');
    buttons[4].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    buttons[4].dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    const filled = fixture.nativeElement.querySelectorAll('.star-btn.filled');
    expect(filled.length).toBe(2);
  });

  it('sets aria-label on the container', () => {
    const { nativeElement } = setup({ rating: 4 });
    const container = nativeElement.querySelector('.star-rating') as HTMLElement;
    expect(container.getAttribute('aria-label')).toContain('4');
  });
});
