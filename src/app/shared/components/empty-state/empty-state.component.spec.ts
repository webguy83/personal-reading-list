import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  function setup(inputs: {
    icon?: string;
    title?: string;
    message?: string;
    actionLabel?: string;
    actionRoute?: string;
  } = {}) {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    if (inputs.icon !== undefined) fixture.componentRef.setInput('icon', inputs.icon);
    if (inputs.title !== undefined) fixture.componentRef.setInput('title', inputs.title);
    if (inputs.message !== undefined) fixture.componentRef.setInput('message', inputs.message);
    if (inputs.actionLabel !== undefined) fixture.componentRef.setInput('actionLabel', inputs.actionLabel);
    if (inputs.actionRoute !== undefined) fixture.componentRef.setInput('actionRoute', inputs.actionRoute);
    fixture.detectChanges();
    return fixture;
  }

  it('creates successfully', () => {
    expect(setup().componentInstance).toBeTruthy();
  });

  it('renders the icon', () => {
    const { nativeElement } = setup({ icon: 'auto_stories', title: 'No books', message: 'Add one' });
    expect(nativeElement.textContent).toContain('auto_stories');
  });

  it('renders the title', () => {
    const { nativeElement } = setup({ icon: 'search', title: 'Nothing found', message: 'Try again' });
    expect(nativeElement.querySelector('.empty-title').textContent.trim()).toBe('Nothing found');
  });

  it('renders the message', () => {
    const { nativeElement } = setup({ icon: 'search', title: 'Nothing found', message: 'Try a different query' });
    expect(nativeElement.querySelector('.empty-message').textContent.trim()).toBe('Try a different query');
  });

  it('hides action button when actionLabel is missing', () => {
    const { nativeElement } = setup({ icon: 'search', title: 'Title', message: 'Msg', actionRoute: '/search' });
    expect(nativeElement.querySelector('.empty-action')).toBeNull();
  });

  it('hides action button when actionRoute is missing', () => {
    const { nativeElement } = setup({ icon: 'search', title: 'Title', message: 'Msg', actionLabel: 'Go' });
    expect(nativeElement.querySelector('.empty-action')).toBeNull();
  });

  it('shows action button when both actionLabel and actionRoute are provided', () => {
    const { nativeElement } = setup({
      icon: 'search',
      title: 'Title',
      message: 'Msg',
      actionLabel: 'Search books',
      actionRoute: '/search',
    });
    const btn = nativeElement.querySelector('.empty-action') as HTMLElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent.trim()).toBe('Search books');
  });

  it('action link points to the provided route', () => {
    const { nativeElement } = setup({
      icon: 'search',
      title: 'Title',
      message: 'Msg',
      actionLabel: 'Go',
      actionRoute: '/search',
    });
    const link = nativeElement.querySelector('.empty-action') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/search');
  });
});
