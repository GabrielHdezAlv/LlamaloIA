import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';
import { paidPlanFeatureRows } from '../../shared/modals/upgrade-plan-modal/pricing-plan-features';
import { StripeService, type StripePaidPlan } from '../../core/services/stripe.service';
import { UserStorage } from '../../storages/user/user-storage';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plan.component.html',
  styleUrl: './upgrade-plan.component.scss'
})
export class UpgradePlanComponent implements OnInit, AfterViewInit, OnDestroy {
  private i18nService = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);
  private stripeService = inject(StripeService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  stripeRedirecting = false;

  @ViewChild('comparisonSection') comparisonSectionRef!: ElementRef<HTMLElement>;
  comparisonVisible = false;
  private comparisonObserver: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['stripe'] === 'cancel' && isPlatformBrowser(this.platformId)) {
        this.notificationService.info(this.t.stripeCheckoutCancelled);
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { stripe: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.comparisonSectionRef?.nativeElement;
    if (!el) return;
    this.comparisonObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !this.comparisonVisible) {
          this.comparisonVisible = true;
          this.cdr.markForCheck();
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );
    this.comparisonObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.comparisonObserver?.disconnect();
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

  async onSelectPlan(planId: StripePaidPlan, event: Event): Promise<void> {
    event.preventDefault();
    if (this.stripeRedirecting || !isPlatformBrowser(this.platformId)) return;

    const origin = window.location.origin;
    const successUrl = `${origin}/dashboard/account?tab=billing&stripe=success`;
    const cancelUrl = `${origin}/dashboard/upgrade-plan?stripe=cancel`;
    const portalReturnUrl = `${origin}/dashboard/account?tab=billing&stripe=return`;

    const user = this.userStore.user();
    this.stripeRedirecting = true;
    this.cdr.markForCheck();

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
      this.cdr.markForCheck();
    }
  }

  get comparisonFeatures() {
    const t = this.t;
    return [
      { name: t.upgradeComp1, free: true, pro: true, premium: true, icon: '録' },
      { name: t.upgradeComp2, free: true, pro: true, premium: true, icon: '☺' },
      { name: t.upgradeComp3, free: true, pro: true, premium: true, icon: '⚓' },
      { name: t.upgradeComp4, free: false, pro: true, premium: true, icon: '⚡' },
      { name: t.upgradeComp5, free: false, pro: true, premium: true, icon: '🗣' },
      { name: t.upgradeComp6, free: false, pro: true, premium: true, icon: '📈' },
      { name: t.upgradeComp7, free: false, pro: true, premium: true, icon: '📅' },
      { name: t.upgradeComp8, free: false, pro: false, premium: true, icon: '🔄' },
      { name: t.upgradeComp9, free: false, pro: false, premium: true, icon: '🔔' },
      { name: t.upgradeComp10, free: false, pro: false, premium: true, icon: '★' }
    ];
  }
}
