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
  requiresSubscriptionPaywall,
} from '../../shared/utils/plan-usage.util';

/**
 * Churn: solo `/subscribe-required`. Trial expirado / pago pendiente: solo `/dashboard` y `/dashboard/home`
 * (modal de precios); el resto de rutas vuelve a inicio.
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

  if (!requiresSubscriptionPaywall(user)) {
    return true;
  }
  if (path === '/dashboard' || path === '/dashboard/home') {
    return true;
  }
  void router.navigate(['/dashboard', 'home'], { replaceUrl: true });
  return false;
};

