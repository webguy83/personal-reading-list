import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="auth-brand">
          <mat-icon>auto_stories</mat-icon>
          <span>Bookshelf</span>
        </a>

        @if (sent()) {
          <div class="sent-state">
            <mat-icon class="sent-icon">mark_email_read</mat-icon>
            <h1 class="auth-title">Check your inbox</h1>
            <p class="auth-sub">
              We sent a password reset link to <strong>{{ sentEmail() }}</strong>.
              Check your spam folder if you don't see it.
            </p>
            <a mat-flat-button routerLink="/auth/login" class="auth-submit">Back to sign in</a>
          </div>
        } @else {
          <h1 class="auth-title">Reset your password</h1>
          <p class="auth-sub">Enter your email and we'll send you a reset link.</p>

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

            <button mat-flat-button type="submit" class="auth-submit" [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="20" /> } @else { Send reset link }
            </button>
          </form>

          <p class="auth-footer">
            <a routerLink="/auth/login">← Back to sign in</a>
          </p>
        }
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class ResetPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal(false);
  protected readonly sentEmail = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    const { email } = this.form.getRawValue();
    this.auth.resetPassword(email).subscribe({
      next: () => {
        this.sentEmail.set(email);
        this.sent.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not send reset email. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
