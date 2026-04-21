import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';
import { StripeService, type StripePaidPlan } from '../../core/services/stripe.service';
import { UserStorage } from '../../storages/user/user-storage';
import { NotificationService } from '../../core/services/notification.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import type { User } from '../../shared/models/new-user.model';

function isPaidUpgradePlanId(v: string): v is StripePaidPlan {
  return v === 'starter' || v === 'growth' || v === 'scale';
}

@Component({
  selector: 'app-plan-change-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plan-change-review.component.html',
  styleUrls: ['./plan-change-review.component.scss'],
})
export class PlanChangeReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matDialog = inject(MatDialog);
  private stripeService = inject(StripeService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly preview = signal<{
    currency: string;
    amountDue: number;
    lines: Array<{ description: string; amount: number }>;
  } | null>(null);
  readonly targetPlan = signal<StripePaidPlan | null>(null);
  readonly currentPlanLabel = signal<string>('');
  readonly targetPlanLabel = signal<string>('');
  confirmLoading = false;

  get t() {
    return this.i18n.getTranslations();
  }

  ngOnInit(): void {
    this.matDialog.closeAll();
    void this.bootstrap();
  }

  formatMoneyAmount(cents: number, currency: string): string {
    const c = (currency || 'eur').toUpperCase();
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: c.length === 3 ? c : 'EUR',
      }).format(cents / 100);
    } catch {
      return `${(cents / 100).toFixed(2)} ${c}`;
    }
  }

  private planLabel(plan: StripePaidPlan): string {
    const tr = this.t;
    switch (plan) {
      case 'starter':
        return tr.upgradePlanStarter;
      case 'growth':
        return tr.upgradePlanGrowth;
      case 'scale':
        return tr.upgradePlanScale;
      default:
        return plan;
    }
  }

  private trialLike(user: User | null): boolean {
    if (!user) return true;
    if (user.planUsage?.trialActive === true) return true;
    if ((user.stripeSubscriptionStatus ?? '').trim() === 'trialing') {
      return true;
    }
    return false;
  }

  private currentPaidTier(user: User | null): StripePaidPlan | null {
    if (!user || this.trialLike(user)) return null;
    const slug = user.planUsage?.effectivePlanSlug;
    if (slug === 'starter' || slug === 'growth' || slug === 'scale') {
      return slug;
    }
    return null;
  }

  private async bootstrap(): Promise<void> {
    const raw = this.route.snapshot.queryParamMap.get('target')?.trim() ?? '';
    if (!isPaidUpgradePlanId(raw)) {
      void this.router.navigate(['/dashboard/home'], {
        queryParams: { pricing: '1' },
        replaceUrl: true,
      });
      return;
    }
    const target = raw;

    await this.userStore.loadUserProfile();
    const user = this.userStore.user();

    if (
      !user?.stripeSubscriptionId?.trim() ||
      !user.stripeCustomerId?.trim() ||
      user.billingChurnLocked === true
    ) {
      this.notificationService.error(this.t.planChangeInvalidSession);
      void this.router.navigate(['/dashboard/account'], {
        queryParams: { tab: 'billing' },
        replaceUrl: true,
      });
      return;
    }

    if (this.trialLike(user)) {
      void this.router.navigate(['/dashboard/home'], {
        queryParams: { pricing: '1' },
        replaceUrl: true,
      });
      return;
    }

    const current = this.currentPaidTier(user);
    if (!current || current === target) {
      void this.router.navigate(['/dashboard/account'], {
        queryParams: { tab: 'billing' },
        replaceUrl: true,
      });
      return;
    }

    this.targetPlan.set(target);
    this.currentPlanLabel.set(this.planLabel(current));
    this.targetPlanLabel.set(this.planLabel(target));

    try {
      const p = await firstValueFrom(
        this.stripeService.previewPlanChange({ plan: target }),
      );
      this.preview.set({
        currency: p.currency,
        amountDue: p.amountDue,
        lines: p.lines,
      });
    } catch (err: unknown) {
      this.errorMessage.set(
        getApiErrorMessage(err, this.t.stripeBillingError),
      );
    } finally {
      this.loading.set(false);
    }
  }

  async confirmChange(): Promise<void> {
    const plan = this.targetPlan();
    if (!plan || this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;
    try {
      await firstValueFrom(this.stripeService.changeSubscriptionPlan({ plan }));
      await this.userStore.loadUserProfile();
      this.notificationService.success(this.t.upgradePlanChangeSuccess);
      void this.router.navigate(['/dashboard/account'], {
        queryParams: { tab: 'billing', stripe: 'plan_updated' },
        replaceUrl: true,
      });
    } catch (err: unknown) {
      this.notificationService.error(
        getApiErrorMessage(err, this.t.stripeBillingError),
      );
    } finally {
      this.confirmLoading = false;
    }
  }
}
