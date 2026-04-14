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
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';
import {
  paidPlanFeatureRows,
  PLAN_TIER_STORAGE_KEY,
  type PaidUpgradePlanId,
} from './pricing-plan-features';
import { StripeService } from '../../../core/services/stripe.service';
import { UserStorage } from '../../../storages/user/user-storage';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { AuthSessionService } from '../../../core/services/auth-session.service';

/** Duración de la animación de cierre + margen (debe alinearse con SCSS ~0.45s). */
const UPGRADE_MODAL_CLOSE_MS = 500;

/** Mensual facturado mes a mes vs. anual (importe por mes al pagar el año). */
const PLAN_PRICE_KEYS = {
  starter: { monthly: '29', annualPerMonth: '24' },
  growth: { monthly: '79', annualPerMonth: '66' },
  scale: { monthly: '169', annualPerMonth: '141' },
} as const;

export interface UpgradePlanModalData {
  /** `registration`: gate post-alta. `paywall`: trial agotado / pago pendiente — no se puede cerrar sin elegir plan. */
  mode?: 'registration' | 'paywall';
}

@Component({
  selector: 'app-upgrade-plan-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './upgrade-plan-modal.component.html',
  styleUrls: ['./upgrade-plan-modal.component.scss'],
})
export class UpgradePlanModalComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private stripeService = inject(StripeService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private authSession = inject(AuthSessionService);
  private platformId = inject(PLATFORM_ID);
  readonly dialogData = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as UpgradePlanModalData | undefined;
  dialogRef = inject(MatDialogRef<UpgradePlanModalComponent>);
  private readonly destroy$ = new Subject<void>();
  private readonly modalShell =
    viewChild<ElementRef<HTMLElement>>('modalShell');
  showCloseButton = false;
  private closing = false;
  stripeRedirecting = false;
  cancelLoading = false;
  /** false = precios mensuales (29 / 79 / 169); true = facturación anual con total anual destacado. */
  billingAnnual = false;

  get isRegistrationMode(): boolean {
    return this.dialogData?.mode === 'registration';
  }

  get isPaywallMode(): boolean {
    return this.dialogData?.mode === 'paywall';
  }

  /** Modal que no debe cerrarse con X, backdrop ni Escape (salvo registro → cancelar cuenta). */
  get isPlanGateLocked(): boolean {
    return this.isRegistrationMode || this.isPaywallMode;
  }

  ngOnInit(): void {
    document.body.classList.add('upgrade-plan-modal-open');
    if (!this.isPlanGateLocked) {
      setTimeout(() => {
        this.showCloseButton = true;
      }, 200);
    }

    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isRegistrationMode) {
          void this.cancelRegistration();
        } else if (this.isPaywallMode) {
          /* Trial caducado: obligatorio elegir plan; no cerrar */
        } else {
          this.closeWithAnimation();
        }
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
        if (this.isRegistrationMode) {
          void this.cancelRegistration();
        } else if (this.isPaywallMode) {
          /* no cerrar */
        } else {
          this.closeWithAnimation();
        }
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
    const rows = [
      {
        id: 'starter' as const,
        name: t.upgradePlanStarter,
        description: t.upgradePlanStarterDesc,
        buttonText: t.upgradePlanStarterButton,
        highlighted: false,
        features: paidPlanFeatureRows('starter', t),
      },
      {
        id: 'growth' as const,
        name: t.upgradePlanGrowth,
        description: t.upgradePlanGrowthDesc,
        buttonText: t.upgradePlanGrowthButton,
        highlighted: true,
        features: paidPlanFeatureRows('growth', t),
      },
      {
        id: 'scale' as const,
        name: t.upgradePlanScale,
        description: t.upgradePlanScaleDesc,
        buttonText: t.upgradePlanScaleButton,
        highlighted: false,
        features: paidPlanFeatureRows('scale', t),
      },
    ];
    return rows.map((row) => {
      const p = PLAN_PRICE_KEYS[row.id];
      return {
        ...row,
        priceMonthly: p.monthly,
        priceAnnualPerMonth: p.annualPerMonth,
      };
    });
  }

  close(): void {
    if (this.isRegistrationMode) {
      void this.cancelRegistration();
      return;
    }
    if (this.isPaywallMode) {
      return;
    }
    this.closeWithAnimation();
  }

  async cancelRegistration(): Promise<void> {
    if (this.cancelLoading || this.closing) {
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.cancelLoading = true;
    try {
      await firstValueFrom(this.userService.cancelIncompleteRegistration());
      this.dialogRef.close('aborted');
      this.authSession.signOutAndReload();
    } catch {
      this.notificationService.error(this.t.stripeBillingError);
    } finally {
      this.cancelLoading = false;
    }
  }

  async onChoosePlan(planId: PaidUpgradePlanId, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (this.closing || this.stripeRedirecting) {
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(PLAN_TIER_STORAGE_KEY, planId);
    } catch {
      /* ignore quota / private mode */
    }

    const origin = window.location.origin;
    const successUrl = `${origin}/dashboard/account?tab=billing&stripe=success`;
    const cancelUrl = `${origin}/dashboard/home?stripe=cancel&pricing=1`;
    const portalReturnUrl = `${origin}/dashboard/account?tab=billing&stripe=return`;

    const user = this.userStore.user();
    this.stripeRedirecting = true;

    try {
      if (user?.stripeCustomerId?.trim()) {
        const { url } = await firstValueFrom(
          this.stripeService.createBillingPortalSession({
            returnUrl: portalReturnUrl,
          }),
        );
        if (url) {
          window.location.href = url;
          return;
        }
      } else {
        const { url } = await firstValueFrom(
          this.stripeService.createCheckoutSession({
            plan: planId,
            successUrl,
            cancelUrl,
          }),
        );
        if (url) {
          window.location.href = url;
          return;
        }
      }
      this.notificationService.error(this.t.stripeBillingError);
    } catch {
      this.notificationService.error(this.t.stripeBillingError);
    } finally {
      this.stripeRedirecting = false;
    }
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
