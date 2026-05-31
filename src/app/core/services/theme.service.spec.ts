import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ThemeService } from './theme.service';

function setup(savedTheme?: string): ThemeService {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  if (savedTheme) {
    localStorage.setItem('bookshelf-theme', savedTheme);
  }
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ThemeService],
  });
  const service = TestBed.inject(ThemeService);
  TestBed.flushEffects();
  return service;
}

describe('ThemeService', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.resetTestingModule();
  });

  // ─── Initial state ──────────────────────────────────────────────────────────

  it('defaults to "system" when no saved theme', () => {
    const svc = setup();
    expect(svc.theme()).toBe('system');
  });

  it('restores saved "dark" theme from localStorage', () => {
    const svc = setup('dark');
    expect(svc.theme()).toBe('dark');
  });

  it('restores saved "light" theme from localStorage', () => {
    const svc = setup('light');
    expect(svc.theme()).toBe('light');
  });

  // ─── setTheme ───────────────────────────────────────────────────────────────

  it('setTheme("dark") updates theme signal', () => {
    const svc = setup();
    svc.setTheme('dark');
    expect(svc.theme()).toBe('dark');
  });

  it('setTheme("light") updates theme signal', () => {
    const svc = setup('dark');
    svc.setTheme('light');
    expect(svc.theme()).toBe('light');
  });

  it('setTheme("system") updates theme signal', () => {
    const svc = setup('dark');
    svc.setTheme('system');
    expect(svc.theme()).toBe('system');
  });

  // ─── isDark ─────────────────────────────────────────────────────────────────

  it('isDark() returns true for "dark" theme', () => {
    const svc = setup();
    svc.setTheme('dark');
    expect(svc.isDark()).toBe(true);
  });

  it('isDark() returns false for "light" theme', () => {
    const svc = setup();
    svc.setTheme('light');
    expect(svc.isDark()).toBe(false);
  });

  // ─── DOM effect ─────────────────────────────────────────────────────────────

  it('adds .dark class to <html> when set to dark', () => {
    const svc = setup();
    svc.setTheme('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes .dark class from <html> when switching to light', () => {
    const svc = setup('dark'); // init effect already applies .dark
    svc.setTheme('light');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies .dark on init when saved theme is dark', () => {
    setup('dark'); // flushEffects called inside setup
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not add .dark on init when saved theme is light', () => {
    setup('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  // ─── localStorage persistence ───────────────────────────────────────────────

  it('persists "dark" to localStorage via effect', () => {
    const svc = setup();
    svc.setTheme('dark');
    TestBed.flushEffects();
    expect(localStorage.getItem('bookshelf-theme')).toBe('dark');
  });

  it('persists "light" to localStorage via effect', () => {
    const svc = setup('dark');
    svc.setTheme('light');
    TestBed.flushEffects();
    expect(localStorage.getItem('bookshelf-theme')).toBe('light');
  });

  // ─── toggle ─────────────────────────────────────────────────────────────────

  it('toggle() switches from light to dark', () => {
    const svc = setup('light');
    svc.toggle();
    expect(svc.theme()).toBe('dark');
  });

  it('toggle() switches from dark to light', () => {
    const svc = setup('dark');
    svc.toggle();
    expect(svc.theme()).toBe('light');
  });

  it('toggle() switches from system to light', () => {
    // toggle() does: t === 'light' ? 'dark' : 'light', so 'system' → 'light'
    const svc = setup();
    svc.toggle();
    expect(svc.theme()).toBe('light');
  });

  it('toggle() applies .dark class after switching to dark', () => {
    const svc = setup('light');
    svc.toggle();
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggle() removes .dark class after switching to light', () => {
    const svc = setup('dark');
    svc.toggle();
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
