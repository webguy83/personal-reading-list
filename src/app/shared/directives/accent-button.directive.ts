import { Directive } from '@angular/core';

/**
 * Accent button directive – apply to any `mat-flat-button` or `mat-button`
 * element to give it the app accent colour with white text.
 *
 * Usage:
 *   <button mat-flat-button appAccentButton type="submit">Save</button>
 *   <a mat-flat-button appAccentButton routerLink="/search">Add book</a>
 */
@Directive({
  selector: '[appAccentButton]',
  standalone: true,
  host: {
    'class': 'app-accent-btn',
    // Set CSS custom-property tokens directly as inline styles so they win
    // against Angular Material's stylesheet regardless of import order.
    'style': '--mat-button-filled-label-text-color: #ffffff; --mat-icon-color: #ffffff;',
  },
})
export class AccentButtonDirective {}
