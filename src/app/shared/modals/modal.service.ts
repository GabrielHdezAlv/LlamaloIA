import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  EditAgentModalComponent,
  EditAgentModalData,
} from './edit-agent-modal/edit-agent-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialog = inject(MatDialog);

  openError(data: ErrorModalData) {
    return this.dialog.open(ErrorModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openDeleteAccount(data: DeleteAccountModalData) {
    return this.dialog.open(DeleteAccountModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openPurchase(data: PurchaseModalData) {
    return this.dialog.open(PurchaseModalComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openSuccess(data: SuccessModalData) {
    return this.dialog.open(SuccessModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openWarning(data: WarningModalData) {
    return this.dialog.open(WarningModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openImportNumber(data: ImportNumberModalData = {}) {
    return this.dialog.open(ImportNumberModalComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openPasswordSuccess(data: PasswordSuccessModalData = {}) {
    return this.dialog.open(PasswordSuccessModalComponent, {
      width: '450px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
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
    });

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      dialogRef.close();
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
    });
  }

  openWeb(data: WebModalData = {}) {
    return this.dialog.open(WebModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openEmailVerification(data: EmailVerificationModalData = {}) {
    return this.dialog.open(EmailVerificationModalComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openTwilioSteps(data: TwilioStepsModalData = {}) {
    return this.dialog.open(TwilioStepsModalComponent, {
      width: '480px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }

  openEditAgent(data: EditAgentModalData) {
    return this.dialog.open(EditAgentModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }
}
