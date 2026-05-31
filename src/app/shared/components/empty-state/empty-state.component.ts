import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AccentButtonDirective } from '../../directives/accent-button.directive';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, RouterLink, AccentButtonDirective],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-message">{{ message() }}</p>
      @if (actionLabel() && actionRoute()) {
        <a mat-flat-button appAccentButton [routerLink]="actionRoute()" class="empty-action">
          {{ actionLabel() }}
        </a>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-12) var(--space-8);
      gap: var(--space-4);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      background: var(--color-accent-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--color-accent);
    }
    .empty-title {
      font-family: var(--font-heading);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    .empty-message {
      font-family: var(--font-sans);
      font-size: var(--text-base);
      color: var(--color-text-secondary);
      margin: 0;
      max-width: 360px;
    }
    .empty-action {
      margin-top: var(--space-2);
    }
  `],
})
export class EmptyStateComponent {
  icon = input<string>('menu_book');
  title = input<string>('Nothing here yet');
  message = input<string>('');
  actionLabel = input<string | null>(null);
  actionRoute = input<string | null>(null);
}
