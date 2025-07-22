import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { LoginUser } from '../../shared/models/login-user.model';

@Component({
  selector: 'app-recover',
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
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss'],
})
export class RecoverComponent {
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

        localStorage.setItem('token', response.Token);

        this.showNotification('Inicio de sesión exitoso', 'success');
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
