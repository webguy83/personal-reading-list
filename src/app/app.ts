import { Component, inject, ChangeDetectionStrategy, signal, effect, viewChild } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavComponent } from './app-shell/nav/nav.component';
import { ThemeService } from './core/services/theme.service';

const APP_PATHS = ['/library', '/search', '/year-in-review'];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatSidenavModule, MatToolbarModule, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Initialise ThemeService eagerly so the dark-mode class is applied immediately
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly bp = inject(BreakpointObserver);
  private readonly sidenavRef = viewChild<MatSidenav>('sidenav');

  protected readonly isMobile = toSignal(
    this.bp.observe('(max-width: 767px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  protected readonly navCollapsed = signal(false);

  /** True when the current route should show the app shell nav */
  protected readonly showShell = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => APP_PATHS.some(p => e.urlAfterRedirects.startsWith(p))),
      startWith(false),
    ),
    { initialValue: false },
  );

  protected readonly mobileNavItems = [
    { path: '/library', icon: 'auto_stories', label: 'Library' },
    { path: '/search', icon: 'search', label: 'Search' },
    { path: '/year-in-review', icon: 'bar_chart', label: 'Stats' },
  ];

  constructor() {
    // On desktop: always keep sidenav open
    effect(() => {
      const sidenav = this.sidenavRef();
      if (sidenav && !this.isMobile()) {
        sidenav.open();
      }
    });

    // On mobile: close sidenav after navigating to a new route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      if (this.isMobile()) {
        this.sidenavRef()?.close();
      }
    });
  }
}
