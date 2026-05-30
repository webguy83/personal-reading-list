import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Guest mode is set synchronously — skip the Firebase wait entirely
  if (auth.isGuest()) return true;

  // Wait until Firebase resolves initial auth state (past the 'loading' phase)
  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated() || auth.isGuest()) return true;
      return router.createUrlTree(['/']);
    }),
  );
};
