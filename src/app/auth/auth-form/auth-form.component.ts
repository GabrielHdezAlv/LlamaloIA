import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginUser } from '../../shared/models/login-user.model';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { log } from 'console';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
})
export class AuthFormComponent implements OnInit {
  type: 'login' | 'register' | 'recover' = 'login';
  title: string = '';
  subtitle: string = '';
  linkText: string = '';
  linkRoute: string = '';
  formTitle: string = '';
  formSubtitle: string = '';
  buttonText: string = '';
  bottomText: string = '';
  bottomLinkText: string = '';
  bottomLinkRoute: string = '';

  // Campos del formulario
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  fullName: string = '';
  
  // Estado para mostrar/ocultar contraseña
  showPassword: boolean = false;

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private router = inject(Router);
  private modalService = inject(ModalService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Detecta el tipo desde la ruta
    this.route.data.subscribe((data) => {
      if (this.type && this.type !== data['type']) {
        console.log(`Cambio de tipo: ${this.type} -> ${data['type']}`);
      }
      this.type = data['type'];
      this.title = data['title'];
      this.subtitle = data['subtitle'];
      this.linkText = data['linkText'];
      this.linkRoute = data['linkRoute'];
      this.formTitle = data['formTitle'];
      this.formSubtitle = data['formSubtitle'];
      this.buttonText = data['buttonText'];
      this.bottomText = data['bottomText'];
      this.bottomLinkText = data['bottomLinkText'];
      this.bottomLinkRoute = data['bottomLinkRoute'];
    });
  }

  submit(event: Event) {
    switch (this.type) {
      case 'login':
        this.login(event);
        break;
      case 'register':
        this.register(event);
        break;
      case 'recover':
        this.recover(event);
        break;
    }
  }

  login(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.modalService.openError({
        title: 'Campos requeridos',
        message: 'Por favor, ingrese email y contraseña',
      });
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

            this.showSuccess('Inicio de sesión exitoso');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error al obtener perfil', err);
            this.modalService.openError({
              title: 'Perfil de usuario',
              message: 'Error al obtener perfil de usuario',
              details: String(err?.message || err),
            });
          },
        });
      },
      error: (err) => {
        console.error('❌ Error en inicio de sesión:', err);
        this.modalService.openError({
          title: 'Inicio de sesión',
          message: 'Error en inicio de sesión',
          details: String(err?.error?.message || err?.message || err),
        });
      },
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  register(event: Event) {
    console.log('register');

    event.preventDefault();
    var user = {
      name: this.fullName.split(' ')[0],
      lastname: this.fullName.split(' ')[1],
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

            this.showSuccess('Registro exitoso');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.modalService.openError({
              title: 'Perfil de usuario',
              message: 'Error al obtener perfil de usuario',
              details: String(err?.message || err),
            });
          },
        });
      },
      error: (err) => {
        this.modalService.openError({
          title: 'Registro',
          message: err?.error?.message || 'Error en registro. Verifica los datos',
          details: String(err?.message || err),
        });
      },
    });
  }

  recover(event: Event) {
    event.preventDefault();
    if (!this.email) {
      this.modalService.openError({
        title: 'Correo requerido',
        message: 'Ingresa tu correo para recuperar la contraseña',
      });
      return;
    }
    // Aquí se podría llamar a un endpoint real de recuperación
    this.showSuccess('Si el correo existe, recibirás instrucciones de recuperación.');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
