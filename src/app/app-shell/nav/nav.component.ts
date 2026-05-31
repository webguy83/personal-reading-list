import { Component, inject, computed, model, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LibraryStore } from '../../core/stores/library.store';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatTooltip, MatListModule, MatDivider],
  template: `
    <div class="nav-wrapper" [class.nav--collapsed]="collapsed()">

      <!-- ─── Brand header ───────────────────────────────────────────── -->
      <div class="nav-header">
        @if (!collapsed()) {
          <a routerLink="/library" class="brand">
            <mat-icon class="brand-icon">auto_stories</mat-icon>
            <span class="brand-name">Bookshelf</span>
          </a>
        }
        <button mat-icon-button class="collapse-btn" (click)="collapsed.update(v => !v)"
          [matTooltip]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'" matTooltipPosition="right">
          <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <mat-divider />

      <!-- ─── Navigation ─────────────────────────────────────────────── -->
      @if (collapsed()) {
        <!-- Icon-only buttons when collapsed -->
        <nav class="collapsed-nav" aria-label="Main navigation">
          @for (item of navItems; track item.path) {
            <a mat-icon-button
              [routerLink]="item.path"
              routerLinkActive="nav-icon--active"
              [routerLinkActiveOptions]="{ exact: item.path === '/library' }"
              [matTooltip]="item.label" matTooltipPosition="right"
            >
              <mat-icon>{{ item.icon }}</mat-icon>
            </a>
          }
        </nav>
      } @else {
        <!-- Full nav list when expanded -->
        <mat-nav-list aria-label="Main navigation">
          @for (item of navItems; track item.path) {
            <a mat-list-item
              [routerLink]="item.path"
              routerLinkActive="nav-item--active"
              [routerLinkActiveOptions]="{ exact: item.path === '/library' }"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      }

      <div class="nav-spacer"></div>

      <mat-divider />

      <!-- ─── Footer ─────────────────────────────────────────────────── -->
      <div class="nav-footer">
        @if (isGuest()) {
          @if (!collapsed()) {
            <div class="guest-cta">
              <p class="guest-cta-text">Save your library by signing up</p>
              <a mat-flat-button routerLink="/auth/signup" class="guest-cta-btn">Sign Up Free</a>
            </div>
            <mat-divider />
          }
        }
        <div class="footer-actions" [class.footer-actions--collapsed]="collapsed()">
          <button mat-icon-button (click)="theme.toggle()" [attr.aria-label]="darkLabel()">
            <mat-icon>{{ darkIcon() }}</mat-icon>
          </button>
          @if (isAuth() || isGuest()) {
            <button mat-icon-button (click)="signOut()"
              aria-label="Sign out"
              matTooltip="Sign out" matTooltipPosition="right">
              <mat-icon>logout</mat-icon>
            </button>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .nav-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0.5rem 0.75rem 0.75rem;
      min-height: 60px;
    }
    .nav--collapsed .nav-header {
      justify-content: center;
      padding: 0.75rem 0.25rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
      min-width: 0;
    }
    .brand-icon { color: var(--color-accent); flex-shrink: 0; }
    .brand-name {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
    }
    .collapse-btn { opacity: 0.6; flex-shrink: 0; }
    .collapse-btn:hover { opacity: 1; }
    .nav--collapsed .collapse-btn { margin-left: 0; }

    /* Icon-only collapsed nav */
    .collapsed-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 0.5rem 0;
    }

    /* Active states */
    a.nav-icon--active mat-icon { color: var(--color-accent); }
    a.nav-item--active {
      background: var(--color-accent-subtle) !important;
      color: var(--color-accent) !important;
    }
    a.nav-item--active mat-icon { color: var(--color-accent); }

    .nav-spacer { flex: 1; }

    .nav-footer { display: flex; flex-direction: column; }
    .guest-cta { padding: 0.75rem; }
    .guest-cta-text {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }
    .guest-cta-btn {
      width: 100%;
      background: var(--color-accent) !important;
      color: #fff !important;
    }
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.5rem;
    }
    .footer-actions--collapsed {
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 0.25rem;
    }
  `],
})
export class NavComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly store = inject(LibraryStore);
  private readonly dialog = inject(MatDialog);

  protected readonly isGuest = this.auth.isGuest;
  protected readonly isAuth = this.auth.isAuthenticated;

  /** Two-way bindable collapse state — parent (app shell) controls sidenav width */
  readonly collapsed = model(false);

  protected readonly darkLabel = computed((): string => this.theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  protected readonly darkIcon = computed((): string => this.theme.isDark() ? 'light_mode' : 'dark_mode');

  protected readonly navItems = [
    { path: '/library', icon: 'auto_stories', label: 'Library' },
    { path: '/search', icon: 'search', label: 'Search' },
    { path: '/year-in-review', icon: 'bar_chart', label: 'Year in Review' },
  ];

  protected signOut(): void {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Sign out',
        message: 'Are you sure you want to sign out?',
        confirmLabel: 'Sign out',
        cancelLabel: 'Cancel',
      },
    }).afterClosed().pipe(
      filter(Boolean),
      switchMap(() => this.auth.signOut()),
    ).subscribe();
  }
}
