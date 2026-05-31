import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="star-rating" [attr.aria-label]="'Rating: ' + (rating() ?? 0) + ' of 5 stars'">
      @for (star of stars; track star) {
        <button
          class="star-btn"
          type="button"
          [class.filled]="star <= activeRating()"
          [class.readonly]="readonly()"
          [attr.aria-label]="'Rate ' + star + ' star' + (star !== 1 ? 's' : '')"
          (mouseenter)="onHover(star)"
          (mouseleave)="onHover(null)"
          (click)="onRate(star)"
          [disabled]="readonly()"
        >
          <mat-icon>{{ star <= activeRating() ? 'star' : 'star_border' }}</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: var(--color-rating);
      display: flex;
      align-items: center;
      transition: transform 0.1s ease;
    }
    .star-btn:not(.readonly):hover {
      transform: scale(1.15);
    }
    .star-btn.readonly {
      cursor: default;
      pointer-events: none;
    }
    .star-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .star-btn:not(.filled) mat-icon {
      color: var(--color-border);
    }
  `],
})
export class StarRatingComponent {
  readonly rating = input<number | null>(null);
  readonly readonly = input<boolean>(false);
  readonly rateChange = output<number>();

  protected readonly stars = [1, 2, 3, 4, 5];
  private readonly hovered = signal<number | null>(null);
  protected readonly activeRating = computed(() => this.hovered() ?? this.rating() ?? 0);

  protected onHover(star: number | null): void {
    if (!this.readonly()) this.hovered.set(star);
  }

  protected onRate(star: number): void {
    if (!this.readonly()) this.rateChange.emit(star);
  }
}
