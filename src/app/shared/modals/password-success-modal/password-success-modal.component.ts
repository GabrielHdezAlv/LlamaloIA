import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface PasswordSuccessModalData {
  title?: string;
  message?: string;
  showContinueButton?: boolean;
  continueButtonText?: string;
}

@Component({
  selector: 'app-password-success-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './password-success-modal.component.html',
  styleUrls: ['./password-success-modal.component.scss'],
})
export class PasswordSuccessModalComponent {
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA) as PasswordSuccessModalData;
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  get title(): string {
    return this.data?.title || this.t.passwordUpdated || 'Contraseña actualizada';
  }

  get message(): string {
    return this.data?.message || 'Tu contraseña ha sido actualizada correctamente.';
  }

  get showContinueButton(): boolean {
    return this.data?.showContinueButton ?? true;
  }

  get continueButtonText(): string {
    return this.data?.continueButtonText || this.t.continue || 'Continuar';
  }

  close(): void {
    this.dialogRef.close();
  }

  continue(): void {
    this.dialogRef.close('continue');
  }
}
