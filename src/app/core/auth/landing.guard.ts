import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

/** Redirects already-authenticated (or guest) users away from the landing page to /library. */
export const landingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Guest mode is set synchronously — skip the Firebase wait entirely
  if (auth.isGuest()) return router.createUrlTree(['/library']);

  // Wait until Firebase resolves initial auth state
  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) return router.createUrlTree(['/library']);
      return true;
    }),
  );
};
