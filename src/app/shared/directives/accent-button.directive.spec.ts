import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { AccentButtonDirective } from './accent-button.directive';

@Component({
  template: `
    <button mat-flat-button appAccentButton>Save</button>
    <a mat-flat-button appAccentButton href="#">Link</a>
  `,
  imports: [MatButtonModule, AccentButtonDirective],
})
class TestHost {}

describe('AccentButtonDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHost] });
  });

  it('should add the app-accent-btn class to the host element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList).toContain('app-accent-btn');
  });

  it('should also add the class to an anchor host element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a');
    expect(a.classList).toContain('app-accent-btn');
  });

  it('should set --mat-button-filled-label-text-color to accent-foreground token inline', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.style.getPropertyValue('--mat-button-filled-label-text-color')).toBe('var(--color-accent-foreground)');
  });

  it('should set --mat-icon-color to accent-foreground token inline', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.style.getPropertyValue('--mat-icon-color')).toBe('var(--color-accent-foreground)');
  });
});
