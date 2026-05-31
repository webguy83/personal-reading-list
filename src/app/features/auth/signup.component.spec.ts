import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignupComponent } from './signup.component';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/auth/auth.service';

describe('SignupComponent', () => {
  const mockAuth = { signUp: vi.fn().mockReturnValue(of(undefined)) };

  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: Auth, useValue: {} },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    vi.clearAllMocks();
    mockAuth.signUp.mockReturnValue(of(undefined));
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('form has email, password, and confirm controls', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    expect(form.contains('email')).toBe(true);
    expect(form.contains('password')).toBe(true);
    expect(form.contains('confirm')).toBe(true);
  });

  it('form is invalid when empty', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('password control is invalid with fewer than 6 characters', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.form.controls.password;
    ctrl.setValue('abc');
    expect(ctrl.invalid).toBe(true);
  });

  it('password control is valid with 6+ characters', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.form.controls.password;
    ctrl.setValue('secret');
    expect(ctrl.valid).toBe(true);
  });

  it('form has mismatch error when passwords do not match', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.setValue({ email: 'a@b.com', password: 'secret123', confirm: 'different' });
    expect(form.errors?.['mismatch']).toBe(true);
  });

  it('submit() marks form touched when invalid', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.submit();
    expect(comp.form.touched).toBe(true);
  });

  it('submit() does not call auth.signUp when form is invalid', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(mockAuth.signUp).not.toHaveBeenCalled();
  });

  it('submit() calls auth.signUp with email and password', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.setValue({ email: 'user@example.com', password: 'mypassword', confirm: 'mypassword' });
    fixture.componentInstance.submit();
    expect(mockAuth.signUp).toHaveBeenCalledWith('user@example.com', 'mypassword');
  });

  it('submit() navigates to /library on success', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.setValue({ email: 'user@example.com', password: 'mypassword', confirm: 'mypassword' });
    fixture.componentInstance.submit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/library');
  });

  it('submit() sets error on failure', () => {
    mockAuth.signUp.mockReturnValue(throwError(() => ({ code: 'auth/email-already-in-use' })));
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.setValue({ email: 'user@example.com', password: 'mypassword', confirm: 'mypassword' });
    fixture.componentInstance.submit();
    const error = fixture.componentInstance.error();
    expect(error).toBe('An account with that email already exists.');
  });

  it('shows "Create account" heading', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.auth-title').textContent.trim()).toBe('Create your account');
  });
});
