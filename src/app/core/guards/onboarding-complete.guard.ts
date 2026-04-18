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
 * Bloquea el uso de la app (rutas bajo dashboard u otras protegidas) hasta que
 * `hasCompletedSetup` sea true. Permite excepciones (p. ej. cuenta / facturación).
 */
export const onboardingCompleteGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);
  const user = userStorage.user();

  if (!user) {
    return true;
  }

  const rawPath = state.url.split('?')[0];
  if (requiresBillingChurnLockPage(user)) {
    if (
      rawPath === '/subscribe-required' ||
      rawPath.startsWith('/subscribe-required/')
    ) {
      return true;
    }
    void router.navigate(['/subscribe-required'], { replaceUrl: true });
    return false;
  }

  if (requiresPaymentFailureSubscribePage(user)) {
    if (
      rawPath === '/subscribe-required' ||
      rawPath.startsWith('/subscribe-required/')
    ) {
      return true;
    }
    void router.navigate(['/subscribe-required'], {
      queryParams: { stripe: 'payment_failed' },
      replaceUrl: true,
    });
    return false;
  }

  if (requiresSubscriptionPaywall(user)) {
    return true;
  }

  if (user.hasCompletedSetup === true) {
    return true;
  }

  const path = rawPath.replace(/\/$/, '') || '/';

  if (
    path === '/dashboard/account' ||
    path.startsWith('/dashboard/account/')
  ) {
    return true;
  }

  void router.navigate(['/company-setup'], { replaceUrl: true });
  return false;
};
