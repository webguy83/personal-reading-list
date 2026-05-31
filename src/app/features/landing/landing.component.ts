import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);

  enterGuest(): void {
    this.auth.enterGuestMode();
  }

  readonly features = [
    {
      icon: 'library_books',
      title: 'Your shelves, your way',
      description: 'Organise books into Want to Read, Currently Reading, Read — plus any custom shelves you create.',
    },
    {
      icon: 'track_changes',
      title: 'Track every page',
      description: 'Log reading progress by page number. See how close you are to finishing and celebrate milestones.',
    },
    {
      icon: 'emoji_events',
      title: 'Annual reading goals',
      description: 'Set a yearly target and watch your progress. See if you\'re ahead, on pace, or need a push.',
    },
    {
      icon: 'bar_chart',
      title: 'Year in review',
      description: 'Beautiful stats about your reading year — genres, pace, ratings, and your reading story.',
    },
  ];

  readonly showcaseCovers = [
    'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
    'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg',
    'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
    'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg',
    'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
    'https://covers.openlibrary.org/b/isbn/9780140449136-M.jpg',
  ];
}
