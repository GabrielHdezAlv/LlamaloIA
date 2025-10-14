import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { LoginUser } from '../../shared/models/login-user.model';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { BetaService } from '../../core/services/beta.service';
import { ErrorModalService } from '../../core/services/error-modal.service';
import { SuccessAlertComponent } from '../../shared/modals/success-alert/success-alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatSnackBarModule,
    RouterLink,
    MatDialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  
  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private betaService = inject(BetaService);
  private errorModalService = inject(ErrorModalService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    // Recuperar idioma del localStorage si existe
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('interfaceLanguage');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        this.currentLanguage = savedLanguage;
      }
    }
  }

  login(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.showNotification('Por favor, ingrese email y contraseña', 'error');
      return;
    }

    const user = new LoginUser(this.email, this.password);

    this.userService.LoginUser(user).subscribe({
      next: (response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }
        this.userService.getUserProfile().subscribe({
          next: (data: any) => {
            this.userStorage.setUser(data);
            if (data.twilio) {
              this.twilioStorage.setConfig(data.twilio);
            }
            const successMessage = this.currentLanguage === 'es' 
              ? '¡Inicio de sesión exitoso!' 
              : 'Login successful!';
            const successSubtitle = this.currentLanguage === 'es' 
              ? `¡Bienvenido de vuelta, ${data.name || 'Usuario'}!` 
              : `Welcome back, ${data.name || 'User'}!`;
            const buttonText = this.currentLanguage === 'es' ? 'Continuar' : 'Continue';
            
            // Cargar minutos inbound antes de verificar elegibilidad
            this.betaService.loadMinutesInbound();
            
            this.showSuccessAlert(successMessage, successSubtitle, buttonText);
          },
          error: (err) => {
            console.error('Error al obtener perfil', err);
            this.errorModalService.showGenericError(
              'Error de Perfil',
              'Error al obtener el perfil de usuario después del login',
              err
            );
          },
        });
      },
      error: (err) => {
        console.error('❌ Error en inicio de sesión:', err);
        this.errorModalService.showLoginError(err);
      },
    });
  }

  loginWithGoogle() {
    console.log('🔹 Iniciar sesión con Google');
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private showSuccessAlert(message: string, subtitle: string, buttonText: string) {
    const dialogRef = this.dialog.open(SuccessAlertComponent, {
      width: '400px',
      disableClose: true,
      panelClass: 'success-alert-dialog',
      data: { 
        message: message, 
        subtitle: subtitle, 
        buttonText: buttonText 
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Continuar con la lógica de navegación
      setTimeout(() => {
        const shouldShowBeta = this.betaService.shouldShowBetaPage;
        if (shouldShowBeta) {
          this.router.navigate(['/beta-thanks']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }, 500);
    });
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    
    // Guardar en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('interfaceLanguage', this.currentLanguage);
    }
    
    // Disparar evento personalizado para notificar a otros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: this.currentLanguage } 
      }));
    }
  }
}
