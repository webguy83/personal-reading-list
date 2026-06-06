import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { landingGuard } from './core/auth/landing.guard';
import { authAccessGuard } from './core/auth/auth-access.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [landingGuard],
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'auth',
    canActivate: [authAccessGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
    ],
  },
  {
    path: 'library',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent) },
      { path: 'shelf/:shelfId', loadComponent: () => import('./features/shelf/shelf.component').then(m => m.ShelfComponent) },
      { path: 'book/:bookId', loadComponent: () => import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent) },
    ],
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'year-in-review',
    canActivate: [authGuard],
    loadComponent: () => import('./features/year-in-review/year-in-review.component').then(m => m.YearInReviewComponent),
  },
  { path: '**', redirectTo: '' },
];

