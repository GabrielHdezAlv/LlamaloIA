import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface LoginSuccessModalData {
  title?: string;
  message?: string;
  userName?: string;
  showContinueButton?: boolean;
  continueButtonText?: string;
  redirectTo?: string;
}

@Component({
  selector: 'app-login-success-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-success-modal.component.html',
  styleUrls: ['./login-success-modal.component.scss'],
})
export class LoginSuccessModalComponent implements OnDestroy {
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA) as LoginSuccessModalData;
  private i18nService = inject(I18nService);

  /** Desliza hacia fuera (slideOut) antes de cerrar el dialog. */
  isClosing = false;
  private closeTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  get title(): string {
    return this.data?.title || '¡Bienvenido de vuelta!';
  }

  get message(): string {
    return this.data?.message || `Hola ${this.data?.userName || ''}, has iniciado sesión correctamente.`;
  }

  get showContinueButton(): boolean {
    return this.data?.showContinueButton ?? true;
  }

  get continueButtonText(): string {
    return this.data?.continueButtonText || 'Ir al Dashboard';
  }

  /** Cierra con animación CSS (.closing → slideOutToRight). */
  requestClose(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.dialogRef.close();
    }, 300);
  }

  close(): void {
    this.requestClose();
  }

  continue(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.dialogRef.close('continue');
    }, 300);
  }
}
