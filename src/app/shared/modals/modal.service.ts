import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  ErrorModalComponent,
  ErrorModalData,
} from './error-modal/error-modal.component';
import {
  DeleteAccountModalComponent,
  DeleteAccountModalData,
} from './delete-account-modal/delete-account-modal.component';
import {
  PurchaseModalComponent,
  PurchaseModalData,
} from './purchase-modal/purchase-modal.component';
import {
  SuccessModalComponent,
  SuccessModalData,
} from './success-modal/success-modal.component';
import {
  WarningModalComponent,
  WarningModalData,
} from './warning-modal/warning-modal.component';
import {
  ImportNumberModalComponent,
  ImportNumberModalData,
} from './import-number-modal/import-number-modal.component';
import {
  PasswordSuccessModalComponent,
  PasswordSuccessModalData,
} from './password-success-modal/password-success-modal.component';
import {
  LoginSuccessModalComponent,
  LoginSuccessModalData,
} from './login-success-modal/login-success-modal.component';
import {
  MakeModalComponent,
  MakeModalData,
} from './make-modal/make-modal.component';
import {
  WebModalComponent,
  WebModalData,
} from './web-modal/web-modal.component';
import {
  EmailVerificationModalComponent,
  EmailVerificationModalData,
} from './email-verification-modal/email-verification-modal.component';
import {
  TwilioStepsModalComponent,
  TwilioStepsModalData,
} from './twilio-steps-modal/twilio-steps-modal.component';
import {
  TextModalComponent,
  TextModalData,
} from './text-modal/text-modal.component';
import {
  UpgradePlanModalComponent,
  type UpgradePlanModalData,
} from './upgrade-plan-modal/upgrade-plan-modal.component';
import {
  PlanUpgradeCelebrationModalComponent,
  PlanUpgradeCelebrationModalData,
} from './plan-upgrade-celebration-modal/plan-upgrade-celebration-modal.component';
import { FirstAgentTourService } from '../../core/services/first-agent-tour.service';
import { PLAN_CELEBRATION_SHOWN_SESSION_KEY } from '../../core/constants/first-agent-tour.constants';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialog = inject(MatDialog);
  private firstAgentTour = inject(FirstAgentTourService);
  private platformId = inject(PLATFORM_ID);

  /** Animaciones de entrada/salida del contenedor de Material Dialog. */
  private readonly dialogMotion = {
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '200ms',
  } as const;

  openError(data: ErrorModalData) {
    return this.dialog.open(ErrorModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openDeleteAccount(data: DeleteAccountModalData) {
    return this.dialog.open(DeleteAccountModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openPurchase(data: PurchaseModalData) {
    return this.dialog.open(PurchaseModalComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openSuccess(data: SuccessModalData) {
    return this.dialog.open(SuccessModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openWarning(data: WarningModalData) {
    return this.dialog.open(WarningModalComponent, {
      width: 'auto', // que se adapte al contenido
      maxWidth: 'min(100%, calc(100vw - 1.5rem))', // móvil: nunca más ancho que el viewport
      disableClose: false,
      panelClass: ['custom-dialog-container', 'warning-dialog-top'],
      data,
      ...this.dialogMotion,
    });
  }

  openImportNumber(data: ImportNumberModalData = {}) {
    return this.dialog.open(ImportNumberModalComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openPasswordSuccess(data: PasswordSuccessModalData = {}) {
    return this.dialog.open(PasswordSuccessModalComponent, {
      width: '450px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openLoginSuccess(data: LoginSuccessModalData = {}) {
    const dialogRef = this.dialog.open(LoginSuccessModalComponent, {
      width: 'auto',
      disableClose: false,
      panelClass: 'login-success-popup-container',
      data,
      position: {
        top: '20px',
        right: '20px',
      },
      ...this.dialogMotion,
    });

    setTimeout(() => {
      dialogRef.componentInstance?.requestClose();
    }, 4000);

    return dialogRef;
  }

  openMake(data: MakeModalData = {}) {
    return this.dialog.open(MakeModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openWeb(data: WebModalData = {}) {
    return this.dialog.open(WebModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openEmailVerification(data: EmailVerificationModalData = {}) {
    return this.dialog.open(EmailVerificationModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: [
        'custom-dialog-container',
        'email-verification-above-global-loading',
      ],
      backdropClass: 'email-verification-backdrop',
      data,
      ...this.dialogMotion,
    });
  }

  openTwilioSteps(data: TwilioStepsModalData = {}) {
    return this.dialog.open(TwilioStepsModalComponent, {
      width: '480px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
      ...this.dialogMotion,
    });
  }

  openText(data: TextModalData = {}) {
    return this.dialog.open(TextModalComponent, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'text-modal-backdrop',
      data,
      ...this.dialogMotion,
    });
  }

  openUpgradePlan() {
    return this.dialog.open(UpgradePlanModalComponent, {
      width: '880px',
      maxWidth: '95vw',
      data: { mode: 'upgrade' } satisfies UpgradePlanModalData,
      // El cierre animado lo gestiona el componente (backdrop / Escape / X).
      disableClose: true,
      panelClass: ['custom-dialog-container', 'upgrade-plan-dialog'],
      ...this.dialogMotion,
    });
  }

  /** Trial expirado o pago pendiente: mismo modal de precios, no cerrable, id único para no duplicar. */
  openUpgradePlanPaywall() {
    const existing = this.dialog.openDialogs.find(
      (d) => d.id === 'subscription-paywall',
    );
    if (existing) {
      return existing;
    }
    return this.dialog.open(UpgradePlanModalComponent, {
      id: 'subscription-paywall',
      width: '880px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'paywall' } satisfies UpgradePlanModalData,
      panelClass: ['custom-dialog-container', 'upgrade-plan-dialog'],
      ...this.dialogMotion,
    });
  }

  /** Tras registro: elegir plan de pago o prueba gratuita (no se puede omitir). */
  openRegistrationPlanGate(
    data: UpgradePlanModalData = { mode: 'registration' },
  ) {
    const existing = this.dialog.openDialogs.find(
      (d) => d.id === 'registration-plan-gate',
    );
    if (existing) {
      return existing;
    }
    return this.dialog.open(UpgradePlanModalComponent, {
      id: 'registration-plan-gate',
      width: '880px',
      maxWidth: '95vw',
      disableClose: true,
      data,
      panelClass: ['custom-dialog-container', 'upgrade-plan-dialog'],
      ...this.dialogMotion,
    });
  }

  /**
   * Modal «Bienvenido a tu plan». Solo una vez por sesión: tras Stripe en cuenta y luego
   * home con POST_ONBOARDING, la segunda llamada no abre otro modal.
   */
  openPlanUpgradeCelebration(
    data: PlanUpgradeCelebrationModalData,
  ):
    | MatDialogRef<PlanUpgradeCelebrationModalComponent>
    | undefined {
    if (isPlatformBrowser(this.platformId)) {
      try {
        if (
          sessionStorage.getItem(PLAN_CELEBRATION_SHOWN_SESSION_KEY) === '1'
        ) {
          return undefined;
        }
      } catch {
        /* ignore */
      }
      const alreadyOpen = this.dialog.openDialogs.find(
        (d) =>
          d.componentInstance instanceof PlanUpgradeCelebrationModalComponent,
      );
      if (alreadyOpen) {
        return alreadyOpen as MatDialogRef<PlanUpgradeCelebrationModalComponent>;
      }
    }

    this.firstAgentTour.markPlanCelebrationRequired();
    const ref = this.dialog.open(PlanUpgradeCelebrationModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'plan-celebration-dialog'],
      data,
      ...this.dialogMotion,
    });

    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(PLAN_CELEBRATION_SHOWN_SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }

    return ref;
  }
}
