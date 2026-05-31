import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="book-cover-wrap" [style.aspect-ratio]="'2/3'" [style.width.px]="size()">
      @if (loaded() && !errored()) {
        <img
          [src]="coverUrl()"
          [alt]="title()"
          class="book-cover-img"
          (load)="onLoad()"
          (error)="onError()"
        />
      } @else if (errored() || !coverUrl()) {
        <div class="book-cover-placeholder" [style.width.px]="size()" [style.height.px]="size() * 1.5">
          <div class="placeholder-spine"></div>
          <div class="placeholder-title" aria-hidden="true" [attr.data-title]="shortTitle()"></div>
          <div class="placeholder-author" aria-hidden="true" [attr.data-author]="shortAuthor()"></div>
        </div>
      } @else {
        <div class="book-cover-skeleton" [style.width.px]="size()" [style.height.px]="size() * 1.5">
          <img
            [src]="coverUrl()"
            [alt]="title()"
            class="book-cover-img hidden-img"
            (load)="onLoad()"
            (error)="onError()"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .book-cover-wrap {
      position: relative;
      display: inline-block;
      border-radius: var(--radius-sm);
      overflow: hidden;
      box-shadow: var(--shadow-book);
      flex-shrink: 0;
    }
    .book-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .hidden-img {
      position: absolute;
      opacity: 0;
    }
    .book-cover-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
      background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
      border-left: 4px solid var(--color-accent);
      text-align: center;
      gap: 0.25rem;
      box-sizing: border-box;
    }
    .placeholder-spine {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-accent);
    }
    .placeholder-title {
      font-family: var(--font-heading);
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      color: var(--color-text-primary);
      line-height: 1.3;
      word-break: break-word;
      hyphens: auto;
    }
    .placeholder-title::after {
      content: attr(data-title);
    }
    .placeholder-author {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
    }
    .placeholder-author::after {
      content: attr(data-author);
    }
    .book-cover-skeleton {
      background: linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-bg-tertiary) 50%, var(--color-bg-secondary) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class BookCoverComponent {
  coverUrl = input<string | null>(null);
  title = input<string>('');
  author = input<string>('');
  /** Width in px; height is auto at 3:2 ratio */
  size = input<number>(80);

  protected readonly loaded = signal(false);
  protected readonly errored = signal(false);

  protected shortTitle() {
    return this.title().length > 40 ? this.title().slice(0, 37) + '…' : this.title();
  }
  protected shortAuthor() {
    return this.author().length > 25 ? this.author().slice(0, 22) + '…' : this.author();
  }

  onLoad(): void { this.loaded.set(true); }
  onError(): void { this.errored.set(true); }
}
