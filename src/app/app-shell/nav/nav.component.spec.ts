import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NavComponent } from './nav.component';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LibraryStore } from '../../core/stores/library.store';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

describe('NavComponent', () => {
  const isGuest = signal(false);
  const isAuthenticated = signal(false);
  const isDark = signal(false);

  let dialogAfterClosed$: Subject<boolean | undefined>;

  const mockAuth = {
    isGuest,
    isAuthenticated,
    signOut: vi.fn().mockReturnValue(of(undefined)),
  };

  const mockTheme = {
    isDark,
    toggle: vi.fn(),
  };

  const mockDialog = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    dialogAfterClosed$ = new Subject<boolean | undefined>();
    mockDialog.open.mockReturnValue({
      afterClosed: () => dialogAfterClosed$.asObservable(),
    } as unknown as MatDialogRef<unknown>);

    await TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: Auth, useValue: {} },
        { provide: ThemeService, useValue: mockTheme },
        { provide: LibraryStore, useValue: {} },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
    isGuest.set(false);
    isAuthenticated.set(false);
    isDark.set(false);
    vi.clearAllMocks();
    mockDialog.open.mockReturnValue({
      afterClosed: () => dialogAfterClosed$.asObservable(),
    } as unknown as MatDialogRef<unknown>);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows brand name "Bookshelf" when expanded', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.brand-name').textContent.trim()).toBe('Bookshelf');
  });

  it('renders all three nav items when expanded', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Library');
    expect(text).toContain('Search');
    expect(text).toContain('Year in Review');
  });

  it('shows theme toggle button', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[aria-label="Switch to dark mode"]');
    expect(btn).toBeTruthy();
  });

  it('toggle button aria-label reflects current theme (dark)', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    isDark.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Switch to light mode"]')).toBeTruthy();
  });

  it('does not show guest CTA when user is not a guest', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.guest-cta')).toBeNull();
  });

  it('shows guest CTA when isGuest is true', () => {
    isGuest.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.guest-cta')).toBeTruthy();
  });

  it('does not show logout button when not authenticated and not guest', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button mat-icon');
    const icons = [...buttons].map((el: Element) => el.textContent?.trim());
    expect(icons).not.toContain('logout');
  });

  it('shows logout button when authenticated', () => {
    isAuthenticated.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('logout');
  });

  it('collapse toggle updates collapsed state', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed()).toBe(false);
    const collapseBtn = fixture.nativeElement.querySelector('.collapse-btn') as HTMLButtonElement;
    collapseBtn.click();
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });

  it('hides brand name when collapsed', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.brand-name')).toBeNull();
  });

  it('hides brand link entirely when collapsed', () => {
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.brand')).toBeNull();
  });

  it('shows logout button when isGuest is true', () => {
    isGuest.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('logout');
  });

  it('clicking logout button opens confirm dialog', () => {
    isAuthenticated.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const logoutBtn = fixture.nativeElement.querySelector('[aria-label="Sign out"]') as HTMLButtonElement;
    logoutBtn.click();
    expect(mockDialog.open).toHaveBeenCalledTimes(1);
  });

  it('confirming sign-out dialog calls auth.signOut()', () => {
    isAuthenticated.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const logoutBtn = fixture.nativeElement.querySelector('[aria-label="Sign out"]') as HTMLButtonElement;
    logoutBtn.click();
    dialogAfterClosed$.next(true);
    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
  });

  it('cancelling sign-out dialog does not call auth.signOut()', () => {
    isAuthenticated.set(true);
    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const logoutBtn = fixture.nativeElement.querySelector('[aria-label="Sign out"]') as HTMLButtonElement;
    logoutBtn.click();
    dialogAfterClosed$.next(false);
    expect(mockAuth.signOut).not.toHaveBeenCalled();
  });
});
