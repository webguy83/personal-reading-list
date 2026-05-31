import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TitleCasePipe, KeyValuePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LibraryStore } from '../../core/stores/library.store';
import { AccentButtonDirective } from '../../shared/directives/accent-button.directive';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-year-in-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe, KeyValuePipe, DecimalPipe, MatIconModule, MatButtonModule, MatCardModule, AccentButtonDirective, LoadingSpinnerComponent],
  templateUrl: './year-in-review.html',
  styleUrl: './year-in-review.css',
})
export class YearInReviewComponent {
  readonly store = inject(LibraryStore);
  readonly currentYear = new Date().getFullYear();
  readonly editingGoal = signal(false);
  goalInput = signal(24);

  saveGoal(): void {
    this.store.setGoal(this.goalInput());
    this.editingGoal.set(false);
  }

  maxMonthlyCount(booksByMonth: Record<string, number>): number {
    const vals = Object.values(booksByMonth);
    return vals.length ? Math.max(...vals, 1) : 1;
  }

  monthAbbr(monthKey: string): string {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const n = parseInt(monthKey, 10);
    return isNaN(n) ? monthKey.slice(0, 3) : (months[n - 1] ?? monthKey);
  }
}
