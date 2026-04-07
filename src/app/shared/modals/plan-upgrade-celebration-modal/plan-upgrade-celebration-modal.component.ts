import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';

export type PlanUpgradeCelebrationPlan = 'pro' | 'premium';

export interface PlanUpgradeCelebrationModalData {
  plan: PlanUpgradeCelebrationPlan;
}

/** Misma duración que upgrade-plan-modal (~0.48s salida + margen). */
const CELEBRATION_MODAL_CLOSE_MS = 520;

@Component({
  selector: 'app-plan-upgrade-celebration-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './plan-upgrade-celebration-modal.component.html',
  styleUrls: ['./plan-upgrade-celebration-modal.component.scss'],
})
export class PlanUpgradeCelebrationModalComponent implements OnInit, OnDestroy {
  readonly planData = inject<PlanUpgradeCelebrationModalData>(MAT_DIALOG_DATA);
  /** Reserva la misma altura que el modal de pricing (tres columnas). */
  readonly placeholderSlots: readonly [1, 2, 3] = [1, 2, 3];
  private i18nService = inject(I18nService);
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<PlanUpgradeCelebrationModalComponent>);
  private readonly destroy$ = new Subject<void>();
  private readonly modalShell = viewChild<ElementRef<HTMLElement>>('modalShell');
  showCloseButton = false;
  private closing = false;

  get t() {
    return this.i18nService.getTranslations();
  }

  get title(): string {
    return this.planData.plan === 'premium'
      ? this.t.planUpgradeCelebrationTitlePremium
      : this.t.planUpgradeCelebrationTitlePro;
  }

  get message(): string {
    return this.planData.plan === 'premium'
      ? this.t.planUpgradeCelebrationMessagePremium
      : this.t.planUpgradeCelebrationMessagePro;
  }

  get planBadge(): string {
    return this.planData.plan === 'premium' ? this.t.upgradePlanPremium : this.t.upgradePlanPro;
  }

  ngOnInit(): void {
    document.body.classList.add('upgrade-plan-modal-open');
    setTimeout(() => {
      this.showCloseButton = true;
    }, 200);

    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.closeWithAnimation());

    this.dialogRef
      .keydownEvents()
      .pipe(
        takeUntil(this.destroy$),
        filter((e): e is KeyboardEvent => e.key === 'Escape'),
      )
      .subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeWithAnimation();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('upgrade-plan-modal-open');
    document.body.classList.remove('upgrade-plan-modal-leaving');
  }

  close(): void {
    this.closeWithAnimation();
  }

  continueToDashboard(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('upgrade-plan-modal--leave');
    document.body.classList.add('upgrade-plan-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('upgrade-plan-modal-leaving');
      this.dialogRef.close('dashboard');
      void this.router.navigate(['/dashboard/home']);
    }, CELEBRATION_MODAL_CLOSE_MS);
  }

  private closeWithAnimation(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('upgrade-plan-modal--leave');
    document.body.classList.add('upgrade-plan-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('upgrade-plan-modal-leaving');
      this.dialogRef.close();
    }, CELEBRATION_MODAL_CLOSE_MS);
  }
}
