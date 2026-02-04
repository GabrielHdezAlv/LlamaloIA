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
import { AnimatedCheckboxComponent } from '../../shared/components/animated-checkbox/animated-checkbox.component';
import { ACCOUNT_STATUS } from '../../shared/models/account-status.enum';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    AnimatedCheckboxComponent,
  ],
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
  country: string = ''; // ✅ NUEVO - Requerido
  marketingConsent: boolean = false; // ✅ NUEVO - Requerido

  // Estado para mostrar/ocultar contraseña
  showPassword: boolean = false;

  // Estado para recordar sesión
  rememberMe: boolean = false;

  // Lista de países con códigos ISO
  countries = [
    { code: 'ES', name: 'España' },
    { code: 'FR', name: 'Francia' },
    { code: 'IT', name: 'Italia' },
    { code: 'PT', name: 'Portugal' },
    { code: 'DE', name: 'Alemania' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
  ];

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
            // Actualizar TwilioStorage si viene en el perfil
            // Usar la primera cuenta de Twilio para compatibilidad con el storage actual
            if (
              data.twilio &&
              Array.isArray(data.twilio) &&
              data.twilio.length > 0
            ) {
              const firstAccount = data.twilio[0];
              this.twilioStorage.setConfig({
                twilioAccountId: firstAccount.twilioAccountId,
                twilioSid: firstAccount.twilioSid,
                twilioToken: firstAccount.twilioToken,
              });
            }
            console.log('data: ', data);

            // Mostrar modal de éxito en lugar de notificación básica
            this.modalService.openLoginSuccess({
              title: '¡Bienvenido de vuelta!',
              message: `Hola ${
                data.name || ''
              }, has iniciado sesión correctamente.`,
              userName: data.name,
              showContinueButton: true,
              continueButtonText: 'Ir al Dashboard',
            });

            // Redirigir después de un breve delay para que el usuario vea el modal
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
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

    // Validar campos antes de abrir el modal
    if (!this.fullName || !this.email || !this.password || !this.country) {
      this.modalService.openError({
        title: 'Campos requeridos',
        message: 'Por favor, completa todos los campos incluyendo el país',
      });
      return;
    }

    // Validar consentimiento de marketing
    if (!this.marketingConsent) {
      this.modalService.openError({
        title: 'Consentimiento requerido',
        message: 'Debes aceptar el consentimiento de marketing para continuar',
      });
      return;
    }

    // Abrir modal de verificación de email
    const dialogRef = this.modalService.openEmailVerification({
      email: this.email,
      title: 'Verificación de correo',
      message:
        'Hemos enviado un código de verificación a tu correo electrónico. Por favor, ingresa el código para completar tu registro.',
    });

    // Esperar a que el usuario verifique el código
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.verified) {
        // Solo proceder con el registro si el código fue verificado
        this.completeRegistration();
      }
    });
  }

  private completeRegistration() {
    var user = {
      name: this.fullName.split(' ')[0],
      lastname: this.fullName.split(' ')[1] || '',
      email: this.email,
      password: this.password,
      country: this.country, // NUEVO - Requerido
      marketingConsent: this.marketingConsent, // NUEVO - Requerido
      accountStatus: ACCOUNT_STATUS.UNVERIFIED, // NUEVO: Por defecto No validado (3) para nuevos usuarios hasta que verifiquen email
    };

    this.userService.RegisterUser(user).subscribe({
      next: (response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }

        this.userService.getUserProfile().subscribe({
          next: (data) => {
            this.userStorage.setUser(data);

            // Actualizar TwilioStorage si viene en el perfil
            // Usar la primera cuenta de Twilio para compatibilidad con el storage actual
            if (
              data.twilio &&
              Array.isArray(data.twilio) &&
              data.twilio.length > 0
            ) {
              const firstAccount = data.twilio[0];
              this.twilioStorage.setConfig({
                twilioAccountId: firstAccount.twilioAccountId,
                twilioSid: firstAccount.twilioSid,
                twilioToken: firstAccount.twilioToken,
              });
            }

            // Mostrar modal de éxito para registro
            this.modalService.openLoginSuccess({
              title: '¡Bienvenido!',
              message: `Hola ${
                data.name || ''
              }, tu cuenta ha sido creada exitosamente.`,
              userName: data.name,
              showContinueButton: true,
              continueButtonText: 'Comenzar',
            });

            // Redirigir después de un breve delay
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
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
          message:
            err?.error?.message || 'Error en registro. Verifica los datos',
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
    this.showSuccess(
      'Si el correo existe, recibirás instrucciones de recuperación.',
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
