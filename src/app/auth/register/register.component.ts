import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { ErrorModalService } from '../../core/services/error-modal.service';
import { SuccessAlertComponent } from '../../shared/modals/success-alert/success-alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  
  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
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

  register(event: Event) {
    event.preventDefault();

    var user = {
      name: this.firstName,
      lastname: this.lastName,
      email: this.email,
      password: this.password,
    };

    this.userService.RegisterUser(user).subscribe({
      next: (response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }

        this.userService.getUserProfile().subscribe({
          next: (data) => {
            this.userStorage.setUser(data);

            if (data.twilio) {
              this.twilioStorage.setConfig(data.twilio);
            }

            const successMessage = this.currentLanguage === 'es' 
              ? '¡Registro exitoso!' 
              : 'Registration successful!';
            const successSubtitle = this.currentLanguage === 'es' 
              ? `¡Bienvenido a Llamalo, ${data.name || 'Usuario'}!` 
              : `Welcome to Llamalo, ${data.name || 'User'}!`;
            const buttonText = this.currentLanguage === 'es' ? 'Continuar' : 'Continue';
            
            this.showSuccessAlert(successMessage, successSubtitle, buttonText);
          },
          error: (err) => {
            console.error('Error al obtener perfil', err);
            this.errorModalService.showGenericError(
              'Error de Perfil',
              'Error al obtener el perfil de usuario después del registro',
              err
            );
          },
        });
      },
      error: (err) => {
        this.errorModalService.showRegisterError(err);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
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
      // Navegar al dashboard después de cerrar el modal
      this.router.navigate(['/dashboard']);
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
