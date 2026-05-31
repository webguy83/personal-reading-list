import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ConfirmDialogComponent, type ConfirmDialogData } from './confirm-dialog.component';
import { ConfirmDialogHarness } from './confirm-dialog.harness';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockDialogRef = { close: vi.fn() };

async function createHarness(data: ConfirmDialogData): Promise<ConfirmDialogHarness> {
  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  });
  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();
  return TestbedHarnessEnvironment.harnessForFixture(fixture, ConfirmDialogHarness);
}

function createComponent(data: ConfirmDialogData) {
  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  });
  return TestBed.createComponent(ConfirmDialogComponent);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ConfirmDialogComponent + ConfirmDialogHarness', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => TestBed.resetTestingModule());

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the title and message', async () => {
    const h = await createHarness({ title: 'Are you sure?', message: 'This cannot be undone.' });
    expect(await h.getTitle()).toContain('Are you sure?');
    expect(await h.getMessage()).toContain('This cannot be undone.');
  });

  it('uses default Confirm / Cancel labels when not provided', async () => {
    const h = await createHarness({ title: 'Title', message: 'Message' });
    expect(await h.getConfirmLabel()).toBe('Confirm');
    expect(await h.getCancelLabel()).toBe('Cancel');
  });

  it('uses custom confirmLabel and cancelLabel when provided', async () => {
    const h = await createHarness({ title: 'Remove', message: 'Remove it?', confirmLabel: 'Remove', cancelLabel: 'Keep' });
    expect(await h.getConfirmLabel()).toBe('Remove');
    expect(await h.getCancelLabel()).toBe('Keep');
  });

  // ─── Confirm interaction ───────────────────────────────────────────────────

  it('calls dialogRef.close(true) when the confirm button is clicked', async () => {
    const h = await createHarness({ title: 'Delete', message: 'Really?' });
    await h.clickConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('calls dialogRef.close(true) when confirm() is called directly', () => {
    const fixture = createComponent({ title: 'Delete', message: 'Really?' });
    fixture.componentInstance.confirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  // ─── Cancel interaction ────────────────────────────────────────────────────

  it('calls dialogRef.close(false) when the cancel button is clicked', async () => {
    const h = await createHarness({ title: 'Delete', message: 'Really?' });
    await h.clickCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('calls dialogRef.close(false) when cancel() is called directly', () => {
    const fixture = createComponent({ title: 'Delete', message: 'Really?' });
    fixture.componentInstance.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
