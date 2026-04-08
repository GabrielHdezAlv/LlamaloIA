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
import { upgradePlanFeatureRows } from './pricing-plan-features';

const PLAN_TIER_STORAGE_KEY = 'llamalo_selected_plan_tier';

/** Duración de la animación de cierre + margen (debe alinearse con SCSS ~0.48s). */
const UPGRADE_MODAL_CLOSE_MS = 520;

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
        id: 'free' as const,
        name: t.upgradePlanFree,
        description: t.upgradePlanFreeDesc,
        price: '0',
        buttonText: t.upgradePlanFreeButton,
        highlighted: false,
        features: [
          { text: t.upgradeFeatureFree1, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { text: t.upgradeFeatureFree2, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { text: t.upgradeFeatureFree3, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { text: t.upgradeFeatureFree4, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
          { text: t.upgradeFeatureFree5, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
        ]
      },
      {
        id: 'pro' as const,
        name: t.upgradePlanPro,
        description: t.upgradePlanProDesc,
        price: '12',
        buttonText: t.upgradePlanProButton,
        highlighted: true,
        features: upgradePlanFeatureRows('pro', t),
      },
      {
        id: 'premium' as const,
        name: t.upgradePlanPremium,
        description: t.upgradePlanPremiumDesc,
        price: '18',
        buttonText: t.upgradePlanPremiumButton,
        highlighted: false,
        features: upgradePlanFeatureRows('premium', t),
      }
    ];
  }

  close(): void {
    this.closeWithAnimation();
  }

  onChoosePlan(planId: 'free' | 'pro' | 'premium', event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.closing) {
      return;
    }
    if (planId === 'free') {
      this.closeWithAnimation();
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
