import { ComponentHarness } from '@angular/cdk/testing';

/** Harness for interacting with `ConfirmDialogComponent` in tests. */
export class ConfirmDialogHarness extends ComponentHarness {
  static readonly hostSelector = 'app-confirm-dialog';

  private readonly titleEl = this.locatorFor('[mat-dialog-title]');
  private readonly messageEl = this.locatorFor('mat-dialog-content');
  private readonly confirmBtn = this.locatorFor('.confirm-btn');
  private readonly cancelBtn = this.locatorFor('.cancel-btn');

  async getTitle(): Promise<string> {
    return (await this.titleEl()).text();
  }

  async getMessage(): Promise<string> {
    return (await this.messageEl()).text();
  }

  async getConfirmLabel(): Promise<string> {
    return (await (await this.confirmBtn()).text()).trim();
  }

  async getCancelLabel(): Promise<string> {
    return (await (await this.cancelBtn()).text()).trim();
  }

  async clickConfirm(): Promise<void> {
    await (await this.confirmBtn()).click();
  }

  async clickCancel(): Promise<void> {
    await (await this.cancelBtn()).click();
  }
}
