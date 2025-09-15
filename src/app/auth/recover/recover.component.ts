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
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  recoverPassword(event: Event) {
    event.preventDefault(); // Evita recarga de la página

    if (!this.email) {
      this.showNotification('Por favor, ingrese su email', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showNotification('Por favor, ingrese un email válido', 'error');
      return;
    }

    this.isLoading = true;

    this.userService.RecoverPassword(this.email).subscribe({
      next: (response) => {
        console.log('✅ Email de recuperación enviado:', response);
        this.showNotification(
          'Se ha enviado un email con las instrucciones para restablecer su contraseña',
          'success'
        );
        this.isLoading = false;
        // Opcional: redirigir al login después de un tiempo
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al enviar email de recuperación:', err);
        this.showNotification(
          'Error al enviar el email. Verifique que el email sea correcto e inténtelo de nuevo.',
          'error'
        );
        this.isLoading = false;
      },
    });
  }

  // 🔹 Función para mostrar notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000, // 5 segundos para dar tiempo a leer
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}