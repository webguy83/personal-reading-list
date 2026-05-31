import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { AccentButtonDirective } from '../../shared/directives/accent-button.directive';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule, AccentButtonDirective],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="auth-brand">
          <mat-icon>auto_stories</mat-icon>
          <span>Bookshelf</span>
        </a>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-sub">Sign in to your reading list</p>

        @if (error()) {
          <div class="auth-error" role="alert">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <mat-error>Enter a valid email address</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
            <button type="button" mat-icon-button matSuffix (click)="showPw.set(!showPw())" [attr.aria-label]="showPw() ? 'Hide password' : 'Show password'">
              <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <a routerLink="/auth/reset-password" class="forgot-link">Forgot password?</a>

          <button mat-flat-button appAccentButton type="submit" class="auth-submit" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="20" /> } @else { Sign in }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/auth/signup">Sign up free</a>
        </p>

        <div class="auth-divider"><span>or</span></div>
        <button mat-stroked-button class="guest-btn" (click)="enterGuest()">
          <mat-icon>visibility</mat-icon>
          Explore as guest
        </button>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPw = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.signIn(email, password).subscribe({
      next: () => this.router.navigateByUrl('/library'),
      error: (err) => {
        this.error.set(this.friendlyError(err.code));
        this.loading.set(false);
      },
    });
  }

  enterGuest(): void {
    this.auth.enterGuestMode();
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'No account found with that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
}
