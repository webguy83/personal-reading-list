import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-host" [class.spinner-host--fullpage]="fullPage()">
      <mat-spinner [diameter]="diameter()" />
      @if (message()) {
        <p class="spinner-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 4rem 2rem;
    }
    .spinner-host--fullpage {
      position: fixed;
      inset: 0;
      z-index: 10;
    }
    .spinner-message {
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
      margin: 0;
    }
    mat-spinner {
      --mdc-circular-progress-active-indicator-color: var(--color-accent);
    }
  `],
})
export class LoadingSpinnerComponent {
  readonly fullPage = input(true);
  readonly diameter = input(48);
  readonly message = input('');
}
