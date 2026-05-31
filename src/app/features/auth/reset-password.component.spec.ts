import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/auth/auth.service';

describe('ResetPasswordComponent', () => {
  const mockAuth = { resetPassword: vi.fn().mockReturnValue(of(undefined)) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: Auth, useValue: {} },
      ],
    }).compileComponents();
    vi.clearAllMocks();
    mockAuth.resetPassword.mockReturnValue(of(undefined));
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('form has an email control', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.contains('email')).toBe(true);
  });

  it('form is invalid when empty', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('email control is invalid for a non-email value', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.email.setValue('not-an-email');
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('email control is valid for a proper email', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.email.setValue('user@example.com');
    expect(fixture.componentInstance.form.valid).toBe(true);
  });

  it('submit() marks form touched when invalid', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.submit();
    expect(comp.form.touched).toBe(true);
  });

  it('submit() does not call auth.resetPassword when form is invalid', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(mockAuth.resetPassword).not.toHaveBeenCalled();
  });

  it('submit() calls auth.resetPassword with the email', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.controls.email.setValue('user@example.com');
    comp.submit();
    expect(mockAuth.resetPassword).toHaveBeenCalledWith('user@example.com');
  });

  it('submit() sets sent=true and sentEmail on success', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.controls.email.setValue('user@example.com');
    comp.submit();
    expect(comp.sent()).toBe(true);
    expect(comp.sentEmail()).toBe('user@example.com');
  });

  it('shows success state with sentEmail after submit', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.controls.email.setValue('user@example.com');
    comp.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sent-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('user@example.com');
  });

  it('shows reset form initially (not sent state)', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sent-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('sets error message on failure', () => {
    mockAuth.resetPassword.mockReturnValue(throwError(() => new Error('network error')));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.controls.email.setValue('user@example.com');
    comp.submit();
    expect(comp.error()).toBeTruthy();
  });

  it('shows "Reset your password" heading initially', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.auth-title').textContent.trim()).toBe('Reset your password');
  });
});
