import { Directive } from '@angular/core';

@Directive({
  selector: '[appAccentButton]',
  host: {
    'class': 'app-accent-btn',
    'style': '--mat-button-filled-label-text-color: var(--color-accent-foreground); --mat-icon-color: var(--color-accent-foreground);',
  },
})
export class AccentButtonDirective {}
