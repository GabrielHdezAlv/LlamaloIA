import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { I18nService, type Translations } from '../../core/services/i18n.service';
import { UserStorage } from '../../storages/user/user-storage';
import {
  requiresBillingChurnLockPage,
  requiresPaymentFailureSubscribePage,
} from '../../shared/utils/plan-usage.util';
import { UpgradePlanPricingViewComponent } from '../../shared/modals/upgrade-plan-modal/upgrade-plan-pricing-view.component';

/**
 * Pantalla única tras cancelar suscripción: solo elección de plan (sin navegación del dashboard).
 */
@Component({
  selector: 'app-subscribe-required',
  standalone: true,
  imports: [CommonModule, UpgradePlanPricingViewComponent],
  templateUrl: './subscribe-required.component.html',
  styleUrls: ['./subscribe-required.component.scss'],
})
export class SubscribeRequiredComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userStorage = inject(UserStorage);
  i18n = inject(I18nService);

  private stripeQuery = toSignal(
    this.route.queryParamMap.pipe(map((q) => q.get('stripe'))),
    { initialValue: null as string | null },
  );

  /** Cobro fallido (estado Stripe o ?stripe=payment_failed): copy distinto al churn. */
  readonly paymentFailedUi = computed(() => {
    const u = this.userStorage.user();
    if (this.stripeQuery() === 'payment_failed') {
      return true;
    }
    return requiresPaymentFailureSubscribePage(u);
  });

  get t(): Translations {
    return this.i18n.getTranslations();
  }

  constructor() {
    effect(() => {
      const u = this.userStorage.user();
      if (!u?.planUsage?.limits) {
        return;
      }
      if (
        requiresBillingChurnLockPage(u) ||
        requiresPaymentFailureSubscribePage(u)
      ) {
        return;
      }
      void this.router.navigate(['/dashboard', 'home'], { replaceUrl: true });
    });
  }
}
