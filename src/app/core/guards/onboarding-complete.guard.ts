import { inject } from '@angular/core';
import {
  Router,
  type CanActivateFn,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { requiresSubscriptionPaywall } from '../../shared/utils/plan-usage.util';

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

  if (requiresSubscriptionPaywall(user)) {
    return true;
  }

  if (user.hasCompletedSetup === true) {
    return true;
  }

  const path = state.url.split('?')[0].replace(/\/$/, '') || '/';

  if (
    path === '/dashboard/account' ||
    path.startsWith('/dashboard/account/')
  ) {
    return true;
  }

  void router.navigate(['/company-setup'], { replaceUrl: true });
  return false;
};
