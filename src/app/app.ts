import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, switchMap } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavComponent } from './app-shell/nav/nav.component';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/auth/auth.service';
import { ConfirmDialogComponent, type ConfirmDialogData } from './shared/components/confirm-dialog/confirm-dialog.component';

const APP_PATHS = ['/library', '/search', '/year-in-review'];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatSidenavModule, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Initialise ThemeService eagerly so the dark-mode class is applied immediately
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly bp = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  protected readonly auth = inject(AuthService);

  protected readonly isAuth = this.auth.isAuthenticated;
  protected readonly isGuest = this.auth.isGuest;
  protected readonly darkIcon = computed(() => this.theme.isDark() ? 'light_mode' : 'dark_mode');
  protected readonly darkLabel = computed(() => this.theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode');

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

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected signOut(): void {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: { title: 'Sign out', message: 'Are you sure you want to sign out?', confirmLabel: 'Sign out', cancelLabel: 'Cancel' },
    }).afterClosed().pipe(
      filter(Boolean),
      switchMap(() => this.auth.signOut()),
    ).subscribe();
  }
}

