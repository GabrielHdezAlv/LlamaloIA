import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ModalService } from '../modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';

export function openPlanLimitDialog(
  modalService: ModalService,
  router: Router,
  i18n: I18nService,
  error: HttpErrorResponse,
): void {
  const t = i18n.getTranslations();
  const msg =
    typeof error.error?.message === 'string'
      ? error.error.message
      : t.http403PlanBlocked;
  modalService
    .openWarning({
      message: `${t.planLimitModalTitle}: ${msg}`,
      confirmText: t.planLimitModalCta,
      cancelText: t.cancelBtn,
    })
    .afterClosed()
    .subscribe((ok) => {
      if (ok) void router.navigate(['/billing']);
    });
}
