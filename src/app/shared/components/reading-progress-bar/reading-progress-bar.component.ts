import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-reading-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-container">
      <div class="progress-track" [attr.role]="'progressbar'" [attr.aria-valuenow]="percentage()" [attr.aria-valuemin]="0" [attr.aria-valuemax]="100">
        <div class="progress-fill" [style.width.%]="percentage()"></div>
      </div>
      @if (showLabel()) {
        <div class="progress-label">
          @if (currentPage() != null && totalPages() != null) {
            <span>{{ currentPage() }} / {{ totalPages() }} pages</span>
          }
          <span class="progress-pct">{{ percentage() }}%</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .progress-track {
      height: 6px;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--color-progress);
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
      min-width: 4px;
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
    }
    .progress-pct {
      font-weight: var(--font-medium);
      color: var(--color-accent);
    }
  `],
})
export class ReadingProgressBarComponent {
  readonly percentage = input<number>(0);
  readonly currentPage = input<number | null>(null);
  readonly totalPages = input<number | null>(null);
  readonly showLabel = input<boolean>(true);
}
