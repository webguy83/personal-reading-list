import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/auth.service';
import { Auth } from '@angular/fire/auth';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('LoginComponent', () => {
  const mockAuth = {
    signIn: vi.fn().mockReturnValue(of(undefined)),
    enterGuestMode: vi.fn(),
  };

  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
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
    mockAuth.signIn.mockReturnValue(of(undefined));
  });

  afterEach(() => TestBed.resetTestingModule());

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('form has email and password controls', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    expect(form.contains('email')).toBe(true);
    expect(form.contains('password')).toBe(true);
  });

  it('form is invalid when empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('email control is invalid without a valid email', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.form.controls.email;
    ctrl.setValue('not-an-email');
    expect(ctrl.invalid).toBe(true);
  });

  it('email control is valid with a valid email', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.form.controls.email;
    ctrl.setValue('user@example.com');
    expect(ctrl.valid).toBe(true);
  });

  it('submit() marks form touched when invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.submit();
    expect(comp.form.touched).toBe(true);
  });

  it('submit() does not call auth.signIn when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(mockAuth.signIn).not.toHaveBeenCalled();
  });

  it('submit() calls auth.signIn with correct credentials', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.setValue({ email: 'user@example.com', password: 'secret123' });
    comp.submit();
    expect(mockAuth.signIn).toHaveBeenCalledWith('user@example.com', 'secret123');
  });

  it('submit() navigates to /library on success', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.setValue({ email: 'user@example.com', password: 'secret123' });
    comp.submit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/library');
  });

  it('submit() sets error message on auth failure', () => {
    mockAuth.signIn.mockReturnValue(throwError(() => ({ code: 'auth/invalid-credential' })));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.form.setValue({ email: 'user@example.com', password: 'wrong' });
    comp.submit();
    expect(comp.error()).toBe('Invalid email or password.');
  });

  it('enterGuest() calls auth.enterGuestMode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fixture.componentInstance.enterGuest();
    expect(mockAuth.enterGuestMode).toHaveBeenCalledTimes(1);
  });

  it('showPw toggle changes input type', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const [, pwInput] = await loader.getAllHarnesses(MatInputHarness);
    expect(await pwInput.getType()).toBe('password');
    fixture.componentInstance.showPw.set(true);
    fixture.detectChanges();
    expect(await pwInput.getType()).toBe('text');
  });

  it('shows "Welcome back" heading', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.auth-title').textContent.trim()).toBe('Welcome back');
  });

  it('renders "Explore as guest" button', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness(MatButtonHarness.with({ text: /Explore as guest/i }));
    expect(button).toBeTruthy();
  });
});
