import { inject } from '@angular/core';
import {
  Router,
  type CanActivateFn,
} from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import {
  requiresBillingChurnLockPage,
  requiresPaymentFailureSubscribePage,
} from '../../shared/utils/plan-usage.util';
import { isQaTeamBypassEmail } from '../../shared/utils/qa-access.util';

/**
 * `/subscribe-required` solo si la cuenta debe estar ahí (churn, trial gratis agotado, pago Stripe fallido)
 * o si el usuario es el equipo QA interno.
 */
export const subscribeRequiredAccessGuard: CanActivateFn = () => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);
  const user = userStorage.user();

  if (!user) {
    return true;
  }

  if (isQaTeamBypassEmail(user.email)) {
    return true;
  }

  if (
    requiresBillingChurnLockPage(user) ||
    requiresPaymentFailureSubscribePage(user)
  ) {
    return true;
  }

  void router.navigate(['/dashboard', 'home'], { replaceUrl: true });
  return false;
};
