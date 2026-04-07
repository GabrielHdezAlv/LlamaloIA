import {
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginUser } from '../../../shared/models/login-user.model';
import { UserStorage } from '../../../storages/user/user-storage';
import { TwilioStorage } from '../../../storages/twilio/twilio-storage';
import { USER_ROLE } from '../../../shared/models/user-role.enum';
import { isPlatformBrowser } from '@angular/common';

export interface EmailVerificationModalData {
  email?: string;
  title?: string;
  message?: string;
  /** Código de 6 dígitos si el usuario llega con enlace (?token=) */
  initialToken?: string;
  /** Tras verificar, si no hay JWT (p. ej. login bloqueado), iniciar sesión con estas credenciales */
  password?: string;
}

@Component({
  selector: 'app-email-verification-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './email-verification-modal.component.html',
  styleUrls: ['./email-verification-modal.component.scss'],
})
export class EmailVerificationModalComponent
  implements AfterViewInit, OnDestroy
{
  private readonly CODE_LENGTH = 6;

  dialogRef = inject(MatDialogRef<EmailVerificationModalComponent>);
  data = inject<EmailVerificationModalData>(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private platformId = inject(PLATFORM_ID);

  uiState: 'input' | 'verifying' | 'success' | 'error' = 'input';
  errorMessage = '';

  codeDigits: string[] = Array(this.CODE_LENGTH).fill('');
  focusedIndex = 0;

  private autoVerifyTimer: ReturnType<typeof setTimeout> | null = null;

  get t() {
    return this.i18nService.getTranslations();
  }

  close(): void {
    this.dialogRef.close();
  }

  goToLogin(): void {
    this.dialogRef.close({ navigateLogin: true });
    void this.router.navigate(['/login']);
  }

  private setGlobalLoading(isLoading: boolean): void {
    if (
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      'dispatchEvent' in window
    ) {
      window.dispatchEvent(
        new CustomEvent<boolean>('global-loading', { detail: isLoading }),
      );
    }
  }

  /**
   * Tras verificar el código: JWT del registro en localStorage, o login con email/contraseña.
   */
  private completeSessionAfterVerification(): void {
    this.setGlobalLoading(true);

    const email = this.data.email?.trim();
    const password = this.data.password;

    const loadProfileAndGoDashboard = () => {
      this.userService.getUserProfile().subscribe({
        next: (data: any) => {
          this.userStorage.setUser(data);
          if (
            data.twilio &&
            Array.isArray(data.twilio) &&
            data.twilio.length > 0
          ) {
            const firstAccount = data.twilio[0];
            this.twilioStorage.setConfig({
              twilioAccountId: firstAccount.twilioAccountId,
              twilioSid: firstAccount.twilioSid,
              twilioToken: firstAccount.twilioToken,
            });
          }

          this.notificationService.success(this.t.authSuccessLogin);

          const redirectUrl =
            data.rol === USER_ROLE.OWNER ? '/admin/agents/edit/1' : '/dashboard';

          this.dialogRef.close({ sessionCompleted: true });

          setTimeout(() => {
            void this.router.navigate([redirectUrl]);
            this.setGlobalLoading(false);
          }, 800);
        },
        error: (err) => {
          console.error('Error al obtener perfil tras verificar', err);
          this.notificationService.error(this.t.authErrorGetProfile);
          this.setGlobalLoading(false);
          this.uiState = 'success';
        },
      });
    };

    let token = '';
    if (
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    if (token) {
      loadProfileAndGoDashboard();
      return;
    }

    if (email && password) {
      this.userService.LoginUser(new LoginUser(email, password)).subscribe({
        next: (response) => {
          if (
            isPlatformBrowser(this.platformId) &&
            typeof window !== 'undefined' &&
            window.localStorage
          ) {
            localStorage.setItem('token', response.token);
          }
          loadProfileAndGoDashboard();
        },
        error: () => {
          this.notificationService.error(
            'Correo verificado. Inicia sesión con tu contraseña.',
          );
          this.setGlobalLoading(false);
          this.dialogRef.close({ sessionCompleted: true, needsManualLogin: true });
          void this.router.navigate(['/login'], { queryParams: { email } });
        },
      });
      return;
    }

    this.notificationService.info(
      'Correo verificado. Inicia sesión para continuar.',
    );
    this.setGlobalLoading(false);
    this.dialogRef.close({ sessionCompleted: true, needsManualLogin: true });
    void this.router.navigate(['/login']);
  }

  onCodeInput(index: number, event: Event): void {
    if (this.uiState === 'error') {
      this.uiState = 'input';
      this.errorMessage = '';
    }
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      this.codeDigits[index] = numericValue.slice(-1);
    } else {
      this.codeDigits[index] = numericValue;
    }

    if (numericValue && index < this.CODE_LENGTH - 1) {
      setTimeout(() => {
        const nextInput = document.getElementById(`ev-code-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
          this.focusedIndex = index + 1;
        }
      }, 0);
    } else {
      this.focusedIndex = index;
    }

    this.tryAutoVerify();
  }

  onCodeKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`ev-code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        this.focusedIndex = index - 1;
      }
    } else if (event.key === 'Backspace' && this.codeDigits[index]) {
      this.codeDigits[index] = '';
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim() || '';
    const digits = pastedData
      .replace(/[^0-9]/g, '')
      .slice(0, this.CODE_LENGTH)
      .split('');

    digits.forEach((digit, index) => {
      if (index < this.CODE_LENGTH) {
        this.codeDigits[index] = digit;
      }
    });

    const firstEmptyIndex = this.codeDigits.findIndex((d) => !d);
    const focusIndex =
      firstEmptyIndex >= 0 ? firstEmptyIndex : this.CODE_LENGTH - 1;
    this.focusedIndex = focusIndex;

    setTimeout(() => {
      const el = document.getElementById(`ev-code-${focusIndex}`);
      el?.focus();
    }, 0);

    this.tryAutoVerify();
  }

  private tryAutoVerify(): void {
    if (this.autoVerifyTimer) {
      clearTimeout(this.autoVerifyTimer);
      this.autoVerifyTimer = null;
    }
    if (!this.isCodeComplete || this.uiState !== 'input') {
      return;
    }
    this.autoVerifyTimer = setTimeout(() => {
      this.autoVerifyTimer = null;
      this.verify();
    }, 250);
  }

  get isCodeComplete(): boolean {
    return this.codeDigits.every((d) => d !== '');
  }

  verify(): void {
    const code = this.codeDigits.join('');
    if (code.length < this.CODE_LENGTH) {
      this.notificationService.error('Introduce el código de 6 dígitos');
      return;
    }

    this.uiState = 'verifying';
    this.errorMessage = '';

    this.userService.verifyEmail(code).subscribe({
      next: () => {
        this.completeSessionAfterVerification();
      },
      error: () => {
        this.uiState = 'error';
        this.errorMessage =
          'Código inválido o expirado. Revisa tu correo o solicita uno nuevo.';
        this.codeDigits = Array(this.CODE_LENGTH).fill('');
        setTimeout(() => {
          const el = document.getElementById('ev-code-0');
          el?.focus();
          this.focusedIndex = 0;
        }, 0);
      },
    });
  }

  resendCode(): void {
    const email = this.data.email?.trim();
    if (!email) {
      this.notificationService.warning(
        'No hay correo asociado. Regístrate de nuevo o contacta soporte.',
      );
      return;
    }

    this.userService.resendVerificationEmail(email).subscribe({
      next: () => {
        this.notificationService.success(
          'Código reenviado. Revisa tu bandeja de entrada.',
        );
      },
      error: () => {
        this.notificationService.error('Error al reenviar el código.');
      },
    });
  }

  ngAfterViewInit(): void {
    const token = this.data.initialToken?.replace(/\D/g, '') ?? '';
    if (token.length === this.CODE_LENGTH) {
      token.split('').forEach((d, i) => {
        if (i < this.CODE_LENGTH) {
          this.codeDigits[i] = d;
        }
      });
      setTimeout(() => this.verify(), 300);
      return;
    }

    setTimeout(() => {
      const firstInput = document.getElementById('ev-code-0');
      if (firstInput) {
        firstInput.focus();
        this.focusedIndex = 0;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.autoVerifyTimer) {
      clearTimeout(this.autoVerifyTimer);
    }
  }
}
