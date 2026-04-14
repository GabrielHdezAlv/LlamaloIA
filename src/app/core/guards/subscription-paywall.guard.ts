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
 * Con trial expirado / pago pendiente, solo se permite permanecer en /dashboard o /dashboard/home;
 * cualquier otra ruta autenticada redirige a inicio para mostrar el modal de precios.
 */
export const subscriptionPaywallGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);
  const user = userStorage.user();
  if (!requiresSubscriptionPaywall(user)) {
    return true;
  }
  const path = state.url.split('?')[0];
  if (path === '/dashboard' || path === '/dashboard/home') {
    return true;
  }
  void router.navigate(['/dashboard', 'home'], { replaceUrl: true });
  return false;
};

