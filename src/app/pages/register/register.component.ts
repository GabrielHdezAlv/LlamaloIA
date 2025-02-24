import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  register(event: Event) {
    event.preventDefault();
    console.log('Registrando usuario:', this.firstName, this.lastName, this.email, this.password);
    // var newUser = new NewUser(this.firstName, this.lastName, this.email, this.password);
    var user = {
      name: this.firstName,
      lastname: this.lastName,
      email: this.email,
      password: this.password
    }
    this.userService.RegisterUser(user).subscribe(r => {
      console.log("r: ", r);
    });

    this.userService.RegisterUser(user).subscribe({
      next: (response) => {
        console.log("✅ Registro exitoso:", response);
        this.showNotification("Registro exitoso", "success");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("❌ Error en registro:", err);
        console.log("📌 Error detallado:", err.error); // Muestra el mensaje exacto del backend
        this.showNotification("Error en registro: " + (err.error?.message || "Verifica los datos"), "error");
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // 🔹 Función para mostrar notificaciones
  private showNotification(message: string, type: "success" | "error") {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000, // 3 segundos
      panelClass: type === "success" ? "snackbar-success" : "snackbar-error",
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
}
