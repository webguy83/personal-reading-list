import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Auth } from '@angular/fire/auth';

describe('LandingComponent', () => {
  const mockAuth = { enterGuestMode: vi.fn() };
  const isDark = signal(false);
  const mockTheme = { isDark, toggle: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Auth, useValue: {} },
        { provide: AuthService, useValue: mockAuth },
        { provide: ThemeService, useValue: mockTheme },
      ],
    }).compileComponents();
    isDark.set(false);
    vi.clearAllMocks();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders all 4 feature items', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.features.length).toBe(4);
  });

  it('renders 6 showcase cover URLs', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.showcaseCovers.length).toBe(6);
  });

  it('enterGuest() calls auth.enterGuestMode()', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    fixture.componentInstance.enterGuest();
    expect(mockAuth.enterGuestMode).toHaveBeenCalledTimes(1);
  });

  it('renders "Sign in" link', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const links = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    const signInLink = links.find(a => /sign in/i.test(a.textContent ?? ''));
    expect(signInLink).toBeTruthy();
  });

  it('renders a theme toggle button', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[aria-label="Switch to dark mode"]');
    expect(btn).toBeTruthy();
  });

  it('theme toggle button calls theme.toggle()', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[aria-label="Switch to dark mode"]') as HTMLButtonElement;
    btn.click();
    expect(mockTheme.toggle).toHaveBeenCalledTimes(1);
  });
});
