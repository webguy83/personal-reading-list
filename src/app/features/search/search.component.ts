import { Component, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { BookApiService } from '../../core/services/book-api.service';
import { LibraryStore } from '../../core/stores/library.store';
import { BookCoverComponent } from '../../shared/components/book-cover/book-cover.component';
import { SearchResult } from '../../shared/models';
import { AccentButtonDirective } from '../../shared/directives/accent-button.directive';
import { debounceTime, distinctUntilChanged, Subject, switchMap, catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatMenuModule, RouterLink, BookCoverComponent, AccentButtonDirective],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent {
  private readonly api = inject(BookApiService);
  readonly store = inject(LibraryStore);

  readonly query = signal('');
  readonly searching = signal(false);
  readonly results = signal<SearchResult[]>([]);

  private readonly search$ = new Subject<string>();

  private readonly searchResult = toSignal(
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) { this.searching.set(false); return of([] as SearchResult[]); }
        this.searching.set(true);
        return this.api.search(q).pipe(catchError(() => of([] as SearchResult[])));
      }),
    ),
    { initialValue: [] as SearchResult[] },
  );

  constructor() {
    effect(() => {
      const r = this.searchResult();
      this.results.set(r);
      this.searching.set(false);
    });
  }

  onQueryChange(q: string): void {
    this.query.set(q);
    if (q.trim()) this.searching.set(true);
    this.search$.next(q);
  }

  clear(): void {
    this.query.set('');
    this.results.set([]);
    this.searching.set(false);
  }

  addToShelf(result: SearchResult, shelfId: string): void {
    this.store.addBook(result, shelfId);
  }

  isInLibrary(apiId: string): boolean {
    return this.store.isBookInLibrary(apiId);
  }
}
