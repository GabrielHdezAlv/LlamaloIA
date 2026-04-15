import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, filter } from 'rxjs';
import { UpgradePlanPricingViewComponent } from './upgrade-plan-pricing-view.component';

export interface UpgradePlanModalData {
  mode?: 'registration' | 'paywall';
}

@Component({
  selector: 'app-upgrade-plan-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    UpgradePlanPricingViewComponent,
  ],
  template: `
    <app-upgrade-plan-pricing-view
      #pricingView
      [mode]="dialogMode"
      (registrationAborted)="dialogRef.close('aborted')"
      (requestDismiss)="dialogRef.close()" />
  `,
})
export class UpgradePlanModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  readonly dialogData = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as UpgradePlanModalData | undefined;
  dialogRef = inject(MatDialogRef<UpgradePlanModalComponent>);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('pricingView')
  pricingView!: UpgradePlanPricingViewComponent;

  get dialogMode(): 'registration' | 'paywall' | 'embedded' {
    return this.dialogData?.mode === 'registration'
      ? 'registration'
      : this.dialogData?.mode === 'paywall'
        ? 'paywall'
        : 'paywall';
  }

  ngOnInit(): void {
    document.body.classList.add('upgrade-plan-modal-open');
  }

  ngAfterViewInit(): void {
    const v = this.pricingView;
    if (!v) return;
    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        v.handleShellDismissRequest();
      });

    this.dialogRef
      .keydownEvents()
      .pipe(
        takeUntil(this.destroy$),
        filter((e): e is KeyboardEvent => e.key === 'Escape'),
      )
      .subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        v.handleShellDismissRequest();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('upgrade-plan-modal-open');
    document.body.classList.remove('upgrade-plan-modal-leaving');
  }
}
