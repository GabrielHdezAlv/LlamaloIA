import { Component, inject } from '@angular/core';
import { LoginUser } from '../../shared/models/login-user.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';

@Component({
  selector: 'app-new-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './new-login.component.html',
  styleUrl: './new-login.component.scss',
})
export class NewLoginComponent {
  email: string = '';
  password: string = '';

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);

  login(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.showNotification('Por favor, ingrese email y contraseña', 'error');
      return;
    }

    const user = new LoginUser(this.email, this.password);

    this.userService.LoginUser(user).subscribe({
      next: (response) => {
        console.log('✅ Inicio de sesión exitoso:', response);

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }
        this.userService.getUserProfile().subscribe({
          next: (data: any) => {
            this.userStorage.setUser(data);
            if (data.twilio) {
              this.twilioStorage.setConfig(data.twilio);
            }
            console.log('data: ', data);

            this.showNotification('Inicio de sesión exitoso', 'success');
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
        console.error('❌ Error en inicio de sesión:', err);
        this.showNotification(
          'Error en inicio de sesión: ' + err.message,
          'error'
        );
      },
    });
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
