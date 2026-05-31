import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { LibraryStore } from '../../core/stores/library.store';
import { BookCoverComponent } from '../../shared/components/book-cover/book-cover.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { ReadingProgressBarComponent } from '../../shared/components/reading-progress-bar/reading-progress-bar.component';

@Component({
  selector: 'app-book-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatInputModule, MatFormFieldModule, FormsModule, BookCoverComponent, StarRatingComponent, ReadingProgressBarComponent],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetailComponent {
  readonly store = inject(LibraryStore);
  private readonly route = inject(ActivatedRoute);

  private readonly bookId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('bookId') ?? '')),
    { initialValue: '' },
  );

  readonly book = computed(() =>
    this.store.books().find(b => b.id === this.bookId()),
  );

  readonly progress = computed(() =>
    this.store.progress()[this.bookId()] ?? null,
  );

  readonly shelfName = computed(() => {
    const book = this.book();
    if (!book?.shelfId) return null;
    return this.store.shelvesWithCounts().find(s => s.id === book.shelfId)?.name ?? null;
  });

  readonly editingProgress = signal(false);
  readonly editingNotes = signal(false);
  currentPageInput = signal<number>(0);
  notesInput = signal('');

  startEditProgress(): void {
    this.currentPageInput.set(this.progress()?.currentPage ?? 0);
    this.editingProgress.set(true);
  }

  saveProgress(): void {
    const book = this.book();
    if (!book) return;
    this.store.updateProgress(book.id, this.currentPageInput());
    this.editingProgress.set(false);
  }

  startEditNotes(): void {
    this.notesInput.set(this.book()?.notes ?? '');
    this.editingNotes.set(true);
  }

  saveNotes(): void {
    const book = this.book();
    if (!book) return;
    this.store.updateNotes(book.id, this.notesInput());
    this.editingNotes.set(false);
  }

  rate(rating: number): void {
    const book = this.book();
    if (book) this.store.updateRating(book.id, rating as 1 | 2 | 3 | 4 | 5);
  }

  moveToShelf(shelfId: string): void {
    const book = this.book();
    if (book) this.store.moveBook(book.id, shelfId);
  }

  deleteBook(): void {
    const book = this.book();
    if (!book) return;
    if (confirm(`Remove "${book.title}" from your library?`)) {
      this.store.deleteBook(book.id);
    }
  }
}
