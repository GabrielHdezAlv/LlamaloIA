import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { ErrorModalService } from '../../core/services/error-modal.service';

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
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private errorModalService = inject(ErrorModalService);

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

            this.showNotification('Registro exitoso', 'success');
            this.router.navigate(['/dashboard']);
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
}
