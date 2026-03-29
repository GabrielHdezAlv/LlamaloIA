import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../shared/modals/modal.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private notificationService = inject(NotificationService);

  verificationState: 'input' | 'loading' | 'success' | 'error' = 'input';
  message: string = '';
  countdown: number = 5;
  private countdownInterval: any;
  
  verificationCode: string = '';
  emailToVerify: string = '';

  ngOnInit(): void {
    // Si la ruta nos manda un token (por ejemplo de un click accidental en un correo viejo), lo probamos.
    // De lo contrario, extraemos el email si se envió por state o query params
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.verificationCode = token;
        this.verifyCode();
      } else {
        this.emailToVerify = params['email'] || history.state?.email || '';
      }
    });
  }

  verifyCode(): void {
    if (!this.verificationCode || this.verificationCode.length < 6) {
      this.notificationService.error('Introduce el código de 6 dígitos');
      return;
    }

    this.verificationState = 'loading';
    this.message = 'Verificando tu código...';

    this.userService.verifyEmail(this.verificationCode).subscribe({
      next: (response) => {
        this.verificationState = 'success';
        this.message = '¡Email verificado! Redirigiendo al login...';

        // Mostrar modal de éxito
        this.modalService.openSuccess({
          title: '¡Email verificado!',
          message:
            'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.',
        });

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error verificando email:', err);
        this.handleError('Código inválido o expirado. Revisa tu correo o solicita uno nuevo.');
      },
    });
  }

  resendCode(): void {
    if (!this.emailToVerify) {
      this.notificationService.warning('Por favor ingresa tu correo para poder reenviar el código');
      // No tenemos email. Mostraríamos un prompt o navegar a login?
      return;
    }

    this.verificationState = 'loading';
    this.message = 'Reenviando código...';
    
    // Suponiendo que hay un endpoint resendVerificationEmail(email)
    this.userService.resendVerificationEmail(this.emailToVerify).subscribe({
      next: () => {
        this.verificationState = 'input';
        this.notificationService.success('Código reenviado. Revisa tu bandeja de entrada.');
      },
      error: (err) => {
        console.error('Error reenviando código:', err);
        this.verificationState = 'input';
        this.notificationService.error('Error al reenviar el código.');
      }
    });
  }

  private handleError(errorMessage: string): void {
    this.verificationState = 'error';
    this.message = errorMessage;

    // Mostrar modal de error
    this.modalService.openError({
      title: 'Error de verificación',
      message: errorMessage,
      details:
        'Por favor, intenta nuevamente o solicita un nuevo código.',
    });

    // En vez de redirigir, le permitimos intentar de nuevo
    setTimeout(() => {
      this.verificationState = 'input';
      this.verificationCode = ''; // Limpiar
    }, 3000);
  }

  navigateToRegister(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
