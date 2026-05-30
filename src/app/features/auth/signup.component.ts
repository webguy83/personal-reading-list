import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirm')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="auth-brand">
          <mat-icon>auto_stories</mat-icon>
          <span>Bookshelf</span>
        </a>

        <h1 class="auth-title">Create your account</h1>
        <p class="auth-sub">Start building your personal reading list</p>

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
            <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" />
            <button type="button" mat-icon-button matSuffix (click)="showPw.set(!showPw())" [attr.aria-label]="showPw() ? 'Hide password' : 'Show password'">
              <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Confirm password</mat-label>
            <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password" />
            @if (form.errors?.['mismatch'] && form.controls.confirm.touched) {
              <mat-error>Passwords do not match</mat-error>
            }
          </mat-form-field>

          <button mat-flat-button type="submit" class="auth-submit" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="20" /> } @else { Create account }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './auth.css',
})
export class SignupComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPw = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.signUp(email, password).subscribe({
      next: () => this.router.navigateByUrl('/library'),
      error: (err) => {
        this.error.set(this.friendlyError(err.code));
        this.loading.set(false);
      },
    });
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with that email already exists.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
}
