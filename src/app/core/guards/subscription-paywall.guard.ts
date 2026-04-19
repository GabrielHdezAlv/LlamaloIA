import { inject } from '@angular/core';
import {
  Router,
  type CanActivateFn,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import {
  requiresBillingChurnLockPage,
  requiresPaymentFailureSubscribePage,
  requiresSubscriptionPaywall,
} from '../../shared/utils/plan-usage.util';

/**
 * Churn o trial gratis agotado: solo `/subscribe-required`.
 * Pago fallido en Stripe: solo `/subscribe-required?stripe=payment_failed`.
 * Otros paywall (p. ej. Stripe bloqueado sin las rutas anteriores): solo `/dashboard` y `/dashboard/home`.
 */
export const subscriptionPaywallGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);
  const user = userStorage.user();
  const path = state.url.split('?')[0];

  if (requiresBillingChurnLockPage(user)) {
    if (
      path === '/subscribe-required' ||
      path.startsWith('/subscribe-required/')
    ) {
      return true;
    }
    void router.navigate(['/subscribe-required'], { replaceUrl: true });
    return false;
  }

  if (requiresPaymentFailureSubscribePage(user)) {
    if (
      path === '/subscribe-required' ||
      path.startsWith('/subscribe-required/')
    ) {
      return true;
    }
    void router.navigate(['/subscribe-required'], {
      queryParams: { stripe: 'payment_failed' },
      replaceUrl: true,
    });
    return false;
  }

  if (!requiresSubscriptionPaywall(user)) {
    return true;
  }
  if (path === '/dashboard' || path === '/dashboard/home') {
    return true;
  }
  void router.navigate(['/dashboard', 'home'], { replaceUrl: true });
  return false;
};

