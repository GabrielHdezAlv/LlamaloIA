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
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';
import { upgradePlanFeatureRows } from '../upgrade-plan-modal/pricing-plan-features';

export type PlanUpgradeCelebrationPlan = 'pro' | 'premium';

export interface PlanUpgradeCelebrationModalData {
  plan: PlanUpgradeCelebrationPlan;
}

const CELEBRATION_MODAL_CLOSE_MS = 420;

@Component({
  selector: 'app-plan-upgrade-celebration-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './plan-upgrade-celebration-modal.component.html',
  styleUrls: ['./plan-upgrade-celebration-modal.component.scss'],
  host: { class: 'block w-full min-w-0 box-border' },
})
export class PlanUpgradeCelebrationModalComponent implements OnInit, OnDestroy {
  readonly planData = inject<PlanUpgradeCelebrationModalData>(MAT_DIALOG_DATA);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  dialogRef = inject(MatDialogRef<PlanUpgradeCelebrationModalComponent>);
  private readonly destroy$ = new Subject<void>();
  private readonly modalShell = viewChild<ElementRef<HTMLElement>>('modalShell');
  private closing = false;

  get t() {
    return this.i18nService.getTranslations();
  }

  get planDisplayName(): string {
    return this.planData.plan === 'premium'
      ? this.t.upgradePlanPremium
      : this.t.upgradePlanPro;
  }

  /** Por si la clave i18n no está en el objeto en runtime (caché antigua, etc.). */
  get benefitsHeading(): string {
    const raw = this.t.planUpgradeCelebrationBenefitsHeading;
    if (raw != null && String(raw).trim() !== '') {
      return raw;
    }
    return this.i18nService.selectedLanguage().code === 'en'
      ? 'Benefits included'
      : 'Ventajas adquiridas';
  }

  get celebrationFeatures() {
    return upgradePlanFeatureRows(this.planData.plan, this.t);
  }

  ngOnInit(): void {
    document.body.classList.add('plan-celebration-modal-open');

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
    document.body.classList.remove('plan-celebration-modal-open');
    document.body.classList.remove('plan-celebration-modal-leaving');
  }

  goToDashboard(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('plan-celebration-shell--leave');
    document.body.classList.add('plan-celebration-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('plan-celebration-modal-leaving');
      this.dialogRef.close('dashboard');
      void this.router.navigate(['/dashboard']);
    }, CELEBRATION_MODAL_CLOSE_MS);
  }

  private closeWithAnimation(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('plan-celebration-shell--leave');
    document.body.classList.add('plan-celebration-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('plan-celebration-modal-leaving');
      this.dialogRef.close();
    }, CELEBRATION_MODAL_CLOSE_MS);
  }
}
