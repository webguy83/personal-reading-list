import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AuthService } from '../../core/auth/auth.service';
import { Auth } from '@angular/fire/auth';

describe('LandingComponent', () => {
  const mockAuth = { enterGuestMode: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Auth, useValue: {} },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();
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
});
