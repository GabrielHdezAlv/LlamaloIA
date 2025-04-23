import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { LoginUser, UserService } from '../../core/services/user.service';

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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  login(event: Event) {
    event.preventDefault(); // Evita recarga de la página

    if (!this.email || !this.password) {
      this.showNotification('Por favor, ingrese email y contraseña', 'error');
      return;
    }

    const user = new LoginUser(this.email, this.password);

    this.userService.LoginUser(user).subscribe({
      next: (response) => {
        console.log('✅ Inicio de sesión exitoso:', response);

        // Guardar el token en localStorage para persistencia
        localStorage.setItem('authToken', response.Token);

        this.showNotification('Inicio de sesión exitoso', 'success');

        // Redirigir al Dashboard
        this.router.navigate(['/dashboard']);
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

  loginWithGoogle() {
    console.log('🔹 Iniciar sesión con Google');
    // Aquí puedes conectar con Firebase Auth o backend .NET
  }

  // 🔹 Función para mostrar notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, // 3 segundos
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
