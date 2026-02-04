import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  verificationState: 'loading' | 'success' | 'error' = 'loading';
  message: string = '';
  countdown: number = 5;
  private countdownInterval: any;

  ngOnInit(): void {
    this.extractTokenAndVerify();
  }

  private extractTokenAndVerify(): void {
    // Extraer token de los query params
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];

      if (!token) {
        this.handleError('Enlace inválido o expirado');
        return;
      }

      this.verifyEmail(token);
    });
  }

  private verifyEmail(token: string): void {
    this.verificationState = 'loading';
    this.message = 'Verificando tu email...';

    this.userService.verifyEmail(token).subscribe({
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
        this.handleError('Enlace inválido o expirado');
      },
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
        'Por favor, intenta registrarte nuevamente o contacta soporte si el problema persiste.',
    });

    // Iniciar countdown
    this.startCountdown();

    // Redirigir automáticamente al registro después de 5 segundos
    setTimeout(() => {
      this.navigateToRegister();
    }, 5000);
  }

  private startCountdown(): void {
    this.countdown = 5;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
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
