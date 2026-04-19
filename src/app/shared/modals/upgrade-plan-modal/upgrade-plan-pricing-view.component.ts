import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import {
  paidPlanFeatureRows,
  PLAN_TIER_STORAGE_KEY,
  type PaidUpgradePlanId,
} from './pricing-plan-features';
import {
  StripeService,
  type StarterCheckoutMode,
} from '../../../core/services/stripe.service';
import { UserStorage } from '../../../storages/user/user-storage';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import type { UpgradePlanPricingViewMode } from './upgrade-plan-pricing-view-mode';
import { getApiErrorMessage } from '../../../core/utils/api-error-message';

/** Duración de la animación de cierre + margen (debe alinearse con SCSS ~0.45s). */
const UPGRADE_MODAL_CLOSE_MS = 500;

/**
 * SessionStorage: el usuario abrió Stripe desde el paso de planes del onboarding embebido.
 * Sirve de respaldo si la URL de cancelación no trae query; se limpia al volver al paso de planes o tras pago exitoso.
 */
export const ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY =
  'llamalo_onboarding_checkout_pending';

const PLAN_PRICE_KEYS = {
  starter: { monthly: '29', annualPerMonth: '24' },
  growth: { monthly: '79', annualPerMonth: '66' },
  scale: { monthly: '169', annualPerMonth: '141' },
} as const;

/**
 * Contenido reutilizable de planes / Stripe (modal de upgrade, gate de registro u onboarding embebido).
 */
@Component({
  selector: 'app-upgrade-plan-pricing-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plan-pricing-view.component.html',
  styleUrls: ['./upgrade-plan-modal.component.scss'],
})
export class UpgradePlanPricingViewComponent implements OnInit {
  private i18nService = inject(I18nService);
  private stripeService = inject(StripeService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private authSession = inject(AuthSessionService);
  private platformId = inject(PLATFORM_ID);

  private readonly modalShell =
    viewChild<ElementRef<HTMLElement>>('modalShell');

  /** `registration`: gate post-alta. `paywall`: trial agotado. `upgrade`: cuenta. `embedded`: onboarding. `churn`: re-suscripción tras baja. */
  @Input() mode: UpgradePlanPricingViewMode = 'embedded';

  @Output() registrationAborted = new EventEmitter<void>();
  @Output() requestDismiss = new EventEmitter<void>();
  /** Solo `mode="embedded"` (company-setup): volver al paso anterior. */
  @Output() onboardingBack = new EventEmitter<void>();

  showCloseButton = false;
  private closing = false;
  stripeRedirecting = false;
  cancelLoading = false;
  billingAnnual = false;

  get isRegistrationMode(): boolean {
    return this.mode === 'registration' || this.mode === 'embedded';
  }

  /** Onboarding en `/company-setup`: pantalla completa, sin cromo de modal. */
  get isEmbeddedOnboarding(): boolean {
    return this.mode === 'embedded';
  }

  get isPaywallMode(): boolean {
    return this.mode === 'paywall';
  }

  get isChurnMode(): boolean {
    return this.mode === 'churn';
  }

  get isPlanGateLocked(): boolean {
    return this.isRegistrationMode || this.isPaywallMode || this.isChurnMode;
  }

  /**
   * Onboarding embebido: Starter «Empezar gratis» → Checkout con trial 7 días (tarjeta en Stripe; sin cargo durante la prueba).
   * Resto de modos: Starter sin trial (pago inmediato).
   */
  get starterCheckoutMode(): StarterCheckoutMode {
    return this.mode === 'embedded' ? 'trial' : 'pay';
  }

  ngOnInit(): void {
    if (!this.isPlanGateLocked) {
      setTimeout(() => {
        this.showCloseButton = true;
      }, 200);
    }
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

  emitOnboardingBack(): void {
    this.onboardingBack.emit();
  }

  /** Pantalla `/subscribe-required` (churn): volver al login (cierra sesión; GuestGuard permite /login). */
  goToLogin(): void {
    this.authSession.signOutAndReload();
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

  /** Backdrop / Escape desde el MatDialog padre. */
  handleShellDismissRequest(): void {
    if (this.isRegistrationMode) {
      void this.cancelRegistration();
    } else if (this.isPaywallMode) {
      /* no cerrar */
    } else {
      this.closeWithAnimation();
    }
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
      this.registrationAborted.emit();
      await this.authSession.signOutAndReload();
    } catch {
      this.notificationService.error(this.t.stripeBillingError);
    } finally {
      this.cancelLoading = false;
    }
  }

  async onChoosePlan(
    planId: PaidUpgradePlanId,
    event: Event,
    starterMode?: StarterCheckoutMode,
  ): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (this.closing || this.stripeRedirecting) {
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (planId !== 'starter' && starterMode != null) {
      return;
    }
    try {
      localStorage.setItem(PLAN_TIER_STORAGE_KEY, planId);
    } catch {
      /* ignore */
    }

    const origin = window.location.origin;
    const successUrl = `${origin}/dashboard/account?tab=billing&stripe=success`;
    const cancelUrl =
      this.mode === 'churn'
        ? `${origin}/subscribe-required?stripe=cancel`
        : this.mode === 'paywall'
          ? `${origin}/dashboard/home?stripe=cancel&pricing=1`
          : this.mode === 'upgrade'
            ? `${origin}/dashboard/account?tab=billing&stripe=cancel`
            : `${origin}/company-setup?stripe=cancel`;
    const portalReturnUrl = `${origin}/dashboard/account?tab=billing&stripe=return`;

    if (this.isEmbeddedOnboarding) {
      try {
        sessionStorage.setItem(ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY, '1');
      } catch {
        /* ignore */
      }
    }

    const user = this.userStore.user();
    this.stripeRedirecting = true;

    try {
      if (user?.stripeCustomerId?.trim() && user.billingChurnLocked !== true) {
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
            ...(this.billingAnnual ? { billingInterval: 'year' as const } : {}),
            ...(planId === 'starter' && starterMode != null
              ? { starterMode }
              : {}),
          }),
        );
        if (url) {
          window.location.href = url;
          return;
        }
      }
      this.notificationService.error(this.t.stripeBillingError);
    } catch (err: unknown) {
      this.notificationService.error(
        getApiErrorMessage(err, this.t.stripeBillingError),
      );
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
      this.requestDismiss.emit();
    }, UPGRADE_MODAL_CLOSE_MS);
  }
}
