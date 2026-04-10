import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';
import {
  PlanUpgradeCelebrationModalComponent,
  PlanUpgradeCelebrationModalData,
} from '../plan-upgrade-celebration-modal/plan-upgrade-celebration-modal.component';
import { paidPlanFeatureRows, type PaidUpgradePlanId } from './pricing-plan-features';

const PLAN_TIER_STORAGE_KEY = 'llamalo_selected_plan_tier';

/** Duración de la animación de cierre + margen (debe alinearse con SCSS ~0.45s). */
const UPGRADE_MODAL_CLOSE_MS = 500;

@Component({
  selector: 'app-upgrade-plan-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './upgrade-plan-modal.component.html',
  styleUrls: ['./upgrade-plan-modal.component.scss'],
})
export class UpgradePlanModalComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private matDialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);
  dialogRef = inject(MatDialogRef<UpgradePlanModalComponent>);
  private readonly destroy$ = new Subject<void>();
  private readonly modalShell = viewChild<ElementRef<HTMLElement>>('modalShell');
  showCloseButton = false;
  private closing = false;

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
        filter((e): e is KeyboardEvent => e.key === 'Escape')
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

  get t() {
    return this.i18nService.getTranslations();
  }

  get pricingPlans() {
    const t = this.t;
    return [
      {
        id: 'starter' as const,
        name: t.upgradePlanStarter,
        description: t.upgradePlanStarterDesc,
        price: '29',
        buttonText: t.upgradePlanStarterButton,
        highlighted: false,
        features: paidPlanFeatureRows('starter', t),
      },
      {
        id: 'growth' as const,
        name: t.upgradePlanGrowth,
        description: t.upgradePlanGrowthDesc,
        price: '79',
        buttonText: t.upgradePlanGrowthButton,
        highlighted: true,
        features: paidPlanFeatureRows('growth', t),
      },
      {
        id: 'scale' as const,
        name: t.upgradePlanScale,
        description: t.upgradePlanScaleDesc,
        price: '169',
        buttonText: t.upgradePlanScaleButton,
        highlighted: false,
        features: paidPlanFeatureRows('scale', t),
      },
    ];
  }

  close(): void {
    this.closeWithAnimation();
  }

  onChoosePlan(planId: PaidUpgradePlanId, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.closing) {
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(PLAN_TIER_STORAGE_KEY, planId);
      } catch {
        /* ignore quota / private mode */
      }
    }
    this.closeWithAnimation();
    window.setTimeout(() => {
      const data: PlanUpgradeCelebrationModalData = { plan: planId };
      this.matDialog.open(PlanUpgradeCelebrationModalComponent, {
        disableClose: true,
        panelClass: ['custom-dialog-container', 'plan-celebration-dialog'],
        data,
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '200ms',
      });
    }, UPGRADE_MODAL_CLOSE_MS);
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
    }, UPGRADE_MODAL_CLOSE_MS);
  }
}
