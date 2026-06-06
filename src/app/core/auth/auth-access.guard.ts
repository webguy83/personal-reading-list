import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Guard for auth routes (login, signup, reset-password).
 * Redirects authenticated users to /library.
 * Allows unauthenticated and guest users through (they can sign up or log in).
 */
export const authAccessGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to finish loading
  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      // Only redirect if user is authenticated (not guest, not unauthenticated)
      if (auth.isAuthenticated()) {
        return router.createUrlTree(['/library']);
      }
      return true;
    }),
  );
};
