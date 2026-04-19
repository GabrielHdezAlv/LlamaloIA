import { inject } from '@angular/core';
import {
  Router,
  type CanActivateFn,
} from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { isQaTeamBypassEmail } from '../../shared/utils/qa-access.util';

/**
 * `/company-setup` solo si el onboarding inicial no está completado,
 * salvo usuario QA interno (puede reabrir para pruebas).
 */
export const companySetupAccessGuard: CanActivateFn = () => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);
  const user = userStorage.user();

  if (!user) {
    return true;
  }

  if (isQaTeamBypassEmail(user.email)) {
    return true;
  }

  if (user.hasCompletedSetup === true) {
    void router.navigate(['/dashboard', 'home'], { replaceUrl: true });
    return false;
  }

  return true;
};
