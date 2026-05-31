import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BookCoverComponent } from './book-cover.component';

describe('BookCoverComponent', () => {
  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCoverComponent],
      providers: [provideZonelessChangeDetection()],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  });

  afterAll(() => TestBed.resetTestingModule());

  function setup(inputs: { coverUrl?: string | null; title?: string; author?: string; size?: number } = {}) {
    const fixture = TestBed.createComponent(BookCoverComponent);
    if (inputs.coverUrl !== undefined) fixture.componentRef.setInput('coverUrl', inputs.coverUrl);
    if (inputs.title !== undefined) fixture.componentRef.setInput('title', inputs.title);
    if (inputs.author !== undefined) fixture.componentRef.setInput('author', inputs.author);
    if (inputs.size !== undefined) fixture.componentRef.setInput('size', inputs.size);
    fixture.detectChanges();
    return fixture;
  }

  it('creates successfully', () => {
    expect(setup().componentInstance).toBeTruthy();
  });

  it('shows placeholder when coverUrl is null', () => {
    const { nativeElement } = setup({ coverUrl: null, title: 'Dune' });
    expect(nativeElement.querySelector('.book-cover-placeholder')).toBeTruthy();
  });

  it('shows placeholder when coverUrl is empty string', () => {
    const { nativeElement } = setup({ coverUrl: '', title: 'Dune' });
    expect(nativeElement.querySelector('.book-cover-placeholder')).toBeTruthy();
  });

  it('shows skeleton while image is loading', () => {
    const { nativeElement } = setup({ coverUrl: 'http://example.com/cover.jpg', title: 'Dune' });
    expect(nativeElement.querySelector('.book-cover-skeleton')).toBeTruthy();
  });

  it('shows loaded image after load event fires', () => {
    const fixture = setup({ coverUrl: 'http://example.com/cover.jpg', title: 'Dune' });
    const img = fixture.nativeElement.querySelector('.hidden-img') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.book-cover-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('.book-cover-img')).toBeTruthy();
  });

  it('shows placeholder after image error event', () => {
    const fixture = setup({ coverUrl: 'http://example.com/broken.jpg', title: 'Dune' });
    const img = fixture.nativeElement.querySelector('.hidden-img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.book-cover-placeholder')).toBeTruthy();
  });

  it('sets data-title on placeholder element', () => {
    const { nativeElement } = setup({ coverUrl: null, title: 'Dune' });
    const titleDiv = nativeElement.querySelector('.placeholder-title') as HTMLElement;
    expect(titleDiv.getAttribute('data-title')).toBe('Dune');
  });

  it('sets data-author on placeholder element', () => {
    const { nativeElement } = setup({ coverUrl: null, title: 'Dune', author: 'Frank Herbert' });
    const authorDiv = nativeElement.querySelector('.placeholder-author') as HTMLElement;
    expect(authorDiv.getAttribute('data-author')).toBe('Frank Herbert');
  });

  it('truncates title longer than 40 characters in data-title', () => {
    const longTitle = 'A'.repeat(50);
    const { nativeElement } = setup({ coverUrl: null, title: longTitle });
    const titleDiv = nativeElement.querySelector('.placeholder-title') as HTMLElement;
    expect(titleDiv.getAttribute('data-title')!.length).toBeLessThanOrEqual(40);
  });

  it('applies size as width to book-cover-wrap', () => {
    const { nativeElement } = setup({ coverUrl: null, title: 'Dune', size: 80 });
    const wrap = nativeElement.querySelector('.book-cover-wrap') as HTMLElement;
    expect(wrap.style.width).toBe('80px');
  });

  it('placeholder title and author elements are aria-hidden', () => {
    const { nativeElement } = setup({ coverUrl: null, title: 'Dune', author: 'Herbert' });
    expect(nativeElement.querySelector('.placeholder-title').getAttribute('aria-hidden')).toBe('true');
    expect(nativeElement.querySelector('.placeholder-author').getAttribute('aria-hidden')).toBe('true');
  });
});
