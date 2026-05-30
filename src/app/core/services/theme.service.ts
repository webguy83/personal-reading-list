import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadSaved());

  readonly theme = this._theme.asReadonly();

  readonly isDark = computed(() => {
    const t = this._theme();
    if (t === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return t === 'dark';
  });

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('bookshelf-theme', this._theme());
    });
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private loadSaved(): Theme {
    return (localStorage.getItem('bookshelf-theme') as Theme) ?? 'system';
  }
}
