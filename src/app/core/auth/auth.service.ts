import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // undefined = still loading, null = signed out, User = signed in
  private readonly _user = signal<User | null | undefined>(undefined);
  private readonly _isGuest = signal(false);

  readonly user = this._user.asReadonly();
  readonly isGuest = this._isGuest.asReadonly();
  readonly isAuthenticated = computed(() => this._user() != null);
  readonly isLoading = computed(() => this._user() === undefined);
  readonly currentUid = computed(() => this._user()?.uid ?? null);

  constructor() {
    onAuthStateChanged(this.auth, user => this._user.set(user));
  }

  signIn(email: string, password: string): Observable<void> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password).then(() => {
        this._isGuest.set(false);
        this.router.navigate(['/library']);
      }),
    );
  }

  signUp(email: string, password: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(() => {
        this._isGuest.set(false);
        this.router.navigate(['/library']);
      }),
    );
  }

  signOut(): Observable<void> {
    return from(
      signOut(this.auth).then(() => {
        this._isGuest.set(false);
        this.router.navigate(['/']);
      }),
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  enterGuestMode(): void {
    this._isGuest.set(true);
    this.router.navigate(['/library']);
  }
}
