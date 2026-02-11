import { Component, inject, AfterViewInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export interface EmailVerificationModalData {
  email?: string;
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-email-verification-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './email-verification-modal.component.html',
  styleUrls: ['./email-verification-modal.component.scss'],
})
export class EmailVerificationModalComponent implements AfterViewInit {
  dialogRef = inject(MatDialogRef<EmailVerificationModalComponent>);
  data = inject<EmailVerificationModalData>(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  codeDigits: string[] = ['', '', '', ''];
  focusedIndex: number = 0;

  get t() {
    return this.i18nService.getTranslations();
  }

  close(): void {
    this.dialogRef.close();
  }

  onCodeInput(index: number, event: any): void {
    const value = event.target.value;

    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');

    // Solo permitir un dígito
    if (numericValue.length > 1) {
      this.codeDigits[index] = numericValue.slice(-1);
    } else {
      this.codeDigits[index] = numericValue;
    }

    // Mover al siguiente campo si hay un valor
    if (numericValue && index < 3) {
      setTimeout(() => {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
          this.focusedIndex = index + 1;
        }
      }, 0);
    } else {
      this.focusedIndex = index;
    }

    // Verificar si todos los campos están llenos
    this.checkComplete();
  }

  onCodeKeyDown(index: number, event: KeyboardEvent): void {
    // Si presiona backspace y el campo está vacío, ir al anterior
    if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        this.focusedIndex = index - 1;
      }
    } else if (event.key === 'Backspace' && this.codeDigits[index]) {
      // Si hay un valor, limpiarlo
      this.codeDigits[index] = '';
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim() || '';

    // Solo tomar los primeros 4 dígitos numéricos
    const digits = pastedData
      .replace(/[^0-9]/g, '')
      .slice(0, 4)
      .split('');

    digits.forEach((digit, index) => {
      if (index < 4) {
        this.codeDigits[index] = digit;
      }
    });

    // Enfocar el último campo lleno o el primero vacío
    const firstEmptyIndex = this.codeDigits.findIndex((d) => !d);
    const focusIndex = firstEmptyIndex >= 0 ? firstEmptyIndex : 3;
    this.focusedIndex = focusIndex;

    setTimeout(() => {
      const nextInput = document.getElementById(`code-${focusIndex}`);
      if (nextInput) {
        nextInput.focus();
      }
    }, 0);

    this.checkComplete();
  }

  checkComplete(): void {
    const isComplete = this.codeDigits.every((digit) => digit !== '');
    if (isComplete) {
      // Auto-verificar cuando esté completo (opcional)
      // this.verify();
    }
  }

  get isCodeIncomplete(): boolean {
    return this.codeDigits.some((digit) => !digit);
  }

  verify(): void {
    const code = this.codeDigits.join('');
    if (code.length === 4) {
      this.dialogRef.close({ verified: true, code });
    }
  }

  ngAfterViewInit(): void {
    // Enfocar el primer campo al cargar
    setTimeout(() => {
      const firstInput = document.getElementById('code-0');
      if (firstInput) {
        firstInput.focus();
        this.focusedIndex = 0;
      }
    }, 100);
  }

  resendCode(): void {
    // Función para reenviar el código (a implementar)
    console.info('Reenviar código a:', this.data.email);
  }
}
