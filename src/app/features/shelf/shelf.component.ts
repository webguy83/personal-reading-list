import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { LibraryStore } from '../../core/stores/library.store';
import { BookCoverComponent } from '../../shared/components/book-cover/book-cover.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SortOptions } from '../../shared/models';

@Component({
  selector: 'app-shelf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatSelectModule, BookCoverComponent, StarRatingComponent, EmptyStateComponent],
  templateUrl: './shelf.html',
  styleUrl: './shelf.css',
})
export class ShelfComponent {
  protected readonly store = inject(LibraryStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly shelfId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('shelfId') ?? '')),
    { initialValue: '' },
  );

  protected readonly shelf = computed(() =>
    this.store.shelvesWithCounts().find(s => s.id === this.shelfId()),
  );

  protected readonly books = computed(() =>
    this.store.booksOnShelf(this.shelfId())(),
  );

  protected readonly sortOptions: { value: SortOptions['field']; label: string }[] = [
    { value: 'dateAdded', label: 'Date added' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'rating', label: 'Rating' },
  ];

  protected updateSort(field: SortOptions['field']): void {
    this.store.setSortOptions({ field, direction: 'desc' });
  }
}
