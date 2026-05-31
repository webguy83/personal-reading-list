import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LibraryStore } from '../../core/stores/library.store';
import { BookCoverComponent } from '../../shared/components/book-cover/book-cover.component';
import { ReadingProgressBarComponent } from '../../shared/components/reading-progress-bar/reading-progress-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { AccentButtonDirective } from '../../shared/directives/accent-button.directive';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule, BookCoverComponent, ReadingProgressBarComponent, EmptyStateComponent, AccentButtonDirective, LoadingSpinnerComponent],
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class LibraryComponent {
  protected readonly store = inject(LibraryStore);
  protected readonly currentYear = new Date().getFullYear();
}
