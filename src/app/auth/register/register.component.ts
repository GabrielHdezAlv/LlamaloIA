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

  register(event: Event) {
    event.preventDefault();
    console.log(
      'Registrando usuario:',
      this.firstName,
      this.lastName,
      this.email,
      this.password
    );

    var user = {
      name: this.firstName,
      lastname: this.lastName,
      email: this.email,
      password: this.password,
    };

    this.userService.RegisterUser(user).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }

        this.userService.getUserProfile().subscribe({
          next: (data) => {
            console.log('Perfil del usuario:', data);
            this.userStorage.setUser(data);

            if (data.twilio) {
              this.twilioStorage.setConfig(data.twilio);
            }

            this.showNotification('Registro exitoso', 'success');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error al obtener perfil', err);
            this.showNotification(
              'Error al obtener perfil de usuario',
              'error'
            );
          },
        });
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        console.log('📌 Error detallado:', err.error);
        this.showNotification(
          'Error en registro: ' + (err.error?.message || 'Verifica los datos'),
          'error'
        );
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
